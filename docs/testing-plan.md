# Testing Plan

Date: 2026-06-25

## Purpose

This document records the testing plan by feature area. It stays high level, with the current baseline tests named so future work can build on them without guessing.

## Maintenance Rules

- Keep current coverage, remaining gaps, and active test strategy.
- Move completed gaps into current coverage once tests land.
- Avoid preserving completed issue history unless it explains a current test boundary.

## Current State

Vitest is installed as the default unit-test runner. A focused Playwright/axe smoke runner is available through `cmd /c npm run test:a11y` for stable rendered accessibility checks, including the public fixed-navigation baseline.

Current baseline test files:

- `tests/admin/routing.test.js`
- `tests/admin/scrollspyUtils.test.js`
- `tests/admin/navigationCoordinator.test.js`
- `tests/admin/adminNavExpansion.test.js`
- `tests/admin/adminSectionToolbar.test.js`
- `tests/admin/adminWorkflowState.test.js`
- `tests/runtime/paths.test.js`
- `tests/domain/projects/routing.test.js`
- `tests/domain/projects/mappers.test.js`
- `tests/domain/projects/preview.test.js`
- `tests/domain/projects/agentDraft.test.js`
- `tests/domain/projects/viewModel.test.js`
- `tests/domain/about/mappers.test.js`
- `tests/domain/contact/mappers.test.js`
- `tests/domain/credentials/mappers.test.js`
- `tests/domain/skills/mappers.test.js`
- `tests/hooks/useProjectMarqueeMotion.test.js`
- `tests/hooks/useHoverPreviewIntent.test.js`
- `tests/hooks/viewportActivationScoring.test.js`
- `tests/components/projects/viewer/viewerUrl.test.js`
- `tests/netlify/functions/inline-svg.test.js`
- `tests/runtime/netlify.test.js`
- `tests/server/admin/utils/storage.test.js`
- `tests/server/admin/routes/validation.helpers.test.js`
- `tests/server/admin/routes/validation.uploads.test.js`
- `tests/server/admin/routes/validation.about.test.js`
- `tests/server/admin/routes/validation.projects.test.js`
- `tests/server/admin/routes/projects.validate-route.test.js`
- `tests/server/admin/routes/validation.contact.test.js`
- `tests/server/admin/routes/validation.credentials.test.js`
- `tests/server/admin/routes/validation.skills.test.js`

Current checks:

- `cmd /c npm run test` passes with 31 test files and 198 tests.
- `cmd /c npm run lint` passes.
- `cmd /c npm run check:schema` passes.
- `cmd /c npm run build` passes with the existing chunk-size advisory.
- `cmd /c npm run test:a11y` passes.
- `git diff --check` passes.

Current accessibility smoke coverage:

- Public home page main landmark, primary section navigation landmark, and owner `h1`.
- Desktop fixed navigation default-open tray behavior through the `Close section navigation` button state.
- Mobile fixed navigation default-closed state, menu opening, exposed section links, and axe scan after opening.
- Invalid architecture viewer fallback, disabled zoom controls, safe Back link, and axe scan.

Admin navigation coverage:

- `tests/admin/routing.test.js` covers `/admin/projects` as a valid parent target, canonical child paths, unknown Projects fallback to the parent, root/child scroll-target distinctions, and flattened observed-leaf metadata.
- `tests/admin/scrollspyUtils.test.js` covers ordered flattened geometry, Classification observation beginning at the Projects parent, the final Projects-child boundary at Education, edge forcing, short-section ownership, current-section hysteresis, sticky viewport offsets, and already-visible scroll guards.
- `tests/admin/navigationCoordinator.test.js` covers the pure route-write policy: traveling observation during a locked target, passive idle replacement, settlement release, user-interruption replacement, and suppression during project-record stabilization.
- `tests/admin/adminNavExpansion.test.js` and `tests/admin/adminSectionToolbar.test.js` cover expandable-group policy and sticky-toolbar geometry without coupling tests to Tailwind class strings.
- `tests/admin/adminWorkflowState.test.js` covers route-tree workflow IDs, explicit Projects field ownership, multiple dirty roots and Projects children, direct parent plus child state, validated-but-unsaved behavior, validation failure and stale-validation clearing, successful/failed save transitions, collapsed precedence, expanded suppression, and single-owner/multi-owner agent import attribution from actual changed fields.

