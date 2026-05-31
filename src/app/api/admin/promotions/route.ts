import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/promotions — текущие настройки бонуса
export async function GET() {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data: promo, error } = await admin
    .from('promotions')
    .select(`
      id, is_active, updated_at,
      menu_items!gift_item_id (
        id, name, is_available, is_visible
      )
    `)
    .single()

  if (error) {
    console.error('[GET /api/admin/promotions]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Предупреждения о проблемах с роллом-подарком
  const gift = promo.menu_items as unknown as { id: string; name: string; is_available: boolean; is_visible: boolean } | null
  const warnings: string[] = []
  if (promo.is_active && gift) {
    if (!gift.is_visible) warnings.push('Le rouleau cadeau est masqué — le bonus ne sera pas appliqué.')
    if (!gift.is_available) warnings.push('Le rouleau cadeau est en rupture de stock — sélectionnez-en un autre.')
  }
  if (promo.is_active && !gift) {
    warnings.push('Aucun rouleau cadeau sélectionné — le bonus ne sera pas appliqué.')
  }

  return NextResponse.json({ ...promo, warnings })
}

// PATCH /api/admin/promotions — изменить настройки бонуса
export async function PATCH(request: Request) {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await request.json() as { is_active?: boolean; gift_item_id?: string | null }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
  if ('gift_item_id' in body) {
    if (body.gift_item_id !== null && body.gift_item_id !== undefined) {
      // Проверяем что выбранный ролл существует
      const { data: item } = await admin
        .from('menu_items')
        .select('id, name, is_available, is_visible')
        .eq('id', body.gift_item_id)
        .single()

      if (!item) {
        return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
      }
    }
    updates.gift_item_id = body.gift_item_id ?? null
  }

  const { data: updated, error } = await admin
    .from('promotions')
    .update(updates)
    .select(`
      id, is_active, updated_at,
      menu_items!gift_item_id (
        id, name, is_available, is_visible
      )
    `)
    .single()

  if (error) {
    console.error('[PATCH /api/admin/promotions]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Предупреждения после обновления
  const gift = updated.menu_items as unknown as { id: string; name: string; is_available: boolean; is_visible: boolean } | null
  const warnings: string[] = []
  if (updated.is_active && gift) {
    if (!gift.is_visible) warnings.push('Le rouleau cadeau est masqué — le bonus ne sera pas appliqué.')
    if (!gift.is_available) warnings.push('Le rouleau cadeau est en rupture de stock — sélectionnez-en un autre.')
  }
  if (updated.is_active && !gift) {
    warnings.push('Aucun rouleau cadeau sélectionné — le bonus ne sera pas appliqué.')
  }

  return NextResponse.json({ ...updated, warnings })
}
