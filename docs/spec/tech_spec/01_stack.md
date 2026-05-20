# Стек технологий и архитектура системы

---

## Стек технологий

| Компонент | Технология | Зачем |
|---|---|---|
| Frontend | Next.js 15 + TypeScript (готово) | App Router, SSR, статичные страницы |
| Backend | Next.js API Routes (App Router) | Сервер и API внутри того же проекта |
| База данных | PostgreSQL через Neon + `@neondatabase/serverless` | Хранение заказов, меню, пользователей; HTTP-драйвер обязателен для serverless |
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
    ├── GET /menu, /orders/:id        → Vercel Serverless Functions (Node.js)
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
- **Frontend** — статичные файлы (уже готово)
- **Backend** — папка `api/` → Vercel автоматически превращает каждый файл в serverless function

> Подробнее о деплое — в [deployment_spec.md](../deployment_spec.md).
