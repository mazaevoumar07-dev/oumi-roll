# База данных — Схема таблиц

> БД: PostgreSQL через Supabase. Таблицы создаются через Supabase Dashboard или SQL Editor.
> Auth-данные (хэш пароля, токены сессии) хранятся в схеме `auth` — управляется Supabase автоматически.

---

## Таблицы

| Таблица | Назначение |
|---|---|
| `users` | Профили клиентов (расширение `auth.users`) |
| `menu_items` | Позиции меню |
| `orders` | Заказы |
| `order_items` | Состав заказа (строки) |
| `promotions` | Настройки бонусов |
| `restaurant_settings` | Глобальные настройки ресторана (пауза приёма заказов) |

> `password_reset_tokens` и `login_attempts` не нужны — Supabase Auth управляет этим автоматически.

---

## `users` — профили клиентов

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ — совпадает с `auth.users.id` |
| first_name | VARCHAR(100) | Имя |
| last_name | VARCHAR(100) | Фамилия |
| phone | VARCHAR(20) | Телефон (логин клиента; NULL у администратора) |
| email | VARCHAR(200) | Email (логин администратора; NULL у клиентов) |
| role | TEXT | Роль: `'client'` или `'admin'`; по умолчанию `'client'` |
| sms_opt_in | BOOLEAN | Согласие на SMS-рассылку |
| sms_opt_in_at | TIMESTAMP | Когда клиент дал согласие (RGPD — обязательно хранить дату) |
| created_at | TIMESTAMP | Дата регистрации |

> Пароль и сессия хранятся в `auth.users` (Supabase). В `public.users` только профильные данные.
> Строка в `public.users` создаётся автоматически при регистрации через Supabase trigger или API route.

---

## `menu_items` — позиции меню

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| name | VARCHAR(200) | Название ролла |
| description | TEXT | Описание |
| price | NUMERIC(8,2) | Текущая цена (€) |
| original_price | NUMERIC(8,2) | Старая цена (если есть скидка) |
| photo_url | TEXT | Ссылка на фото (Supabase Storage) |
| is_available | BOOLEAN | Доступен для заказа |
| is_visible | BOOLEAN | Виден в меню (не удалён) |
| created_at | TIMESTAMP | Дата добавления |

> Физическое удаление запрещено — только `is_visible = false`. Защищает историю заказов.

---

## `orders` — заказы

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| order_number | SERIAL | Человеческий номер заказа (#1, #2...) |
| user_id | UUID (FK) | Ссылка на users.id (NULL если без регистрации) |
| first_name | VARCHAR(100) | Имя клиента |
| last_name | VARCHAR(100) | Фамилия клиента |
| phone | VARCHAR(20) | Телефон клиента |
| email | VARCHAR(200) | Email клиента (для Stripe receipt_email — чек об оплате) |
| delivery_type | TEXT | Способ получения: `'delivery'`, `'pickup'`, `'in_person'` |
| address | TEXT | Адрес доставки (NULL если самовывоз или на месте) |
| delivery_cost | NUMERIC(8,2) | Стоимость доставки (0 если самовывоз или на месте) |
| total_amount | NUMERIC(8,2) | Итоговая сумма (заказ + доставка) |
| source | TEXT | Канал заказа: `'online'`, `'phone'`, `'in_person'`; по умолчанию `'online'` |
| payment_method | TEXT | Способ оплаты: `'stripe'`, `'cash'`, `'card_terminal'`; по умолчанию `'stripe'` |
| status | TEXT | Статус заказа |
| payment_status | TEXT | Статус оплаты: `'pending'`, `'paid'`, `'failed'` |
| stripe_payment_id | TEXT UNIQUE | ID платежа в Stripe; NULL для ручных заказов (UNIQUE — защита от дублей при повторных webhook) |
| refund_failed | BOOLEAN | true если возврат через Stripe не прошёл; по умолчанию false |
| delivery_time | TIMESTAMPTZ | Выбранный клиентом временной слот; NULL означает «как можно скорее» |
| comment | TEXT | Комментарий к заказу (аллергии, предпочтения, код домофона; NULL если не указан) |
| created_at | TIMESTAMP | Время создания заказа |
| cancelled_at | TIMESTAMP | Время отмены (NULL если не отменён) |

**Статусы заказа:** `new` → `preparing` → `in_delivery` → `completed` / `cancelled`

> Ручные заказы (source = `'phone'` или `'in_person'`) создаются сразу со статусом `preparing`, минуя `new`.
> Для ручных заказов `stripe_payment_id = NULL`, `payment_method = 'cash'` или `'card_terminal'`.

---

## `order_items` — состав заказа

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| order_id | UUID (FK) | Ссылка на orders.id |
| menu_item_id | UUID (FK) | Ссылка на menu_items.id |
| name | VARCHAR(200) | Название (копируется на момент заказа) |
| price | NUMERIC(8,2) | Цена (копируется на момент заказа; 0.00 если подарок) |
| quantity | INTEGER | Количество |
| is_gift | BOOLEAN | true если позиция добавлена как подарок по бонусу |

> Цена и название копируются при создании заказа — история не меняется если владелец изменит меню.
> Подарочный ролл: `price = 0.00`, `quantity = 1`, `is_gift = true`.

---

## `restaurant_settings` — глобальные настройки ресторана

| Поле | Тип | Описание |
|---|---|---|
| key | TEXT | Первичный ключ (название настройки) |
| value | TEXT | Значение настройки |

> Таблица хранит пары ключ–значение. Сейчас одна запись: `key = 'orders_paused'`, `value = 'false'` / `'true'`.
> Используется для паузы приёма заказов (F-14). При старте системы вставляется начальная запись:
> ```sql
> INSERT INTO restaurant_settings (key, value) VALUES ('orders_paused', 'false');
> ```

---

## `promotions` — бонусы и акции

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| is_active | BOOLEAN | Включён бонус или нет |
| gift_item_id | UUID (FK) | Ролл-подарок (ссылка на menu_items.id) |
| updated_at | TIMESTAMP | Когда администратор последний раз менял настройку |

> Таблица содержит одну строку — настройки текущего бонуса.
