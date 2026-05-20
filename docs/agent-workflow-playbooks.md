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

## Workflow Sections

Later P3.10 implementation windows fill in these shared workflows:

- Trust boundaries and service-role guardrails.
- Quality gates.
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
