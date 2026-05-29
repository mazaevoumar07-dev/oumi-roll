# Rate Limiting

> Ограничения запросов защищают эндпоинты которые стоят денег или могут быть использованы для атаки.
> Реализуется через Next.js middleware на Vercel.
> Auth-маршруты (вход, регистрация, сброс пароля) обрабатываются Supabase Auth — rate limiting на них встроен в Supabase.

---

## Таблица лимитов

| Эндпоинт | Лимит | Ключ | Причина |
|---|---|---|---|
| `POST /api/delivery/calculate` | 10 запросов / минута | IP | Каждый запрос = платный вызов Google Maps Geocoding API |
| `POST /api/admin/sms/send` | 2 запроса / неделю | admin session | Защита от случайной массовой рассылки |

---

## Ответ при превышении

```
HTTP 429 Too Many Requests
Retry-After: <секунды до сброса>
```

---

## Auth — Supabase берёт на себя

Supabase Auth имеет встроенную защиту от брутфорса:
- Блокировка аккаунта после повторных неверных попыток входа
- Rate limiting на OTP-запросы (SMS-коды верификации)
- Настраивается в Supabase Dashboard → Auth → Rate Limits

Дополнительный rate limiting на auth в нашем коде не нужен.
