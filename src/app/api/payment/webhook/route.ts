import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Next.js must not parse the body — Stripe needs the raw bytes for signature verification
export const config = { api: { bodyParser: false } }

type CartItemSnapshot = {
  id: string
  name: string
  price: number
  qty: number
  is_gift: boolean
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    // Use raw text body for signature verification — do NOT use request.json()
    const body = await request.text()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle successful payments
  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const meta = paymentIntent.metadata
  const admin = createAdminClient()

  // Idempotency — ignore if order was already created for this payment
  const { data: existing } = await admin
    .from('orders')
    .select('id')
    .eq('stripe_payment_id', paymentIntent.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true })
  }

  // Parse cart snapshot
  let cartItems: CartItemSnapshot[] = []
  try {
    cartItems = JSON.parse(meta.items ?? '[]')
  } catch {
    console.error('[webhook] Failed to parse items metadata, payment_intent:', paymentIntent.id)
    return NextResponse.json({ error: 'Invalid items metadata' }, { status: 400 })
  }

  // Create the order
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: meta.user_id || null,
      first_name: meta.first_name,
      last_name: meta.last_name,
      phone: meta.phone,
      email: meta.email,
      delivery_type: meta.delivery_type,
      address: meta.address || null,
      delivery_cost: Number(meta.delivery_cost),
      total_amount: Number(meta.total_amount),
      status: 'new',
      payment_status: 'paid',
      stripe_payment_id: paymentIntent.id,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[webhook] Failed to create order:', orderError)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Insert order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    menu_item_id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: item.qty,
    is_gift: item.is_gift,
  }))

  const { error: itemsError } = await admin.from('order_items').insert(orderItems)

  if (itemsError) {
    // Order was created — log but don't fail the webhook (Stripe won't retry on 200)
    console.error('[webhook] Failed to insert order items:', itemsError)
  }

  console.log(`[webhook] Order ${order.id} created for payment ${paymentIntent.id}`)
  return NextResponse.json({ received: true })
}
