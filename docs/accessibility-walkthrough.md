# Accessibility Walkthrough

Date: 2026-06-23

## Purpose

This document is the source of truth for the current accessibility state of the public portfolio, project modal flow, architecture viewer, and local admin UI.

Keep this current-state oriented:

- Describe what accessibility behavior exists now.
- Keep known tradeoffs, deferred checks, and local verification limits visible.
- Update the baseline when accessibility tooling, smoke coverage, or expected warnings change.
- Remove fixed historical findings unless they still explain a current behavior or guardrail.

## Current Baseline

Last accessibility-affecting baseline checked on 2026-06-24 with Windows `cmd /c` commands for the coordinated, route-addressable, scroll-continuous admin shell with an expandable Projects group in the primary sidebar.

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
- The accessibility smoke currently covers the public home page landmark/menu baseline, the desktop and mobile fixed section navigation contract, and the architecture viewer invalid-source fallback.
- The routed admin shell and selector-driven editor flows remain outside the automated axe smoke until the repo adds a stable admin browser fixture.
- Plain Vite local runtime still has expected Netlify function caveats for visit count and architecture SVG proxy behavior.

## Accessibility Surface Map

Public app:

- `src/App.jsx`: public layout, AOS initialization, top bar, main section stack, main landmark, top focus reset target, and back-to-top control.
- `src/components/layout/Navbar.jsx`: fixed section navigation, animated menu button, desktop/mobile tray behavior, active-section semantics, Escape close, modal-open removal, collapsed-link tab behavior, and navigation labels.
- `src/components/layout/VisitCount.jsx`: async visit-count status text and expected local fallback behavior.
- `src/components/buttons/BackToTopButton.jsx`: floating public back-to-top control, reduced-motion scroll behavior, and top tab-order reset trigger.
- `src/components/sections/*`: public content sections, section landmarks, heading order, and fallback content.

Project flow:

- `src/components/sections/Projects.jsx`: project grouping, hover preview coordination, route-backed modal state, and one `ProjectModal` owner.
- `src/components/sections/projects/FeaturedProjectsGroup.jsx`: featured project card group and section labeling.
- `src/components/sections/projects/StandardProjectsGroup.jsx`: standard project card group, section labeling, reduced-motion/mobile grid fallback, and desktop marquee selection.
- `src/components/sections/projects/ProjectMarquee.jsx`: desktop standard-card marquee rendering, duplicate-copy hiding, primary-item focus alignment wiring, and region labeling.
- `src/hooks/useProjectMarqueeMotion.js`: browser-guarded marquee measurement, hover/focus pause, modal pause, focus alignment, and transform updates.
- `src/components/projects/ProjectCard.jsx`: project-specific case-study link names, anchor activation, guarded featured-video prefetch, and hover/focus video preview intent.
- `src/components/projects/ProjectClassificationPills.jsx`: non-interactive card classification row, type display copy, rotating display-label pill, reduced-motion fallback, and stable screen-reader label summary.
- `src/components/projects/modal/ProjectModal.jsx`: dialog shell, accessible dialog name, backdrop close, modal content, and focus containment.
- `src/components/projects/modal/Header.jsx`: modal title, action links, and close button.
- `src/hooks/useModalSideEffects.js`: conditional modal focus restore, initial focus, Escape close, body scroll lock, and root modal state.
- `src/hooks/useProjectViewportPreview.js`: project viewport preview bridge that avoids modal, interaction, marquee, and reduced-motion conflicts.
- `src/hooks/useViewportActivationGroup.js`: browser-guarded active-card selection for viewport-aware card groups.

Architecture viewer:

- `src/components/projects/modal/ArchitecturePreview.jsx`: modal diagram preview, project-aware viewer links, and local SVG proxy fallback state.
- `src/components/projects/viewer/ArchitectureViewer.jsx`: standalone viewer controls, keyboard shortcuts, loading/error/empty states, live-region status, and zoom controls.
- `src/components/projects/viewer/viewerUrl.js`: trusted viewer URL parsing/building and invalid-source fallback inputs.

Admin:

