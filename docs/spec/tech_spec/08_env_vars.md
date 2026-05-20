# Переменные окружения

> Все переменные хранятся в **Vercel Environment Variables** — не в коде и не в git.

---

## Полный список

```env
# База данных (Neon)
DATABASE_URL=postgresql://...

# Аутентификация
JWT_SECRET=...                        # случайная строка, минимум 32 символа

# Stripe
STRIPE_SECRET_KEY=sk_live_...          # серверный ключ — никогда не светить на клиенте
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # публичный ключ — нужен Stripe Elements на фронтенде
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...

# Google Maps (backend — геокодинг, скрыт от клиента)
GOOGLE_MAPS_API_KEY=AIza...

# Google Maps (frontend — карта с курьером, публичный ключ)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...

# Vercel Blob (фото роллов)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Координаты ресторана (Ле-Ман)
RESTAURANT_LAT=47.9948
RESTAURANT_LNG=0.1985
```

---

## Где задаются

Vercel Dashboard → Settings → Environment Variables.

Три окружения: `Development`, `Preview`, `Production` — у каждого свои значения.
Тестовые ключи Stripe (`sk_test_...`) используются в Development и Preview.
Боевые ключи (`sk_live_...`) — только в Production.

> Подробнее о настройке — в [deployment_spec.md](../deployment_spec.md).

---

## Важные правила

- `JWT_SECRET` — случайная строка, минимум 32 символа. Никогда не `password123`.
- `NEXT_PUBLIC_*` переменные **видны в браузере** — не писать туда секреты.
- `GOOGLE_MAPS_API_KEY` (backend) — должен быть ограничен только серверными запросами.
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (frontend) — ограничить доменом `oumiroll.fr` в Google Cloud Console.
