import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isOpen, getNextOpenAt, generateSlots } from '@/lib/working-hours'

export async function GET() {
  const admin = createAdminClient()

  const { data: setting } = await admin
    .from('restaurant_settings')
    .select('value')
    .eq('key', 'orders_paused')
    .single()

  const paused = setting?.value === 'true'
  const now = new Date()
  const open = isOpen(now)

  return NextResponse.json({
    open,
    paused,
    nextOpenAt: open ? null : getNextOpenAt(now).toISOString(),
    slots: generateSlots(now),
  })
}
