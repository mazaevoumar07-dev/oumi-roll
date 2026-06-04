import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface CartItem {
  menu_item_id: string
  quantity: number
}

interface IntentBody {
  first_name: string
  last_name: string
  phone: string
  email: string
  delivery_type: 'delivery' | 'pickup'
  address?: string
  delivery_cost: number
  items: CartItem[]
  comment?: string
}

type CartSnapshot = {
  id: string
  name: string
  price: number
  qty: number
  is_gift: boolean
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as IntentBody

    if (
      !body.first_name?.trim() ||
      !body.last_name?.trim() ||
      !body.phone?.trim() ||
      !body.email?.trim() ||
      !['delivery', 'pickup'].includes(body.delivery_type) ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }

    if (body.delivery_type === 'delivery' && !body.address?.trim()) {
      return NextResponse.json({ error: 'Adresse requise pour la livraison' }, { status: 400 })
    }

    // Check if a registered user is placing this order
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    const userId = user?.id ?? null

    const admin = createAdminClient()

    // Fetch current prices from DB — never trust client prices
    const menuItemIds = body.items.map(i => i.menu_item_id)
    const { data: menuItems, error: menuError } = await admin
      .from('menu_items')
      .select('id, name, price, is_available, is_visible')
      .in('id', menuItemIds)

    if (menuError || !menuItems) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Validate every item is available
    for (const item of body.items) {
      const found = menuItems.find(m => m.id === item.menu_item_id)
      if (!found || !found.is_visible || !found.is_available) {
        return NextResponse.json(
          { error: `Article indisponible: ${found?.name ?? item.menu_item_id}` },
          { status: 400 }
        )
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
      }
    }

    // Calculate items total using DB prices
    const itemsTotal = body.items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menu_item_id)!
      return sum + Number(menuItem.price) * item.quantity
    }, 0)

    // Check promotion server-side — never trust client bonus state
    const { data: promotion } = await admin
      .from('promotions')
      .select('is_active, gift_item_id')
      .single()

    const totalQuantity = body.items.reduce((sum, i) => sum + i.quantity, 0)
    const bonusApplies = promotion?.is_active === true && totalQuantity >= 2

    const deliveryCost =
      body.delivery_type === 'pickup' || bonusApplies ? 0 : body.delivery_cost

    const totalAmount = itemsTotal + deliveryCost

    if (totalAmount < 0.5) {
      return NextResponse.json({ error: 'Montant minimum €0.50' }, { status: 400 })
    }

    // Build cart snapshot for webhook metadata
    const cartSnapshot: CartSnapshot[] = body.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menu_item_id)!
      return {
        id: item.menu_item_id,
        name: menuItem.name,
        price: Number(menuItem.price),
        qty: item.quantity,
        is_gift: false,
      }
    })

    if (bonusApplies && promotion?.gift_item_id) {
      const { data: giftItem } = await admin
        .from('menu_items')
        .select('id, name')
        .eq('id', promotion.gift_item_id)
        .eq('is_visible', true)
        .eq('is_available', true)
        .single()

      if (giftItem) {
        cartSnapshot.push({
          id: giftItem.id,
          name: giftItem.name,
          price: 0,
          qty: 1,
          is_gift: true,
        })
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: body.email,
      metadata: {
        user_id: userId ?? '',
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        email: body.email,
        delivery_type: body.delivery_type,
        address: body.address ?? '',
        delivery_cost: String(deliveryCost),
        total_amount: String(totalAmount),
        items: JSON.stringify(cartSnapshot),
        comment: body.comment?.trim() ?? '',
      },
    })

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      total_amount: totalAmount,
    })
  } catch (err) {
    console.error('[payment/intent]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
