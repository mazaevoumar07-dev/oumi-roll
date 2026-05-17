<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Рабочий процесс — обязательно после каждого изменения кода

Весь код пишется на **feature-ветках**, которые сливаются в `main` через Pull Request. Никогда не коммитить напрямую в `main`.

### Начало задачи — создать ветку

Перед любыми изменениями создай ветку от актуального `main`:

```bash
git checkout main && git pull origin main
git checkout -b <тип>/<название>
```

Примеры имён веток: `feat/stripe-integration`, `fix/jwt-cookie`, `docs/tech-spec-security`

### После завершения изменений — всегда автоматически:

1. **Закоммить** — `git add <изменённые файлы>` + `git commit -m "..."`
2. **Запушить** — `git push origin <текущая ветка>`
3. **Создать Pull Request** — `gh pr create --base main` с описанием что изменено
4. **Смержить PR** — `gh pr merge <номер> --merge`  
   *(GitHub автоматически удаляет feature-ветку после мержа)*
5. **Вернуться на main** — `git checkout main && git pull origin main`

### Исключения (не делать автоматически, а спросить пользователя):
- Если изменения незавершённые или пользователь явно сказал «не коммитить»
