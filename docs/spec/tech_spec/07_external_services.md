# Внешние сервисы

---

## Stripe — оплата

**Используется:** Stripe Payment Intents API

- Заказ создаётся **только** после подтверждения оплаты через webhook `payment_intent.succeeded`
- Данные карты никогда не проходят через наш сервер — только через Stripe
- Комиссия: 1.5% + €0.25 с каждой транзакции (за счёт ресторана)
- Поддерживаемые методы: Visa, Mastercard, Apple Pay, Google Pay
- Валюта: только EUR (€)

**Защита от дублей (idempotency):**
Перед созданием заказа: `SELECT id FROM orders WHERE stripe_payment_id = $1`.
Если строка уже есть — webhook игнорируется, возвращается `200 OK`.
Stripe гарантирует "at-least-once", поэтому один webhook может прийти несколько раз.

**Верификация подписи:**
Каждый webhook проверяется через `stripe.webhooks.constructEvent()` с `STRIPE_WEBHOOK_SECRET`.
Запросы без валидной подписи отклоняются с `400`.

**Возврат при отмене:**
Если клиент отменяет оплаченный заказ в течение 3 минут — backend вызывает Stripe Refunds API.
Деньги возвращаются на карту за 5–10 рабочих дней.

**Переменные окружения:**
```
STRIPE_SECRET_KEY=sk_...                        # серверный ключ — никогда не светить на клиенте
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...       # публичный ключ — нужен Stripe Elements на фронтенде
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Twilio — SMS

**Используется:** Twilio Messaging API

- SMS рассылаются только клиентам с `sms_opt_in = true`
- Логирование: сколько SMS отправлено, сколько ошибок
- Используется также для SMS-кодов восстановления пароля

**Переменные окружения:**
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
```

---

## Neon — PostgreSQL

**Используется:** PostgreSQL (управляемая БД)

- Подключение через `DATABASE_URL` (connection string)
- Библиотека: `pg` (node-postgres)
- Миграции: `node-pg-migrate`
- Регион: **EU West (Paris)** — ближайший к Ле-Ману

**Переменная окружения:**
```
DATABASE_URL=postgresql://user:pass@host/dbname
```

---

## Vercel Blob — хранение фото

**Используется:** Vercel Blob Storage

- Фотографии роллов загружаются администратором
- При загрузке через `/api/admin/menu` — файл сохраняется в Blob, в БД пишется только URL
- Максимальный размер: **5 МБ**
- Поддерживаемые форматы: JPG, PNG, WebP

**Переменная окружения:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

---

## Google Maps — геокодинг и карта

**Два разных ключа:**

| Ключ | Где используется | Доступ |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | Backend — геокодинг адреса для расчёта доставки | Только сервер, скрыт |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Frontend — карта с курьером на странице отслеживания | Публичный, ограничен доменом |

> `NEXT_PUBLIC_*` виден в браузере — ключ должен быть ограничен только доменом `oumiroll.fr` в настройках Google Cloud.

**Переменные окружения:**
```
GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
```
