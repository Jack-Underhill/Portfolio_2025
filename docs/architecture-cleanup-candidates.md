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

- Some runtime values still live at their natural runtime boundary, while public route and browser-visible function paths now have one browser-safe home.

Examples:

- `/admin`
- `/admin-api`
- `portfolio-assets`
- `PROJECT_SECTION_ID = 1`
- `ABOUT_ID = 1`
- `http://localhost:8787/admin-api`
- `http://localhost:5173`

Current state:

- `src/runtime/paths.js` owns public route constants and browser-visible Netlify function paths.
- `src/domain/projects/routing.js` keeps pure project route parsing/building.

Next actions:

- Add a server-safe constants home only if it can be imported by Node without Vite/browser dependencies.
- Document values that should not be shared across browser/server boundaries.

Avoid:

- A broad config framework.
- Importing frontend code into the admin server.
- Hiding simple constants behind unnecessary abstractions.

## Storage Path Helpers

Problem:

- Project media storage conventions have been clarified, including the architecture SVG trust path.
- Future storage work should preserve the current media-specific project path helpers.

Next actions:

- Keep database docs and server storage docs updated when storage conventions change.
- Add new storage helpers only when another media type needs its own stable object path.

## Public Data Ownership

Problem:

- Contact links are data-driven.
- Skills are data-driven with static grouped fallbacks.
- Project classification is data-driven with one shared project row shape.

Next actions:

- Keep Contact links and Skills owned by separate public/domain/admin modules.
- Keep static Skills fallback groups so the public site remains resilient.
- Keep project featured/standard grouping in `src/domain/projects/viewModel.js` so future project-list UI work does not duplicate sorting rules.

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

- Unit tests, lint, build, and schema drift checks pass.
- Browser smoke coverage and `track-visit` function behavior are still future work.

Next actions:

- Keep README verification aligned with the active baseline.
- Add focused browser smoke tests and mocked `track-visit` tests when those areas become active work.

## Definition of Done

This cleanup pass is complete when:

- `cmd /c npm run test`, `cmd /c npm run lint`, `cmd /c npm run check:schema`, and `cmd /c npm run build` all pass.
- Root README points to `docs/`.
- Public data ownership for Skills/Contact is explicit.
- Route/function/storage constants have obvious homes.
- Architecture diagram upload and viewer validation agree.
