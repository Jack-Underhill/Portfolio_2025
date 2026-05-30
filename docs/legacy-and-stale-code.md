# Legacy and Stale Code

Date: 2026-05-30

## Purpose

This document records code and data paths that appear stale, legacy, unused, or out of sync with the current product direction. Stale does not automatically mean delete immediately. It means review before building on it.

## Maintenance Rules

- Keep only stale paths that can mislead future work or still need review.
- Remove resolved stale-code notes when they no longer affect current decisions.
- Keep historical context short and tied to an active guardrail.

## Project Video Debug Logger

`src/logging/projectVideoDebug.js` and `src/logging/projectVideoDebugVitePlugin.js` remain intentionally available for local real-iOS troubleshooting after the project-card preview playback fix.

Current guardrails:

- Client diagnostics require `import.meta.env.DEV` and `?projectVideoDebug=1`.
- The Vite middleware is `serve`-only and prints diagnostics in the local terminal.
- Normal visitors do not see debug UI or send diagnostic events.

Review before extending or shipping additional media work. Remove the logger when the device-specific troubleshooting value no longer justifies the small maintenance surface.

Static Education and Certifications are tracked in `data-flow-drift.md` as a future data-flow candidate, not as stale code.