Admin workflow test strategy:

- Pure transition tests protect dirty and validation as independent dimensions; validation success never implies persistence.
- Ownership tests use explicit root callbacks, Projects subsection IDs, collection-operation policy, and the changed-field map for agent imports. Navigation observation is not an attribution input.
- Parent display tests derive collapsed precedence and expanded suppression from the same workflow map rather than asserting sidebar class strings.
- The authenticated admin DOM, tooltip/focus behavior, and save/validation interaction sequence remain the documented browser boundary until a stable non-destructive fixture exists.

Remaining testing gap:

- The coordinated DOM lifecycle remains a browser/manual boundary because the repo does not have a stable authenticated admin fixture. Required focused checks are delayed direct entry after data readiness, traveling highlights with a locked URL, wheel/touch/keyboard interruption, `/admin/projects` settling to Classification, Browser Back/Forward, large-to-small project switching, the zero-project Projects fallback, and unsaved-edit preservation.
- Expandable admin sidebar rendering remains a browser/manual boundary until a stable admin component or browser fixture exists. The authenticated manual pass must cover the exact active root/child gradient, static Projects ancestor treatment, traveling highlights, reduced motion, neutral inactive icon contrast, simultaneous dirty indicators, validation spinner/success/error, Save remaining enabled after successful validation, successful/failed save behavior, collapsed/expanded parent display, focus, status tooltips, and `beforeunload`.
- The 2026-06-25 workflow verification pass completed the pure workflow matrix and full quality gate. It did not claim authenticated admin visual verification because no stable local fixture or non-destructive browser login path exists; the checks above remain the explicit browser boundary.
- Add browser/component smoke coverage later for modal focus and remaining Netlify function behavior such as `track-visit`.
- Add browser smoke only if project viewport card activation, desktop standard-card marquee behavior, or deeper fixed-nav scrollspy behavior needs coverage beyond the pure scoring helpers, current nav smoke, and axe checks.
- Project-card video preview lifecycle has focused helper coverage in `tests/hooks/useHoverPreviewIntent.test.js`: retained-source cleanup versus default source release, actual playback state from `playing`, clearing state on `pause`/`emptied`/`ended`/`error`, and listener cleanup. Prop routing and guarded `safeVideo` source/preload behavior remain covered by structural/manual verification rather than a React component harness.
- Real-device iOS Safari autoplay behavior remains a manual verification boundary. The 2026-05-30 pass covered first activation for featured and standard cards across three fresh Safari sessions with Low Power Mode disabled; Low Power Mode still produces an accepted thumbnail fallback when iOS rejects autoplay.
- Live desktop keyboard traversal through standard project marquee cards remains data-dependent when plain local Vite has no public project rows; duplicate marquee copies are covered by the component structure using `aria-hidden` plus duplicate-anchor `tabIndex="-1"`, with visible duplicates intentionally not `inert`.
- Desktop marquee interaction verification used mocked Supabase project rows in local Playwright after sandboxed live fetches returned `ERR_NETWORK_ACCESS_DENIED`; it covered duplicate hover preview activation, normal duplicate modal clicks, modified/middle-click preservation, focus centering, and the reduced-motion grid fallback.
- Focus alignment center-delta math is covered by `tests/hooks/useProjectMarqueeMotion.test.js`; a heavier ProjectCard/CardSurface component test was intentionally deferred because the existing suite does not include a React component harness and the prop path was verified structurally/manually.
- Project classification pill rendering and label cycling are covered by mapper normalization tests plus structural/manual verification rather than a dedicated React component harness. Manual checks verified card placement, row-height stability during a 4600ms rotation window, no focusable pill descendants, stable card link names, stable `.sr-only` summaries for multi-label cycling, and reduced-motion first-label behavior.
- Keep live Supabase, Redis, and deployed Netlify behavior out of the default gate unless explicitly mocked.

