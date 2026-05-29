# Аутентификация

> Auth полностью управляется **Supabase Auth**. Никакого ручного JWT/bcrypt.

---

## Клиент

- Логин: **номер телефона + пароль** (Supabase Phone Auth)
- При регистрации Supabase отправляет OTP-код через Twilio для верификации телефона
- После верификации — сессия создаётся автоматически, Supabase выдаёт JWT
- JWT хранится в `httpOnly cookie` через `@supabase/ssr`
- Токен истекает через **1 час**, автоматически обновляется через refresh token

---

## Администратор

- Страница входа: `/admin/login`
- Логин: **email + пароль** (Supabase Email Auth)
- Supabase выдаёт JWT с теми же механизмами что у клиента
- Роль `admin` проверяется на сервере: `SELECT role FROM public.users WHERE id = $userId`
- Аккаунт создаётся один раз разработчиком через Supabase Dashboard
- Регистрации нет — только один администратор

---

## Как проверять авторизацию в API-маршрутах

```ts
import { createServerClient } from '@supabase/ssr'

// В API route:
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Для admin-маршрутов дополнительно:
const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

---

## Что Supabase берёт на себя

- Хэширование паролей (bcrypt внутри)
- SMS OTP для верификации телефона (через Twilio — настраивается в Supabase Dashboard)
- Refresh token и ротация сессий
- Защита от брутфорса (встроенный rate limiting)
- Восстановление пароля (SMS OTP для телефонных пользователей)

---

## Пакеты

```
@supabase/supabase-js   — клиентский SDK
@supabase/ssr           — server-side helpers для Next.js App Router (cookies)
```

---

## Переменные окружения

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # только сервер — никогда не светить на клиенте
```
