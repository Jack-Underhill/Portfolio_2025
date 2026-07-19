# Data Flow Drift

Date: 2026-06-29

## Purpose

This document records active mismatches between database, admin UI, public API, domain helpers, and public components.

## Maintenance Rules

- Keep active data-flow mismatches, accepted caveats, and next actions.
- Remove resolved drift unless it remains a current guardrail.
- Preserve detailed implementation history outside this doc.

## Current Verdict

The active drift is limited:

- Projects have aligned persisted classification fields, card-only public classification pills, centralized modal ownership, featured-card guarded video prefetch, and a current mobile/reduced-motion grid plus desktop standard-card marquee presentation. The marquee interaction contract is aligned around assistive-hidden duplicate copies, non-sequential duplicate anchors, and hook-owned primary focus alignment. Empty-state decisions remain open.
- Contact link icon fallbacks remain positional.
- Education and Certifications now use the shared credentials data flow, separate routed admin pages, and static defaults kept only as resilient fallbacks.

## Projects

Current classification flow:

- Table: `projects`
- Columns: `featured_rank`, `project_type`, and `labels`.
- Public read: `src/api/public/projects.js`
- Domain mapper/defaults: `src/domain/projects/mappers.js`
- Draft preview mapper: `src/domain/projects/preview.js`
- Domain grouping helper: `src/domain/projects/viewModel.js`
- Public UI: `src/components/sections/Projects.jsx`
- Admin backend: `server/admin/routes/projects.js` and `server/admin/routes/validation.js`
- Admin UI: `src/admin/projects/editor/ProjectClassificationFields.jsx`

Current admin draft preview flow:

- Project edits remain local unsaved React state until the explicit admin Save action.
- `mapProjectDraftToPreviewProject` maps the active admin project draft into the public modal-compatible shape.
- `ProjectsSection.jsx` renders the mapped draft through the shared `ProjectModal` with admin-local open/close state.
- `src/domain/projects/agentDraft.js` parses agent draft JSON, maps supported fields into a project patch, applies that patch to the active local draft, and serializes safe current project review context.
- `ProjectWorkspaceActions.jsx` exposes Projects-level `+ Add Project`, `Validate Projects`, and `Preview Case Study` actions below the selector.
- `ProjectAgentSection.jsx` renders the Projects `Agent` subsection inputs, local-only `Run Agent`, `Copy draft`, and `Import draft` actions, the owner intent selector, and source inputs. `Revise draft` is the editing intent; `Review only` is analysis-only. Instructions stay separate from source evidence.
- `ProjectAgentSourceInputs.jsx` owns the compact source file and repo controls: the GitHub repository URL input, the `+` file-picker trigger, selected source-file chips, remove actions, file-size labels, source preview trigger, per-file preview status, and metadata-only preview manifest for pasted/file/repo source entries. `ProjectAgentSection.jsx` owns the pasted source-material text area, GitHub URL state, and preview request lifecycle. The browser file accept list mirrors the current curated local-file evidence contract for owner ergonomics: broad UTF-8 developer text/code/config files, safe project filenames such as `Dockerfile` and `README`, direct PDFs, and direct zip bundles; bounded public GitHub repo URLs are collected separately and validated authoritatively by the local admin backend.
- `Run Agent` calls the local admin route through `src/admin/api/adminClient.js`. No-file, pasted-source-only, and GitHub-repo-only runs use JSON; runs with browser `File` objects use multipart with a JSON `payload` field and repeated `sourceFiles` fields. `previewProjectAgentSources` uses the same JSON-or-multipart request shape against `POST /admin-api/projects/agent/sources/preview` and returns only `hasSourceContext`, manifest, warnings, counts, and limit metadata. For revise runs, `server/admin/agent/projectAgentRun.js` applies the normalized patch to a temporary active-draft copy through `server/admin/agent/projectAgentValidationPreflight.js`, validates a one-project payload with the existing Projects validation rules, and returns `validationPreflight` as advisory success-result data. `ProjectsSection.jsx` still applies successful patches to the unsaved active draft through the same `src/domain/projects/agentDraft.js` contract used by manual imports. For review runs, the server suppresses returned patch fields server-side and returns no revised-draft validation preflight, so no draft fields are returned to the browser.
- `server/admin/routes/projectsAgent.js` is the browser-to-server source request boundary. It parses JSON or multipart, collects pasted source text, uploaded source files, and an optional `githubRepoUrl`, and delegates both preview and run normalization to `server/admin/agent/sourceBundle.js`. The source bundle owns source IDs, selected-file count, GitHub delegation, aggregate source text limits, manifest aggregation, and warning aggregation; `server/admin/agent/sourceIngestion/textSource.js`, `pdfSource.js`, `zipSource.js`, `zipEntryNormalizer.js`, `fileSource.js`, `githubSource.js`, and `sourceIngestion/github/*` own UTF-8 text/code policy, PDF text extraction, in-memory zip filtering/extraction, direct-file dispatch, and public GitHub URL/API/path/tree/file normalization.
- `ProjectAgentRunPanel.jsx` renders the post-run review surface for running, succeeded, and failed states. Successful runs report changed fields, applied fields, advisory validation preflight status and errors when present, source manifest entries, notes, warnings, elapsed time, and derived run-plan copy when available; Retry reruns the last submitted intent, instructions, pasted source, GitHub repository URL, and still-live source file objects against the current active draft; Clear result hides the visible run summary without mutating project draft fields or selected source inputs. The import and context fallback panels live in `ProjectDraftImportPanel.jsx` and `ProjectDraftContextPanel.jsx`.
- Newly selected image, video, and architecture files are previewed through temporary object URLs owned by admin UI state and revoked after use.
- `POST /admin-api/projects/validate` validates the current projects payload without Supabase writes or storage uploads; `validateProjectDraft` is the browser helper.

