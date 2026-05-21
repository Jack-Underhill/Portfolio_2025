# Agent Workflow Playbooks

Date: 2026-05-21

## Purpose

This document gives future fresh-context agents a current-state starting point for repeated work on this portfolio. Use it to orient before editing content, project data, media, accessibility behavior, data-flow contracts, verification, or closeout docs.

The playbooks should point to live repo truth, not stale planning memory. Start from `README.md`, `docs/`, and the local README for the files you are touching. Planning notes outside the tracked docs may explain why work happened, but they are not the source for active warnings or current contracts.

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

If external planning notes are provided with a task, use them only to understand the requested scope. Return to the current-state docs and code before deciding what to edit.

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

- Before calling a scoped task complete.
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

- Call a scoped task complete after a partial gate unless the skipped command and reason are documented.
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
- `src/domain/projects/preview.js`
- `src/domain/projects/viewModel.js`
- `src/components/sections/Projects.jsx`
- `src/components/projects/modal/ProjectModal.jsx`
- `src/admin/sections/ProjectsSection.jsx`
- `src/admin/projects/ProjectPreviewActions.jsx`
- `src/admin/api/adminClient.js`
- `server/admin/routes/projects.js`
- `server/admin/routes/validation.js`

Do:

- Classify the task before editing: content-only, admin UI, schema, public rendering, routing, or validation.
- Keep public project cards and project details compatible with `mapProjectRowToPublicCard`, `mapProjectRowToPublicDetails`, and the view-model helpers.
- For admin draft previews, keep unsaved draft-to-modal shape changes in `mapProjectDraftToPreviewProject` and render through the shared `ProjectModal`.
- For agent-assisted drafts, produce a JSON payload that the admin `Import draft` action can apply through `src/domain/projects/agentDraft.js`.
- For existing project revisions, ask the user for the admin `Copy current context` output before comparing current content against new source material.
- Keep `Projects.jsx` as the owner of public fetch, grouping, flattened modal project list, and the single `ProjectModal` render.
- Preserve route-backed project opens through the current project routing helpers.
- Use `server/admin/routes/validation.js` for persisted project edit rules and `server/admin/routes/projects.js` for admin serialization.
- Use `validateProjectDraft` and `POST /admin-api/projects/validate` when the admin needs validation feedback without saving or uploading.
- Add or update tests when mapper, view-model, routing, validation, or public/admin contract behavior changes.

Agent-assisted draft payloads:

- Read the relevant project notes, source files, docs, screenshots, or rough writeups before drafting.
- Choose the mode before writing JSON:
  - New draft mode: use project source material only and produce a full import payload.
  - Existing project edit/review mode: read current project draft JSON first, then read the new report or source material, compare both, and produce either a full refreshed payload or a minimal patch payload.
- Return one fenced `json` block shaped like this, with assumptions, caveats, and review notes outside the JSON:

  ```json
  {
    "title": "Project title",
    "description": "One-sentence public card summary",
    "overview": "Short paragraph explaining what the product is, who it serves, and the practical outcome.",
    "role": "Short paragraph naming my role, ownership, and the main technical contribution.",
    "features": ["Migrated a concrete surface or shipped a user-visible capability with the constraint preserved."],
    "metrics": ["~400 users, >90% coverage, or another concrete outcome tied to the project impact."],
    "challenges": [
      {
        "challenge": "Concise challenge headline that can stand alone in the collapsed card",
        "solution": "What I did, written as an implementation summary for the expanded card",
        "result": "Outcome, risk reduction, maintainability gain, or user impact"
      }
    ],
    "improvements": ["Specific next improvement that would make the project easier to operate, maintain, or scale."],
    "techStack": {
      "frontend": ["React"],
      "backend": ["Node"],
      "data": ["Supabase"],
      "infrastructure": ["Netlify"]
    },
    "projectType": "personal",
    "labels": ["AI-assisted draft"],
    "url": "https://example.com",
    "sourceUrl": "https://github.com/example/repo",
    "writeupUrl": "",
    "videoPageUrl": "",
    "published": true,
    "featuredRank": ""
  }
  ```

