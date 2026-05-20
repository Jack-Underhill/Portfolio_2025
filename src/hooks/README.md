# Hooks

`src/hooks` contains reusable React hooks for browser lifecycle behavior and shared UI state.

Use this directory when behavior needs React state/effects and is reused across components or is complex enough to deserve a named boundary.

## Scope

- Encapsulate browser event listeners, observers, timers, focus handling, and scroll behavior.
- Coordinate modal side effects and route-backed project modal state.
- Load public resources into component state while preserving local fallbacks.
- Keep reusable UI behavior out of presentational components.

Keep this directory free of raw database queries, row mapping, validation, privileged admin logic, and feature markup.

## Files

- `useAutoTextarea.js`: resizes textarea height from its content and container changes.
- `useHoverPreviewIntent.js`: manages delayed project-card video previews and releases video resources.
- `useModalOpenFlag.js`: observes the root `data-modal-open` attribute for components that need modal-aware behavior.
- `useModalSideEffects.js`: handles modal focus containment, Escape close, body scroll lock, focus restore, and the root modal-open flag.
- `usePrefersReducedMotion.js`: reads and subscribes to `prefers-reduced-motion: reduce` for runtime motion decisions.
- `useProjectModalRouting.js`: syncs project modal open/close state with `/p/:project` routes and public project detail loading.
- `usePublicResource.js`: runs public async loaders with initial data, optional transform/merge behavior, loading state, and error capture.
- `useScrollVisibility.js`: shows or hides scroll controls based on distance from the top or bottom of the page.

## Boundary Notes

- Put pure data shaping in `src/domain`, not in hooks.
- Put public fetch logic in `src/api/public`, then call it from hooks or components.
- Hooks may touch `window` and `document`, but should guard those accesses for non-browser execution.
- Prefer component-local state when behavior is used once and remains easy to read inline.
- Keep detailed lifecycle cleanup notes in `docs/`. This README is only the local map for maintainers reading `src/hooks`.