Agent draft import decision:

- Supported payloads are pasted JSON or the first fenced `json` block with content fields only.
- Import preserves identity, routing, sort order, media URLs, selected media file objects, and derived `techTags`; unknown keys are ignored with warnings.
- Missing supported keys preserve the active project draft, while present empty strings or arrays intentionally clear those supported fields.
- Import and local Codex revise runs do not save, upload, call Supabase, persist drafts, or bypass Validate Projects, Preview Case Study, or explicit Save. Revise run validation preflight checks only the temporary active draft submitted with the run and remains advisory; full manual validation is still authoritative for the editor state. Local Codex review runs do not edit the draft.
- Projects agent source material is transient request context. Pasted source text, selected file contents, extracted PDF text, zip entry contents, and fetched GitHub file contents are not uploaded to Supabase storage, written to disk, persisted as project data, saved as run history, or exposed to public portfolio visitors. Source preview and run results return manifests, warnings, counts, and limit metadata only, not raw source text. Preview is advisory; the run route rebuilds the source bundle from the submitted browser `File` objects, pasted source, and current GitHub repo URL at run time.
- Current project context export separates read-only `projectContext` from importable `draft` content so existing-project agent review has context without creating an identity/media mutation path.

Current public presentation flow:

- `Projects.jsx` fetches once, maps once, and calls `groupProjectsForDisplay`.
- `FeaturedProjectsGroup.jsx` renders featured projects under the `#Projects` anchor and is the only project group that opts cards into video prefetch.
- `StandardProjectsGroup.jsx` renders standard projects under the `#ProjectGallery` anchor. Mobile users and reduced-motion users receive the existing responsive grid; non-mobile users without reduced-motion preference receive a horizontal `ProjectMarquee` of full `ProjectCard` cards.
- `ProjectCard.jsx` renders `ProjectClassificationPills.jsx` immediately below card media and above card descriptions when `projectType`, `labels`, or both are available. The type pill is stable, and the display-label pill cycles through curated labels every four seconds for users without reduced motion.
- Modal routing uses one flattened featured-plus-standard list from `Projects.jsx`, and `ProjectModal` is rendered once from `Projects.jsx`.
- `ProjectCard.jsx` remains the source-selection boundary for project videos. Featured prefetch uses the guarded `safeVideo` value, so plain Vite local development warms the bundled placeholder while production-capable environments can warm real project videos. Card-local lifecycle and actual playback state remain owned by `useHoverPreviewIntent.js`; `VideoGlowFrame.jsx` receives explicit video-visibility and glow booleans.

