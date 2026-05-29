# Стек технологий и архитектура системы

---

## Стек технологий

| Компонент | Технология | Зачем |
|---|---|---|
| Frontend | Next.js 15 + TypeScript (готово) | App Router, SSR, статичные страницы |
| Backend | Next.js API Routes (App Router) | Сервер и API внутри того же проекта |
| База данных | PostgreSQL через Supabase + `@supabase/supabase-js` | Хранение заказов, меню, пользователей |
| Auth | Supabase Auth | Регистрация/вход клиентов (телефон+пароль) и администратора (email+пароль), SMS-верификация |
| Хранение фото | Supabase Storage | Фотографии позиций меню |
| Оплата | Stripe | Оплата картой, Apple Pay, Google Pay |
| SMS | Twilio | Уведомления клиентам об акциях; OTP-верификация через Supabase Auth |
| Геокодинг | Google Maps Geocoding API | Расчёт расстояния для доставки |
| Хостинг | Vercel | Frontend + Backend (serverless functions) |
| Мультиязычность | i18next | Французский (по умолчанию), английский, русский |
| Переменные окружения | Vercel Environment Variables | API-ключи, секреты |

---

## Архитектура системы

```
Клиент (браузер)
    │
    ├── GET /menu, /orders/:id        → Vercel Serverless Functions (Node.js)
    ├── POST /orders, /payment/intent →        │
    └── Supabase Auth SDK             →        │
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                           Supabase         Stripe           Twilio
                        (DB + Auth        (Оплата)     (SMS акции + OTP)
                        + Storage)
                              │
                       Google Maps API
                       (Геокодинг)
```

Frontend и backend деплоятся на Vercel:
- **Frontend** — статичные файлы (уже готово)
- **Backend** — папка `api/` → Vercel автоматически превращает каждый файл в serverless function

> Подробнее о деплое — в [deployment_spec.md](../deployment_spec.md).
