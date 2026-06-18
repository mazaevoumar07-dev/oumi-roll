import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
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

  // Показывать только заказы старше 3 минут — клиент ещё может отменить в это время
  const cancelWindowCutoff = new Date(Date.now() - 3 * 60 * 1000).toISOString()

  const { data: orders, error } = await admin
    .from('orders')
    .select(`
      id, order_number, first_name, last_name, phone, email,
      delivery_type, address, delivery_cost, total_amount,
      status, payment_status, created_at, cancelled_at,
      order_items (
        id, name, price, quantity, is_gift
      )
    `)
    .lte('created_at', cancelWindowCutoff)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/admin/orders]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(orders)
}