Decision:

- Featured projects are selected by non-null `featured_rank`, not by hardcoded component IDs.
- Featured projects sort by `featuredRank`, then `sortOrder`, then `id`; standard projects sort by `sortOrder`, then `id`.
- Featured project video prefetch uses `preload="auto"` as a browser hint and retains the attached source after preview deactivation. Standard project videos remain lazy and release their source on preview release. Preview intent and actual `playing` state stay separate so prefetched thumbnails remain visible until playback begins.
- `project_type` is constrained to `school`, `internship`, `competition`, `personal`, `client`, or `open-source`. Use `competition` for hackathons, game jams, and similar limited-time competitive work.
- `labels` stay as optional JSON curated card copy, including finer context such as `Hackathon`, `Game Jam`, `Club`, event names, or duration. Public cards render one cycling display-label pill, while filters, analytics, modal label sections, and cross-project metadata remain out of scope until a new product decision expands the model.
- Decide whether the current two peer page sections are intended, or whether `Projects.jsx` should restore one top-level Projects wrapper with child groups.

Next actions:

- Keep `groupProjectsForDisplay` as the current grouping and sorting source.
- Move global loading and zero-project empty state decisions back to `Projects.jsx` if per-group empty states are not accepted.
- Hide empty group headings, or explicitly document that empty groups should remain visible.
- Keep public label display card-only unless a future phase intentionally adds modal, filter, analytics, search, or metadata behavior.
- Preserve the standard-card marquee guardrails when refining project cards: duplicate marquee copies stay `aria-hidden`, duplicate card anchors stay out of sequential focus with `tabIndex="-1"`, visible duplicates remain pointer-interactive, primary focus alignment stays owned by `useProjectMarqueeMotion`, reduced-motion stays a grid fallback, and modal ownership stays in `Projects.jsx`.

## Contact Links

Current flow:

- Database table `links` stores social/contact rows with `published` as the public visibility flag.
- Admin contact editor can edit labels, URLs, uploaded icons, and published state.
- Admin reads use the service-role path and keep both published and unpublished links editable.
- Public contact fetch requests published links only, and the Contact mapper defensively drops rows with `published === false`.
- Public anon RLS for `links` is published-only.
- `Contact.jsx` merges mapped links with static fallback icons.

Known caveat:

- Link icon fallbacks remain positional; this is accepted because admin-managed Contact links are expected to keep icons. If the database order changes or a DB row omits an icon, the public component may use a fallback icon from the same index rather than from a stable platform key.

Next actions:

- Consider storing a stable platform key if icon fallback accuracy matters.
- Keep existing contact mapper and admin validation tests updated if the link visibility or fallback strategy changes.

## Credentials

Current flow:

- Table: `credentials`
- Public read: `src/api/public/credentials.js`
- Domain mapper/defaults: `src/domain/credentials`
- Public UI: `src/components/sections/Education.jsx`, `src/components/sections/Certifications.jsx`, and `src/components/credentials/*`
- Admin backend: `server/admin/routes/credentials.js` and `server/admin/routes/validation.js`
- Admin UI: `/admin/education` and `/admin/certifications`, composed from `src/admin/pages/*AdminPage.jsx` and `src/admin/credentials/CredentialGroupEditor.jsx`

Decision:

- Education and Certification rows share one credentials table and stay distinct through `credential_kind`.
- Public rows are mapped into card-facing fields before rendering.
- Static Education and Certification defaults remain as fallback content when a public read is unavailable or a kind has no usable live rows.
- Bundled credential logos are selected through stable `logoKey` values; optional `logoUrl` values win at the UI boundary. Logo upload is deferred.
- Admin saves use small replacement-save behavior because credentials are compact display content.
- Admin page separation is presentation-only; `credentialsState` and the save-all payload remain grouped as `{ education, certifications }`.

Next actions:

- Keep mapper and validation tests aligned whenever credential fields change.
- Keep live Supabase checks out of the default gate unless they are explicitly mocked or manually requested.
- Add upload UI only if credential logo management becomes more than bundled keys or public URLs.
