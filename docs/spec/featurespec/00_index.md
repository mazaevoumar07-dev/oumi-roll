# Feature Spec — OUMI ROLL

> Каждая функция — отдельный файл. Полный оригинал — в [overview.md](overview.md).

---

## Список функций

| Файл | Функция | Этап |
|---|---|---|
| [F-01_menu.md](F-01_menu.md) | Просмотр меню | Frontend ✓ |
| [F-02_cart.md](F-02_cart.md) | Корзина | Frontend ✓ |
| [F-03_checkout.md](F-03_checkout.md) | Оформление заказа | Backend |
| [F-04_delivery_calculation.md](F-04_delivery_calculation.md) | Расчёт стоимости доставки | Backend |
| [F-05_cancellation.md](F-05_cancellation.md) | Отмена заказа (3 минуты) | Backend |
| [F-06_auth.md](F-06_auth.md) | Регистрация и вход | Backend |
| [F-07_order_tracking.md](F-07_order_tracking.md) | История заказов (для зарегистрированных клиентов) | Backend |
| [F-08_payment.md](F-08_payment.md) | Онлайн-оплата картой + email-чек (Stripe) | Backend |
| [F-09_sms.md](F-09_sms.md) | SMS-уведомления об акциях | Backend |
| [F-10_admin_menu.md](F-10_admin_menu.md) | Панель администратора — меню | Backend |
| [F-11_admin_orders.md](F-11_admin_orders.md) | Панель администратора — заказы | Backend |
| [F-12_bonuses.md](F-12_bonuses.md) | Система бонусов | Backend |
| [F-13_gps.md](F-13_gps.md) | GPS-отслеживание курьера | ~~Удалено~~ |

---

## Связанные документы

- [functional_map/](../functional_map/) — пользовательские сценарии
- [tech_spec/](../tech_spec/) — технический стек, БД, API
- [deployment_spec.md](../deployment_spec.md) — деплой и CI/CD
