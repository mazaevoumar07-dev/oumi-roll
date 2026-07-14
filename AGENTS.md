<!-- BEGIN:nextjs-agent-rules -->
## Контекст проекта

**OUMI ROLL** — сайт онлайн-заказа суши. Ресторан в Ле-Мане, Франция. Клиенты выбирают роллы, оформляют заказ и оплачивают онлайн. Администратор видит заказы в панели и управляет меню.

**Стек:** Next.js 15 App Router + TypeScript, PostgreSQL (Supabase), Stripe, Twilio, Google Maps.

**Ключевые спеки (читать перед работой):**
- `docs/spec/tech_spec/04_api.md` — все API-маршруты
- `docs/spec/tech_spec/03_database.md` — схема БД
- `docs/spec/tech_spec/05_auth.md` — аутентификация
- `docs/spec/featurespec/` — детали каждой функции F-01—F-13
- `docs/spec/known_risks.md` — известные риски, обязательно читать

---

## Локальный запуск

```bash
npm install
npm run dev   # http://localhost:3000
```

Нужен файл `.env.local` в корне проекта. Взять у владельца проекта или заполнить самостоятельно:

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com/dashboard/project/_/settings/api) → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role key |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys) → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Запустить `stripe listen --forward-to localhost:3000/api/payment/webhook` |
| `TWILIO_ACCOUNT_SID` | [console.twilio.com](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Twilio console |
| `TWILIO_PHONE_NUMBER` | Twilio → номер в формате `+1...` |
| `ADMIN_PHONE` | Номер владельца ресторана в формате E.164 (`+33...`) |
| `GOOGLE_MAPS_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → Geocoding API |
| `RESTAURANT_LAT` / `RESTAURANT_LNG` | Координаты ресторана |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` для локальной разработки |

---

## Структура папок

```
src/
  app/
    api/           — API-маршруты (Next.js App Router)
    admin/         — страницы панели администратора
    commande/      — страница оформления заказа
    confirmation/  — страница подтверждения заказа
    connexion/     — страница авторизации клиента
    paiement/      — страница оплаты (Stripe)
    account/       — аккаунт и история заказов клиента
    courier/       — страница курьера (GPS)
  components/      — переиспользуемые React-компоненты
  context/         — React context (корзина, авторизация)
  data/            — статические данные
  i18n/            — переводы (FR / EN / RU)
  lib/supabase/    — клиент Supabase (server и browser)
  types/           — TypeScript-типы
```

---

## Как понять проект — читать в таком порядке

1. `docs/spec/global_spec.md` — общая концепция, пользователи, этапы
2. `docs/spec/tech_spec/overview.md` — стек и архитектура
3. `docs/spec/functional_map/` — сценарии пользователей (как клиент проходит весь путь)
4. `docs/spec/featurespec/00_index.md` — список всех функций F-01—F-14
5. `docs/spec/known_risks.md` — известные риски и ограничения

---

## Что читать перед конкретными задачами

| Задача | Где искать |
|---|---|
| Новый API-маршрут | `docs/spec/tech_spec/` → файл про API-маршруты + `docs/spec/featurespec/` → нужная функция F-XX |
| БД / миграции | `docs/spec/tech_spec/` → файл схемы БД |
| Stripe / оплата | `docs/spec/tech_spec/` → файл внешних сервисов + `docs/spec/featurespec/` → F-08 (оплата), F-05 (отмена) |
| Аутентификация | `docs/spec/tech_spec/` → файл auth + `docs/spec/featurespec/` → F-06 |
| Доставка / Google Maps | `docs/spec/tech_spec/` → файл доставки + `docs/spec/featurespec/` → F-04 |
| SMS / Twilio | `docs/spec/tech_spec/` → файл внешних сервисов + `docs/spec/featurespec/` → F-09 |
| Панель администратора | `docs/spec/featurespec/` → F-10 (меню), F-11 (заказы), F-12 (бонусы), F-14 (часы работы) |
| Безопасность / rate limiting | `docs/spec/tech_spec/` → файлы security и rate limiting + `docs/spec/known_risks.md` |
| Деплой | `docs/spec/deployment_spec.md` |
| Любой новый код | `docs/spec/known_risks.md` + `docs/spec/tech_spec/` → файл правил написания кода |

---

## Язык проекта

- **Общение с разработчиком** — только русский язык
- **Комментарии в коде** — русский язык
- **Документация и спеки** — русский язык
- **Сообщения коммитов и PR** — русский язык
- **Текст для клиентов** (UI, API-ответы браузеру, сообщения об ошибках) — **французский язык**, не менять

---
<!-- END:nextjs-agent-rules -->

## Рабочий процесс — обязательно после каждого изменения кода

Весь код пишется на **feature-ветках**, которые сливаются в `main` через Pull Request. Никогда не коммитить напрямую в `main`.

### Начало задачи — создать ветку

Перед любыми изменениями запусти `/new-branch` — скилл создаст ветку от актуального `main`.

### После завершения изменений

Никогда не коммитить, пушить, создавать PR или мержить автоматически. Каждый шаг — только по явной просьбе пользователя:

- **«Закоммить»** → `git add <файлы>` + `git commit -m "..."`
- **«Запушить»** → `git push origin <текущая ветка>`
- **«Создать PR»** → `gh pr create --base main`
- **«Смержить»** → `gh pr merge <номер> --merge` + `git checkout main && git pull origin main`

---

## Конвенции коммитов

Формат: `<тип>: <описание на русском>`

| Тип | Когда использовать |
|---|---|
| `feat:` | Новая функциональность |
| `fix:` | Исправление бага |
| `docs:` | Изменения только в документации или спеках |
| `chore:` | Служебные изменения: конфиги, зависимости, `.gitignore` |
| `temp:` | Временный код для отладки — **удалить после** |

Примеры:
```
feat: добавить страницу истории заказов
fix: убрать CRLF из NEXT_PUBLIC_APP_URL
docs: исправить противоречие в спеке F-05
chore: обновить зависимости Stripe
```

---

## Процесс для новых фич

1. **Проверить спек** — открыть `docs/spec/featurespec/` и найти нужную функцию. Если спека нет — написать её первым делом.
2. **Создать план** — добавить файл в `plans/in-progress/` с шагами реализации.
3. **Создать ветку** — `feat/название` от актуального `main`.
4. **Написать код** — читать `known_risks.md` перед любым новым кодом.
5. **Запустить `/risk-check`** — на каждом новом API-маршруте.
6. **Обновить changelog** — добавить запись в нужный файл в папке `changelog/`.
7. **Стандартный workflow** — commit → push → PR → merge (см. раздел выше).

---

## Кастомные скиллы проекта

Скиллы — это команды, которые можно вызвать в чате через `/имя`. Кастомные скиллы этого проекта лежат в `.claude/commands/` и вызываются так:

```
/risk-check [файл]
/spec-check [файл]
/new-api-route
/new-migration
/mobile-check
```

| Скилл | Что делает |
|---|---|
| `/risk-check [файл]` | Проверяет файл(ы) по чеклисту из `known_risks.md` — безопасность, SQL-инъекции, Stripe webhook и др. |
| `/spec-check [файл]` | Сверяет реализацию со спецификацией |
| `/new-api-route` | Создаёт новый API-маршрут по шаблону проекта |
| `/new-migration` | Создаёт новую миграцию БД |
| `/mobile-check` | Проверяет мобильную адаптивность |
| `/new-branch` | Создаёт ветку от актуального `main` перед началом задачи |

**Когда использовать:** запускать `/risk-check` после написания любого нового API-маршрута или изменения логики оплаты.

---

## Обновление changelog

Changelog ведётся вручную в папке `changelog/`. Обновлять **вместе с коммитом фичи** — не копить в конце.

В проекте есть папка `changelog/` с файлами по зонам:

| Файл | Зона |
|---|---|
| `changelog/frontend.md` | UI, страницы, компоненты, дизайн |
| `changelog/backend.md` | API-маршруты, база данных |
| `changelog/admin.md` | Панель администратора |
| `changelog/payments.md` | Stripe, webhook, flow оплаты |
| `changelog/notifications.md` | SMS через Twilio |
| `changelog/security.md` | CORS, rate limiting, RGPD |
| `changelog/docs.md` | Документация и спецификации |

**Как добавлять запись:** открыть нужный файл зоны, добавить вверху блок с датой и описанием. Если фича затрагивает несколько зон — писать в каждой.

```markdown
## YYYY-MM-DD

### Добавлено
- `POST /api/menu/:id/disable` — отключить позицию меню
```

### Формат новой записи

Добавлять **вверху нужного файла зоны**:

```markdown
## YYYY-MM-DD

### Добавлено
- Краткое описание новой фичи

### Исправлено
- Краткое описание бага
```

### Категории

| Категория | Когда использовать |
|---|---|
| `### Добавлено` | Новые фичи, эндпоинты, страницы |
| `### Исправлено` | Баги |
| `### Изменено` | Изменения в существующей логике |
| `### Удалено` | Удалённые фичи или эндпоинты |
| `### Документация` | Только если не было изменений в коде |

### Что НЕ писать в changelog

- Мелкие правки стилей и рефакторинг
- Изменения в `AGENTS.md`, планах, спеках
- Коммиты типа `chore:`, `temp:`, `docs:`

---

## Управление планами

Планы хранятся в папке `plans/`:
- `plans/in-progress/` — активные планы, по которым ведётся работа
- `plans/completed/` — выполненные планы

### Правило завершения плана

Когда все пункты плана выполнены — план нужно **перенести** из `in-progress/` в `completed/`:

1. Обновить статус в файле плана: `**Статус:** Завершён`
2. Добавить дату завершения
3. Переместить файл: `plans/in-progress/название.md` → `plans/completed/название.md`
4. Закоммитить: `docs: перенести план <название> в completed`

Не ждать указания от пользователя — переносить автоматически при завершении всех пунктов.