- Use only supported top-level payload fields: `title`, `description`, `overview`, `role`, `features`, `metrics`, `challenges`, `improvements`, `techStack`, `projectType`, `labels`, `url`, `sourceUrl`, `writeupUrl`, `videoPageUrl`, `published`, and `featuredRank`.
- Use only `techStack.frontend`, `techStack.backend`, `techStack.data`, and `techStack.infrastructure`.
- Use only accepted project types: `school`, `internship`, `personal`, `client`, or `open-source`.
- Use `title` as the modal heading; keep it specific and portfolio-friendly.
- Use `description` for the public project card, not the modal body. Make it one concise sentence.
- Use `overview` for the first modal paragraph: what the project is, who it serves, and why it matters.
- Use `role` for the second modal paragraph: my title or responsibility, what I owned, and the main technical direction.
- Use `features` for the "Key Features" bullets. Each item should be a complete, skimmable sentence about a shipped behavior, migration, or system capability.
- Use `metrics` for the "Metrics" bullets. Prefer quantified outcomes, adoption, coverage, reliability, performance, scope, or concrete delivery results.
- Frame `challenges` as collapsed case-study cards: `challenge` is the bold card headline, `solution` appears under "What I did", and `result` appears both as the collapsed teaser and expanded result. Do not use alternate keys such as `problem` or `impact` in the JSON.
- Use `improvements` for "What I'd Improve Next" bullets. Keep them as credible future engineering follow-ups, not apologies.
- Keep `techStack` values short enough to work as pills, but include clarifying context when useful, such as `Redis (sessions / cache)` or `Traefik (reverse proxy / routing)`.
- Leave optional action URLs as empty strings when there is no public link; do not invent links.
- Do not use em dashes in drafted case-study copy. Use commas, parentheses, colons, semicolons, or shorter sentences instead.
- Do not include identity, routing, media, upload, or persistence fields such as `id`, `permalink`, `sortOrder`, `imageUrl`, `videoUrl`, `architectureImageUrl`, file objects, or `techTags`.
- Tell the user to paste the JSON into the admin `Import draft` panel, then run `Validate draft`, open `Preview`, and save only after review.

Existing project edit/review mode:

- Ask for or use current project draft context before revising an existing case study. The preferred source is the admin `Copy current context` action; a manual copy/export is acceptable only if the UI is unavailable.
- Review current project context shaped like this. Treat `projectContext` as read-only identification and `draft` as the supported content fields to compare, not as an import payload:

  ```json
  {
    "projectContext": {
      "id": "project-id-for-reference-only",
      "title": "Current project title",
      "permalink": "current-project-permalink",
      "projectType": "personal",
      "labels": ["Existing label"]
    },
    "draft": {
      "title": "Current project title",
      "description": "Current card summary",
      "overview": "Current modal overview",
      "role": "Current role summary",
      "features": ["Current feature"],
      "metrics": ["Current metric"],
      "challenges": [
        {
          "challenge": "Current challenge",
          "solution": "Current solution",
          "result": "Current result"
        }
      ],
      "improvements": ["Current improvement"],
      "techStack": {
        "frontend": ["React"],
        "backend": ["Node"],
        "data": ["Supabase"],
        "infrastructure": ["Netlify"]
      },
      "projectType": "personal",
      "labels": ["Existing label"],
      "url": "https://example.com",
      "sourceUrl": "https://github.com/example/repo",
      "writeupUrl": "",
      "videoPageUrl": "",
      "published": true,
      "featuredRank": ""
    }
  }
  ```

- Compare the current draft against the new source material before producing the import JSON. Name accurate existing content, stale content, missing content, and contradictions in notes outside the JSON.
- Output either a full refreshed payload or a minimal patch payload using the same supported import fields. Missing supported keys preserve the active admin draft; present empty strings or arrays intentionally clear those fields.
- Keep the change summary, preserved-field notes, assumptions, caveats, contradictions, and open questions outside the fenced JSON block.
- Tell the user to paste only the import JSON into `Import draft`, then run `Validate draft` and `Preview` before saving.

Do not:

