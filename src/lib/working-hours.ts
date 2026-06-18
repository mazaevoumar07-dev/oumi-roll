export const TZ = 'Europe/Paris'

// Расписание: день недели JS (0=Вс, 1=Пн...6=Сб) → минуты от полуночи по Парижу
const SCHEDULE: Record<number, { open: number; close: number }> = {
  0: { open: 12 * 60, close: 21 * 60 }, // Воскресенье: 12:00–21:00
  1: { open: 11 * 60, close: 22 * 60 }, // Понедельник–Суббота: 11:00–22:00
  2: { open: 11 * 60, close: 22 * 60 },
  3: { open: 11 * 60, close: 22 * 60 },
  4: { open: 11 * 60, close: 22 * 60 },
  5: { open: 11 * 60, close: 22 * 60 },
  6: { open: 11 * 60, close: 22 * 60 },
}

const SLOT_STEP = 30
const LAST_SLOT_BEFORE_CLOSE = 30
const MIN_PREP_MINUTES = 45

// Получить компоненты даты/времени в часовом поясе Парижа
function parisComponents(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) =>
    parseInt(parts.find(p => p.type === type)?.value ?? '0', 10)

  const year = get('year')
  const month = get('month')
  const day = get('day')
  const hour = get('hour') % 24 // Intl может вернуть 24 для полуночи
  const minute = get('minute')

  return {
    year,
    month,
    day,
    hour,
    minute,
    weekday: new Date(year, month - 1, day).getDay(),
    dayMinutes: hour * 60 + minute,
  }
}

// Перевести локальное парижское время в UTC Date
function parisToUTC(year: number, month: number, day: number, hour: number, minute: number): Date {
  // Берём UTC-кандидат, считая парижское время как UTC
  const rough = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  // Смотрим, какое парижское время показывает этот UTC-момент
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(rough)

  const get = (type: string) =>
    parseInt(parts.find(p => p.type === type)?.value ?? '0', 10)

  const roughParisH = get('hour') % 24
  const roughParisM = get('minute')

  // Смещение: насколько Париж опережает UTC в данный момент
  const offsetMs = (roughParisH * 60 + roughParisM - hour * 60 - minute) * 60_000

  return new Date(rough.getTime() - offsetMs)
}

export function isOpen(now: Date = new Date()): boolean {
  const { weekday, dayMinutes } = parisComponents(now)
  const s = SCHEDULE[weekday]
  return dayMinutes >= s.open && dayMinutes <= s.close - LAST_SLOT_BEFORE_CLOSE
}

export function getNextOpenAt(now: Date = new Date()): Date {
  const current = parisComponents(now)
  // Если ещё не открылись сегодня — возвращаем сегодняшнее открытие
  const todayS = SCHEDULE[current.weekday]
  if (current.dayMinutes < todayS.open) {
    return parisToUTC(current.year, current.month, current.day,
      Math.floor(todayS.open / 60), todayS.open % 60)
  }
  // Иначе — следующий день (все дни рабочие, поэтому offset=1 всегда найдёт)
  for (let i = 1; i <= 7; i++) {
    const candidate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
    const { year, month, day, weekday } = parisComponents(candidate)
    const s = SCHEDULE[weekday]
    return parisToUTC(year, month, day, Math.floor(s.open / 60), s.open % 60)
  }
  throw new Error('[working-hours] Нет рабочего дня в ближайшие 7 дней')
}

export type Slot = { label: string; value: string | null }

export function generateSlots(now: Date = new Date()): Slot[] {
  const slots: Slot[] = []
  const current = parisComponents(now)
  const open = isOpen(now)

  for (let offset = 0; offset <= 1; offset++) {
    const targetDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000)
    const target = parisComponents(targetDate)
    const s = SCHEDULE[target.weekday]
    const lastSlotMin = s.close - LAST_SLOT_BEFORE_CLOSE

    // Сегодня: минимальный слот = сейчас + время готовки, с округлением вверх
    // Завтра: начинаем с открытия
    const minSlot = offset === 0
      ? Math.max(
          Math.ceil((current.dayMinutes + MIN_PREP_MINUTES) / SLOT_STEP) * SLOT_STEP,
          s.open,
        )
      : s.open

    // «Как можно скорее» — только если ресторан открыт прямо сейчас
    if (offset === 0 && open) {
      slots.push({ label: 'Dès que possible (~45 min)', value: null })
    }

    for (let slotMin = minSlot; slotMin <= lastSlotMin; slotMin += SLOT_STEP) {
      const h = Math.floor(slotMin / 60)
      const m = slotMin % 60
      const utc = parisToUTC(target.year, target.month, target.day, h, m)
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      slots.push({
        label: offset === 0 ? `${hh}:${mm}` : `Demain ${hh}:${mm}`,
        value: utc.toISOString(),
      })
    }
  }

  return slots
}

// Проверить, что delivery_time — допустимый будущий слот
export function isValidDeliveryTime(isoString: string | null, now: Date = new Date()): boolean {
  // null = ASAP, допустимо только когда ресторан открыт
  if (isoString === null) return isOpen(now)

  const deliveryDate = new Date(isoString)

  // Должно быть в будущем (с допуском 5 минут на медленное соединение)
  if (deliveryDate.getTime() < now.getTime() + (MIN_PREP_MINUTES - 5) * 60_000) return false

  // Должно попадать в рабочие часы
  const { weekday, dayMinutes } = parisComponents(deliveryDate)
  const s = SCHEDULE[weekday]
  return dayMinutes >= s.open && dayMinutes <= s.close - LAST_SLOT_BEFORE_CLOSE
}
