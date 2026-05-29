# Безопасность

---

## Правила

| Правило | Как реализовано |
|---|---|
| SQL-инъекции | Supabase клиент использует параметризованные запросы внутри; при raw SQL — только параметры |
| XSS (кража токенов) | Supabase сессия хранится в `httpOnly cookie` через `@supabase/ssr` — JavaScript не имеет доступа |
| Несанкционированный доступ к админке | Все `/api/admin/*` проверяют Supabase сессию + роль `admin` из таблицы `users` |
| Дублирование заказов (Stripe webhook) | `UNIQUE` на `stripe_payment_id` + проверка перед созданием |
| Поддельные Stripe webhook | Проверка подписи через `stripe.webhooks.constructEvent()` |
| Чужие заказы | `GET /api/orders/:id` требует Supabase сессию (владелец заказа) или роль `admin` |
| CORS | Настроен только на домен ресторана (`oumiroll.fr`) |
| Пароли | Хэширование управляется Supabase Auth (bcrypt внутри) — пароли никогда не проходят через наш код |
| Перебор паролей | Встроенный rate limiting Supabase Auth |
| Спам SMS при регистрации | Supabase Auth ограничивает количество OTP-запросов на номер |
| Утечка API-ключей | Все секреты в Vercel Environment Variables, не в коде |
| `SUPABASE_SERVICE_ROLE_KEY` | Только на сервере — этот ключ обходит RLS и даёт полный доступ к БД |

---

## Cookie-настройки (Supabase SSR)

`@supabase/ssr` управляет cookie автоматически со следующими настройками:

```
httpOnly: true      ← JavaScript не видит токен
Secure: true        ← только HTTPS
SameSite: Lax       ← защита от CSRF + совместимость с 3DS-редиректами Stripe
```

> **Почему Lax, а не Strict:** при 3DS-аутентификации банк делает redirect обратно на сайт с внешнего домена. С `SameSite=Strict` cookie не отправляется при таком переходе — пользователь оказывается разлогинен посреди оплаты. `SameSite=Lax` отправляет cookie при top-level навигации (redirect), но блокирует cross-site sub-resource запросы — достаточно для CSRF-защиты.

---

## Что проверяется перед каждым запросом к admin API

```ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return 401

const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
if (profile?.role !== 'admin') return 403
```

Всегда два шага: валидность сессии + роль. Недостаточно проверить только одно.
