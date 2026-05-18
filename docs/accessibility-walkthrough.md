# Accessibility Walkthrough

Date: 2026-05-18

## Purpose

This document records the practical accessibility walkthrough for the public portfolio, project modal flow, architecture viewer, and local admin UI.

Keep this current-state oriented:

- `Fix now`: issues found during walkthrough that should be addressed in P3.9.
- `Defer`: useful accessibility work that is outside the current focused pass.
- `Accepted tradeoff`: known behavior that is acceptable for this portfolio phase.
- `Unable to verify locally`: checks that need a different local setup, browser tool, or assistive technology session.

## Baseline

Last checked on 2026-05-18 with Windows `cmd /c` commands.

Passing:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Accessibility-related tools currently installed:

- `eslint-plugin-jsx-a11y` `^6.10.2`
- `@playwright/test` `^1.60.0`
- `playwright` `^1.60.0`
- `@axe-core/playwright` `^4.11.3`

Current state:

- The tools are installed but not yet wired into the default lint/test gate.
- Browser smoke coverage for modal focus, architecture viewer fallback states, and `track-visit` remains a documented future gap.
- Plain Vite local runtime still has expected Netlify function caveats for visit count and architecture SVG proxy behavior.

## Accessibility Surface Map

Public app:

- `src/App.jsx`: public layout, AOS initialization, top bar, main section stack, back-to-top control.
- `src/components/layout/Navbar.jsx`: collapsible section navigation and menu button.
- `src/components/layout/VisitCount.jsx`: async visit-count status text.
- `src/components/buttons/BackToTopButton.jsx`: floating public back-to-top control.
- `src/components/sections/*`: public content sections and section heading order.

Project flow:

- `src/components/sections/Projects.jsx`: project grouping, hover preview coordination, route-backed modal state.
- `src/components/sections/projects/FeaturedProjectsGroup.jsx`: featured project cards and modal owner.
- `src/components/sections/projects/StandardProjectsGroup.jsx`: standard project cards and modal owner.
- `src/components/projects/ProjectCard.jsx`: card link activation, Enter behavior through anchor semantics, hover/focus video preview intent.
- `src/components/projects/modal/ProjectModal.jsx`: dialog shell, backdrop close, modal content.
- `src/components/projects/modal/Header.jsx`: modal title, action links, and close button.
- `src/hooks/useModalSideEffects.js`: modal focus restore, initial close-button focus, Escape close, body scroll lock, root modal flag.

Architecture viewer:

- `src/components/projects/modal/ArchitecturePreview.jsx`: modal diagram preview and viewer link.
- `src/components/projects/viewer/ArchitectureViewer.jsx`: standalone viewer controls, keyboard shortcuts, loading/error/empty states.
- `src/components/projects/viewer/viewerUrl.js`: trusted viewer URL parsing/building.

Admin:

- `src/admin/AppAdmin.jsx`: development-only admin landmarks, navigation, save status.
- `src/admin/sections/*`: section editors and add/remove controls.
- `src/admin/projects/*`: project selector and project editing controls.
- `src/admin/forms/*`: form labels and inputs.
- `src/admin/lists/*`: repeated list editing controls.
- `src/admin/navigation/*`: admin back-to-top/back-to-bottom controls.

## Early Findings To Verify In Walkthrough

Fix now candidates:

- Public navigation currently uses buttons wrapping links; Substep 2 should replace this with valid link-based navigation and useful nav/menu semantics.
- Collapsed public navigation is visually hidden with `pointer-events-none`; Substep 2 should verify hidden links are not reachable by keyboard.
- Project modal uses `role="dialog"` and `aria-modal="true"` but does not yet expose an explicit label relationship to the project title.
- Modal focus currently moves to the close button and restores the previously active element; Substep 3 should verify route-backed entry, card entry, Escape close, close-button close, and backdrop close.
- Several decorative/icon images have implementation-style alt text such as `View menu svg`, `View close svg`, or arrow descriptions; upcoming passes should hide decorative icons or provide action-oriented names.
- Async status and fallback text should be reviewed for useful, non-noisy announcements.

Defer candidates:

- Sparse Playwright/axe browser smoke coverage is best decided after markup/focus fixes land.
- Live Netlify, Supabase, and Redis behavior remain outside the default gate unless explicitly mocked.

Accepted tradeoff candidates:

- Local plain Vite can show expected Netlify function fallback warnings for visit count and architecture preview.
- The admin UI is development-only, so fixes should improve labels and keyboard ergonomics without a broad design-system rewrite.

Unable to verify locally yet:

- Full keyboard-only public walkthrough has not been run in this step.
- Browser accessibility tree inspection and screen reader checks have not been run in this step.