- `src/admin/AppAdmin.jsx`: development-only admin draft ownership, save state, route-addressable scroll navigation, status-message derivation, and unsaved-leave warning wiring.
- `src/admin/shell/*`: fixed primary sidebar navigation landmark, expandable route groups, decorative disclosure chevrons, save panel, top-of-content status/error live region, and scroll-continuous main layout.
- `src/admin/pages/*`: admin page wrappers with one visible masthead heading per top-level admin section.
- `src/admin/sections/*`: section editors, named regions, selector-driven repeated-record editing, and add/remove/reorder controls where present.
- `src/admin/credentials/CredentialGroupEditor.jsx`: shared Education/Certification selector editor used by separate routed pages.
- `src/admin/projects/*`: project record selector, fixed subsection definitions, challenge item selector, selected-state controls, draft preview/validation actions, and project editing labels.
- `src/admin/forms/*`: shared form labels, inputs, and file-input saved/pending helper text.
- `src/admin/lists/*`: repeated list editing controls and item-specific accessible names.
- `src/admin/navigation/*`: admin selector/navigation support components that remain after the retired scroll-helper controls were removed.

## Current Implemented Behavior

Public structure:

- The public page has one `main` landmark, a semantic top header, one real `h1`, and labeled section landmarks.
- Public navigation uses valid link-based markup in a fixed labeled navigation landmark. The visit count remains in the normal-flow top header, while only the section navigation stays fixed.
- The public section menu button exposes `aria-expanded`, `aria-controls`, and action-specific names: `Open section navigation` and `Close section navigation`. Its inline hamburger/X icon is decorative.
- The fixed section tray is open by default at desktop widths and collapsed on mobile. Closed tray links leave the tab order and the hidden tray is not pointer-interactive.
- Active same-page section links expose `aria-current="location"` and use a subtle visual highlight. The active section updates on scroll and on link activation without coupling to project-card viewport activation.
- Escape closes the section tray when keyboard focus is inside the nav cluster, restores focus to the menu button, and does not add an outside-click dismissal path.
- Public back-to-top activation returns programmatic focus to the top header before the navigation menu and closes the section menu, so the next Tab starts again at the menu button without moving pointer users directly onto the menu control.
- Hidden back-to-top controls leave the tab order until visible.
- Decorative icons are hidden from assistive technology where the surrounding control or link already provides the name.
- Public icon and image names favor action-oriented or content-specific text rather than implementation-style file names.

Project modal and cards:

- Project cards expose project-specific case-study names.
- Project cards render a compact classification row below media and above descriptions when mapped classification data exists. The stable type pill is exposed normally. A single display label is exposed normally; multiple cycling visual labels are hidden from assistive technology and expose one stable visually-hidden summary such as `Project labels: ...` without a live region.
- Featured project cards attach their guarded video source early with `preload="auto"` while keeping the curated thumbnail visible until the video emits actual `playing` state. Standard project cards keep lazy source attachment. If iOS rejects autoplay, the visible image fallback remains in place instead of exposing a blank preview.
- Modal rendering has one owner in `Projects.jsx`, so card-open and route-backed modal states share the same dialog behavior.
- Standard project cards render as the existing grid for mobile and reduced-motion users. Non-mobile users without reduced-motion preference receive the desktop marquee with the same full `ProjectCard` markup and modal handoff.
- Desktop marquee duplicate copies are visual-only for assistive technology: copied lists and items are `aria-hidden`, duplicate card anchors receive `tabIndex="-1"`, and duplicate cards skip viewport-preview ref registration. Visible duplicate cards are not `inert`, so pointer hover and click behavior matches primary cards.
- Project groups can request one scroll-driven preview through the same source-aware `activePreviewId` owner used by hover/focus previews.
- Viewport-driven project previews are disabled while the modal is open, while reduced motion is active, or while the standard-card marquee is rendered. Hover/focus interaction owns the active preview while active; viewport activation resumes from the next scroll measurement after that interaction ends.
- The modal has an `h2`-backed dialog name, focus containment, Escape close, and focus restore only when the modal was opened from focused card navigation.
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
- Reduced-motion users see only the first project display label; `ProjectClassificationPills.jsx` does not keep the cycling label timer active while reduced motion is enabled.
- The desktop project marquee pauses while actually hovered, while keyboard focus is inside the marquee, and while the project modal is open; closing the modal resumes motion unless hover or restored keyboard focus still applies.
- Project-card hover/focus video previews do not request or play video while reduced motion is active. Featured prefetch still follows the card-owned guarded source path; reduced-motion users do not receive preview playback.
- Scroll-driven viewport activation is disabled for project previews and credential card effects while reduced motion is active.
- Education and certification cards keep hover/focus effects for pointer and keyboard users; touch viewport activation does not move focus or trigger navigation.
- Reduced-motion CSS calms AOS elements, animated gradient text, tag marquee motion, hover-gradient transforms, avatar float/tilt motion, and avatar hover transforms.
- Reduced-motion CSS also calms the fixed section nav's button rotation, hamburger/X morph, tray transitions, and active-link gradient animation. The Home link uses instant top scrolling when reduced motion is active.
- The public back-to-top button uses instant scrolling when reduced motion is active.
- Credential/card meta contrast uses the current `--color-text-subtle` value of `#8BA1B6`.
- Visible focus is strengthened on the public menu button, project cards, credential cards, back-to-top control, and shared admin form/button/link recipes.

