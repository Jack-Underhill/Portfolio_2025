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

## Public Walkthrough - 2026-05-18

Method:

- Started the public app through Vite in a Playwright-driven local browser session.
- Checked the rendered heading list, landmark list, keyboard tab order with the navigation closed and opened, and an axe scan with `@axe-core/playwright`.
- Inspected source for public section structure and accessible names where runtime data was unavailable.

Fix now:

- Navigation exposes closed menu links in the tab order and duplicates every item as both a `button` and nested `a`.
  Repro: load `/`, press `Tab` from the top of the page before opening the menu. Focus moves from the menu button into hidden Projects, Education, Certifications, Skills, and Contact controls, with separate tab stops for each button and nested link. Axe reports `nested-interactive`.
- The menu button has no accessible text or `aria-expanded` state.
  Repro: focus the first top-bar button. The accessible name is empty because the only child image says `View menu svg`, and the button does not announce whether the menu is expanded.
- The page has no `main` landmark and no level-one heading.
  Repro: rendered heading scan starts at `h2` (`Featured Work`), and axe reports `landmark-one-main`, `region`, and `page-has-heading-one`.
- Several public sections are not exposed as landmarks or labeled regions.
  Repro: the rendered landmark scan only finds the Certifications `section`; Hero, About, Projects, Education, Skills, and Contact content is mostly in plain `div` wrappers.
- The hidden back-to-top wrapper sets `aria-hidden="true"` while still containing a focusable button.
  Repro: axe reports `aria-hidden-focus` for the fixed back-to-top container before it is visually available.
- Credential/card meta text is slightly below contrast threshold.
  Repro: axe reports `color-contrast` for `text-text-subtle` credential highlight/footer text at roughly 4.12-4.29 contrast against the card background.
- Public icon alt text is noisy in several places.
  Repro: source inspection shows labels like `View svg`, `View menu svg`, `Up Arrow Button to go back to top`, and `external link icon`; these should become action-oriented names on controls or empty alt text for decorative icons.
- Hero and About headings are visually prominent but not semantic headings.
  Repro: source uses `SectionTitle as="div"` through `TextBlock`, so `Jack Underhill`, `Full-Stack Developer`, and `About Me` do not appear in the rendered heading list.

Defer:

- Add sparse Playwright/axe smoke tests after Substeps 2-6 land so tests protect the final markup instead of current known-broken structure.
- Full project-card and modal keyboard walkthrough with live project data should happen after navigation/landmark fixes; plain Vite in this sandbox could not fetch public Supabase-backed project data.
- Browser accessibility tree snapshots remain a useful future check, but the installed Playwright API in this local script did not expose `page.accessibility.snapshot`.

Accepted tradeoff:

- Plain Vite continues to show expected visit-count Netlify function warnings and unavailable status text. This remains acceptable for local walkthroughs; `netlify dev` is still the correct runtime for testing functions.
- Public data fetch failures in the sandbox left the page on static fallbacks or empty project states. The walkthrough still captured structural issues, but live content checks remain outside this substep.
- The avatar LinkedIn image and contact icons are informative links; their current visible behavior is acceptable for this pass, though alt/name polish can be folded into the public semantics pass.

Unable to verify locally:

- A native screen reader session was not run in this window.
- Live Supabase-backed project cards, route-backed project modal entry, and modal focus return were not verified through the browser because public data fetches failed under the plain Vite sandbox.
- Browser accessibility tree inspection was attempted through Playwright, but `page.accessibility.snapshot` was unavailable in the installed API surface.

## Architecture Viewer and Status Text - 2026-05-18

Fixes completed:

- Architecture preview links now have project-aware names, and duplicated preview images/objects are hidden from screen readers.
- Architecture preview fallback text is exposed as a named note instead of relying on visual text alone.
- The standalone architecture viewer now labels the main viewer area, diagram canvas, zoom-control group, Back link, and zoom buttons more clearly.
- Keyboard shortcut guidance for Escape, plus, minus, and 0 is available to assistive technology without adding visible instructional UI.
- Viewer loading, empty, error, and zoom-percent changes use scoped live-region behavior.
- Visit count status now hides the decorative views icon and announces count/unavailable changes through a single polite status region.

Deferred:

- Browser smoke coverage for the architecture viewer invalid-source fallback remains deferred to Substep 7, where it can be considered alongside the broader Playwright/axe decision.

Accepted tradeoff:

- The architecture preview still shows a local Netlify fallback when SVG proxy functions are unavailable; this remains expected plain Vite behavior.

## Reduced Motion, Contrast, and Focus - 2026-05-19

Fixes completed:

- AOS now follows `prefers-reduced-motion: reduce`, disabling section animation for reduced-motion users and refreshing when the preference changes.
- Project-card hover/focus video previews no longer request or play video while reduced motion is active, and any active preview is released if the preference changes.
- Reduced-motion CSS now calms AOS elements, animated gradient text, tag marquee motion, hover-gradient transforms, avatar float/tilt motion, and avatar hover transforms.
- The public back-to-top button uses instant scrolling when reduced motion is active.
- Credential/card meta contrast was improved by raising `--color-text-subtle` to `#8BA1B6`.
- Visible focus was strengthened on the public menu button, project cards, credential cards, back-to-top control, and shared admin form/button/link recipes.

Deferred:

- Browser reduced-motion and focus-ring smoke coverage remains part of the Substep 7 test decision, alongside the already-deferred Playwright/axe checks.

Accepted tradeoff:

- Motion is calmed through the media query and runtime guards, but default users keep the portfolio's existing animated personality.

## Admin Accessibility Pass - 2026-05-19

Fixes completed:

- The admin header nav now has an explicit label, and each admin section is exposed as a named region through its visible heading.
- Admin save failures are announced as alerts, and the save button exposes its busy state while a save is in progress.
- Project selector buttons now expose selected state with `aria-pressed` and project-specific names.
- Existing admin drag reorder behavior was left unchanged; no additional reorder controls were added.
- Repeated list textareas now have item-specific accessible names, and remove buttons describe the item they affect.
- Project, challenge, skill, and social add/remove/reorder controls received more specific accessible names where those controls already existed.
- Admin preview images now use clearer preview alt text, while decorative scroll-button icons are hidden from assistive technology.
- Hidden admin back-to-top/back-to-bottom controls are removed from the tab order until visible.

Accepted tradeoff:

- Personal-use admin reorder remains mouse-drag based by owner preference; this pass focuses on screen-reader names, labels, landmarks, status text, and alt text rather than adding new admin controls.

Verification:

- `cmd /c npm run test`, `cmd /c npm run lint`, `cmd /c npm run check:schema`, and `cmd /c npm run build` passed after the admin accessibility changes.
