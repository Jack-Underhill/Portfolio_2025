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

## Skills Legacy Level Flow

Status: resolved in active code, historical in migrations.

Current state:

- Active Skills use grouped rows through `src/api/public/skills.js`, `src/domain/skills/*`, `src/components/sections/Skills.jsx`, `server/admin/routes/skills.js`, and `src/admin/sections/SkillsSection.jsx`.
- Contact is links-only in active public and admin code.
- `database/migrations/0001_current_portfolio_schema.sql` and `0003_grouped_skills.sql` still mention legacy level values only to preserve setup history and live-data backfill behavior.

Next actions:

- Do not rebuild new Skills work on the old Contact mapper shape.
- Keep the migration backfill note visible until live Supabase data has been migrated and curated.

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
