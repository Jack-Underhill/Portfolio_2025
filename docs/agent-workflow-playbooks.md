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

## Workflow: Add or Edit a Case Study

When to use it:

- A project card, project detail modal, permalink-backed project, or admin-managed project content changes.
- The work may be content-only, admin editor work, schema work, public rendering work, or a mix.

Read first:

- [Data Flow Drift](./data-flow-drift.md)
- [Testing Plan](./testing-plan.md)
- [Database README](../database/README.md)
- `src/api/public/projects.js`
- `src/domain/projects/mappers.js`
- `src/domain/projects/viewModel.js`
- `src/components/sections/Projects.jsx`
- `src/components/projects/modal/ProjectModal.jsx`
- `server/admin/routes/projects.js`
- `server/admin/routes/validation.js`

Do:

- Classify the task before editing: content-only, admin UI, schema, public rendering, routing, or validation.
- Keep public project cards and project details compatible with `mapProjectRowToPublicCard`, `mapProjectRowToPublicDetails`, and the view-model helpers.
- Keep `Projects.jsx` as the owner of public fetch, grouping, flattened modal project list, and the single `ProjectModal` render.
- Preserve route-backed project opens through the current project routing helpers.
- Use `server/admin/routes/validation.js` for persisted project edit rules and `server/admin/routes/projects.js` for admin serialization.
- Add or update tests when mapper, view-model, routing, validation, or public/admin contract behavior changes.

Do not:

- Hardcode a project ID in public components.
- Add browser writes to Supabase.
- Add service-role code or admin route imports to `src`.
- Change modal data shape without reviewing public mappers, admin validation, and route-backed modal behavior.
- Let component-local fallback behavior become the only source for persisted project fields.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Docs update expectations:

- Update [Data Flow Drift](./data-flow-drift.md) when a project content decision changes active drift, accepted caveats, grouping, label display, or empty-state behavior.
- Update [Testing Plan](./testing-plan.md) when project mapper, validation, routing, or component smoke coverage changes.
- Update local READMEs only when boundaries or setup expectations change.

Stop condition for a fresh context window:

- Stop after the requested case-study behavior is implemented, the touched public/admin/schema contracts agree, verification is run or a current failure is documented, and any active docs drift is updated.

## Workflow: Add or Adjust Project Labels and Classification

When to use it:

- `featured_rank`, `project_type`, `labels`, featured-vs-standard grouping, or label display behavior changes.
- A task changes accepted project type values, label validation rules, admin classification inputs, or public grouping/sorting.

Read first:

- [Data Flow Drift](./data-flow-drift.md)
- `src/domain/projects/constants.js`
- `src/domain/projects/mappers.js`
- `src/domain/projects/viewModel.js`
- `src/admin/projects/editor/ProjectClassificationFields.jsx`
- `server/admin/routes/projects.js`
- `server/admin/routes/validation.js`
- `database/schema.sql`
- [Database README](../database/README.md)

Do:

- Reuse the existing `featured_rank`, `project_type`, and `labels` model.
- Keep accepted project type values centralized in `src/domain/projects/constants.js`.
- Keep featured and standard projects on the same mapped project shape.
- Keep grouping and sorting behavior in `src/domain/projects/viewModel.js`.
- Keep admin classification inputs aligned with server validation and admin serialization.
- Update mapper, view-model, and admin validation tests if accepted values, label normalization, sorting, or grouping rules change.
- Make an explicit product decision before rendering labels publicly; labels are currently mapped and admin-ready, but visual display remains an active decision.

Do not:

- Create a normalized label table unless filtering, search, analytics, or cross-project metadata requires it now.
- Duplicate featured/standard sorting rules in components.
- Treat labels as visually implemented if they are only mapped and editable in admin.
- Add a new project type in admin UI without updating constants, validation, mappers, schema expectations, and tests as needed.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Docs update expectations:

- Update [Data Flow Drift](./data-flow-drift.md) if label display, empty groups, featured grouping, project type semantics, or standard project presentation changes.
- Update [Testing Plan](./testing-plan.md) if project classification coverage changes.
- Update [Database README](../database/README.md) if persisted project classification fields or storage/schema expectations change.

Stop condition for a fresh context window:

- Stop after public mappers, admin validation, admin UI, schema expectations, tests, and current-state docs agree on the classification contract.

## Workflow Sections

Later P3.10 implementation windows fill in these shared workflows:

- Update project media.
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
