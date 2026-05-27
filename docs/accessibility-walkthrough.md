# Accessibility Walkthrough

Date: 2026-05-26

## Purpose

This document is the source of truth for the current accessibility state of the public portfolio, project modal flow, architecture viewer, and local admin UI.

Keep this current-state oriented:

- Describe what accessibility behavior exists now.
- Keep known tradeoffs, deferred checks, and local verification limits visible.
- Update the baseline when accessibility tooling, smoke coverage, or expected warnings change.
- Remove fixed historical findings unless they still explain a current behavior or guardrail.

## Current Baseline

Last checked on 2026-05-26 with Windows `cmd /c` commands.

Passing:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
cmd /c npm run test:a11y
```

Accessibility-related tools currently installed:

- `eslint-plugin-jsx-a11y` `^6.10.2`
- `@playwright/test` `^1.60.0`
- `playwright` `^1.60.0`
- `@axe-core/playwright` `^4.11.3`

Current verification behavior:

- `eslint-plugin-jsx-a11y` is wired into the default lint gate through `eslint.config.js`.
- `cmd /c npm run test:a11y` starts a local Vite server, drives Chromium with Playwright, and runs axe against stable rendered routes.
- The accessibility smoke currently covers the public home page landmark/menu baseline and the architecture viewer invalid-source fallback.
- Plain Vite local runtime still has expected Netlify function caveats for visit count and architecture SVG proxy behavior.

## Accessibility Surface Map

Public app:

- `src/App.jsx`: public layout, AOS initialization, top bar, main section stack, skip link, main landmark, and back-to-top control.
- `src/components/layout/Navbar.jsx`: collapsible section navigation, menu button, collapsed-link tab behavior, and navigation labels.
- `src/components/layout/VisitCount.jsx`: async visit-count status text and expected local fallback behavior.
- `src/components/buttons/BackToTopButton.jsx`: floating public back-to-top control and reduced-motion scroll behavior.
- `src/components/sections/*`: public content sections, section landmarks, heading order, and fallback content.

Project flow:

- `src/components/sections/Projects.jsx`: project grouping, hover preview coordination, route-backed modal state, and one `ProjectModal` owner.
- `src/components/sections/projects/FeaturedProjectsGroup.jsx`: featured project card group and section labeling.
- `src/components/sections/projects/StandardProjectsGroup.jsx`: standard project card group, section labeling, reduced-motion/mobile grid fallback, and desktop marquee selection.
- `src/components/sections/projects/ProjectMarquee.jsx`: desktop standard-card marquee rendering, duplicate-copy hiding, primary-item focus alignment wiring, and region labeling.
- `src/hooks/useProjectMarqueeMotion.js`: browser-guarded marquee measurement, hover/focus pause, modal pause, focus alignment, and transform updates.
- `src/components/projects/ProjectCard.jsx`: project-specific case-study link names, anchor activation, and hover/focus video preview intent.
- `src/components/projects/modal/ProjectModal.jsx`: dialog shell, accessible dialog name, backdrop close, modal content, and focus containment.
- `src/components/projects/modal/Header.jsx`: modal title, action links, and close button.
- `src/hooks/useModalSideEffects.js`: modal focus restore, initial focus, Escape close, body scroll lock, and root modal state.
- `src/hooks/useProjectViewportPreview.js`: touch viewport preview bridge that avoids keyboard, modal, and reduced-motion conflicts.
- `src/hooks/useViewportActivationGroup.js`: browser-guarded active-card selection for touch-capable card groups.

Architecture viewer:

- `src/components/projects/modal/ArchitecturePreview.jsx`: modal diagram preview, project-aware viewer links, and local SVG proxy fallback state.
- `src/components/projects/viewer/ArchitectureViewer.jsx`: standalone viewer controls, keyboard shortcuts, loading/error/empty states, live-region status, and zoom controls.
- `src/components/projects/viewer/viewerUrl.js`: trusted viewer URL parsing/building and invalid-source fallback inputs.

Admin:

- `src/admin/AppAdmin.jsx`: development-only admin landmarks, navigation, save status, save error announcements, and busy state.
- `src/admin/sections/*`: section editors, named regions, and add/remove/reorder controls where present.
- `src/admin/projects/*`: project selector, selected-state controls, draft preview/validation actions, and project editing labels.
- `src/admin/forms/*`: shared form labels and inputs.
- `src/admin/lists/*`: repeated list editing controls and item-specific accessible names.
- `src/admin/navigation/*`: admin back-to-top/back-to-bottom controls and hidden-control tab behavior.

## Current Implemented Behavior

Public structure:

- The public page has a skip link, one `main` landmark, a semantic top header, one real `h1`, and labeled section landmarks.
- Public navigation uses valid link-based markup, a labeled navigation landmark, an expanded/collapsed menu button, and collapsed links that leave the tab order.
- Hidden back-to-top controls leave the tab order until visible.
- Decorative icons are hidden from assistive technology where the surrounding control or link already provides the name.
- Public icon and image names favor action-oriented or content-specific text rather than implementation-style file names.

Project modal and cards:

- Project cards expose project-specific case-study names.
- Modal rendering has one owner in `Projects.jsx`, so card-open and route-backed modal states share the same dialog behavior.
- Standard project cards render as the existing grid for mobile and reduced-motion users. Non-mobile users without reduced-motion preference receive the desktop marquee with the same full `ProjectCard` markup and modal handoff.
- Desktop marquee duplicate copies are visual-only for assistive technology: copied lists and items are `aria-hidden`, duplicate card anchors receive `tabIndex="-1"`, and duplicate cards skip viewport-preview ref registration. Visible duplicate cards are not `inert`, so pointer hover and click behavior matches primary cards.
- Touch-capable project groups can request one scroll-driven preview through the same `activePreviewId` owner used by hover/focus previews.
- Viewport-driven project previews are disabled while the modal is open, while reduced motion is active, or while keyboard navigation is the latest input.
- The modal has an `h2`-backed dialog name, focus containment, Escape close, and invoking-element focus restore when possible.
- Initial modal focus prefers useful project actions when available.
- Route-backed project modal behavior is preserved while focus and dialog semantics are handled through shared side effects.

Architecture viewer and async status:

- Architecture preview links use project-aware names.
- Duplicate preview media is hidden from screen readers.
- Architecture preview fallback text is exposed as a named note.
- The standalone architecture viewer labels the main viewer area, diagram canvas, zoom-control group, Back link, and zoom buttons.
- Keyboard shortcut guidance for Escape, plus, minus, and 0 is available to assistive technology without adding visible instructional UI.
- Viewer loading, empty, error, and zoom-percent changes use scoped live-region behavior.
- Visit count hides the decorative views icon and announces count/unavailable changes through one polite status region.

Motion, contrast, and focus:

- AOS follows `prefers-reduced-motion: reduce`, disabling section animation for reduced-motion users and refreshing when the preference changes.
- Reduced-motion users receive the standard project grid instead of a paused marquee.
- The desktop project marquee pauses on hover, pauses while keyboard focus is inside the marquee, centers the focused primary card inside the clipped viewport, and pauses when the project modal is open.
- Project-card hover/focus video previews do not request or play video while reduced motion is active.
- Scroll-driven touch activation is disabled for project previews and credential card effects while reduced motion is active.
- Education and certification cards keep hover/focus effects for pointer and keyboard users; touch viewport activation does not move focus or trigger navigation.
- Reduced-motion CSS calms AOS elements, animated gradient text, tag marquee motion, hover-gradient transforms, avatar float/tilt motion, and avatar hover transforms.
- The public back-to-top button uses instant scrolling when reduced motion is active.
- Credential/card meta contrast uses the current `--color-text-subtle` value of `#8BA1B6`.
- Visible focus is strengthened on the public menu button, project cards, credential cards, back-to-top control, and shared admin form/button/link recipes.

Admin accessibility:

- The admin header nav has an explicit label.
- Each admin section is exposed as a named region through its visible heading.
- Admin save failures are announced as alerts, and the save button exposes busy state while saving.
- Admin draft validation feedback uses status or alert roles, and the global save status names saved, unsaved, saving, and draft-validation states.
- Project selector buttons expose selected state with `aria-pressed` and project-specific names.
- The admin project preview opens the shared project modal from the active unsaved draft and inherits the existing dialog focus containment, Escape close, and focus-restore behavior.
- The admin project draft import and current-context panels use labeled textareas, alert/status feedback, and disabled states while Save is in flight so pasted draft changes do not race the save response.
- Repeated list textareas have item-specific accessible names, and remove buttons describe the item they affect.
- Project, challenge, skill, and social add/remove/reorder controls use specific accessible names where those controls already exist.
- Admin preview images use preview-specific alt text.
- Decorative scroll-button icons are hidden from assistive technology.
- Hidden admin back-to-top/back-to-bottom controls are removed from the tab order until visible.

## Accepted Tradeoffs

- Default users keep the portfolio's animated feel; reduced-motion users get calmer behavior for non-essential motion.
- Touch-capable devices get one scroll-active card per project, education, or certification group. Hybrid devices can still use intentional hover and keyboard focus independently of the scroll-active state.
- Personal-use admin reorder remains mouse-drag based; the current accessibility state focuses on names, labels, landmarks, status text, and tab behavior rather than adding alternate reorder controls.
- Plain Vite can show expected Netlify function fallback behavior for visit count and architecture SVG previews. Use `netlify dev` when testing deployed-function behavior locally.
- Public data fetch failures can leave the page on static fallbacks or empty project states in constrained local environments. Live Supabase-backed content checks remain outside the default local gate unless explicitly mocked.
- Desktop standard-card marquee keyboard traversal is structurally protected by duplicate anchors using `tabIndex="-1"` while duplicate wrappers stay `aria-hidden`. A full live traversal check depends on public project rows being available in the local runtime; mocked Playwright verification covered duplicate pointer parity and primary focus centering.
- Live Redis, live Supabase, and deployed Netlify behavior are not part of the default accessibility gate.

## Deferred Checks

- Add browser modal focus smoke coverage when stable project-card/modal data can be supplied through public Supabase or a mocked browser fixture.
- Cover `track-visit` through mocked function tests or Netlify Dev checks rather than a live Redis browser gate.
- Run a native screen reader session as a future validation pass.
- Consider browser accessibility tree snapshots if the installed Playwright API and local setup make them reliable.
- Add browser reduced-motion or focus-ring smoke coverage only if it catches a stable regression that lint, unit tests, and the current axe smoke cannot catch.
- Add touch/hybrid browser smoke coverage for viewport card activation only if a stable emulated-pointer test catches regressions beyond the pure scoring tests.

## Unable To Verify Locally

- Native screen reader behavior has not been verified in the current local baseline.
- Live Supabase-backed project cards and route-backed project modal entry are not guaranteed by the default local accessibility smoke.
- Live Supabase-backed standard-card marquee keyboard traversal is not guaranteed by the default local accessibility smoke; mocked local browser verification covered the marquee interaction contract when live public data was blocked.
- Deployed Netlify function behavior for `track-visit` and `inline-svg` is not verified by plain Vite.

## Maintenance Rules

- Update this file when accessibility behavior, test coverage, accepted tradeoffs, or deferred checks change.
- Keep findings grouped by current state, not by the work session that produced them.
- Remove dated repro notes once the issue is fixed unless the repro still describes an active limitation.
- Keep accessibility semantics close to the component that renders the markup.
- Prefer native HTML structure and names before adding ARIA.
- Preserve route-backed modal behavior when changing dialog or focus handling.
- Keep reduced-motion support without removing the default visual personality of the portfolio.
