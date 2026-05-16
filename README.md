# Portfolio 2025

Personal portfolio site, content system, and architecture playground for showcasing my work. The public experience is a React/Vite portfolio deployed on Netlify; the editing experience is a local-only admin workflow backed by Supabase service-role operations that never ship to the browser.

This repository is written for a mixed audience:

- For me and my coding agents, it documents the current boundaries, known drift, and next cleanup steps.
- For peers and lead developers, it shows the architecture decisions behind the public app, admin backend, data flow, and deployment boundaries.
- For HR, hiring teams, and employers, it provides a readable overview of what this project demonstrates: frontend craft, secure data boundaries, backend/admin tooling, documentation hygiene, and production-oriented maintenance.

## What This Project Demonstrates

- A production-style React portfolio using Vite, Tailwind, and Supabase.
- Public browser reads constrained to anon-safe credentials and public policies.
- A separate local Node admin backend for privileged reads, writes, deletes, and uploads.
- Netlify serverless functions for public runtime features that must stay outside the browser.
- Pure domain mappers and route helpers that keep database shape, UI shape, and admin persistence from bleeding into one another.
- A documentation trail that distinguishes current repo truth from historical planning notes.

## Architecture Overview

The browser is treated as untrusted. Code under `src` may use only public Supabase credentials and must not import privileged admin clients, server routes, or service-role logic.

Public app:

- Runs from `src`.
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Performs browser-safe portfolio reads through `src/api/public`.
- Shapes About, Contact, Project, and route data through pure helpers in `src/domain`.
- Deploys to Netlify with public-safe functions from `netlify/functions`.

Local admin workflow:

- Runs the React admin UI only during development.
- Calls `http://localhost:8787/admin-api` through `src/admin/api/adminClient.js`.
- Sends privileged operations to `server/admin`.
- Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only from server-side Node code.
- Reuses pure domain defaults/helpers for editor state where useful.

`server/admin` is not configured as a Netlify functions directory. The public deploy does not need, receive, or expose the service-role key.

## Repo Map

Start here when you need to understand a boundary quickly:

- [src/README.md](./src/README.md): browser application code, route surfaces, UI/data boundaries, and local frontend caveats.
- [src/api/README.md](./src/api/README.md): browser-safe public data readers and Supabase anon-client scope.
- [src/domain/README.md](./src/domain/README.md): pure mappers, route helpers, defaults, and dependency-light domain rules.
- [src/hooks/README.md](./src/hooks/README.md): reusable React lifecycle and UI-state hooks.
- [src/styles/README.md](./src/styles/README.md): shared theme tokens, global utilities, and reusable admin class recipes.
- [server/admin/README.md](./server/admin/README.md): local-only admin backend, privileged Supabase access, validation, and uploads.
- [netlify/functions/README.md](./netlify/functions/README.md): deployed public serverless handlers and local Netlify Dev expectations.
- [database/README.md](./database/README.md): Supabase schema, migrations, RLS expectations, and storage conventions.
- [docs/README.md](./docs/README.md): current repo truth, drift notes, testing plan, stale-code review, and cleanup candidates.

Treat `docs/` as the tracked source of truth for current status and next actions. Treat `planning/` as historical implementation memory and context logs.

## Documentation Guide

The root README is the orientation layer. It should stay readable for people evaluating the project and practical for agents or maintainers entering the codebase.

Detailed current-state notes live in `docs/`:

- [Data Flow Drift](./docs/data-flow-drift.md): database/admin/public drift, especially Contact and Skills.
- [Current Errors and Warnings](./docs/current-errors-and-warnings.md): known command failures, lint state, and expected local runtime warnings.
- [Testing Plan](./docs/testing-plan.md): feature-area testing priorities.
- [Routes, Runtime, and Data Collisions](./docs/routes-runtime-and-data-collisions.md): route constants, function paths, singleton IDs, storage paths, and collision risks.
- [Legacy and Stale Code](./docs/legacy-and-stale-code.md): unused, historical, or out-of-sync code paths.
- [Architecture Cleanup Candidates](./docs/architecture-cleanup-candidates.md): small stabilizing architecture work that should reduce drift.

## Current Architecture Notes

- Domain modules under `src/domain` must stay dependency-free and browser/server safe: no React, Supabase clients, browser globals, Vite-only APIs, UI assets, or request handlers.
- API modules own fetching and load-failure behavior.
- React components own rendering and browser behavior.
- Hooks own reusable browser lifecycle state and effects.
- The local admin server owns privileged reads, writes, deletes, validation, and uploads.
- Netlify functions own small deployed public endpoints callable from `/.netlify/functions/*`.
- Styling tokens, global utilities, and reusable admin recipes live in `src/styles`; feature-specific layout should stay near the component that uses it.

Known cleanup themes are documented rather than hidden:

- Runtime route/function/storage constants need clearer homes.
- Skills data is still partly legacy while the public Skills section uses newer grouped static content.
- Project media upload paths need a safer per-media convention.
- Lint is the immediate quality-gate blocker before tests become part of the default baseline.

## Local Development

Install dependencies:

```sh
npm install
```

Start the public app:

```sh
npm run dev
```

Start the local admin backend in a separate terminal:

```sh
npm run admin:server
```

Required local env vars in `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional admin backend env vars:

- `ADMIN_SERVER_HOST`, defaults to `127.0.0.1`
- `ADMIN_SERVER_PORT`, defaults to `8787`
- `VITE_ADMIN_API_BASE_URL`, defaults in the frontend to `http://localhost:8787/admin-api`

The admin backend refuses to start with `NODE_ENV=production` or a non-loopback `ADMIN_SERVER_HOST`.

Use Netlify Dev when testing deployed-function behavior locally:

```sh
netlify dev
```

Plain Vite is enough for the public UI, but Netlify Dev is needed for `/.netlify/functions/track-visit` and `/.netlify/functions/inline-svg`.

## Verification

Near-term target checks:

```sh
npm run lint
npm run check:schema
npm run build
```

Current docs note that `npm run check:schema` and `npm run build` pass, while `npm run lint` is the known blocker. On this Windows machine, direct PowerShell `npm` execution may be blocked by the unsigned `npm.ps1` policy; use `cmd /c npm ...` if that happens.

Useful boundary searches before shipping changes:

```sh
rg "VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin|requireClient" src
rg "SUPABASE_SERVICE_ROLE_KEY" src
rg "SUPABASE_SERVICE_ROLE_KEY" server
```

## Maintenance Rules

When changing persisted portfolio data, update the same contract end to end:

- SQL snapshot and migrations in `database/`.
- Public select list in `src/api/public/*`.
- Domain mapper/default in `src/domain/*`.
- Admin route reader/serializer in `server/admin/routes/*`.
- Admin validation in `server/admin/routes/validation.js`.
- Related docs or subfolder README when setup expectations or boundaries change.

When changing architecture boundaries, update `docs/` first or in the same change. The point of this repo is not only to work, but to stay legible.
