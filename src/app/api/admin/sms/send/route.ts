import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/sms/send — количество SMS-подписчиков
export async function GET() {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { count, error } = await admin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('sms_opt_in', true)

  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })

  return NextResponse.json({ count: count ?? 0 })
}

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Инструкция отписки обязательна по французскому закону L.34-5
const STOP_SUFFIX = '\nRépondez STOP pour vous désinscrire.'

function toE164(phone: string): string {
  // Телефоны хранятся в формате "0612345678"
  if (phone.startsWith('0')) return '+33' + phone.slice(1)
  return phone
}

// POST /api/admin/sms/send — разослать SMS всем клиентам с sms_opt_in = true
export async function POST(request: Request) {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { message } = await request.json() as { message?: string }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  // Телефоны берём из БД — клиенту не доверяем список получателей
  const { data: recipients, error: dbError } = await admin
    .from('users')
    .select('phone')
    .eq('sms_opt_in', true)
    .not('phone', 'is', null)

  if (dbError) {
    console.error('[POST /api/admin/sms/send] Ошибка получения получателей:', dbError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, total: 0 })
  }

  const fullMessage = message.trim() + STOP_SUFFIX
  const from = process.env.TWILIO_PHONE_NUMBER!

  const results = await Promise.allSettled(
    recipients.map(r =>
      twilioClient.messages.create({
        body: fullMessage,
        from,
        to: toE164(r.phone!),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  // Логируем ошибки для диагностики
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[sms/send] Ошибка отправки на ${recipients[i].phone}:`, r.reason)
    }
  })

  return NextResponse.json({ sent, failed, total: recipients.length })
}