- Hardcode a project ID in public components.
- Add browser writes to Supabase.
- Add service-role code or admin route imports to `src`.
- Add browser-side Supabase writes, autosave, localStorage drafts, or a persistent draft table for the current draft-preview workflow.
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

## Workflow: Update Project Media

When to use it:

- A project preview image, preview video, architecture diagram, media upload behavior, storage convention, or architecture viewer/proxy trust rule changes.
- The work touches admin project uploads, public project media rendering, architecture preview fallback behavior, or Netlify inline SVG behavior.

Read first:

- [Database README](../database/README.md)
- [Admin Server README](../server/admin/README.md)
- [Netlify Functions README](../netlify/functions/README.md)
- [Current Errors and Warnings](./current-errors-and-warnings.md)
- [Testing Plan](./testing-plan.md)
- [Routes, Runtime, and Data Collisions](./routes-runtime-and-data-collisions.md)
- `server/admin/utils/storage.js`
- `src/components/projects/modal/ArchitecturePreview.jsx`
- `src/components/projects/viewer/ArchitectureViewer.jsx`
- `src/components/projects/viewer/viewerUrl.js`
- `netlify/functions/inline-svg.js`

Do:

- Use the current project-scoped storage paths:

  ```txt
  projects/{id}/preview-image{ext}
  projects/{id}/preview-video{ext}
  projects/{id}/architecture{ext}
  ```

- Keep upload path building in `server/admin/utils/storage.js`; public components should consume stored URLs instead of rebuilding upload paths.
- Keep image, video, and architecture media on distinct stems so same-extension uploads cannot overwrite another media type.
- Keep architecture SVG trust aligned across `server/admin/utils/storage.js`, `src/components/projects/viewer/viewerUrl.js`, and `netlify/functions/inline-svg.js`.
- Trust inline architecture SVGs only when the target is an HTTPS Supabase public bucket URL shaped as `portfolio-assets/projects/{id}/architecture.svg`.
- Let non-SVG architecture files remain normal stored media URLs; do not send them through the inline SVG proxy.
- Use `netlify dev` for manual local checks of `/.netlify/functions/inline-svg`.
- Add or update focused tests when storage paths, viewer URL trust, proxy validation, or fallback behavior changes.

Do not:

- Let preview images, preview videos, and architecture files share the same storage stem.
- Trust arbitrary SVG URLs, legacy `project-architecture/*.svg` URLs, non-Supabase hosts, wrong buckets, or query-string tricks in the architecture viewer.
- Put service-role storage writes, upload path generation, or admin storage helpers in browser code.
- Import Netlify function handlers directly into public React components.
- Treat the plain Vite architecture preview fallback as a production failure.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Run the focused accessibility smoke if rendered architecture viewer behavior, preview fallback markup, or viewer route accessibility changes:

```sh
cmd /c npm run test:a11y
```

Docs update expectations:

- Update [Database README](../database/README.md), [Admin Server README](../server/admin/README.md), and [Routes, Runtime, and Data Collisions](./routes-runtime-and-data-collisions.md) if storage bucket names, object paths, or architecture trust rules change.
- Update [Current Errors and Warnings](./current-errors-and-warnings.md) only if expected local Netlify function caveats or the latest verified gate change.
- Update [Testing Plan](./testing-plan.md) when media path, viewer URL, inline SVG proxy, or accessibility smoke coverage changes.

Stop condition for a fresh context window:

- Stop after storage helper behavior, public media consumption, architecture SVG trust, Netlify function expectations, tests, and current-state docs all describe the same media contract.

## Workflow: Accessibility Walkthrough

When to use it:

- Public rendered structure, landmarks, headings, navigation, project cards, modal behavior, architecture viewer states, reduced-motion behavior, focus treatment, status text, or admin accessibility behavior changes.
- A task needs to review accessibility behavior without turning this portfolio into a broad certification project.

Read first:

- [Accessibility Walkthrough](./accessibility-walkthrough.md)
- [Testing Plan](./testing-plan.md)
- [Current Errors and Warnings](./current-errors-and-warnings.md)
- `src/App.jsx`
- `src/components/layout/Navbar.jsx`
- `src/components/sections/Projects.jsx`
- `src/components/projects/ProjectCard.jsx`
- `src/components/projects/modal/ProjectModal.jsx`
- `src/hooks/useModalSideEffects.js`
- `src/components/projects/viewer/ArchitectureViewer.jsx`
- `src/admin/AppAdmin.jsx`

