# JEE Planner

A study-planning web app for students prepping for JEE Main/Advanced — tracks daily tasks, upcoming tests, monthly goals, and syllabus progress against the exam countdown. Supports multiple independent user accounts, each with fully isolated data.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/*.ts` (tasks, tests, monthly-goals, syllabus, settings, holidays, users)
- API routes: `artifacts/api-server/src/routes/*.ts`
- New-user seed data (default settings, syllabus chapters, template test schedule): `artifacts/api-server/src/lib/seed-data.ts`
- OpenAPI contract: `lib/api-spec/openapi.yaml` → generated hooks/schemas in `lib/api-client-react` / `lib/api-zod`
- Frontend auth: `artifacts/jee-planner/src/lib/auth.tsx`, login UI: `artifacts/jee-planner/src/pages/login.tsx`
- Session store: Postgres `session` table (via `connect-pg-simple`), created manually — not part of the drizzle schema

## Architecture decisions

- True multi-user: every user has isolated tasks, tests, monthly goals, syllabus progress, and settings (each table has a `userId` FK). `holidays` (Bengaluru public holidays) is the one shared/global table since it isn't personal data.
- Registration (`POST /api/auth/register`) seeds a new user's default settings row, full syllabus chapter list, and the template BASE PU test schedule synchronously — not lazily via an "auto-seed if table is empty" check, since that pattern breaks once data is per-user.
- Accent color/theme defaults live in three places kept in sync: DB schema default, settings preset list, and `index.css`/manifest — update all three together when changing brand color.

## Product

- Dashboard, Calendar, Tasks, Tests, Monthly Goals, Syllabus Tracker, Search, Settings
- Username/password auth with self-service sign up (no invite/admin gate)
- Offline/PWA support with a versioned service worker cache
- Custom accent color theming (default lime `#4aff00`), dark mode by default

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `drizzle-kit push` will always flag the `session` table as a pending destructive delete (it's managed by `connect-pg-simple`, not declared in the drizzle schema) and then abort non-interactively. This is expected — verify schema-vs-DB sync with direct `psql` queries instead of relying on `push`'s output.
- Bump the service worker cache version in `artifacts/jee-planner/public/sw.js` after any static asset/theme/logo change, or the PWA serves stale content.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
