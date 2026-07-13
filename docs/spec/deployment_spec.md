# Deployment Spec — OUMI ROLL

## Статус

> Создан — 2026-05-05  
> Обновлён — 2026-06-28 (Neon → Supabase, Vercel Blob → Supabase Storage, удалена F-13)  
> Обновлён — 2026-07-13 (чеклист перед запуском пройден и сверен с текущим кодом)

---

## Окружения (environments)

| Окружение | Назначение | URL |
|---|---|---|
| **Development** | Локальная разработка на компьютере | `http://localhost:3000` |
| **Preview** | Тестирование перед публикацией (Vercel автоматически) | `sushi-roll-git-branch.vercel.app` |
| **Production** | Боевой сайт для клиентов | `oumiroll.fr` (или другой домен) |

> В каждом окружении — свои переменные окружения. Тестовые заказы никогда не попадают на боевую базу.

---

## Как работает деплой (CI/CD)

```
Разработчик пишет код
        │
        ▼
   git push → GitHub
        │
        ▼
   Vercel видит изменения
        │
        ├── ветка main → деплой в Production (автоматически)
        └── любая другая ветка → деплой в Preview (автоматически)
```

Никакой ручной публикации — просто пушишь код в git, Vercel делает остальное.

---

## Шаг 1 — Подготовка аккаунтов

| Сервис | Что сделать |
|---|---|
| **GitHub** | Создать репозиторий, загрузить код |
| **Vercel** | Зарегистрироваться, подключить GitHub репозиторий |
| **Supabase** | Создать проект, получить URL и ключи (anon + service_role) |
| **Stripe** | Зарегистрироваться, получить тестовые ключи |
| **Twilio** | Зарегистрироваться, получить номер телефона и ключи |
| **Google Cloud** | Создать проект, включить Geocoding API, получить ключ |

---

## Шаг 2 — Настройка Supabase

