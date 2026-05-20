# New API Route

Read these files before writing any code:
- `docs/spec/tech_spec/04_api.md` — confirm the route exists and check its access level
- `docs/spec/tech_spec/02_project_structure.md` — find the correct file path
- The relevant featurespec file (e.g. `docs/spec/featurespec/F-03_checkout.md`)

## Scaffold rules

Create a Next.js App Router route handler (`route.ts`) with:

**Imports:**
```ts
import { neon } from '@neondatabase/serverless'  // always, never 'pg'
```

**Structure per route:**
1. Parse and validate request body/params — reject early with `400` if invalid
2. Authenticate if required:
   - Admin routes: verify JWT, check `role === 'admin'` → `401`/`403` on failure
   - Client routes: verify JWT or `tracking_token` per `docs/spec/tech_spec/05_auth.md`
3. Run DB queries with parameterized placeholders only — never string interpolation
4. Return correct HTTP status codes per `docs/spec/tech_spec/04_api.md`
5. Catch errors — return `{ error: string }` with status `500`

**Cookie (when setting JWT):**
```ts
{ httpOnly: true, secure: true, sameSite: 'lax' }
```

**Never:**
- Use `pg` or raw TCP connections
- Trust `amount` or bonus state from the client — recalculate server-side
- Put secrets in response bodies

After creating the file — run `/risk-check` on it before committing.