Admin accessibility:

- The admin runs as a development-only routed CMS shell with all fixed top-level admin sections rendered in one scroll-continuous stack. `/admin` and unknown top-level `/admin/*` paths canonicalize to About. `/admin/projects` remains a valid parent destination; unknown Projects child paths canonicalize to that parent.
- Top-level admin routes remain addressable at `/admin/about`, `/admin/projects`, `/admin/education`, `/admin/certifications`, `/admin/skills`, and `/admin/contact`. Project subsections are addressable from `/admin/projects/classification` through the remaining Intro, Media, Links, Tech, Lists, and Challenges child paths.
- The fixed sidebar is the only admin navigation surface. It exposes a named `Admin pages` navigation landmark and icon-plus-label root links. One flattened observed leaf owns the visual current location across root sections and Projects subsections.
- Exactly one precise observed leaf exposes `aria-current="location"`. A Projects child owns that semantic while its root receives only the grouped active styling, so assistive technology is not given both a parent and child current location.
- Projects is an expandable root link whose `aria-expanded` state follows the coordinated origin, destination, and observed-leaf policy and whose `aria-controls` references the in-flow child link group. Its right/down chevron is decorative with `aria-hidden="true"` and is not a separate control.
- The Projects child group remains mounted for its visual disclosure transition, becomes `inert` and `aria-hidden` while collapsed, and disables the transition for reduced-motion users.
- Activating the Projects parent preserves `/admin/projects` while scrolling to the Projects masthead. When project content exists, observation at the top of Projects resolves the precise current leaf and settled URL to Classification without manually defaulting the click to that child.
- During intentional smooth navigation, the observed leaf may move rapidly through intermediate root and child locations for the traveling sidebar highlight. The requested URL stays locked until navigation settles, no live region announces those intermediate changes, and the activated link retains keyboard focus.
- Admin navigation uses instant scrolling when `prefers-reduced-motion: reduce` is active while preserving the same final route and current-leaf semantics.
- Wheel, touch, scrollbar/middle-pointer, and non-editing keyboard scroll input release intentional navigation ownership so observation can take over. Arrow, Page, Home, End, and Space input from an input, textarea, select, or contenteditable editor is not treated as a navigation interruption.
- The sidebar save panel keeps the global save button reachable, exposes busy state while saving, and reports saved, unsaved, saving, and draft-validation save states through a polite status line.
- The top-of-content admin status banner appears only for active messaging. Errors use `role="alert"`; saving, validation, and unsaved-change messages use `role="status"` with polite live-region behavior and a labeled dismiss button.
- Each top-level admin section has one clear visible masthead heading through `AdminPageWrapper`. Masthead icons are decorative, and section editors keep local named regions and labels where their controls need them.
- Selector-backed admin workspaces use a section-scoped sticky toolbar directly after the masthead. The toolbar is intentionally selector-only, keeps selector labels visible, and stays in normal DOM order before section actions and editor fields.
- Add, draft, validation, preview, and remove actions remain in normal section content/editor flow so the sticky surface stays compact and related edit/remove controls stay near each other.
- Empty Education and Certification record states use plain empty text without rendering an empty sticky selector toolbar. Empty Skills and Contact states use plain empty text plus their Add action.
- Admin root and nested Projects navigation use smooth scroll by default and instant scroll when `prefers-reduced-motion: reduce` is active.
- Admin selector buttons expose selected state with `aria-pressed` and record-specific names. Reorderable selectors own mouse-drag ordering for Projects, Credentials, Skills groups, Contact links, and Project challenge items.
- Project editor subsection links render directly beneath Projects in the primary sidebar while Projects is active. No separate Projects secondary sidebar or conditional content gutter remains.
- The active project editor renders all fixed project subsection regions for the selected project. Each subsection has a visible heading associated with the region, while project records and challenge items remain selector-driven.
- The admin project preview opens the shared project modal from the active unsaved draft and inherits the existing dialog focus containment, Escape close, and focus-restore behavior.
- The admin project draft import and current-context panels use labeled textareas, alert/status feedback, and disabled states while Save is in flight so pasted draft changes do not race the save response.
- Shared admin file inputs keep a real native file control associated with `FieldLabel`, visually replace the browser-owned filename text with app-owned `Choose file` or `Replace file` action text, and expose the saved/pending state through nearby helper text referenced by `aria-describedby`. File selection still uses the native control; saved URLs are represented by caller-owned booleans instead of attempting to prefill the input value.
- Repeated list textareas have item-specific accessible names, and remove buttons describe the item they affect.
- Project, challenge, skill, credential, and social add/remove/reorder controls use specific accessible names where those controls already exist. Destructive remove controls remain visible in the selected editor instead of moving into selector buttons.
- Admin preview images use preview-specific alt text.

