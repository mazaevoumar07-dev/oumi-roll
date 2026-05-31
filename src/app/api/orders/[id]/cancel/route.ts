import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const CANCEL_WINDOW_MS = 3 * 60 * 1000 // 3 minutes

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Require authentication
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: order, error } = await admin
    .from('orders')
    .select('id, user_id, status, payment_status, stripe_payment_id, created_at')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116' || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }
  if (error) {
    console.error('[POST /api/orders/:id/cancel]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Check access: owner or admin
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

  // Can't cancel an already cancelled or completed order
  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'Cette commande est déjà annulée' }, { status: 400 })
  }
  if (order.status === 'completed') {
    return NextResponse.json({ error: 'Une commande livrée ne peut pas être annulée' }, { status: 400 })
  }

  // Clients can only cancel within the 3-minute window; admins have no time limit
  if (!isAdmin) {
    const elapsed = Date.now() - new Date(order.created_at).getTime()
    if (elapsed > CANCEL_WINDOW_MS) {
      return NextResponse.json(
        { error: 'Le délai d\'annulation de 3 minutes est écoulé. Contactez-nous par téléphone.', code: 'CANCEL_WINDOW_EXPIRED' },
        { status: 400 }
      )
    }
  }

  // Initiate Stripe refund for paid orders
  if (order.payment_status === 'paid' && order.stripe_payment_id) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripe_payment_id })
    } catch (err) {
      console.error('[cancel] Stripe refund failed:', err)
      return NextResponse.json({ error: 'Échec du remboursement. Contactez-nous.' }, { status: 500 })
    }
  }

  // Mark order as cancelled
  const { error: updateError } = await admin
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('[cancel] Failed to update order:', updateError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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
