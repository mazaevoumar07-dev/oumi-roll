# Структура файлов проекта

---

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
│   │   │   ├── login/page.tsx      → Вход администратора
│   │   │   ├── orders/page.tsx     → Управление заказами
│   │   │   └── menu/page.tsx       → Управление меню
│   │   └── api/                    ← API Routes (backend)
│   │       ├── menu/route.ts                    → GET  /api/menu
│   │       ├── menu/[id]/route.ts               → GET  /api/menu/:id
│   │       ├── orders/route.ts                  → POST /api/orders
│   │       ├── orders/[id]/route.ts             → GET  /api/orders/:id
│   │       ├── orders/[id]/cancel/route.ts      → POST /api/orders/:id/cancel
│   │       ├── orders/[id]/location/route.ts    → GET  /api/orders/:id/location
│   │       ├── auth/register/route.ts           → POST /api/auth/register
│   │       ├── auth/login/route.ts              → POST /api/auth/login
│   │       ├── auth/logout/route.ts             → POST /api/auth/logout
│   │       ├── auth/forgot-password/route.ts    → POST /api/auth/forgot-password
│   │       ├── auth/reset-password/route.ts     → POST /api/auth/reset-password
│   │       ├── users/me/orders/route.ts         → GET  /api/users/me/orders
│   │       ├── delivery/calculate/route.ts      → POST /api/delivery/calculate
│   │       ├── payment/create-intent/route.ts   → POST /api/payment/intent
│   │       ├── payment/webhook/route.ts         → POST /api/payment/webhook
│   │       ├── courier/location/route.ts        → POST /api/courier/location
│   │       └── admin/
│   │           ├── login/route.ts       → POST /api/admin/login
│   │           ├── menu/route.ts        → GET, POST /api/admin/menu
│   │           ├── menu/[id]/route.ts   → PATCH /api/admin/menu/:id
│   │           ├── orders/route.ts      → GET /api/admin/orders
│   │           ├── orders/[id]/route.ts → PATCH /api/admin/orders/:id
│   │           ├── sms/send/route.ts    → POST /api/admin/sms/send
│   │           └── promotions/route.ts  → GET, PATCH /api/admin/promotions
│   ├── middleware.ts               → rate limiting (Next.js Middleware)
│   ├── components/                 ← UI-компоненты
│   ├── context/                    ← React Context (корзина, auth)
│   ├── data/                       ← статичные данные (меню)
│   ├── lib/                        ← общий код (db, helpers)
│   │   ├── db.ts                   → подключение к Neon (PostgreSQL)
│   │   ├── auth.ts                 → проверка JWT токенов
│   │   └── delivery.ts             → расчёт стоимости доставки
│   └── types/                      ← TypeScript типы
│
├── migrations/                     ← SQL-миграции базы данных (node-pg-migrate)
│   ├── 001_create_users.sql
│   ├── 002_create_menu_items.sql
│   ├── 003_create_orders.sql
│   └── ...                         → npm run db:migrate применяет все миграции
├── scripts/
│   └── create-admin.ts             → npm run create:admin — создаёт аккаунт администратора
├── public/                         ← статичные файлы
├── docs/                           ← документация проекта
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Ключевые папки

| Папка | Назначение |
|---|---|
| `src/app/api/` | Весь backend — каждый файл становится serverless function на Vercel |
| `src/lib/` | Переиспользуемый код: подключение к БД, проверка JWT, расчёт доставки |
| `src/components/` | React-компоненты интерфейса |
| `src/context/` | Глобальное состояние: корзина, авторизация |
| `src/types/` | TypeScript-типы для всего проекта |
| `scripts/` | Служебные скрипты разработчика (не попадают в клиентский bundle) |
| `migrations/` | SQL-файлы миграций БД — применяются через `npm run db:migrate` |
| `src/middleware.ts` | Next.js Middleware — rate limiting для защищённых эндпоинтов |
