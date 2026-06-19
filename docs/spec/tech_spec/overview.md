# Tech Spec — OUMI ROLL

## Статус

> Создан — 2026-05-05
> Этап — Backend (в разработке)

---

## Стек технологий

| Компонент | Технология | Зачем |
|---|---|---|
| Frontend | Next.js 15 + TypeScript (готово) | App Router, SSR, статичные страницы |
| Backend | Next.js API Routes (App Router) | Сервер и API внутри того же проекта |
| База данных | PostgreSQL через Supabase | Хранение заказов, меню, пользователей |
| Auth | Supabase Auth | Сессии, JWT, OTP — без ручного bcrypt/JWT |
| Оплата | Stripe | Оплата картой, Apple Pay, Google Pay |
| SMS | Twilio | OTP при регистрации + промо-рассылки |
| Геокодинг | Google Maps Geocoding API | Расчёт расстояния для доставки |
| Хостинг | Vercel | Frontend + Backend (serverless functions) |
| Хранение фото | Supabase Storage | Фотографии позиций меню |
| Мультиязычность | i18next | Французский (по умолчанию), английский, русский |
| Карта (клиент) | Google Maps JavaScript API | Карта с курьером на странице отслеживания |
| Переменные окружения | Vercel Environment Variables | API-ключи, секреты |

---

## Архитектура системы

```
Клиент (браузер)
    │
    ├── GET /menu, /orders/:id        → Vercel Serverless Functions (Next.js API Routes)
    ├── POST /orders, /payment/intent →        │
    └── POST /admin/orders            →        │
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                           Supabase         Stripe           Twilio
                        (PostgreSQL         (Оплата)          (SMS)
                         + Auth
                         + Storage)
                              │
                       Google Maps API
                       (Геокодинг)
```

Frontend и backend деплоятся на Vercel:
- Frontend — статичные файлы (уже готово)
- Backend — папка `api/` → Vercel автоматически превращает каждый файл в serverless function

---

## Структура проекта

