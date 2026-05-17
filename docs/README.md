# Project Truth Docs

This directory is the tracked source of truth for where the portfolio stands now and what should happen next.

The `planning/` directory is historical working memory. It contains implementation plans, context dumps, and audits that were useful while the repo was being refactored, but those files are not authoritative by themselves. Use them as logs when reconstructing why a change happened. Use this directory when deciding what the current repo state is.

## Current Docs

- [Data Flow Drift](./data-flow-drift.md): current database/admin/public drift, especially contact, skills, education, and certifications.
- [Current Errors and Warnings](./current-errors-and-warnings.md): current command failures, lint errors, local runtime warnings, and known quality gates.
- [Testing Plan](./testing-plan.md): high-level testing plan grouped by feature area.
- [Routes, Runtime, and Data Collisions](./routes-runtime-and-data-collisions.md): route constants, function paths, storage paths, singleton IDs, and data collision risks.
- [Legacy and Stale Code](./legacy-and-stale-code.md): code that appears unused, historical, or out of sync with the active product direction.
- [Architecture Cleanup Candidates](./architecture-cleanup-candidates.md): cleanup work that would reduce drift without changing the product direction.

## Documentation Rules

- Keep current truth and next actions together.
- Keep historical references explicit: cite `planning/` only as background, not as the final answer.
- Prefer repo-specific details over generic architecture advice.
- Update docs when a drift item is fixed, removed, or intentionally accepted.
- Future subdirectory READMEs should be concise. These docs may stay more audit-like and detailed.