## Projects

Highest-value coverage:

- Project route parsing and building for `/p/:project`.
- Public project card mapper.
- Public project detail mapper.
- Project detail fallback merging.
- Permalink behavior for old and new projects.
- Admin project validation and serialization.
- Project media upload path behavior after the storage convention decision is made.

Current coverage:

- Route parsing/building, public project mappers, detail view models, fallback merging, and sort-order normalization are covered.
- Draft-to-public-modal preview mapping is covered for complete drafts, optional fields, classification normalization, malformed list fallbacks, and challenge preservation.
- Agent draft import and current-context export helpers are covered for pasted and fenced JSON parsing, malformed payload errors, unknown-key warnings, protected identity/media preservation, challenge shape handling, classification normalization, partial tech stack merging, unsupported-only payloads, and safe current project review context serialization.
- Project classification mapper defaults, rank/type/label normalization, and featured/standard grouping sort behavior are covered.
- Public project-card classification pills consume the mapped `projectType` and `labels` fields. The card-local timer, opacity overlap, reduced-motion branch, and assistive-hidden transient layers remain manually verified until the repo gains a lightweight React component test path.
- Desktop standard-card marquee verification is currently pure focus-alignment helper coverage plus quality-gate/accessibility-smoke/manual checks rather than a dedicated component test; mobile and reduced-motion users still receive the grid path.
- Featured project cards prefetch only their guarded `safeVideo` source with `preload="auto"`; standard project cards keep lazy source attachment. The preview hook requests muted inline playback after hover intent, retries on readiness events, and tracks actual `playing` state separately from preview intent. Stable lifecycle branches are covered by `tests/hooks/useHoverPreviewIntent.test.js`; real iOS autoplay policy remains manually verified.
- Admin project validation is covered through pure validation helper tests, and the no-write draft validation route is covered for success and shared validation errors.
- Project media upload path conventions are covered by focused storage utility tests.

Why this matters:

- Projects are the primary portfolio content.
- Project routes and modal data are easy to break during refactors.
- Admin writes and public reads must agree on field names and structured list shapes.

## About and Hero

Highest-value coverage:

- About row mapping from database shape to public shape.
- `resume_pdf` -> `resumeUrl`.
- Hero fallback merge behavior when public data is missing or partial.
- Profile image fallback behavior.

Current coverage:

- About row mapping, `resume_pdf` to `resumeUrl`, profile image mapping, and Hero fallback merge behavior are covered.
- Hero fallback merge behavior now lives in `src/domain/about/viewModel.js`.

Why this matters:

- Mapper and view-model tests catch field-name contract drift quickly.

## Contact and Links

Highest-value coverage:

- Link row mapping.
- Empty link filtering.
- Unpublished link filtering.
- Social link fallback behavior.
- Uploaded icon URL handling.
- Admin validation for Contact link published state.

Current coverage:

- Link row mapping, unpublished filtering, empty URL filtering, uploaded icon URL passthrough, and links-only null behavior are covered.
- Admin Contact validation covers missing `published` defaulting to `true`, explicit `published: false`, and rejection of non-boolean values.

Why this matters:

- Contact links are public-facing and admin-managed.
- Public reads and mapper output should expose only published links, while admin keeps unpublished links editable.
- The current icon fallback is index-based and should be preserved or intentionally replaced.

## Skills

Current status:

- Skills are covered as their own grouped database/admin/public flow.
- Public `Skills.jsx` consumes mapped grouped rows and falls back to static grouped defaults.

Current coverage:

