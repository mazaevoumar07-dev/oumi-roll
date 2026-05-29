# Переменные окружения

> Все переменные хранятся в **Vercel Environment Variables** — не в коде и не в git.

---

## Полный список

```env
# Supabase (база данных + auth + storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...                   # серверный ключ — никогда не светить на клиенте
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # публичный ключ — нужен Stripe Elements на фронтенде
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio (SMS акции + OTP через Supabase)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...

# Google Maps (backend — геокодинг адреса для расчёта доставки)
GOOGLE_MAPS_API_KEY=AIza...

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

---

## Важные правила

- `SUPABASE_SERVICE_ROLE_KEY` — даёт полный доступ к БД в обход RLS. Только на сервере, никогда на клиенте.
- `NEXT_PUBLIC_*` переменные **видны в браузере** — не писать туда секреты.
- `GOOGLE_MAPS_API_KEY` — ограничить только серверными запросами в Google Cloud Console.