```
oumi-roll/
├── src/
│   ├── app/                        ← Next.js App Router
│   │   ├── page.tsx                → Главная (Hero + Menu)
│   │   ├── commande/page.tsx       → Оформление заказа
│   │   ├── paiement/[id]/page.tsx  → Оплата (Stripe)
│   │   ├── suivi/[id]/page.tsx     → Отслеживание заказа
│   │   ├── connexion/page.tsx      → Вход / Регистрация (Supabase Auth UI)
│   │   ├── admin/                  → Панель администратора
│   │   └── api/                    ← API Routes (backend)
│   │       ├── menu/route.ts           → GET  /api/menu
│   │       ├── menu/[id]/route.ts      → GET  /api/menu/:id
│   │       ├── orders/route.ts         → POST /api/orders (только Stripe webhook)
│   │       ├── orders/[id]/route.ts    → GET  /api/orders/:id
│   │       ├── orders/[id]/cancel/route.ts  → POST /api/orders/:id/cancel
│   │       ├── delivery/calculate/route.ts → POST /api/delivery/calculate
│   │       ├── payment/create-intent/route.ts → POST /api/payment/intent
│   │       ├── payment/webhook/route.ts    → POST /api/payment/webhook
│   │       ├── courier/location/route.ts   → POST /api/courier/location
│   │       └── admin/
│   │           ├── menu/route.ts       → GET, POST /api/admin/menu
│   │           ├── menu/[id]/route.ts  → PATCH /api/admin/menu/:id
│   │           ├── orders/route.ts     → GET, POST /api/admin/orders
│   │           ├── orders/[id]/route.ts → PATCH /api/admin/orders/:id
│   │           ├── sms/send/route.ts   → POST /api/admin/sms/send
│   │           └── promotions/route.ts → GET, PATCH /api/admin/promotions
│   ├── components/                 ← UI-компоненты
│   ├── context/                    ← React Context (корзина, auth)
│   ├── data/                       ← статичные данные (меню)
│   ├── lib/                        ← общий код (supabase client, helpers)
│   │   ├── supabase/server.ts      → createServerClient (@supabase/ssr)
│   │   ├── supabase/client.ts      → createBrowserClient (@supabase/ssr)
│   │   └── delivery.ts             → расчёт стоимости доставки
│   └── types/                      ← TypeScript типы
│
├── public/                         ← статичные файлы
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## База данных — Схема таблиц

> Авторитетный источник: `03_database.md`. Здесь — краткая сводка.

### `users` — профили клиентов

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Совпадает с `auth.users.id` (Supabase) |
| first_name | VARCHAR(100) | Имя |
| last_name | VARCHAR(100) | Фамилия |
| phone | VARCHAR(20) | Телефон (логин клиента; NULL у администратора) |
| email | VARCHAR(200) | Email (логин администратора; NULL у клиентов) |
| role | TEXT | `'client'` или `'admin'`; по умолчанию `'client'` |
| sms_opt_in | BOOLEAN | Согласие на SMS-рассылку |
| sms_opt_in_at | TIMESTAMP | Дата согласия (RGPD) |
| created_at | TIMESTAMP | Дата регистрации |

> Пароль и сессия хранятся в `auth.users` (Supabase) — не в этой таблице.

### `menu_items` — позиции меню

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| name | VARCHAR(200) | Название ролла |
| description | TEXT | Описание |
| price | NUMERIC(8,2) | Текущая цена (€) |
| original_price | NUMERIC(8,2) | Старая цена (если есть скидка) |
| photo_url | TEXT | Ссылка на фото (Supabase Storage) |
| is_available | BOOLEAN | Доступен для заказа |
| is_visible | BOOLEAN | Виден в меню (не удалён) |
| created_at | TIMESTAMP | Дата добавления |

### `orders` — заказы

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| order_number | SERIAL | Человеческий номер заказа (#1, #2...) |
| user_id | UUID (FK) | Ссылка на users.id (NULL если без регистрации) |
| first_name | VARCHAR(100) | Имя клиента |
| last_name | VARCHAR(100) | Фамилия клиента |
| phone | VARCHAR(20) | Телефон клиента |
| email | VARCHAR(200) | Email (для Stripe receipt_email) |
| delivery_type | TEXT | `'delivery'`, `'pickup'`, `'in_person'` |
| address | TEXT | Адрес доставки (NULL если самовывоз или на месте) |
| delivery_cost | NUMERIC(8,2) | Стоимость доставки |
| total_amount | NUMERIC(8,2) | Итоговая сумма |
| source | TEXT | Канал заказа: `'online'`, `'phone'`, `'in_person'`; default `'online'` |
| payment_method | TEXT | `'stripe'`, `'cash'`, `'card_terminal'`; default `'stripe'` |
| status | TEXT | Статус заказа |
| payment_status | TEXT | `'pending'`, `'paid'`, `'failed'` |
| stripe_payment_id | TEXT UNIQUE | ID платежа в Stripe; NULL для ручных заказов |
| refund_failed | BOOLEAN | true если возврат Stripe не прошёл; default false |
| comment | TEXT | Комментарий к заказу |
| created_at | TIMESTAMP | Время создания |
| cancelled_at | TIMESTAMP | Время отмены (NULL если не отменён) |

**Статусы:** `new` → `preparing` → `in_delivery` → `completed` / `cancelled`

> Ручные заказы (source = `'phone'` / `'in_person'`) создаются сразу в статусе `preparing`.

### `order_items` — состав заказа

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| order_id | UUID (FK) | Ссылка на orders.id |
| menu_item_id | UUID (FK) | Ссылка на menu_items.id |
| name | VARCHAR(200) | Название (копируется на момент заказа) |
| price | NUMERIC(8,2) | Цена (копируется на момент заказа; 0.00 если подарок) |
| quantity | INTEGER | Количество |
| is_gift | BOOLEAN | true если позиция добавлена как подарок по бонусу |

### `promotions` — бонусы и акции

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| is_active | BOOLEAN | Включён бонус или нет |
| gift_item_id | UUID (FK) | Ролл-подарок (ссылка на menu_items.id) |
| updated_at | TIMESTAMP | Последнее изменение |

> Таблица содержит одну строку — настройки текущего бонуса.

---

## API — Эндпоинты

> Авторитетный источник: `04_api.md`. Здесь — краткая сводка.

### Меню

| Метод | Путь | Доступ |
|---|---|---|
| GET | /api/menu | Публичный |
| GET | /api/menu/:id | Публичный |

### Заказы

| Метод | Путь | Доступ |
|---|---|---|
| POST | /api/orders | Только Stripe webhook |
| GET | /api/orders/:id | Клиент (владелец) или Admin |
| POST | /api/orders/:id/cancel | Клиент (владелец) или Admin |

### Доставка и оплата

| Метод | Путь | Доступ |
|---|---|---|
| POST | /api/delivery/calculate | Публичный |
| POST | /api/payment/intent | Публичный |
| POST | /api/payment/webhook | Только Stripe |

### Профиль клиента

| Метод | Путь | Доступ |
|---|---|---|
| GET | /api/users/me/orders | Авторизованный |

### GPS-отслеживание

| Метод | Путь | Доступ |
|---|---|---|
| POST | /api/courier/location | `?token=<courier_token>` |
| GET | /api/orders/:id/location | `?token=<tracking_token>` или авторизованный |

### Панель администратора

| Метод | Путь | Доступ |
|---|---|---|
| GET | /api/admin/orders | Только админ |
| POST | /api/admin/orders | Только админ (ручной ввод: телефон / на месте) |
| PATCH | /api/admin/orders/:id | Только админ |
| GET | /api/admin/menu | Только админ |
| POST | /api/admin/menu | Только админ |
| PATCH | /api/admin/menu/:id | Только админ |
| POST | /api/admin/sms/send | Только админ |
| GET | /api/admin/promotions | Только админ |
| PATCH | /api/admin/promotions | Только админ |

> Auth (вход, выход, сброс пароля) — через Supabase Auth SDK на клиенте, без отдельных API-маршрутов.

---

## Аутентификация

> Авторитетный источник: `05_auth.md`.

- Полностью управляется **Supabase Auth** — никакого ручного JWT/bcrypt
- Клиент: телефон + пароль, SMS OTP через Twilio
- Администратор: email + пароль, роль `admin` проверяется через `public.users`
- JWT хранится в `httpOnly cookie` через `@supabase/ssr`
- Пакеты: `@supabase/supabase-js`, `@supabase/ssr`

---

## Внешние сервисы

> Авторитетный источник: `07_external_services.md`.

- **Supabase** — PostgreSQL + Auth + Storage (бакет `menu-photos`)
- **Stripe** — Payment Intents, webhook `payment_intent.succeeded`, Refunds API
- **Twilio** — SMS OTP (через Supabase Dashboard) + промо-рассылки
- **Google Maps Geocoding API** — геокодинг адреса для расчёта стоимости доставки

---

## Переменные окружения

> Авторитетный источник: `08_env_vars.md`.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# Ресторан
RESTAURANT_LAT=47.9948
RESTAURANT_LNG=0.1985
```

Все переменные хранятся в **Vercel Environment Variables** — не в коде и не в git.

---

## Безопасность

- Supabase Auth управляет паролями и сессиями — bcrypt и JWT вручную не используются
- Все `/api/admin/*` проверяют роль через `supabase.auth.getUser()` + `SELECT role FROM public.users`
- SQL только через `@supabase/supabase-js` (параметризованные запросы — без интерполяции строк)
- Stripe webhook проверяется через подпись (`stripe.webhooks.constructEvent()`)
- Защита от дублей webhook: `UNIQUE` на `stripe_payment_id`
- `NEXT_PUBLIC_*` переменные видны в браузере — секреты туда не писать
- `SUPABASE_SERVICE_ROLE_KEY` обходит RLS — только на сервере, никогда на клиенте
