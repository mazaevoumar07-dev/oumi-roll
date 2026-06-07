import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const results: Record<string, unknown> = {
    env_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    env_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
    key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('menu_items').select('id').limit(1)
    results.supabase_ok = !error
    results.supabase_error = error?.message ?? null
    results.rows = data?.length ?? 0
  } catch (e: unknown) {
    results.supabase_exception = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json(results)
}
