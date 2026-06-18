import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import twilio from 'twilio'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const SMS_CANCEL_TEXT =
  "Votre commande a été annulée car un article n'est plus disponible. " +
  'Vous serez remboursé sous 5 à 10 jours ouvrés. ' +
  "Vous pouvez passer une nouvelle commande sur notre site — l'article indisponible n'apparaîtra plus."

function toE164(phone: string): string {
  if (phone.startsWith('0')) return '+33' + phone.slice(1)
  return phone
}

// Допустимые переходы статусов — нельзя откатить назад или изменить выполненный заказ
const ALLOWED_STATUSES = ['preparing', 'in_delivery', 'completed', 'cancelled'] as const
type OrderStatus = typeof ALLOWED_STATUSES[number]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Проверка авторизации и роли администратора
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Валидация тела запроса
  const body = await request.json() as { status?: string }
  const newStatus = body.status as OrderStatus

  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      { error: `Statut invalide. Valeurs acceptées : ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  // Получить текущий заказ
  const { data: order, error: fetchError } = await admin
    .from('orders')
    .select('id, status, payment_status, stripe_payment_id, phone')
    .eq('id', id)
    .single()

  if (fetchError?.code === 'PGRST116' || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }
  if (fetchError) {
    console.error('[PATCH /api/admin/orders/:id]', fetchError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Нельзя изменить статус выполненного заказа
  if (order.status === 'completed') {
    return NextResponse.json(
      { error: 'Impossible de modifier une commande terminée' },
      { status: 400 }
    )
  }

  // Нельзя изменить уже отменённый заказ
  if (order.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Cette commande est déjà annulée' },
      { status: 400 }
    )
  }

  // Возврат денег при отмене оплаченного заказа
  let refunded = false
  if (newStatus === 'cancelled' && order.payment_status === 'paid' && order.stripe_payment_id) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripe_payment_id })
      refunded = true
    } catch (err) {
      console.error('[admin/orders] Ошибка возврата Stripe:', err)
      return NextResponse.json({ error: 'Échec du remboursement. Contactez le support.' }, { status: 500 })
    }
  }

  // Обновить статус заказа
  const updatePayload: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'cancelled') {
    updatePayload.cancelled_at = new Date().toISOString()
  }

  const { error: updateError } = await admin
    .from('orders')
    .update(updatePayload)
    .eq('id', id)

  if (updateError) {
    console.error('[admin/orders] Ошибка обновления статуса:', updateError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // SMS клиенту при отмене оплаченного заказа администратором
  if (newStatus === 'cancelled' && refunded && order.phone) {
    try {
      await twilioClient.messages.create({
        body: SMS_CANCEL_TEXT,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: toE164(order.phone),
      })
    } catch (err) {
      // SMS — некритичный сбой, заказ уже отменён
      console.error('[admin/orders] SMS annulation failed:', err)
    }
  }

  return NextResponse.json({ updated: true, status: newStatus, refunded })
}
