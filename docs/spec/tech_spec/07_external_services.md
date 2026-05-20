# Внешние сервисы

---

## Stripe — оплата

**Используется:** Stripe Payment Intents API

- Заказ создаётся **только** после подтверждения оплаты через webhook `payment_intent.succeeded`
- Данные карты никогда не проходят через наш сервер — только через Stripe
- Комиссия: 1.5% + €0.25 с каждой транзакции (за счёт ресторана)
- Поддерживаемые методы: Visa, Mastercard, Apple Pay, Google Pay
- Валюта: только EUR (€)

**Хранение данных формы до оплаты:**
При создании Payment Intent данные формы (имя, адрес, состав корзины, email) передаются в `metadata` объекта PaymentIntent; email дополнительно передаётся в поле `receipt_email`. При получении webhook `payment_intent.succeeded` — сервер читает `metadata` и создаёт заказ. Данные формы не хранятся в нашей БД до подтверждения оплаты.

**Email-чек об оплате:**
Stripe автоматически отправляет чек на адрес из `receipt_email` после успешной транзакции. Активируется в Stripe Dashboard → Settings → Emails → «Successful payments». Дополнительного кода не требует.

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
- Библиотека: **`@neondatabase/serverless`** (HTTP-режим, не TCP) — обязательно для Vercel Serverless Functions
- Миграции: `node-pg-migrate`
- Регион: **EU West (Paris)** — ближайший к Ле-Ману

> **Почему не стандартный `pg`:** каждая serverless-функция открывает новое TCP-соединение к БД. При пиковой нагрузке (SMS-рассылка → все клиенты открывают сайт одновременно) возникает connection storm и Neon отказывает. `@neondatabase/serverless` использует HTTP-запросы без постоянного соединения — это правильный выбор для serverless.

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

## Google Maps — геокодинг

**Используется:** Google Maps Geocoding API (только backend)

- Геокодинг адреса клиента → координаты → расчёт расстояния до ресторана → стоимость доставки
- Вызывается при `POST /api/delivery/calculate` (один раз при уходе из поля адреса)

**Переменная окружения:**
```
GOOGLE_MAPS_API_KEY=AIza...
```

> Ключ ограничивается только серверными запросами в Google Cloud Console. Фронтендовый ключ для карты не нужен — карта с курьером удалена из проекта.
