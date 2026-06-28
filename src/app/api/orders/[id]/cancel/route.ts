import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import twilio from 'twilio'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const CANCEL_WINDOW_MS = 3 * 60 * 1000

const SMS_CANCEL_TEXT =
  "Votre commande a été annulée car un article n'est plus disponible. " +
  'Vous serez remboursé sous 5 à 10 jours ouvrés. ' +
  "Vous pouvez passer une nouvelle commande sur notre site — l'article indisponible n'apparaîtra plus."

function toE164(phone: string): string {
  if (phone.startsWith('0')) return '+33' + phone.slice(1)
  return phone
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  const { id } = await params

  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: order, error } = await admin
    .from('orders')
    .select('id, user_id, status, payment_status, stripe_payment_id, created_at, phone')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116' || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }
  if (error) {
    console.error('[POST /api/orders/:id/cancel]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const isOwner = order.user_id === user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'Cette commande est déjà annulée' }, { status: 400 })
  }
  if (order.status === 'completed') {
    return NextResponse.json({ error: 'Une commande livrée ne peut pas être annulée' }, { status: 400 })
  }

  if (!isAdmin) {
    const elapsed = Date.now() - new Date(order.created_at).getTime()
    if (elapsed > CANCEL_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Le délai d\'annulation de 3 minutes est écoulé. Contactez-nous par téléphone.', code: 'CANCEL_WINDOW_EXPIRED' },
        { status: 400 }
      )
    }
  }

  if (order.payment_status === 'paid' && order.stripe_payment_id) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripe_payment_id })
    } catch (err) {
      console.error('[cancel] Stripe refund failed:', err)
      return NextResponse.json({ error: 'Échec du remboursement. Contactez-nous.' }, { status: 500 })
    }
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('[cancel] Failed to update order:', updateError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // SMS клиенту только при отмене администратором оплаченного заказа
  if (isAdmin && order.payment_status === 'paid' && order.phone) {
    try {
      await twilioClient.messages.create({
        body: SMS_CANCEL_TEXT,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: toE164(order.phone),
      })
    } catch (err) {
      // SMS — некритичный сбой: заказ уже отменён и возврат инициирован
      console.error('[cancel] SMS notification failed:', err)
    }
  }

  const refunded = order.payment_status === 'paid'
  return NextResponse.json({
    cancelled: true,
    refunded,
    message: refunded
      ? 'Commande annulée. Le remboursement sera effectué sous 5 à 10 jours ouvrés.'
      : 'Commande annulée.',
  })
}
