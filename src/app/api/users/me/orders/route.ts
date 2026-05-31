import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  // Require authentication
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: orders, error } = await admin
    .from('orders')
    .select(`
      id, order_number, delivery_type, address, delivery_cost,
      total_amount, status, payment_status, created_at, cancelled_at,
      order_items (
        id, name, price, quantity, is_gift
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/users/me/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(orders)
}
