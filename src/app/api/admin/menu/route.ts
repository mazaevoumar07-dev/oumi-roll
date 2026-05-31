import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Допустимые форматы фото
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 МБ

// Расширение файла по MIME-типу
function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  return 'webp'
}

// GET /api/admin/menu — все позиции включая скрытые
export async function GET() {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await admin
    .from('menu_items')
    .select('id, name, description, price, original_price, photo_url, is_available, is_visible, category, pieces, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/admin/menu]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/admin/menu — добавить новую позицию меню
export async function POST(request: Request) {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const form = await request.formData()

  const name = (form.get('name') as string | null)?.trim()
  const price = form.get('price')
  const description = (form.get('description') as string | null)?.trim() ?? null
  const originalPrice = form.get('original_price')
  const category = (form.get('category') as string | null)?.trim() ?? null
  const pieces = form.get('pieces')
  const photo = form.get('photo') as File | null

  // Обязательные поля
  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
  const priceNum = Number(price)
  if (!price || isNaN(priceNum) || priceNum <= 0) {
    return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
  }

  // Валидация фото если загружено
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format non supporté. JPG, PNG ou WebP uniquement.' }, { status: 400 })
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'Photo trop volumineuse. Maximum 5 Mo.' }, { status: 400 })
    }
  }

  // Создаём запись в БД чтобы получить UUID
  const { data: item, error: insertError } = await admin
    .from('menu_items')
    .insert({
      name,
      description,
      price: priceNum,
      original_price: originalPrice ? Number(originalPrice) : null,
      category,
      pieces: pieces ? Number(pieces) : null,
      is_available: true,
      is_visible: true,
    })
    .select('id')
    .single()

  if (insertError || !item) {
    console.error('[POST /api/admin/menu] Ошибка создания позиции:', insertError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Загружаем фото в Supabase Storage если оно есть
  if (photo && photo.size > 0) {
    const ext = extFromMime(photo.type)
    const fileName = `${item.id}.${ext}`
    const buffer = Buffer.from(await photo.arrayBuffer())

    const { error: uploadError } = await admin.storage
      .from('menu-photos')
      .upload(fileName, buffer, { contentType: photo.type, upsert: true })

    if (uploadError) {
      console.error('[POST /api/admin/menu] Ошибка загрузки фото:', uploadError)
      // Позиция уже создана — не удаляем, просто фото останется пустым
    } else {
      // Сохраняем публичный URL в БД
      const { data: { publicUrl } } = admin.storage.from('menu-photos').getPublicUrl(fileName)
      await admin.from('menu_items').update({ photo_url: publicUrl }).eq('id', item.id)
    }
  }

  // Возвращаем созданную позицию
  const { data: created } = await admin.from('menu_items').select('*').eq('id', item.id).single()
  return NextResponse.json(created, { status: 201 })
}
