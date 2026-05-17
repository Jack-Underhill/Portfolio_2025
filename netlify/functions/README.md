# Netlify Functions

`netlify/functions` contains deployed serverless handlers used by the public portfolio.

Use this directory for small runtime endpoints that must run outside the browser but do not belong to the local admin server.

## Scope

- Track unique public visits with Upstash Redis.
- Proxy trusted project architecture SVGs with safe response headers.
- Share function-only utilities such as IP skip checks.
- Keep function handlers deployable by Netlify and callable from `/.netlify/functions/*`.

Keep this directory free of React components, local admin routes, service-role admin workflows, and browser-only Vite imports.

## Active Files

- `track-visit.mjs`: increments and returns the `unique_visits` Redis counter, skipping IPs listed in `SKIP_TRACKING_IPS`.
- `inline-svg.js`: fetches and returns trusted Supabase-hosted project architecture SVGs for inline preview rendering. Trusted SVGs must come from the public `portfolio-assets` bucket at `projects/{id}/architecture.svg`.
- `utils/shouldSkipIP.js`: reads `SKIP_TRACKING_IPS` and decides whether a request IP should be excluded from tracking.

## Local Testing

Functions are available locally when the site runs through Netlify Dev, not plain Vite.

- Use `netlify dev` when testing `/.netlify/functions/track-visit` or `/.netlify/functions/inline-svg`.
- Without Netlify Dev, public UI components should keep fallback behavior and warn instead of crashing.
- Redis-backed functions need `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## Boundary Notes

- Public browser code may call these handlers through `/.netlify/functions/*`, but should not import handler code directly.
- Admin-only writes belong in `server/admin`.
- Public Supabase reads belong in `src/api/public`.
- Keep route path constants browser-safe if they are centralized later.
- Keep detailed function drift and testing notes in `docs/`. This README is only the local map for maintainers reading `netlify/functions`.

## Current Caveat

`project-click-track.js` and `project-click-count.js` are not referenced by active `src` code. They should either be wired intentionally and cleaned up, or removed with the related stale-code notes updated.
