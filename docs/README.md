# Project Truth Docs

This directory is the tracked source of truth for where the portfolio stands now and what should happen next.

Use this directory when deciding what the current repo state is.

## Current Docs

- [Data Flow Drift](./data-flow-drift.md): active database/admin/public/UI drift, including Projects presentation, Contact icon fallback behavior, and static Education/Certifications.
- [Current Errors and Warnings](./current-errors-and-warnings.md): current command failures, lint errors, local runtime warnings, and known quality gates.
- [Testing Plan](./testing-plan.md): high-level testing plan grouped by feature area.
- [Routes, Runtime, and Data Collisions](./routes-runtime-and-data-collisions.md): route constants, function paths, storage paths, singleton IDs, and data collision risks.
- [Legacy and Stale Code](./legacy-and-stale-code.md): code that appears unused, historical, or out of sync with the active product direction.
- [Architecture Cleanup Candidates](./architecture-cleanup-candidates.md): cleanup work that would reduce drift without changing the product direction.

## Documentation Rules

- `docs/` should describe current repo state, accepted caveats, and active next actions, not preserve PRD history.
- Keep current truth and next actions together.
- Prefer repo-specific details over generic architecture advice.
- Remove resolved issues unless they remain an active caveat or current guardrail.
- Update docs when a drift item is fixed, removed, or intentionally accepted.
- Subdirectory READMEs should stay concise. These docs may stay more detailed when they describe active decisions.
