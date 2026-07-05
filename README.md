# JEE Planner

A study-planning web app for students prepping for JEE Main/Advanced. It tracks daily tasks, upcoming tests, monthly goals, and syllabus progress against the exam countdown — with support for multiple independent user accounts, each fully isolated from the others.

## Features

- **Dashboard** — today's tasks, upcoming tests, and a live countdown to JEE Main / JEE Advanced
- **Calendar** — month view of tasks, tests, and holidays
- **Tasks** — create, prioritize, and complete study tasks by subject/chapter
- **Tests** — schedule and track mock tests, weekly tests, and JEE Advanced practice papers
- **Monthly Goals** — set and check off goals for the current month
- **Syllabus Tracker** — Physics, Chemistry, and Maths chapters with per-chapter progress status
- **Search** — find tasks and chapters across the app
- **Settings** — theme, accent color, and exam date configuration
- **Multi-user accounts** — self-service sign up, with each account getting its own private tasks, tests, goals, and syllabus progress
- **Offline / PWA support** — installable, works with cached data when offline

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React + Vite (`artifacts/jee-planner`)
- **Backend**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API contract & codegen**: OpenAPI spec + Orval (generates React Query hooks and Zod schemas)
- **Auth**: username/password with server-side sessions (`express-session` + `connect-pg-simple`)

## Getting started

Requires a `DATABASE_URL` environment variable pointing at a PostgreSQL database.

```bash
# run the API server
pnpm --filter @workspace/api-server run dev

# run the web app
pnpm --filter @workspace/jee-planner run dev

# push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# regenerate API hooks/schemas after changing the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# typecheck everything
pnpm run typecheck
```

On Replit, both services run automatically via configured workflows and are reachable through the shared preview proxy.

## Project structure

```
artifacts/
  api-server/     Express API (routes, session/auth middleware)
  jee-planner/    React + Vite frontend
lib/
  db/             Drizzle schema + DB client
  api-spec/       OpenAPI contract (source of truth for the API)
  api-zod/        Generated Zod request/response schemas
  api-client-react/ Generated React Query hooks
scripts/          Misc workspace utility scripts
```

See `replit.md` for architecture decisions, gotchas, and where things live in more detail.

## Note on hosting

This app requires a running backend and database, so it can't be hosted on static-only platforms like GitHub Pages. Use Replit's deployment/publishing to make it available at a live URL, or deploy it to Render (see below).

## Deploying to Render (free tier)

A `render.yaml` at the repo root is configured for Render's "Blueprint" deploy, which provisions a single free web service plus a free Postgres database:

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint** and point it at the repo — it will read `render.yaml` automatically.
3. Render provisions a free Postgres database (`jee-planner-db`) and a free web service, wiring `DATABASE_URL` and a generated `SESSION_SECRET` automatically.
4. After the first deploy, push the database schema once: `DATABASE_URL=<your Render DB URL> pnpm --filter @workspace/db run push` (run this from your local machine/Replit, pointed at the Render database).

Notes:

- The web service builds and serves the frontend and API together as a single Node process (unlike the two-service setup used on Replit's shared proxy), so it works within Render's one-free-service constraint.
- Render's free web service spins down after ~15 minutes of inactivity, so the first request after idle time will be slow (cold start).
- Render's free Postgres database expires after 90 days unless upgraded — plan to migrate or upgrade before then.
