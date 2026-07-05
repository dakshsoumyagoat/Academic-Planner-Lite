---
name: JEE Planner multi-user conversion
description: Notes on converting a single-user (setup-once) app to true multi-user with isolated per-user data, relevant to any future auth/data-scoping work in this project.
---

- `holidays` table stays global/shared across all users (public holidays aren't personal data) — only `tasks`, `tests`, `monthly_goals`, `syllabus_chapters`, `settings` got a `userId` FK.
- New-user seeding (default settings row, full syllabus chapter list, template test schedule) happens synchronously inside the `/api/auth/register` handler, not lazily on first fetch. Avoids "ensureSeeded on GET" races and keeps route handlers simple (no more global auto-seed-if-empty logic).

**Why:** the original app seeded syllabus/tests globally once (if table was empty); that pattern breaks once rows are user-scoped, since "table has 0 rows" is no longer a valid signal for "needs seeding" (any given user's subset being 0 doesn't mean the table is empty).

**How to apply:** if adding another per-user resource that ships with default/template data, seed it in the registration handler (see `artifacts/api-server/src/lib/seed-data.ts` for the pattern), not via a `count() === 0` global check in the route.

- `drizzle-kit push` in this project always flags the `session` table (managed by `connect-pg-simple`, not declared in the drizzle schema) as a pending destructive delete, and then aborts non-interactively since there's no TTY for the confirmation prompt. This is expected/pre-existing — not a sign the schema is out of sync. For manual, already-applied-via-psql migrations, don't rely on `drizzle push` to confirm; verify with direct `psql` queries instead.
