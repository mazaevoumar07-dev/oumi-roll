import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 МБ

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  return 'webp'
}

// PATCH /api/admin/menu/:id — изменить позицию меню
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  // Проверяем что позиция существует
  const { data: existing, error: fetchError } = await admin
    .from('menu_items')
    .select('id, photo_url')
    .eq('id', id)
    .single()

  if (fetchError?.code === 'PGRST116' || !existing) {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  }

  const form = await request.formData()
  const updates: Record<string, unknown> = {}

  // Обновляем только переданные поля
  const name = (form.get('name') as string | null)?.trim()
  if (name !== null && name !== undefined) {
    if (!name) return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 })
    updates.name = name
  }

  const description = form.get('description') as string | null
  if (description !== null) updates.description = description.trim() || null

  const price = form.get('price')
  if (price !== null) {
    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    }
    updates.price = priceNum
  }

  const originalPrice = form.get('original_price')
  if (originalPrice !== null) {
    updates.original_price = originalPrice === '' ? null : Number(originalPrice)
  }

  const category = form.get('category') as string | null
  if (category !== null) updates.category = category.trim() || null

  const pieces = form.get('pieces')
  if (pieces !== null) updates.pieces = pieces === '' ? null : Number(pieces)

  const isAvailable = form.get('is_available')
  if (isAvailable !== null) updates.is_available = isAvailable === 'true'

  const isVisible = form.get('is_visible')
  if (isVisible !== null) updates.is_visible = isVisible === 'true'

  // Загрузка нового фото
  const photo = form.get('photo') as File | null
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format non supporté. JPG, PNG ou WebP uniquement.' }, { status: 400 })
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'Photo trop volumineuse. Maximum 5 Mo.' }, { status: 400 })
    }

    const ext = extFromMime(photo.type)
    const fileName = `${id}.${ext}`
    const buffer = Buffer.from(await photo.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from('menu-photos')
      .upload(fileName, buffer, { contentType: photo.type, upsert: true })

    if (uploadError) {
      console.error('[PATCH /api/admin/menu/:id] Ошибка загрузки фото:', uploadError)
      return NextResponse.json({ error: 'Erreur lors du téléchargement de la photo' }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage.from('menu-photos').getPublicUrl(fileName)
    updates.photo_url = publicUrl
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 })
  }

  const { data: updated, error: updateError } = await admin
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (updateError) {
    console.error('[PATCH /api/admin/menu/:id] Ошибка обновления:', updateError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(updated)
}
