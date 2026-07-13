# Этап 3 — Запуск

**Статус:** В процессе
**Предыдущий этап:** [Этап 2 — Backend](../completed/stage-2-backend.md)

---

## Цель

Закрыть оставшиеся пункты, которые блокируют реальный публичный запуск: боевую оплату, домен, регистрацию клиентов и оставшиеся фото меню. Бэкенд (API, БД, интеграции) уже готов — это финальные шаги перед тем, как пустить настоящих клиентов.

---

## Что нужно сделать

### 1. Оплата (Stripe) — критично, делает владелец
- [ ] Пройти верификацию личности (KYC) в Stripe Dashboard — паспорт, банковский счёт, описание бизнеса
- [ ] Переключить Stripe с Test на Live mode
- [ ] Получить боевые ключи (`sk_live_...`, `pk_live_...`) и заменить тестовые в Vercel → Settings → Environment Variables (Production)
- [ ] Настроить webhook заново для Live mode: Stripe Dashboard → Developers → Webhooks → добавить endpoint `https://<боевой домен>/api/payment/webhook`, событие `payment_intent.succeeded`
- [ ] Провести один реальный платёж на небольшую сумму, подтвердить поступление денег на счёт

### 2. Домен — делает владелец
- [ ] Купить домен (например, `oumiroll.fr` на [OVH](https://www.ovh.com))
- [ ] Подключить в Vercel → Settings → Domains
- [ ] Прописать DNS-записи у регистратора по инструкции Vercel
- [ ] Дождаться выпуска SSL-сертификата (обычно 5–30 минут)
- [ ] Обновить `NEXT_PUBLIC_APP_URL` в Vercel Production на боевой домен
- [ ] Проверить, что CORS (`next.config.ts`, читает `NEXT_PUBLIC_APP_URL`) не блокирует запросы с нового домена

### 3. Регистрация клиентов (Twilio Trial) — делает владелец
См. [known_risks.md](../../docs/spec/known_risks.md) — «Регистрация клиента не работает».
- [ ] Зайти в Twilio Console, добавить способ оплаты — снимает ограничение Trial
- [ ] Проверить в Supabase Dashboard → Authentication → Providers → Phone, что привязаны верные Twilio credentials
- [ ] Протестировать регистрацию на сайте с реальным номером телефона — SMS-код должен дойти
- [ ] Отметить риск решённым в `known_risks.md`

### 4. Фото меню — 4 позиции ещё на заглушках
Проверено через Supabase Storage (2026-07-13) — у всех остальных позиций меню уже реальные фото, кроме:
- [ ] Jus d'orange (Boissons)
- [ ] Jus de pomme (Boissons)
- [ ] Mayo Épicée (Sauces)
- [ ] Dragon Roll (Spécialités)

### 5. Финальная проверка перед публичным запуском
- [ ] Полный тестовый заказ end-to-end в Live mode (реальная карта, небольшая сумма)
- [ ] SMS администратору о новом заказе пришло
- [ ] Регистрация нового клиента с реальным номером прошла
- [ ] Повторно пройти чеклист [deployment_spec.md](../../docs/spec/deployment_spec.md) — особенно пункты про Stripe и домен

---

## Связанные документы

- [known_risks.md](../../docs/spec/known_risks.md) — известные риски, включая Twilio Trial и Stripe KYC
- [deployment_spec.md](../../docs/spec/deployment_spec.md) — чеклист и шаги настройки
- [stage-2-backend.md](../completed/stage-2-backend.md) — предыдущий этап (backend готов)
