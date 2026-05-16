# Testing Plan

Date: 2026-05-16

## Purpose

This document records the testing plan by feature area. It is intentionally high level for now. Exact test file names can be chosen when implementation starts.

## Current State

No test files are currently present.

Current checks:

- `cmd /c npm run build` passes.
- `cmd /c npm run check:schema` passes.
- `cmd /c npm run lint` passes.

Immediate testing gap:

- Add the first high-value tests before treating tests as part of the default quality gate.

## Projects

Highest-value coverage:

- Project route parsing and building for `/p/:project`.
- Public project card mapper.
- Public project detail mapper.
- Project detail fallback merging.
- Permalink behavior for old and new projects.
- Admin project validation and serialization.
- Project media upload path behavior after the storage convention decision is made.

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

Why this matters:

- The Hero fallback bug was a small casing mismatch.
- A tiny contract test would catch the same class of issue quickly.

## Contact and Links

Highest-value coverage:

- Link row mapping.
- Empty link filtering.
- Social link fallback behavior.
- Uploaded icon URL handling.

Why this matters:

- Contact links are public-facing and admin-managed.
- The current icon fallback is index-based and should be preserved or intentionally replaced.

## Skills

Current status:

- The old database/admin skills flow is legacy.
- Public `Skills.jsx` is static and grouped by the newer display direction.
- `languages` and `experience` are stale mapper outputs.

Testing should wait until the new skills data shape is chosen.

Future coverage:

- Grouped skills row mapping.
- Sort order.
- Fallback static groups.
- Admin grouped skills validation.
- Public Skills rendering from mapped data.

## Education and Certifications

Current status:

- Static component-local data.
- Not current drift.
- Future candidate for database/admin/public data flow.

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

Why this matters:

- This feature handles externally hosted SVGs.
- Security constraints are part of the intended behavior, not just implementation detail.

## Netlify Functions

Highest-value coverage:

- `track-visit` counted and skipped IP behavior.
- Redis failure behavior.
- `inline-svg` URL validation and content type response.
- Stale project click functions if they are kept for review.

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
- Sparse browser smoke tests.

Avoid for now:

- Full live Supabase tests as the default gate.
- Large React component suites before data contracts are covered.
- Generic test abstraction before the first real tests exist.
