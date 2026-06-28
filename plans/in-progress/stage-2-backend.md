# Этап 2 — Backend

**Статус:** В процессе  
**Предыдущий этап:** [Написание спецификаций](../completed/specifications.md)

> ⚠️ Стек изменился после первоначального плана: Neon → Supabase, Vercel Blob → Supabase Storage, F-13 GPS удалена.

---

## Цель

Подключить реальный сервер, базу данных и внешние сервисы чтобы сайт заработал по-настоящему: заказы сохранялись, оплата списывалась, администратор видел входящие заказы.

---

## Что нужно сделать

### 1. Настройка окружения
- [x] Зарегистрировать аккаунты: Supabase, Stripe, Twilio, Google Cloud
- [x] Написать `.env.local` с заглушками для всех переменных
- [x] Заполнить реальные ключи Supabase в `.env.local`
- [x] Заполнить реальные ключи Stripe в `.env.local`
- [x] Заполнить реальные ключи Twilio в `.env.local`
- [x] Заполнить реальный ключ Google Maps в `.env.local`
- [x] Добавить реальные координаты ресторана (RESTAURANT_LAT, RESTAURANT_LNG)
- [x] Запустить миграции в Supabase SQL Editor (001, 002, 003)
- [x] Создать бакет `menu-photos` в Supabase Storage (публичный)
- [x] Включить Phone Auth в Supabase + подключить Twilio
- [ ] Заполнить меню через панель администратора
- [x] Создать аккаунт администратора через Supabase Dashboard

### 2. База данных (Supabase / PostgreSQL)
- [x] Миграция 001 — все таблицы: `users`, `menu_items`, `orders`, `order_items`, `promotions`
- [x] Миграция 002 — исправлен триггер создания профиля (first_name, last_name, sms_opt_in)
- [x] Миграция 003 — добавлены поля `category` и `pieces` в `menu_items`
- [x] Запустить все три миграции в Supabase

### 3. API — функции для клиента
- [x] **F-01** `GET /api/menu` — список меню из БД
- [x] **F-02** Бонус проверяется сервером при создании Payment Intent
- [x] **F-03** `POST /api/orders` — создание заказа через Stripe webhook
- [x] **F-04** `POST /api/delivery/calculate` — расчёт доставки через Google Maps
- [x] **F-05** `POST /api/orders/:id/cancel` — отмена + возврат через Stripe
- [x] **F-06** Авторизация через Supabase Auth (без отдельных API-маршрутов)
- [x] **F-07** `GET /api/users/me/orders` — история заказов
- [x] **F-08** `POST /api/payment/intent` + `POST /api/payment/webhook`
- [x] `GET /api/orders/:id` — статус заказа

### 4. API — панель администратора
- [x] **F-10** `GET/POST /api/admin/menu`, `PATCH /api/admin/menu/:id`
- [x] **F-11** `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`
- [x] **F-09** `POST /api/admin/sms/send` — SMS-рассылка через Twilio
- [x] **F-12** `GET/PATCH /api/admin/promotions`
- [x] Вход в панель — через Supabase Auth (email + пароль)
- [x] Защита `/admin/*` страниц через middleware (редирект на `/admin/login`)

### 5. Подключение frontend к backend
- [x] Страница меню — данные из API, реальные фото
- [x] Корзина — бонус из API
- [x] Форма заказа — Email, расчёт доставки, реальный API
- [x] Страница оплаты — реальный Stripe Elements
- [x] Страница подтверждения — после оплаты
- [x] Вход / Регистрация — Supabase Auth + OTP
- [x] Панель администратора — реальные данные (подключена к API)

### 6. Безопасность
- [x] Защита `/admin/*` страниц через middleware
- [x] Проверка роли `admin` в каждом API-маршруте
- [x] Supabase RLS на всех таблицах
- [x] Stripe webhook signature verification
- [x] Rate limiting через Next.js middleware
- [x] CORS настроен на домен ресторана

### 7. Деплой и запуск
- [x] Добавить переменные окружения в Vercel Production
- [x] Запустить `npm run build` без ошибок
- [x] Задеплоить на Vercel — сайт доступен на oumi-roll.vercel.app
- [x] Исправить API роуты 500 (CRLF в NEXT_PUBLIC_APP_URL ломал Vercel роутер — PR #72)
- [ ] Пройти чеклист из [deployment_spec.md](../../docs/spec/deployment_spec.md)
- [ ] Переключить Stripe с Test на Live mode
- [~] Провести тестовый заказ от начала до конца
  - [x] Меню загружается из БД ✓
  - [x] Корзина открывается и работает ✓
  - [x] Форма заказа валидируется и отправляется ✓
  - [x] `/api/payment/intent` возвращает 200 с `client_secret` ✓
  - [x] Редирект на `/paiement/pi_...` работает ✓
  - [ ] Ручная оплата тест-картой (4242 4242 4242 4242) + webhook → confirmation

---

## Технический стек (актуальный)

| Компонент | Технология |
|---|---|
| Backend | Next.js API Routes |
| БД + Auth + Storage | Supabase (PostgreSQL + Auth + Storage) |
| Оплата | Stripe |
| SMS | Twilio (через Supabase Auth для OTP, напрямую для рассылок) |
| Геокодинг | Google Maps Geocoding API |
| Фото | Supabase Storage (бакет `menu-photos`) |

---

## Связанные спеки

- [featurespec/](../../docs/spec/featurespec/) — спеки всех функций F-01 — F-13
- [tech_spec/](../../docs/spec/tech_spec/) — стек, API, БД, безопасность
- [deployment_spec.md](../../docs/spec/deployment_spec.md) — деплой и настройка окружения
- [known_risks.md](../../docs/spec/known_risks.md) — известные риски и ограничения
