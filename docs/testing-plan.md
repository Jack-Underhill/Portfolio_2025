# Testing Plan

Date: 2026-07-26

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
- `tests/server/admin/agent/codexBridge.test.js`
- `tests/server/admin/agent/codexRuntimeMetadata.test.js`
- `tests/server/admin/agent/projectAgentPrompt.test.js`
- `tests/server/admin/agent/projectAgentRun.test.js`
- `tests/server/admin/agent/projectAgentValidationPreflight.test.js`
- `tests/server/admin/agent/sourceBundle.test.js`
- `tests/server/admin/agent/sourceIngestion/textSource.test.js`
- `tests/server/admin/agent/sourceIngestion/fileSource.test.js`
- `tests/server/admin/agent/sourceIngestion/pdfSource.test.js`
- `tests/server/admin/agent/sourceIngestion/zipSource.test.js`
- `tests/server/admin/agent/sourceIngestion/sourcePathUtils.test.js`
- `tests/server/admin/agent/sourceIngestion/sourceResult.test.js`
- `tests/server/admin/agent/sourceIngestion/validation/sourceValidationResult.test.js`
- `tests/server/admin/agent/sourceIngestion/validation/fileValidation.test.js`
- `tests/server/admin/agent/sourceIngestion/validation/textValidation.test.js`
- `tests/server/admin/agent/sourceIngestion/validation/byteLimitValidation.test.js`
- `tests/server/admin/agent/sourceIngestion/githubSource.test.js`
- `tests/server/admin/agent/sourceIngestion/githubUrl.test.js`
- `tests/server/admin/agent/sourceIngestion/githubPathPolicy.test.js`
- `tests/server/admin/agent/sourceIngestion/githubApiClient.test.js`
- `tests/server/admin/agent/sourceIngestion/githubTree.test.js`
- `tests/server/admin/routes/projectsAgent.test.js`
- `tests/admin/adminClient.test.js`
- `tests/admin/projectAgentRunState.test.js`
- `tests/admin/projectAgentSourcePreviewState.test.js`
- `tests/admin/ProjectAgentRunPanel.test.jsx`
- `tests/admin/ProjectAgentSourceInputs.test.jsx`
- `tests/server/admin/utils/storage.test.js`
- `tests/server/admin/routes/validation.helpers.test.js`
- `tests/server/admin/routes/validation.uploads.test.js`
- `tests/server/admin/routes/validation.about.test.js`
- `tests/server/admin/routes/validation.projects.test.js`
- `tests/server/admin/routes/projects.validate-route.test.js`
- `tests/server/admin/routes/validation.contact.test.js`
- `tests/server/admin/routes/validation.credentials.test.js`
- `tests/server/admin/routes/validation.skills.test.js`

Current checks verified in the 2026-07-19 local Projects Agent closeout pass:

- `cmd /c npm run test` passes in the current baseline.
- `cmd /c npm run lint` passes.
- `cmd /c npm run check:schema` passes.
- `cmd /c npm run build` passes with the existing chunk-size advisory.
- `cmd /c npm run test:a11y` passes.
- `git diff --check` passes.

Local Codex agent focused checks:

