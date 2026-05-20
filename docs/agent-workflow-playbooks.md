# Agent Workflow Playbooks

Date: 2026-05-19

## Purpose

This document gives future fresh-context agents a current-state starting point for repeated work on this portfolio. Use it to orient before editing content, project data, media, accessibility behavior, data-flow contracts, verification, or closeout docs.

The playbooks should point to live repo truth, not stale planning memory. Start from `README.md`, `docs/`, and the local README for the files you are touching. Use `codex-planning/` for implementation history and roadmap status, not as the first source for active warnings or current contracts.

## Maintenance Rules

- Keep workflows current-state oriented.
- Update this file when source-of-truth docs, module boundaries, quality gates, or recurring workflows move.
- Remove stale warnings instead of carrying old history forward.
- Prefer links to current docs and local READMEs over copying long details.
- Keep workflow updates scoped to the behavior, boundary, or verification rule that changed.
- Keep this as one lightweight docs file until it becomes hard to scan.

## Start Here for Any Agent Task

Read the current orientation docs before editing:

- [Root README](../README.md): project purpose, architecture boundaries, local setup, and baseline verification.
- [Docs Index](./README.md): current repo truth and active follow-up docs.
- [Current Errors and Warnings](./current-errors-and-warnings.md): passing gate, expected local warnings, and command caveats.
- [Testing Plan](./testing-plan.md): current coverage, remaining gaps, and test strategy.

Then read the local README nearest the files you expect to touch:

- [Frontend README](../src/README.md): public browser code and route surfaces.
- [Public API README](../src/api/README.md): browser-safe public readers.
- [Domain README](../src/domain/README.md): pure mappers, route helpers, defaults, and shared domain rules.
- [Hooks README](../src/hooks/README.md): reusable browser lifecycle hooks.
- [Styles README](../src/styles/README.md): tokens, global utilities, and admin class recipes.
- [Admin Server README](../server/admin/README.md): local-only privileged admin backend.
- [Database README](../database/README.md): schema, migrations, RLS expectations, and storage conventions.
- [Netlify Functions README](../netlify/functions/README.md): deployed public function boundaries and local Netlify Dev expectations.

For planning context, read only the current PRD substep or roadmap item that owns the work. After that, return to the current-state docs and code before deciding what to edit.

## Trust Boundaries

Use these rules before choosing files to edit:

- Browser code under `src` may use public Supabase anon credentials only: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Browser code must not import `server/admin`, service-role clients, admin validation routes, Node-only helpers, or `SUPABASE_SERVICE_ROLE_KEY`.
- Do not create or use `VITE_SUPABASE_SERVICE_ROLE_KEY`.
- Privileged Supabase reads, writes, deletes, uploads, and service-role validation belong in `server/admin`.
- Public Netlify functions belong in `netlify/functions`; keep them free of local admin routes, React components, and Vite browser-only imports.
- Public browser reads belong in `src/api/public`.
- Pure browser/server-safe data shaping belongs in `src/domain`.
- Admin validation belongs in `server/admin/routes/validation.js` or nearby server-owned helpers.
- Browser-visible route and function path constants belong in `src/runtime/paths.js`.
- Project route parsing and building belongs in `src/domain/projects/routing.js`.
- Admin-managed storage path behavior belongs in `server/admin/utils`; public components should consume stored URLs.

Run these guardrail searches when boundary changes, credential use, Supabase access, admin routes, or shared helpers are in scope:

```sh
rg "VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin|requireClient" src
rg "SUPABASE_SERVICE_ROLE_KEY" src
rg "SUPABASE_SERVICE_ROLE_KEY" server
rg "server/admin|clients/supabaseService|process.env" src
```

Stop condition for a fresh context window:

- Stop and document the mismatch if browser code needs a service-role operation, admin code needs a Vite-only module, or a Netlify function starts depending on local admin internals.

## Workflow: Run Quality Gates

When to use it:

- Before marking a PRD substep, roadmap item, or scoped phase complete.
- After changes to contracts, routes, rendered public structure, admin persistence, schema snapshots, or docs that alter verification guidance.
- Before updating `docs/current-errors-and-warnings.md` with a new baseline.

Read first:

- [Current Errors and Warnings](./current-errors-and-warnings.md)
- [Testing Plan](./testing-plan.md)
- The local README closest to the files changed.

Do:

- Run the normal gate with `cmd /c` on this Windows machine:

  ```sh
  cmd /c npm run test
  cmd /c npm run lint
  cmd /c npm run check:schema
  cmd /c npm run build
  ```

- Run the focused accessibility smoke when public rendered structure, accessibility behavior, route rendering, modal focus behavior, or accessibility guidance changes:

  ```sh
  cmd /c npm run test:a11y
  ```

- Treat the plain Vite `track-visit` warning and the plain Vite `inline-svg` architecture preview warning as expected local caveats unless behavior changed. Use `netlify dev` when manually checking those function paths.
- Update `docs/current-errors-and-warnings.md` only for current failures, expected warnings, or the latest verified gate.

Do not:

- Mark a PRD step or roadmap item complete after a partial gate unless the skipped command and reason are documented.
- Treat plain Vite Netlify function warnings as production failures.
- Add live Supabase, Redis, or deployed Netlify checks to the default local quality gate.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Optional in scope:

```sh
cmd /c npm run test:a11y
```

Docs update expectations:

- Keep `README.md` and `docs/current-errors-and-warnings.md` aligned if baseline commands, command caveats, or expected warnings change.
- Keep `docs/testing-plan.md` aligned when coverage scope changes.

Stop condition for a fresh context window:

- Stop after the needed commands have passed or after a pre-existing failure is recorded as current state with enough detail for the next window.

## Workflow Sections

Later P3.10 implementation windows fill in these shared workflows:

- Add or edit a case study.
- Update project media.
- Add or adjust project labels and classification.
- Accessibility walkthrough.
- Data-flow docs after schema changes.
- Roadmap and docs closeout.

## Fresh Context Handoff Template

Use this shape when leaving notes for the next context window:

```md
## Fresh Context Handoff

Current PRD or roadmap item:
- `path/to/source.md`, substep or item name.

Status:
- Completed:
- In progress:
- Not started:

Files changed:
- `path/to/file`: short current-state note.

Verification:
- Passed:
- Not run:
- Expected warnings:

Implementation details future steps need:
- Final helper names, contracts, accepted caveats, or remaining decisions.

Next stop condition:
- The precise point where the next window should stop.
```

Keep handoffs short. They should help the next agent continue from current truth without rereading every completed PRD note.