1. Создать аккаунт на [supabase.com](https://supabase.com), создать новый проект — регион **EU West (Paris)**
2. Скопировать из **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Запустить миграции в **SQL Editor** (по порядку):
   - `migrations/001_initial_schema.sql`
   - `migrations/002_fix_profile_trigger.sql`
   - `migrations/003_add_menu_fields.sql`
4. Создать бакет `menu-photos` в **Storage** — тип **Public**
5. Включить **Phone Auth** в **Authentication → Providers → Phone** и подключить Twilio

---

## Шаг 3 — Настройка Vercel

1. Зайти на [vercel.com](https://vercel.com), подключить GitHub аккаунт
2. Нажать **"Add New Project"** → выбрать репозиторий `sushi-roll`
3. Перейти в **Settings → Environment Variables** и добавить все ключи:

```
NEXT_PUBLIC_SUPABASE_URL          → из Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     → из Supabase → Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY         → из Supabase → Settings → API → service_role key

STRIPE_SECRET_KEY                 → из Stripe Dashboard → Secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → из Stripe Dashboard → Publishable key
STRIPE_WEBHOOK_SECRET             → из Stripe Dashboard → Webhooks → Signing Secret

TWILIO_ACCOUNT_SID                → из Twilio Console
TWILIO_AUTH_TOKEN                 → из Twilio Console
TWILIO_PHONE_NUMBER               → из Twilio Console (формат +1...)
ADMIN_PHONE                       → номер владельца ресторана (формат E.164, +33...)

GOOGLE_MAPS_API_KEY               → из Google Cloud Console → Geocoding API (только backend)

RESTAURANT_LAT                    → координаты ресторана (широта)
RESTAURANT_LNG                    → координаты ресторана (долгота)

NEXT_PUBLIC_APP_URL               → https://oumiroll.fr (для Production)
```

4. Нажать **Deploy** — первый деплой запустится автоматически

---

## Шаг 4 — Настройка Stripe Webhook

Stripe должен сообщать серверу когда оплата прошла:

1. Зайти в Stripe Dashboard → **Developers → Webhooks**
2. Нажать **"Add endpoint"**
3. URL: `https://oumiroll.fr/api/payment/webhook`
4. Выбрать события: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Скопировать **Signing Secret** → вставить в Vercel как `STRIPE_WEBHOOK_SECRET`

**Для тестирования локально:**
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

---

## Шаг 5 — Создание аккаунта администратора

Аккаунт администратора создаётся один раз через Supabase Dashboard:

1. Открыть **Supabase → Authentication → Users**
2. Нажать **"Add user"** → ввести email и пароль администратора
3. Открыть **SQL Editor** и выставить роль вручную:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@oumiroll.fr';
   ```
4. Проверить что вход работает: открыть `/admin/login`, ввести созданные данные

---

## Шаг 6 — Настройка домена

1. Купить домен (например на [OVH](https://www.ovh.com) — французский регистратор)
2. В Vercel → **Settings → Domains** → добавить домен
3. Vercel покажет DNS-записи которые нужно добавить у регистратора
4. Подождать 5–30 минут пока DNS обновится
5. Vercel автоматически выдаст SSL-сертификат (HTTPS)

---

## Шаг 7 — Переключение на боевой режим (Production)

До запуска всё работает в **тестовом режиме** Stripe — деньги не списываются по-настоящему.

Когда готов к запуску:
1. В Stripe Dashboard переключить с **Test mode** на **Live mode**
2. Получить боевые ключи (`sk_live_...`) и заменить тестовые в Vercel
3. Повторить настройку webhook для боевого режима
4. Убедиться что Stripe аккаунт прошёл верификацию (требует документы бизнеса)

---

## Чеклист перед запуском

### Код и база данных
- [x] Все миграции запущены в Supabase (001–007)
- [x] RLS включён на всех таблицах в Supabase
- [~] Меню заполнено реальными данными и фото — большинство позиций готово (роллы, часть напитков), часть напитков ещё требует реальных фото от владельца
- [x] Координаты ресторана заданы верно (`RESTAURANT_LAT`, `RESTAURANT_LNG`)

### Внешние сервисы
- [ ] Stripe — боевые ключи, webhook настроен, аккаунт верифицирован — **сознательно отложено** (решение от 2026-07-05, Stripe остаётся в Test mode; см. `known_risks.md` — KYC ещё не пройден)
- [ ] Twilio — **оба** Twilio-аккаунта на Trial (проверено 2026-07-14): и Phone Auth для регистрации в Supabase Dashboard, и `.env.local` (уведомления администратору, SMS при отмене, промо-рассылка) — ни один SMS не доставляется на неверифицированные номера, см. `known_risks.md`. Сознательно отложено — личный проект
- [x] Google Maps — `GOOGLE_MAPS_API_KEY` используется только в серверном коде (`api/delivery/calculate`), не передаётся на клиент. Ограничения по IP/referrer в Google Cloud Console — не проверено
- [x] Supabase Storage — бакет `menu-photos` создан, публичный доступ работает (используется активно, подтверждено)

### Vercel
- [ ] Все переменные окружения заполнены для окружения Production — не проверено напрямую (нет доступа к Vercel env ls в этой сессии)
- [ ] `NEXT_PUBLIC_APP_URL` указывает на боевой домен — домен ещё не куплен, сайт живёт на `oumi-roll.vercel.app`
- [ ] Домен подключён и HTTPS работает — кастомный домен не куплен (Шаг 6 не выполнен)
- [x] Тестовый заказ оформлен end-to-end — оплата тест-картой + webhook подтверждены (заказ #1, #2), код вызова `notifyAdmin()` срабатывает корректно, но само SMS не доставляется (Twilio Trial, см. `known_risks.md`)

### Безопасность
- [x] CORS настроен только на домен ресторана (`next.config.ts`, `Access-Control-Allow-Origin` = `NEXT_PUBLIC_APP_URL`)
- [x] Панель администратора недоступна без логина (middleware редиректит на `/admin/login`)
- [x] Аккаунт администратора создан и вход проверен
- [x] `SUPABASE_SERVICE_ROLE_KEY` используется только в `src/lib/supabase/server.ts` (серверный код, не в клиентских компонентах)

---

## Мониторинг и логи

| Инструмент | Что смотреть |
|---|---|
| **Vercel Dashboard** | Логи каждого запроса, ошибки функций |
| **Supabase Dashboard** | Нагрузка на базу данных, логи Auth |
| **Stripe Dashboard** | Платежи, возвраты, ошибки оплаты |
| **Twilio Dashboard** | Доставка SMS, ошибки отправки |

Если что-то упало — первым делом смотреть **Vercel → Functions → Logs**.

---

## Откат (если что-то пошло не так)

Vercel хранит историю всех деплоев. Если после обновления что-то сломалось:

1. Vercel Dashboard → **Deployments**
2. Найти последний рабочий деплой
3. Нажать **"Redeploy"** — сайт вернётся к предыдущей версии за 30 секунд