- `cmd /c npx vitest run tests/server/admin/agent/codexBridge.test.js tests/domain/projects/agentDraft.test.js` covers the deterministic bridge helper and the existing project draft import contract.
- `cmd /c npx vitest run tests/server/admin/agent/codexRuntimeMetadata.test.js tests/server/admin/agent/sourceBundle.test.js tests/server/admin/agent/sourceIngestion tests/server/admin/agent/projectAgentPrompt.test.js tests/server/admin/agent/projectAgentValidationPreflight.test.js tests/server/admin/agent/projectAgentRun.test.js tests/server/admin/routes/projectsAgent.test.js tests/admin/adminClient.test.js tests/admin/projectAgentRunState.test.js tests/admin/projectAgentSourcePreviewState.test.js tests/admin/ProjectAgentRunPanel.test.jsx tests/admin/ProjectAgentSourceInputs.test.jsx` covers browser-safe model metadata parsing/fallbacks, source bundle limits and manifests, expanded text/code policy, direct file dispatch, PDF extraction, zip filtering and limits, source ingestion path/result/validation primitives, GitHub URL/API/path/tree/file ingestion behavior through injected fetch fixtures, source preview state/rendering, compact toolbar summary helpers, prompt assembly, intent validation, source-aware derived run planning, review patch suppression, advisory validation preflight passed/failed/skipped behavior, run orchestration, route/client JSON and multipart request shape, runtime metadata route/client behavior, run-state retry/clear behavior, and run-panel validation preflight rendering with fake Codex responses only.
- `cmd /c npx vitest run tests/admin/projectAgentRunState.test.js` covers the Project Agent review-surface helper state used for idle/running shape and retry/clear availability.
- `cmd /c npm run admin:codex-spike` runs a real Codex CLI bridge check through the logged-in local CLI. Run it when changing the low-level bridge command path or local CLI assumptions, but keep it out of the default gate because it depends on local Codex CLI/auth availability.

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
- Projects Agent run-panel rendering remains in that authenticated admin browser boundary: manual checks cover readable success/failure states, source manifest readability, selected source file add/remove behavior, keyboard access to Retry and Clear result, Review success copy that does not imply draft edits, and the distinction that Clear result does not revert unsaved draft edits or selected source inputs.

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
- The Projects agent run and runtime metadata paths are covered at the helper and route layers: browser-safe Codex config metadata parsing/fallbacks, owner intent validation, source bundle normalization, source-aware derived run-plan prompt construction, wrapper validation, instruction/context/source limits, review-only patch suppression, advisory validation preflight passed/failed/skipped behavior, bridge failure normalization, malformed wrapper handling, invalid patch handling, route content-type errors, concise browser-facing errors, and the `runProjectAgent` / `loadProjectAgentRuntime` admin client helpers.
- Source attachment coverage includes pasted text, broad UTF-8 developer text/code/config files, safe extensionless project filenames, Jupyter notebook markdown/code-cell extraction, direct PDF extraction, zip archives with supported text/PDF entries, unsupported file extensions, secret-like names, binary/database dumps, generated/minified bundles, empty/oversized/unreadable/undecodable files, unsafe zip paths, nested archive skips, dependency/build/generated zip-folder skips, archive/entry/included-file/extracted-byte limits, total source text limits, manifest entries without raw source text, shared source path/result/validation primitives, GitHub URL parsing, unsupported GitHub URL warnings, metadata/tree/blob fetch handling with injected fetch fixtures, repo path filtering, high-signal tree selection, GitHub file count/byte/text/fetch limits, compact source warnings, no-source JSON requests, pasted-source/GitHub JSON requests, multipart file requests with GitHub payload fields, source preview route/client behavior, stale preview state derivation, compact source summary derivation, context menu labels, hidden file input accept policy, source tray file chips, per-file remove labels, `Preview context` naming, metadata-only tray rendering, and retry state preserving source inputs while browser file objects remain usable. Live GitHub network calls remain outside the default automated gate; use injected fetch fixtures for deterministic coverage.
- The Projects agent review surface has focused coverage for serializable idle/running state, retry/clear availability across active-project, saved/running, in-flight save, source-backed last requests, unavailable source file objects, and missing-request cases, plus render coverage for passed and failed validation preflight copy and hidden skipped/old results. Broader authenticated-browser checks still cover live-region semantics, focus handoff, responsive composer/tray layout, source context menu keyboard operation, optional input focus/collapse behavior, and compact result layout rather than relying on a full admin browser fixture.
- Project classification mapper defaults, rank/type/label normalization, and featured/standard grouping sort behavior are covered.
- Public project-card classification pills consume the mapped `projectType` and `labels` fields. The card-local timer, opacity overlap, reduced-motion branch, and assistive-hidden transient layers remain manually verified until the repo gains a lightweight React component test path.
- Desktop standard-card marquee verification is currently pure focus-alignment helper coverage plus quality-gate/accessibility-smoke/manual checks rather than a dedicated component test; mobile and reduced-motion users still receive the grid path.
- Featured project cards prefetch only their guarded `safeVideo` source with `preload="auto"`; standard project cards keep lazy source attachment. The preview hook requests muted inline playback after hover intent, retries on readiness events, and tracks actual `playing` state separately from preview intent. Stable lifecycle branches are covered by `tests/hooks/useHoverPreviewIntent.test.js`; real iOS autoplay policy remains manually verified.
- Admin project validation is covered through pure validation helper tests, the no-write draft validation route is covered for success and shared validation errors, and the Projects agent validation preflight helper is covered for temporary revised drafts without replacing the manual full-editor validation gate.
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
- The local Codex bridge helper is covered with deterministic process fixtures for success, stderr detail, malformed JSON, non-object JSON, validation failure, nonzero exit, and timeout. The Codex runtime metadata helper is covered with deterministic config fixtures for explicit model/reasoning values, comments, missing/empty/unreadable config, unsupported syntax fallback, injected `CODEX_HOME`, and browser-safe output. The Projects agent source bundle, run helpers, admin client, and local route are covered with fake file objects and fake Codex outputs; no unit test invokes real Codex. The real `codex exec` path remains a manual local check through `cmd /c npm run admin:codex-spike`.

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
