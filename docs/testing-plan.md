# Testing Plan

Date: 2026-05-24

## Purpose

This document records the testing plan by feature area. It stays high level, with the current baseline tests named so future work can build on them without guessing.

## Maintenance Rules

- Keep current coverage, remaining gaps, and active test strategy.
- Move completed gaps into current coverage once tests land.
- Avoid preserving completed issue history unless it explains a current test boundary.

## Current State

Vitest is installed as the default unit-test runner. A focused Playwright/axe smoke runner is available through `cmd /c npm run test:a11y` for stable rendered accessibility checks.

Current baseline test files:

- `tests/runtime/paths.test.js`
- `tests/domain/projects/routing.test.js`
- `tests/domain/projects/mappers.test.js`
- `tests/domain/projects/preview.test.js`
- `tests/domain/projects/agentDraft.test.js`
- `tests/domain/projects/viewModel.test.js`
- `tests/domain/about/mappers.test.js`
- `tests/domain/contact/mappers.test.js`
- `tests/domain/skills/mappers.test.js`
- `tests/hooks/viewportActivationScoring.test.js`
- `tests/components/projects/viewer/viewerUrl.test.js`
- `tests/netlify/functions/inline-svg.test.js`
- `tests/server/admin/utils/storage.test.js`
- `tests/server/admin/routes/validation.helpers.test.js`
- `tests/server/admin/routes/validation.uploads.test.js`
- `tests/server/admin/routes/validation.about.test.js`
- `tests/server/admin/routes/validation.projects.test.js`
- `tests/server/admin/routes/projects.validate-route.test.js`
- `tests/server/admin/routes/validation.contact.test.js`
- `tests/server/admin/routes/validation.skills.test.js`

Current checks:

- `cmd /c npm run test` passes.
- `cmd /c npm run build` passes.
- `cmd /c npm run check:schema` passes.
- `cmd /c npm run lint` passes.
- `cmd /c npm run test:a11y` passes.

Remaining testing gap:

- Add browser/component smoke coverage later for modal focus and remaining Netlify function behavior such as `track-visit`.
- Add browser smoke only if viewport card activation needs coverage beyond the pure scoring helpers.
- Keep live Supabase, Redis, and deployed Netlify behavior out of the default gate unless explicitly mocked.

## Projects

Highest-value coverage:

- Project route parsing and building for `/p/:project`.
- Public project card mapper.
- Public project detail mapper.
- Project detail fallback merging.
- Permalink behavior for old and new projects.
- Admin project validation and serialization.
- Project media upload path behavior after the storage convention decision is made.

Current coverage:

- Route parsing/building, public project mappers, detail view models, fallback merging, and sort-order normalization are covered.
- Draft-to-public-modal preview mapping is covered for complete drafts, optional fields, classification normalization, malformed list fallbacks, and challenge preservation.
- Agent draft import and current-context export helpers are covered for pasted and fenced JSON parsing, malformed payload errors, unknown-key warnings, protected identity/media preservation, challenge shape handling, classification normalization, partial tech stack merging, unsupported-only payloads, and safe current project review context serialization.
- Project classification mapper defaults, rank/type/label normalization, and featured/standard grouping sort behavior are covered.
- Admin project validation is covered through pure validation helper tests, and the no-write draft validation route is covered for success and shared validation errors.
- Project media upload path conventions are covered by focused storage utility tests.

Why this matters:

- Projects are the primary portfolio content.
- Project routes and modal data are easy to break during refactors.
- Admin writes and public reads must agree on field names and structured list shapes.

## About and Hero

Highest-value coverage:

- About row mapping from database shape to public shape.
- `resume_pdf` -> `resumeUrl`.
- Hero fallback merge behavior when public data is missing or partial.
- Profile image fallback behavior.

Current coverage:

- About row mapping, `resume_pdf` to `resumeUrl`, profile image mapping, and Hero fallback merge behavior are covered.
- Hero fallback merge behavior now lives in `src/domain/about/viewModel.js`.

Why this matters:

- Mapper and view-model tests catch field-name contract drift quickly.

## Contact and Links

Highest-value coverage:

- Link row mapping.
- Empty link filtering.
- Social link fallback behavior.
- Uploaded icon URL handling.

Current coverage:

- Link row mapping, empty URL filtering, uploaded icon URL passthrough, and links-only null behavior are covered.

Why this matters:

- Contact links are public-facing and admin-managed.
- The current icon fallback is index-based and should be preserved or intentionally replaced.

## Skills

Current status:

- Skills are covered as their own grouped database/admin/public flow.
- Public `Skills.jsx` consumes mapped grouped rows and falls back to static grouped defaults.

Current coverage:

- Grouped skills row mapping.
- Sort order.
- Fallback static groups.
- Admin grouped skills validation.

Future coverage:

- Thin component smoke coverage for `Skills.jsx` fallback/render states if public data fetching behavior changes.

## Education and Certifications

Current status:

- Static component-local data.
- Touch-capable scroll activation is section-local and uses the shared viewport activation hook.
- Future candidate for database/admin/public data flow.

Current coverage:

- Shared viewport activation scoring helpers are covered for diagonal selection, visible-ratio filtering, hysteresis, activation-band rejection, single-column center behavior, and multi-column left/right selection.

Future coverage after migration:

- Education row mapping.
- Certification row mapping.
- Admin validation for dates, links, credential type, logo/icon handling, and sort order.
- Public rendering from mapped data with static fallbacks.

## Architecture Viewer

Highest-value coverage:

- Trusted Supabase SVG URL validation.
- Rejection of untrusted URLs and open redirects.
- Inline SVG proxy URL generation.
- Safe `returnTo` behavior.
- Invalid viewer URL fallback state.

Current coverage:

- Trusted Supabase architecture SVG validation, unsafe viewer source rejection, inline SVG proxy URL generation, safe `returnTo`, and viewer URL encoding are covered.
- Tests lock the current trusted path rule to project-scoped `portfolio-assets/projects/{id}/architecture.svg` SVGs.
- `cmd /c npm run test:a11y` covers the invalid-source viewer fallback, disabled zoom controls, safe Back link, and an axe scan of the fallback route.

Why this matters:

- This feature handles externally hosted SVGs.
- Security constraints are part of the intended behavior, not just implementation detail.

## Netlify Functions

Highest-value coverage:

- `track-visit` counted and skipped IP behavior.
- Redis failure behavior.
- `inline-svg` URL validation and content type response.

Current coverage:

- `inline-svg` URL validation and SVG response headers are covered with mocked fetch behavior.
- `track-visit` remains covered only by local/manual Netlify Dev checks.

Decision:

- Do not make live Redis or live Supabase tests part of the default gate.
- Prefer pure helper tests and mocked function tests.

## Admin Backend

Highest-value coverage:

- Route validation.
- URL validation.
- Max list sizes.
- Duplicate and missing project ID handling.
- Upload filename/path helpers.
- JSON and multipart payload parsing.

Current coverage:

- Pure helper primitives, upload file validation, and about/project/contact/skills state validation are covered.
- The project draft validation endpoint is covered as a no-write route that reuses project state validation.

Why this matters:

- The admin backend owns privileged writes.
- It is local-only, but it still guards the real portfolio data.

## Suggested Layers

Start with:

- Pure domain and routing tests.
- Admin validation tests.
- Viewer URL tests.

Then add:

- Public data-flow contract tests.
- Thin component smoke tests.
- Sparse browser smoke tests for stable rendered routes.

Avoid for now:

- Full live Supabase tests as the default gate.
- Large React component suites before data contracts are covered.
- Generic test abstraction before the first real tests exist.
