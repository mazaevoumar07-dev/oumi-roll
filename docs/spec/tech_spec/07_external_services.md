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

**Используется:** Twilio Messaging API (два назначения)

1. **Supabase Auth OTP** — верификация телефона при регистрации клиента (настраивается в Supabase Dashboard → Auth → SMS Provider → Twilio)
2. **Промо-рассылки** — SMS клиентам с `sms_opt_in = true` через `/api/admin/sms/send`

- SMS рассылаются только клиентам с `sms_opt_in = true`
- Логирование: сколько SMS отправлено, сколько ошибок

**Переменные окружения:**
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
```

---

## Supabase — база данных + auth + storage

**Используется:** PostgreSQL + Supabase Auth + Supabase Storage

**База данных:**
- Подключение через `@supabase/supabase-js`
- На сервере (API routes): `createServerClient` из `@supabase/ssr` — читает cookie из запроса
- Регион: **EU West** — ближайший к Ле-Ману

**Auth:**
- Клиенты: телефон + пароль + SMS OTP через Twilio
- Администратор: email + пароль
- Supabase выдаёт и обновляет JWT автоматически

**Storage:**
- Бакет `menu-photos` — фотографии позиций меню
- Загрузка через `/api/admin/menu` — файл идёт в Supabase Storage, в БД пишется только публичный URL
- Максимальный размер: **5 МБ**
- Поддерживаемые форматы: JPG, PNG, WebP

**Переменные окружения:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...             # публичный — можно на клиент
SUPABASE_SERVICE_ROLE_KEY=eyJ...                 # только сервер — никогда не светить на клиенте
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

> Ключ ограничивается только серверными запросами в Google Cloud Console.
