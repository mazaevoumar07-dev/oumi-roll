# Risk Check

Read `docs/spec/known_risks.md` before reviewing.

Check the provided file(s) — or the most recently changed files if no argument — against this checklist:

| # | What to check | How to spot it |
|---|---|---|
| 1 | **DB library** | Any `import ... from 'pg'` → must be `@neondatabase/serverless` |
| 2 | **Amount from client** | Any route that reads `amount` or `total` from `req.body` without recalculating server-side |
| 3 | **Bonus validation** | Checkout/payment routes — is bonus condition checked on the server? |
| 4 | **JWT cookie flags** | `sameSite` must be `'lax'`, not `'strict'`; must have `httpOnly` and `secure` |
| 5 | **SQL injection** | Any template literal inside a SQL string → must use `$1, $2` placeholders |
| 6 | **Unprotected endpoint** | New public POST/PATCH endpoints — are they in `09_rate_limiting.md`? |
| 7 | **Token in URL** | `tracking_token` or `courier_token` in query string — acceptable for MVP, note it |
| 8 | **Personal data** | New fields storing name/phone/address — is retention policy considered? |
| 9 | **Stripe webhook** | Does webhook handler verify `stripe.webhooks.constructEvent()` signature? |
| 10 | **Admin access** | Routes under `/api/admin/*` — do they check `role === 'admin'`? |

Report findings as a table:

| Risk # | File | Line | Severity (low/medium/high) | Detail |
|---|---|---|---|---|

If no issues found — say so clearly. Don't invent problems.