Do:

- Review the current accessibility state before deciding whether behavior, tradeoffs, or verification gaps changed.
- Classify findings as `Fix now`, `Defer`, `Accepted tradeoff`, or `Unable to verify locally`.
- Keep accessibility semantics close to the component that renders the markup.
- Prefer native HTML structure and names before adding ARIA.
- Keep shared modal focus, Escape close, focus restore, body scroll lock, and root modal state in existing hooks when behavior is shared.
- Preserve route-backed project modal behavior while changing focus or dialog markup.
- Preserve the current reduced-motion decision: default users keep the portfolio's animated feel, while reduced-motion users get calmer non-essential motion.
- Add focused tests only for stable rendered routes, pure helpers, or browser states that can run without live Supabase, Redis, or deployed Netlify dependencies.
- Update `docs/accessibility-walkthrough.md` with current behavior, deferred checks, accepted tradeoffs, and unable-to-verify notes.

Do not:

- Claim full WCAG certification.
- Add broad browser test matrices for live Supabase, Redis, or deployed Netlify behavior.
- Use ARIA to hide invalid markup that can be fixed with native structure.
- Remove the site's visual personality for default users while implementing reduced-motion support.
- Break route-backed modal entry or focus restore while fixing dialog semantics.
- Treat the plain Vite `track-visit` or `inline-svg` function caveats as accessibility regressions unless user-facing fallback behavior changes.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
cmd /c npm run test:a11y
```

Docs update expectations:

- Update [Accessibility Walkthrough](./accessibility-walkthrough.md) whenever accessibility behavior, accepted tradeoffs, deferred checks, or local verification limits change.
- Update [Testing Plan](./testing-plan.md) when accessibility smoke coverage, modal focus coverage, or browser-route coverage changes.
- Update [Current Errors and Warnings](./current-errors-and-warnings.md) only when the latest verified gate or expected local warning state changes.
- Update local READMEs only when component ownership, boundary guidance, or setup expectations change.

Stop condition for a fresh context window:

- Stop after accessibility behavior and tradeoffs are current, fixes are scoped to the rendering owner, verification has passed or a current failure is documented, and the walkthrough reflects only current accessibility truth.

## Workflow: Data-Flow Docs After Schema Changes

When to use it:

- A persisted field, table, migration, public select, mapper default, admin validation rule, admin editor field, or schema drift check changes.
- Static component-local content is moving toward database/admin/public ownership.
- A current data-flow mismatch is being resolved or a new accepted caveat is being documented.

Read first:

- [Data Flow Drift](./data-flow-drift.md)
- [Testing Plan](./testing-plan.md)
- [Database README](../database/README.md)
- `database/schema.sql`
- `database/migrations/`
- `scripts/check-schema-drift.mjs`
- Relevant `src/api/public/*` reader.
- Relevant `src/domain/*` mapper, default, view-model, or routing helper.
- Relevant `server/admin/routes/*` route and `server/admin/routes/validation.js`.
- Relevant admin UI section under `src/admin`.

Do:

- Start with the intended persisted shape: table, column names, nullability/defaults, constraints, RLS expectation, storage impact, and whether public reads should expose the field.
- Add or update an ordered migration and `database/schema.sql` together.
- Update `scripts/check-schema-drift.mjs` when a table, required runtime column, or forbidden stale reference changes.
- Update public select lists in `src/api/public/*` only after the schema exists.
- Update pure domain mappers, defaults, view models, and route helpers before changing rendering components.
- Update admin route serialization, admin reads/writes, and `server/admin/routes/validation.js` before or alongside admin UI fields.
- Keep shared enums and constrained values centralized in domain constants when both browser and admin code need them.
- Add or update tests at the mapper, view-model, validation, storage, or function-helper layer where the contract changed.
- Update current-state docs after verification, especially `docs/data-flow-drift.md`, `database/README.md`, and `docs/testing-plan.md` when their active truth changes.

Do not:

- Add fields to public selects before the schema and snapshot include them.
- Update admin UI fields without server-side validation and serialization.
- Make browser components own persisted data shape that belongs in a mapper or view model.
- Put service-role writes, schema checks, or admin validators in `src`.
- Normalize tables prematurely when an existing constrained field or JSON display list fits the current portfolio use.
- Leave resolved drift in `docs/data-flow-drift.md` as completed history.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Run the focused accessibility smoke if the schema change also changes rendered public structure, routes, modal behavior, or accessibility guidance:

```sh
cmd /c npm run test:a11y
```

Docs update expectations:

- Update [Data Flow Drift](./data-flow-drift.md) so it names only active mismatches, accepted caveats, and next actions.
- Update [Database README](../database/README.md) when setup order, table shape, RLS expectation, storage convention, or field semantics change.
- Update [Testing Plan](./testing-plan.md) when coverage is added, removed, or intentionally deferred.
- Update local READMEs only when ownership boundaries or setup expectations move.

Stop condition for a fresh context window:

- Stop after schema, migrations, schema drift checks, public readers, domain shape, admin writes, validation, tests, and current-state docs agree on the changed contract, or after a mismatch is documented as active drift for the next window.

## Workflow: Current-State Docs Closeout

When to use it:

- A scoped task is ready to be called complete.
- Work changed source-of-truth docs, test coverage, active drift, warnings, accessibility state, or implementation details that future work needs.
- A fresh-context window needs to leave the repo in a state the next window can trust from current docs and code.

Read first:

- [Current Errors and Warnings](./current-errors-and-warnings.md)
- [Testing Plan](./testing-plan.md)
- [Data Flow Drift](./data-flow-drift.md)
- [Architecture Cleanup Candidates](./architecture-cleanup-candidates.md)
- [Accessibility Walkthrough](./accessibility-walkthrough.md)
- Any feature-specific docs or local READMEs touched by the work.

Do:

- Run the required verification commands before calling the work complete.
- Update only docs whose current project truth changed.
- Add short implementation notes that future work needs: final data shape, helper locations, accepted tradeoffs, remaining warnings, test coverage, and deferred tests.
- Update scoped docs after verification when the current project truth changed.
- Keep docs in their existing tone and current-state shape.
- Leave a fresh-context handoff when another window needs to continue immediately.

Do not:

- Call work complete before the relevant gate passes or a current failure is documented.
- Update unrelated docs just because they were mentioned in older planning notes.
- Turn docs into a completion diary of every edit.
- Preserve resolved warnings, resolved drift, or old implementation history in current-state docs.

Verification:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Run the focused accessibility smoke if public rendered structure, accessibility behavior, route rendering, modal focus behavior, or accessibility guidance changed:

```sh
cmd /c npm run test:a11y
```

Docs update expectations:

- Update [Current Errors and Warnings](./current-errors-and-warnings.md) when the latest verified gate, current failures, expected warnings, or command caveats change.
- Update [Testing Plan](./testing-plan.md) when current coverage or deferred test gaps change.
- Update [Data Flow Drift](./data-flow-drift.md) when active database/admin/public/UI drift changes.
- Update [Architecture Cleanup Candidates](./architecture-cleanup-candidates.md) when active cleanup candidates are completed, reframed, or newly accepted.
- Update [Accessibility Walkthrough](./accessibility-walkthrough.md) when accessibility behavior, accepted tradeoffs, deferred checks, or smoke guidance change.
- Update README files only when onboarding, setup, source-of-truth pointers, or boundary rules change.

Stop condition for a fresh context window:

- Stop after current-state docs, verification results, and future-facing implementation notes all agree on the completed scope.

## Fresh Context Handoff Template

Use this shape when leaving notes for the next context window:

```md
## Fresh Context Handoff

Current task:
- Short name for the requested work.

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

Implementation details future work needs:
- Final helper names, contracts, accepted caveats, or remaining decisions.

Next stop condition:
- The precise point where the next window should stop.
```

Keep handoffs short. They should help the next agent continue from current truth without relying on historical planning notes.
