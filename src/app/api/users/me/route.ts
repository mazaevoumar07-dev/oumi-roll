import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getIp } from '@/lib/rate-limit'

export async function DELETE(request: Request) {
  if (!rateLimit(`delete-account:${getIp(request)}`, 3, 3_600_000)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une heure.' }, { status: 429 })
  }

  // Проверяем авторизацию
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()

  // 1. Анонимизируем персональные данные в заказах (не удаляем — нужны для бухгалтерии)
  const { error: ordersError } = await admin
    .from('orders')
    .update({
      first_name: 'Utilisateur supprimé',
      last_name: '',
      phone: null,
      email: null,
      address: null,
      comment: null,
    })
    .eq('user_id', user.id)

  if (ordersError) {
    console.error('[DELETE /api/users/me] anonymize orders:', ordersError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // 2. Удаляем профиль из public.users
  const { error: profileError } = await admin
    .from('users')
    .delete()
    .eq('id', user.id)

  if (profileError) {
    console.error('[DELETE /api/users/me] delete profile:', profileError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // 3. Удаляем учётную запись из auth.users (необратимо)
  const { error: authError } = await admin.auth.admin.deleteUser(user.id)

  if (authError) {
    console.error('[DELETE /api/users/me] delete auth user:', authError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Compte supprimé' })
}
