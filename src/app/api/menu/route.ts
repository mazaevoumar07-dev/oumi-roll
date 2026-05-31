import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, description, price, original_price, photo_url, is_available, category, pieces')
    .eq('is_visible', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/menu]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json(data)
}
