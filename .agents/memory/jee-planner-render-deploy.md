---
name: Deploying off Replit to a single-service host (Render)
description: How the two-service Replit architecture (separate frontend + API server behind the shared proxy) was made deployable as one Node process for free-tier hosts like Render that only give one free web service.
---

- Replit runs the frontend (Vite static build) and the API server as two separate services behind a shared path-based proxy. Free tiers on other hosts (Render) typically only give one free web service, so a single-service deploy is needed there.
- Solution: the API server (Express) optionally serves the frontend's built static files itself, with an SPA fallback route, gated on `NODE_ENV === "production"` AND the frontend build output actually existing on disk next to it. This is inert on Replit (the frontend dist isn't present in the API server's own deploy) and activates only when both packages are built into the same deploy, as on Render.

**Why:** avoids maintaining two separate frontend/backend deploy configs per host, and avoids cross-origin cookie complications (session cookies work fine same-origin; cross-site would need `sameSite: "none"` + extra CORS care).

**How to apply:** if adding another host target that only supports one service, build both `@workspace/jee-planner` and `@workspace/api-server`, then run the API server's compiled entrypoint — it will pick up and serve the frontend automatically once its dist directory is present as a sibling artifact directory.

- `connect-pg-simple`'s session table needs `createTableIfMissing: true` for portability across hosts/databases (it was previously `false`, relying on a manually-created table only present in the original Replit DB) — otherwise a fresh Postgres instance (e.g. Render's) has no session table and login breaks silently.
- Cookie `secure` must be conditional on `NODE_ENV === "production"` (not hardcoded true/false) plus `app.set("trust proxy", 1)` in production, or secure cookies won't work behind a TLS-terminating reverse proxy (Render's load balancer) but would also break local/dev HTTP testing if left always-on.
