import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, description, price, original_price, photo_url, is_available, category, pieces')
    .eq('id', id)
    .eq('is_visible', true)
    .single()

  if (error?.code === 'PGRST116' || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (error) {
    console.error('[GET /api/menu/:id]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(data)
}
