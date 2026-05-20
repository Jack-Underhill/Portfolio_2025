# Architecture Cleanup Candidates

Date: 2026-05-16

## Purpose

This document captures architecture cleanup candidates that would reduce drift without turning the portfolio into a larger system than it needs to be.

## Maintenance Rules

- Keep cleanup candidates that are still active and stabilizing.
- Remove or reframe completed setup work as current architecture rules.
- Avoid broad refactor ideas unless they reduce documented drift.

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

## Quality Gate

Problem:

- Unit tests, lint, build, and schema drift checks pass.
- Focused browser accessibility smoke coverage exists for stable public/accessibility routes.
- Modal focus browser smoke coverage and `track-visit` function behavior are still future work.

Next actions:

- Keep README verification aligned with the active baseline.
- Add modal focus browser smoke tests and mocked `track-visit` tests when those areas become active work.

## Definition of Done

This cleanup pass is complete when:

- `cmd /c npm run test`, `cmd /c npm run lint`, `cmd /c npm run check:schema`, and `cmd /c npm run build` all pass.
- Root README points to `docs/`.
- Route/function constants have obvious homes.
- Architecture diagram upload and viewer validation agree.
