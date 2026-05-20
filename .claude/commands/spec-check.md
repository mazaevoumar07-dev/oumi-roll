# Spec Check

Read before starting:
- `docs/spec/tech_spec/04_api.md` — API contract (methods, paths, access)
- `docs/spec/tech_spec/03_database.md` — DB schema (field names, types)
- The featurespec file for the function being checked (e.g. `docs/spec/featurespec/F-05_cancellation.md`)

If an argument is provided (e.g. `/spec-check F-05` or `/spec-check src/app/api/orders/[id]/cancel/route.ts`), focus on that function or file. Otherwise check all recently changed API files.

## What to verify

**1. Route contract**
- HTTP method and path match `04_api.md` exactly
- Access level matches (Public / Client JWT / Admin JWT / Stripe-only)

**2. Request**
- Body fields match what the featurespec describes the user/system sends
- Required fields are validated — missing fields return `400`

**3. Response**
- Shape matches expected output from the featurespec
- Correct HTTP status codes used (see codes table in `04_api.md`)

**4. Error cases**
- Every «Исключительный случай» from the featurespec has a corresponding code path
- Each error returns the right status code and a clear message

**5. DB consistency**
- Field names match `03_database.md` exactly (e.g. `is_available`, not `available`)
- ENUM values match (`'new'`, `'preparing'`, `'in_delivery'`, `'completed'`, `'cancelled'`)

## Output format

For each checked item:
- ✓ Matches spec
- ✗ Diverges — quote the spec and quote the code, explain the difference

End with a summary: how many checks passed, how many failed.
