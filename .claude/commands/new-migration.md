# New Database Migration

Read `docs/spec/tech_spec/03_database.md` to understand the full schema before creating anything.

If an argument was provided (e.g. `/new-migration create_users`), use it as the description. Otherwise ask the user what the migration should do.

## Steps

1. List files in `migrations/` to find the highest existing number
2. Create `migrations/00N_<description>.sql` with the next number (pad to 3 digits)
3. Write the migration using plain SQL with two sections:

```sql
-- migrate:up
<CREATE TABLE or ALTER TABLE statements>

-- migrate:down
<DROP TABLE or reverse ALTER statements>
```

4. Follow the schema exactly as defined in `docs/spec/tech_spec/03_database.md`:
   - Use UUID primary keys
   - Use TIMESTAMP for date fields
   - Use NUMERIC(8,2) for prices in euros
   - Use ENUM types where the spec defines them
   - Add indexes where the spec notes they are required

5. Show the generated SQL to the user and ask to confirm before committing.

After confirmation — commit and push via a `docs/migration-*` branch following the git workflow in AGENTS.md.
