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
├── spec/                           ← документация проекта
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
