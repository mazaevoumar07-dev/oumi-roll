import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(
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
    .select(`
      id, order_number, user_id, first_name, last_name, phone, email,
      delivery_type, address, delivery_cost, total_amount,
      status, payment_status, created_at, cancelled_at,
      order_items (
        id, menu_item_id, name, price, quantity, is_gift
      )
    `)
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116' || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }
  if (error) {
    console.error('[GET /api/orders/:id]', error)
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

  return NextResponse.json(order)
}