- Grouped skills row mapping.
- Sort order.
- Fallback static groups.
- Admin grouped skills validation.

Future coverage:

- Thin component smoke coverage for `Skills.jsx` fallback/render states if public data fetching behavior changes.

## Education and Certifications

Current status:

- Education and Certifications are data-backed through the shared `credentials` table.
- Public sections read published credential rows through `src/api/public/credentials.js`, map them through `src/domain/credentials/mappers.js`, and fall back per kind to static domain defaults.
- Local admin editing uses separate `/admin/education` and `/admin/certifications` pages backed by the shared `src/admin/credentials/CredentialGroupEditor.jsx`; service-role replacement saves still live in `server/admin/routes/credentials.js`.
- Project scroll activation is section-local, enabled outside the marquee path, and uses the shared viewport activation hook. Credential scroll activation remains touch-capability gated.

Current coverage:

- Credential row mapping, split Education/Certification output, required display field filtering, unpublished filtering, highlight normalization, URL/logo/GPA normalization, logo scale handling, sort order, and fallback-ready empty output.
- Admin credential validation for required fields, known logo keys, valid URLs, bounded logo scale, bounded highlights, max rows, blank-row dropping, boolean normalization, and derived sort order.
- Shared viewport activation scoring helpers are covered for diagonal selection, visible-ratio filtering, hysteresis, activation-band rejection, single-column center behavior, and multi-column left/right selection.

Remaining gaps:

- Browser/component smoke for public credential live/fallback rendering and routed admin credential save behavior remains manual unless a lightweight React/browser harness is added.
- Live Supabase credential reads and writes remain outside the default automated gate.

## Architecture Viewer

Highest-value coverage:

- Trusted Supabase SVG URL validation.
- Rejection of untrusted URLs and open redirects.
- Inline SVG proxy URL generation.
- Safe `returnTo` behavior.
- Invalid viewer URL fallback state.

Current coverage:

- Trusted Supabase architecture SVG validation, unsafe viewer source rejection, inline SVG proxy URL generation, safe `returnTo`, and viewer URL encoding are covered.
- Tests lock the current trusted path rule to project-scoped `portfolio-assets/projects/{id}/architecture.svg` SVGs.
- `cmd /c npm run test:a11y` covers the invalid-source viewer fallback, disabled zoom controls, safe Back link, and an axe scan of the fallback route.

Why this matters:

- This feature handles externally hosted SVGs.
- Security constraints are part of the intended behavior, not just implementation detail.

## Netlify Functions

Highest-value coverage:

- `track-visit` counted and skipped IP behavior.
- Redis failure behavior.
- `inline-svg` URL validation and content type response.

Current coverage:

- `inline-svg` URL validation and SVG response headers are covered with mocked fetch behavior.
- `track-visit` remains covered only by local/manual Netlify Dev checks.

Decision:

- Do not make live Redis or live Supabase tests part of the default gate.
- Prefer pure helper tests and mocked function tests.

## Admin Backend

Highest-value coverage:

- Route validation.
- URL validation.
- Max list sizes.
- Duplicate and missing project ID handling.
- Upload filename/path helpers.
- JSON and multipart payload parsing.

Current coverage:

- Pure helper primitives, upload file validation, and about/project/contact/skills state validation are covered.
- Contact validation includes link label/URL/icon checks plus published defaulting, explicit false preservation, and non-boolean rejection.
- The project draft validation endpoint is covered as a no-write route that reuses project state validation.

Why this matters:

- The admin backend owns privileged writes.
- It is local-only, but it still guards the real portfolio data.

## Suggested Layers

Start with:

- Pure domain and routing tests.
- Admin validation tests.
- Viewer URL tests.

Then add:

- Public data-flow contract tests.
- Thin component smoke tests.
- Sparse browser smoke tests for stable rendered routes.

Avoid for now:

- Full live Supabase tests as the default gate.
- Large React component suites before data contracts are covered.
- Generic test abstraction before the first real tests exist.
