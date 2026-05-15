<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Рабочий процесс — обязательно после каждого изменения кода

После завершения любых изменений в коде **всегда** выполняй следующие шаги автоматически, без ожидания отдельной команды от пользователя:

1. **Закоммить** — `git add <изменённые файлы>` + `git commit -m "..."`
2. **Запушить** — `git push origin <текущая ветка>`
3. **Создать Pull Request** — `gh pr create` с описанием что изменено
4. **Смержить PR** — `gh pr merge <номер> --merge`

Исключения (не делать автоматически, а спросить пользователя):
- Если изменения незавершённые или пользователь явно сказал «не коммитить»
- Если PR затрагивает `master` напрямую без проверки
