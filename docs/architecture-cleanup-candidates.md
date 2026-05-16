# Architecture Cleanup Candidates

Date: 2026-05-16

## Purpose

This document captures architecture cleanup candidates that would reduce drift without turning the portfolio into a larger system than it needs to be.

## Current Verdict

The architecture is already directionally correct:

- Browser-safe public reads live under `src/api/public`.
- Privileged writes live in `server/admin`.
- Pure row shaping and route helpers live under `src/domain`.
- Browser lifecycle behavior has been extracted into focused hooks.
- Styling tokens and repeated recipes have clearer homes.

The next architecture work should be small and stabilizing.

## Runtime Constants

Problem:

- Important route, function, bucket, path, host, and singleton values are scattered.

Examples:

- `/p/`
- `/architecture-viewer`
- `/admin`
- `/admin-api`
- `/.netlify/functions/track-visit`
- `/.netlify/functions/inline-svg`
- `portfolio-assets`
- `PROJECT_SECTION_ID = 1`
- `ABOUT_ID = 1`
- `http://localhost:8787/admin-api`
- `http://localhost:5173`

Next actions:

- Add a tiny browser-safe runtime/routes module for public route and function paths.
- Add a server-safe constants home only if it can be imported by Node without Vite/browser dependencies.
- Document values that should not be shared across browser/server boundaries.

Avoid:

- A broad config framework.
- Importing frontend code into the admin server.
- Hiding simple constants behind unnecessary abstractions.

## Storage Path Helpers

Problem:

- Project image, video, and architecture upload paths currently share the same preview stem.
- Architecture viewer trust rules do not clearly match admin architecture upload behavior.

Next actions:

- Introduce distinct project media path helpers.
- Align architecture upload paths with viewer validation.
- Update database docs and server storage docs together.

## Public Data Ownership

Problem:

- Contact links are data-driven.
- Skills display is static.
- Old skill database/admin paths still exist.

Next actions:

- Decide and implement a grouped skills data model.
- Remove stale languages/experience outputs once replaced.
- Keep static fallback groups so the public site remains resilient.

## Documentation Boundaries

Problem:

- Main README is useful but intentionally high level.
- Subdirectory boundaries are still mostly learned by reading source.

Next actions:

- Add concise future READMEs after these audit docs settle:
  - `src/README.md`
  - `src/domain/README.md`
  - `src/api/README.md`
  - `server/admin/README.md`
  - `src/hooks/README.md`
  - `src/styles/README.md`
  - `netlify/functions/README.md`

Guideline:

- These future READMEs should be practical and short.
- Keep detailed status and audit notes in `docs/`.

## Quality Gate

Problem:

- Lint, build, and schema drift checks pass.
- No tests exist yet.

Next actions:

- Add high-value tests by feature area.
- Keep README verification aligned with the active baseline.

## Definition of Done

This cleanup pass is complete when:

- `cmd /c npm run lint`, `cmd /c npm run check:schema`, and `cmd /c npm run build` all pass.
- Root README points to `docs/`.
- Public data ownership for Skills/Contact is explicit.
- Route/function/storage constants have obvious homes.
- Architecture diagram upload and viewer validation agree.
- Stale project click functions are either wired intentionally or removed.