## Accepted Tradeoffs

- Default users keep the portfolio's animated feel; reduced-motion users get calmer behavior for non-essential motion.
- Project groups get one scroll-active card except while the marquee, modal, or reduced-motion guardrails apply. Education and certification groups still limit scroll-active card effects to touch-capable devices. Hybrid devices can still use intentional hover and keyboard focus independently of the scroll-active state.
- Some personal-use admin reorder remains mouse-drag based through selector drag. The current accessibility state focuses on names, labels, landmarks, status text, tab behavior, selected-state semantics, and explicit controls where they already exist.
- Plain Vite can show expected Netlify function fallback behavior for visit count and architecture SVG previews. Use `netlify dev` when testing deployed-function behavior locally.
- Public data fetch failures can leave the page on static fallbacks or empty project states in constrained local environments. Live Supabase-backed content checks remain outside the default local gate unless explicitly mocked.
- Desktop standard-card marquee keyboard traversal is structurally protected by duplicate anchors using `tabIndex="-1"` while duplicate wrappers stay `aria-hidden`. A full live traversal check depends on public project rows being available in the local runtime; mocked Playwright verification covered duplicate pointer parity and primary focus centering.
- Real iPhone Safari verification passed project-card preview first activation with Low Power Mode disabled. When Low Power Mode is enabled, iOS can reject autoplay; keeping the image fallback visible is the accepted behavior.
- Live Redis, live Supabase, and deployed Netlify behavior are not part of the default accessibility gate.

## Deferred Checks

- Add browser modal focus smoke coverage when stable project-card/modal data can be supplied through public Supabase or a mocked browser fixture.
- Cover `track-visit` through mocked function tests or Netlify Dev checks rather than a live Redis browser gate.
- Run a native screen reader session as a future validation pass.
- Consider browser accessibility tree snapshots if the installed Playwright API and local setup make them reliable.
- Add browser reduced-motion or focus-ring smoke coverage only if it catches a stable regression that lint, unit tests, and the current axe smoke cannot catch.
- Add browser smoke coverage for viewport card activation only if a stable emulated scroll/pointer test catches regressions beyond the pure scoring tests.

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
