// Скользящее окно в памяти: key → массив меток времени запросов
// Сбрасывается при холодном старте Vercel-инстанции — приемлемо для MVP
const store = new Map<string, number[]>()

/**
 * Возвращает true если запрос разрешён, false если лимит превышен.
 * @param key     Уникальный ключ (например "delivery:1.2.3.4")
 * @param limit   Максимальное кол-во запросов за окно
 * @param windowMs Размер окна в миллисекундах
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs

  const hits = (store.get(key) ?? []).filter(t => t > cutoff)

  if (hits.length >= limit) {
    store.set(key, hits)
    return false
  }

  hits.push(now)
  store.set(key, hits)
  return true
}

export function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
