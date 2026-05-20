# Этап 2 — Backend

**Статус:** Не начат  
**Предыдущий этап:** [Написание спецификаций](../завершённые/спецификации.md)

---

## Цель

Подключить реальный сервер, базу данных и внешние сервисы чтобы сайт заработал по-настоящему: заказы сохранялись, оплата списывалась, администратор видел входящие заказы.

---

## Что нужно сделать

### 1. Настройка окружения
- [ ] Зарегистрировать аккаунты: Neon, Stripe, Twilio, Google Cloud
- [ ] Получить все API-ключи
- [ ] Добавить переменные окружения в Vercel
- [ ] Запустить миграции базы данных (`npm run db:migrate`)
- [ ] Заполнить меню начальными данными (`npm run db:seed`)

### 2. База данных (Neon / PostgreSQL)
- [ ] Написать миграции для всех таблиц: `users`, `menu_items`, `orders`, `order_items`, `courier_locations`, `promotions`, `password_reset_tokens`, `login_attempts`

### 3. API — функции для клиента
- [ ] **F-01** `GET /api/menu` — список меню из БД
- [ ] **F-02** Корзина — логика бонуса (F-12) на клиенте
- [ ] **F-03** `POST /api/orders` — создание заказа через Stripe webhook
- [ ] **F-04** `POST /api/delivery/calculate` — расчёт доставки через Google Maps
- [ ] **F-05** `POST /api/orders/:id/cancel` — отмена заказа + возврат через Stripe
- [ ] **F-06** `POST /api/auth/register`, `/login`, `/logout`, `/forgot-password`, `/reset-password`
- [ ] **F-07** `GET /api/orders/:id` — статус заказа по токену
- [ ] **F-08** `POST /api/payment/intent` + `/api/payment/webhook` — Stripe оплата
- [ ] **F-13** `POST /api/courier/location` + `GET /api/orders/:id/location` — GPS курьера

### 4. API — панель администратора
- [ ] **F-10** `GET/POST /api/admin/menu`, `PATCH /api/admin/menu/:id` — управление меню
- [ ] **F-11** `GET /api/admin/orders`, `PATCH /api/admin/orders/:id` — управление заказами
- [ ] **F-09** `POST /api/admin/sms/send` — SMS-рассылка через Twilio
- [ ] **F-12** `GET/PATCH /api/admin/promotions` — управление бонусами
- [ ] `POST /api/admin/login` — вход в панель

### 5. Подключение frontend к backend
- [ ] Страница меню — данные из API вместо статичных
- [ ] Корзина — применение бонусов из API
- [ ] Форма заказа — отправка на сервер
- [ ] Страница оплаты — реальный Stripe Elements
- [ ] Страница отслеживания — реальный статус из API + карта Google Maps
- [ ] Вход / Регистрация — реальная аутентификация
- [ ] Панель администратора — реальные данные

### 6. Безопасность и rate limiting
- [ ] JWT middleware для защиты `/api/admin/*`
- [ ] Rate limiting через Next.js middleware
- [ ] CORS настроен только на домен ресторана

### 7. Деплой и запуск
- [ ] Проверить все переменные окружения в Vercel Production
- [ ] Пройти чеклист из [deployment_spec.md](../../spec/deployment_spec.md)
- [ ] Переключить Stripe с Test mode на Live mode
- [ ] Провести тестовый заказ от начала до конца

---

## Технический стек

Подробнее — в [tech_spec/overview.md](../../spec/tech_spec/overview.md)

| Компонент | Технология |
|---|---|
| Backend | Next.js API Routes |
| БД | PostgreSQL (Neon) |
| Оплата | Stripe |
| SMS | Twilio |
| Геокодинг | Google Maps Geocoding API |
| Карта | Google Maps JavaScript API |
| Фото | Vercel Blob |

---

## Связанные спеки

- [featurespec/](../../spec/featurespec/) — спеки всех функций F-01 — F-13
- [tech_spec/](../../spec/tech_spec/) — стек, API, БД, безопасность
- [deployment_spec.md](../../spec/deployment_spec.md) — деплой и настройка окружения
