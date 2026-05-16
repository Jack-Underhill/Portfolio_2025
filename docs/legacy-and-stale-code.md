# Legacy and Stale Code

Date: 2026-05-16

## Purpose

This document records code and data paths that appear stale, legacy, unused, or out of sync with the current product direction. Stale does not automatically mean delete immediately. It means review before building on it.

## Planning Directory

Status: historical logs, not source of truth.

`planning/` contains useful implementation memory, old PRDs, context dumps, and audits. It should not be used as current repo truth without checking source.

Decision:

- Keep planning files as historical references.
- Do not translate planning docs directly into tracked truth docs.
- Use the latest implementation state and current source as the deciding authority.

Next actions:

- Add or update a `planning/README.md` later to explain how to read historical plans.

## Skills Languages and Experience Flow

Status: stale legacy data flow.

Current stale pieces:

- `src/domain/contact/mappers.js` returns `languages` and `experience`.
- `src/api/public/contact.js` still describes public contact data as languages, experience, and social links.
- Admin contact state still uses `proficientTechs` and `experiencingTechs`.

Why stale:

- The public Skills section no longer displays this old shape.
- The desired future is grouped skills mapped back into the data flow.

Next actions:

- Review and replace this flow when the new skills data model is designed.

## Project Click Functions

Status: stale or unintegrated.

Files:

- `netlify/functions/project-click-track.js`
- `netlify/functions/project-click-count.js`

Current source search:

- These functions are not referenced by active `src` code.

Known issues:

- `project-click-count.js` decodes the `project` query param before validating that it exists.
- `project-click-count.js` returns an error message that says `repo` instead of `project`.

Decision:

- Mark as stale because it is not wired or referenced.
- Review before either wiring or removing.

Next actions:

- If project click tracking is still desired, wire it intentionally and test it.
- If not, remove both functions and any related planning notes.

## Static Education and Certifications

Status: current static implementation, future data-flow candidate.

Files:

- `src/components/sections/Education.jsx`
- `src/components/sections/Certifications.jsx`

Decision:

- Do not call this current drift.
- Do document that these sections should eventually move into the admin/database/public data flow.

Next actions:

- Leave static until a proper data model is designed.

## Old Architecture Priority Language

Status: stale historical priority language.

Planning docs still reference earlier priorities, including issues that have since been fixed by the secure backend and domain refactors.

Decision:

- Do not use old planning priority language as current direction.
- Current active priorities are docs, lint, tests, route/runtime constants, storage conventions, and stale function review.

Next actions:

- Future `planning/README.md` should explain which planning docs are historical and which are closest to current.

