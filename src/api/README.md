# API

`src/api` contains browser-safe API helpers for reading public portfolio data.

Use this directory for frontend data access that can run with public environment variables and return normalized data for components and hooks.

## Scope

- Create the public Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Fetch public About, Contact, Project section, Project card, and Project detail data.
- Delegate row shaping to `src/domain` mappers.
- Return `null` when public data cannot be loaded, so the UI can use local defaults or omit optional sections.

Keep this directory free of privileged writes, service-role keys, admin validation, upload behavior, and React rendering logic.

## Folders

- `clients/`: owns configured external clients that are safe for browser use.
- `public/`: owns public read helpers grouped by portfolio feature.

## Boundary Notes

- Public helpers should only use anon-safe Supabase access and public tables or policies.
- Keep database row-to-view-model mapping in `src/domain`; API modules should focus on selecting data and handling load failures.
- Keep admin routes and write operations in `server/admin`.
- Keep Netlify function handlers in `netlify/functions`.
- Log unexpected fetch errors here, but let callers decide how to present fallbacks.

## Current Caveat

`public/projects.js` currently owns `PROJECT_SECTION_ID = 1` for the singleton project section read. If runtime constants are centralized later, keep the replacement browser-safe and avoid importing frontend-only code into server/admin modules.
