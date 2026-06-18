import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH() {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { data: current } = await admin
    .from('restaurant_settings')
    .select('value')
    .eq('key', 'orders_paused')
    .single()

  const newValue = current?.value === 'true' ? 'false' : 'true'

  await admin
    .from('restaurant_settings')
    .upsert({ key: 'orders_paused', value: newValue })

  return NextResponse.json({ paused: newValue === 'true' })
}
