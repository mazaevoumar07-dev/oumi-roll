# База данных — Схема таблиц

> БД: PostgreSQL через Neon. Миграции через `node-pg-migrate`.

---

## Таблицы

| Таблица | Назначение |
|---|---|
| `users` | Зарегистрированные клиенты |
| `menu_items` | Позиции меню |
| `orders` | Заказы |
| `order_items` | Состав заказа (строки) |
| `promotions` | Настройки бонусов |
| `password_reset_tokens` | Коды восстановления пароля |
| `login_attempts` | Попытки входа для блокировки |

---

## `users` — зарегистрированные клиенты

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| first_name | VARCHAR(100) | Имя |
| last_name | VARCHAR(100) | Фамилия |
| phone | VARCHAR(20) UNIQUE | Номер телефона (логин для клиентов; NULL у администратора) |
| email | VARCHAR(200) UNIQUE | Email (логин для администратора; NULL у клиентов) |
| password_hash | TEXT | Хэш пароля (bcrypt) |
| role | ENUM('client','admin') | Роль; по умолчанию 'client' |
| sms_opt_in | BOOLEAN | Согласие на SMS-рассылку |
| sms_opt_in_at | TIMESTAMP | Когда клиент дал согласие (RGPD — обязательно хранить дату) |
| created_at | TIMESTAMP | Дата регистрации |

---

## `menu_items` — позиции меню

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| name | VARCHAR(200) | Название ролла |
| description | TEXT | Описание |
| price | NUMERIC(8,2) | Текущая цена (€) |
| original_price | NUMERIC(8,2) | Старая цена (если есть скидка) |
| photo_url | TEXT | Ссылка на фото (Vercel Blob) |
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
| delivery_type | ENUM('delivery','pickup') | Способ получения |
| address | TEXT | Адрес доставки (NULL если самовывоз) |
| delivery_cost | NUMERIC(8,2) | Стоимость доставки (0 если самовывоз) |
| total_amount | NUMERIC(8,2) | Итоговая сумма (заказ + доставка) |
| status | ENUM | Статус заказа |
| payment_status | ENUM('pending','paid','failed') | Статус оплаты |
| stripe_payment_id | TEXT UNIQUE | ID платежа в Stripe (UNIQUE — защита от дублей при повторных webhook) |
| created_at | TIMESTAMP | Время создания заказа |
| cancelled_at | TIMESTAMP | Время отмены (NULL если не отменён) |

**Статусы заказа:** `new` → `preparing` → `in_delivery` → `completed` / `cancelled`

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


## `promotions` — бонусы и акции

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| is_active | BOOLEAN | Включён бонус или нет |
| gift_item_id | UUID (FK) | Ролл-подарок (ссылка на menu_items.id) |
| updated_at | TIMESTAMP | Когда администратор последний раз менял настройку |

> Таблица содержит одну строку — настройки текущего бонуса.

---

## `password_reset_tokens` — коды восстановления пароля

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| user_id | UUID (FK) | Ссылка на users.id |
| code_hash | TEXT | bcrypt-хэш 6-значного кода (не хранится в открытом виде) |
| expires_at | TIMESTAMP | Время истечения (создание + 10 минут) |
| used_at | TIMESTAMP | Когда использован (NULL если ещё нет) |
| created_at | TIMESTAMP | Время создания |

> При повторном запросе старый код инвалидируется (`used_at = now()`), создаётся новый.

---

## `login_attempts` — попытки входа для блокировки

| Поле | Тип | Описание |
|---|---|---|
| id | UUID | Первичный ключ |
| phone | VARCHAR(20) | Телефон по которому пытались войти |
| attempted_at | TIMESTAMP | Время попытки |
| success | BOOLEAN | Успешный вход или нет |

> Блокировка: если за последние 15 минут ≥ 5 записей с `success = false` по одному `phone` — вход запрещается.
> **Индекс обязателен:** `CREATE INDEX ON login_attempts (phone, attempted_at DESC)` — без него запрос блокировки замедлится по мере накопления записей. Таблица не чистится автоматически, нужен периодический cron или DELETE по TTL.
