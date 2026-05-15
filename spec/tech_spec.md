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
| База данных | PostgreSQL через Neon | Хранение заказов, меню, пользователей |
| Оплата | Stripe | Оплата картой, Apple Pay, Google Pay |
| SMS | Twilio | Уведомления клиентам об акциях |
| Геокодинг | Google Maps Geocoding API | Расчёт расстояния для доставки |
| Хостинг | Vercel | Frontend + Backend (serverless functions) |
| Хранение фото | Vercel Blob | Фотографии позиций меню |
| Мультиязычность | i18next | Французский (по умолчанию), английский, русский |
| Карта (клиент) | Google Maps JavaScript API | Карта с курьером на странице отслеживания |
| Переменные окружения | Vercel Environment Variables | API-ключи, секреты |

---

## Архитектура системы

```
Клиент (браузер)
    │
    ├── GET /menu, /orders/:id        → Vercel Serverless Functions (Node.js + Express)
    ├── POST /orders, /auth/login     →        │
    └── POST /payment/intent          →        │
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                           Neon DB          Stripe           Twilio
                        (PostgreSQL)      (Оплата)           (SMS)
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
│   │   ├── connexion/page.tsx      → Вход / Регистрация
│   │   ├── admin/                  → Панель администратора
│   │   └── api/                    ← API Routes (backend)
│   │       ├── menu/route.ts           → GET  /api/menu
│   │       ├── menu/[id]/route.ts      → GET  /api/menu/:id
│   │       ├── orders/route.ts         → POST /api/orders
│   │       ├── orders/[id]/route.ts    → GET  /api/orders/:id
│   │       ├── orders/[id]/cancel/route.ts  → POST /api/orders/:id/cancel
│   │       ├── auth/register/route.ts  → POST /api/auth/register
│   │       ├── auth/login/route.ts     → POST /api/auth/login
│   │       ├── auth/logout/route.ts    → POST /api/auth/logout
│   │       ├── delivery/calculate/route.ts → POST /api/delivery/calculate
│   │       ├── payment/create-intent/route.ts → POST /api/payment/intent
│   │       ├── payment/webhook/route.ts    → POST /api/payment/webhook
│   │       ├── courier/location/route.ts   → POST /api/courier/location
│   │       └── admin/
│   │           ├── menu/route.ts       → GET, POST /api/admin/menu
│   │           ├── menu/[id]/route.ts  → PATCH /api/admin/menu/:id
│   │           ├── orders/route.ts     → GET /api/admin/orders
│   │           ├── orders/[id]/route.ts → PATCH /api/admin/orders/:id
│   │           ├── sms/send/route.ts   → POST /api/admin/sms/send
│   │           └── promotions/route.ts → GET, PATCH /api/admin/promotions
│   ├── components/                 ← UI-компоненты
│   ├── context/                    ← React Context (корзина, auth)
│   ├── data/                       ← статичные данные (меню)
│   ├── lib/                        ← общий код (db, helpers)
│   │   ├── db.ts                   → подключение к Neon (PostgreSQL)
│   │   ├── auth.ts                 → проверка JWT токенов
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

### `users` — зарегистрированные клиенты

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| first_name | VARCHAR(100) | Имя |
| last_name | VARCHAR(100) | Фамилия |
| phone | VARCHAR(20) UNIQUE | Номер телефона (логин) |
| password_hash | TEXT | Хэш пароля (bcrypt) |
| sms_opt_in | BOOLEAN | Согласие на SMS-рассылку |
| created_at | TIMESTAMP | Дата регистрации |

### `menu_items` — позиции меню

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| name | VARCHAR(200) | Название ролла |
| description | TEXT | Описание |
| price | NUMERIC(8,2) | Текущая цена (€) |
| original_price | NUMERIC(8,2) | Старая цена (если есть скидка) |
| photo_url | TEXT | Ссылка на фото |
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
| delivery_type | ENUM('delivery','pickup') | Способ получения |
| address | TEXT | Адрес доставки (NULL если самовывоз) |
| delivery_cost | NUMERIC(8,2) | Стоимость доставки (0 если самовывоз) |
| total_amount | NUMERIC(8,2) | Итоговая сумма (заказ + доставка) |
| status | ENUM | Статус (см. ниже) |
| payment_status | ENUM('pending','paid','failed') | Статус оплаты |
| stripe_payment_id | TEXT | ID платежа в Stripe |
| created_at | TIMESTAMP | Время создания заказа |
| cancelled_at | TIMESTAMP | Время отмены (NULL если не отменён) |

**Статусы заказа:** `new` → `preparing` → `in_delivery` → `completed` / `cancelled`

### `courier_locations` — GPS-координаты курьера (F-13)

| Поле | Тип | Описание |
|---|---|---|
| order_id | UUID (FK) | Ссылка на orders.id |
| latitude | NUMERIC(10,7) | Широта |
| longitude | NUMERIC(10,7) | Долгота |
| updated_at | TIMESTAMP | Время последнего обновления |

> Одна строка на заказ. Координаты перезаписываются каждые 10 секунд пока заказ "В доставке".

### `promotions` — бонусы и акции (F-12)

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| is_active | BOOLEAN | Включён бонус или нет |
| gift_item_id | UUID (FK) | Ролл-подарок (ссылка на menu_items.id) |
| updated_at | TIMESTAMP | Когда администратор последний раз менял настройку |

> Таблица содержит одну строку — настройки текущего бонуса. Администратор меняет `is_active` и `gift_item_id` через панель.

### `order_items` — состав заказа

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| order_id | UUID (FK) | Ссылка на orders.id |
| menu_item_id | UUID (FK) | Ссылка на menu_items.id |
| name | VARCHAR(200) | Название (копируется на момент заказа) |
| price | NUMERIC(8,2) | Цена (копируется на момент заказа) |
| quantity | INTEGER | Количество |

> Цена и название копируются при создании заказа — чтобы история не менялась если владелец изменит меню.

---

## API — Эндпоинты

### Меню

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | /api/menu | Список всех доступных позиций | Публичный |
| GET | /api/menu/:id | Одна позиция меню | Публичный |

### Заказы

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/orders | Создать заказ | Публичный |
| GET | /api/orders/:id | Статус заказа по ID | Публичный |
| POST | /api/orders/:id/cancel | Отменить заказ (3 минуты) | Публичный |

### Аутентификация

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/auth/register | Регистрация клиента | Публичный |
| POST | /api/auth/login | Вход в аккаунт | Публичный |
| POST | /api/auth/logout | Выход | Авторизованный |

### Доставка

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/delivery/calculate | Расчёт стоимости по адресу | Публичный |

### Оплата

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/payment/intent | Создать платёжный intent (Stripe) | Публичный |
| POST | /api/payment/webhook | Webhook от Stripe (подтверждение оплаты) | Только Stripe |

### Профиль клиента

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | /api/users/me/orders | История заказов клиента | Авторизованный |

### Восстановление пароля

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/auth/forgot-password | Отправить SMS с кодом на номер телефона | Публичный |
| POST | /api/auth/reset-password | Проверить код и установить новый пароль | Публичный |

### GPS-отслеживание (F-13)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/courier/location | Курьер отправляет свои GPS-координаты | По токену заказа |
| GET | /api/orders/:id/location | Клиент получает текущие координаты курьера | Публичный |

### Панель администратора

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | /api/admin/login | Вход в панель администратора | Публичный |
| GET | /api/admin/orders | Все заказы (новые вверху) | Только админ |
| PATCH | /api/admin/orders/:id | Сменить статус заказа | Только админ |
| GET | /api/admin/menu | Все позиции (включая скрытые) | Только админ |
| POST | /api/admin/menu | Добавить позицию | Только админ |
| PATCH | /api/admin/menu/:id | Изменить позицию | Только админ |
| POST | /api/admin/sms/send | Разослать SMS всем клиентам | Только админ |
| GET | /api/admin/promotions | Текущие настройки бонусов | Только админ |
| PATCH | /api/admin/promotions | Включить/выключить бонус, выбрать подарок | Только админ |

---

## Аутентификация

### Клиент
- JWT токен, хранится в `localStorage`
- Логин: номер телефона + пароль
- Токен истекает через 7 дней

### Администратор
- Заходит на страницу `/admin/login` — отдельная страница, скрытая от обычных клиентов
- Вводит логин (email или имя) и пароль
- Получает JWT с ролью `admin`, хранится в `httpOnly cookie` (безопаснее чем localStorage)
- Этот токен даёт доступ ко всем `/api/admin/*` эндпоинтам
- Аккаунт администратора создаётся один раз разработчиком (вручную в базе данных) — регистрации нет
- Только один администратор — владелец ресторана

### Общее
- Пароли хэшируются через **bcrypt** (salt rounds: 12)
- После 5 неверных попыток входа — блокировка на 15 минут (хранится в БД)

---

## Расчёт стоимости доставки (F-04)

1. Клиент вводит адрес
2. Backend отправляет адрес в **Google Maps Geocoding API** → получает координаты
3. Backend считает расстояние от ресторана до клиента (по прямой × 1.3 — поправка на дороги)
4. Применяет тариф:

| Расстояние | Стоимость |
|---|---|
| 0 — 3 км | €2.50 |
| 3.0 — 3.5 км | €3.50 |
| 3.5 — 4.0 км | €4.50 |
| 4.0 — 4.5 км | €5.50 |
| 4.5 — 5.0 км | €6.50 |
| > 5 км | Недоступно |

- Координаты ресторана: задаются в переменных окружения (`RESTAURANT_LAT`, `RESTAURANT_LNG`)

---

## Внешние сервисы

### Stripe (оплата)
- Используется **Stripe Payment Intents API**
- Заказ создаётся только после подтверждения оплаты (через webhook)
- Данные карты никогда не проходят через наш сервер — только через Stripe
- **Возврат денег при отмене:** если клиент отменяет оплаченный заказ в течение 3 минут, backend вызывает Stripe Refunds API → деньги возвращаются на карту клиента за 5–10 рабочих дней

### Twilio (SMS)
- Рассылка через **Twilio Messaging API**
- Отправка только клиентам с `sms_opt_in = true`
- Логирование: сколько SMS отправлено, сколько ошибок

### Neon (PostgreSQL)
- Подключение через `DATABASE_URL` (connection string)
- Используется библиотека `pg` (node-postgres)
- Миграции через `node-pg-migrate`

### Vercel Blob (хранение фото)
- Фотографии роллов загружаются администратором и хранятся в Vercel Blob
- При загрузке фото через `/api/admin/menu` — файл сохраняется в Blob, в БД пишется только URL
- Максимальный размер фото: 5 МБ
- Поддерживаемые форматы: JPG, PNG, WebP

### Google Maps Geocoding API
- Используется только на backend (API-ключ не виден клиенту)
- Запрос: адрес → координаты → расстояние

---

## Переменные окружения

```env
# База данных
DATABASE_URL=postgresql://...

# Аутентификация
JWT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Google Maps
GOOGLE_MAPS_API_KEY=...

# Vercel Blob (фото роллов)
BLOB_READ_WRITE_TOKEN=...

# Google Maps (карта для клиента — публичный ключ, только для домена сайта)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...

# Ресторан
RESTAURANT_LAT=47.9948
RESTAURANT_LNG=0.1985
```

Все переменные хранятся в **Vercel Environment Variables** — не в коде и не в git.

---

## Безопасность

- SQL-запросы только через параметризацию (защита от SQL-инъекций)
- Все `/api/admin/*` эндпоинты проверяют JWT с ролью `admin`
- Stripe webhook проверяется через подпись (`stripe-signature` header)
- CORS настроен только на домен ресторана
- Пароли никогда не хранятся в открытом виде

---
