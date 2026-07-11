# Admin Server

`server/admin` contains the local Node backend used by the portfolio admin UI.

Use this directory for privileged admin reads and writes that require the Supabase service role key, storage uploads, request validation, and admin-only persistence behavior.

## Scope

- Start the local admin HTTP server on loopback only.
- Serve `/admin-api/*` endpoints for health, bootstrap, About, Contact, Skills, Credentials, Projects, project draft validation, Projects agent run/runtime metadata, and save-all flows.
- Read and write Supabase tables with the service-role client.
- Validate admin payloads and uploaded files before persistence.
- Upload admin-managed media into the `portfolio-assets` bucket and return public URLs.

Keep this directory free of browser code, React components, public anon-key reads, Netlify function handlers, and frontend-only Vite imports.

## Folders

- `agent/`: owns the local-only Codex bridge, controlled terminal harness, Projects agent intent/run-plan helpers, prompt/run helpers, source bundle normalization, browser-safe Codex runtime metadata, and strict agent output validation.
- `clients/`: owns the Supabase service-role client and storage bucket constant.
- `routes/`: owns admin endpoint handlers, request parsing, validation, and JSON/error responses.
- `utils/`: owns shared server helpers for storage paths, permalink creation, strings, and tech-stack flattening.

## Files

- `index.js`: creates the local HTTP server, applies CORS for the Vite dev origin, and routes `/admin-api/*` requests.
- `routes/bootstrap.js`: loads or saves About, Projects, Contact, Skills, and Credentials data together.
- `routes/about.js`: manages the singleton About row and About media uploads.
- `routes/contact.js`: manages social links, published state, and social icon uploads.
- `routes/skills.js`: manages grouped Skills rows with service-role replacement saves.
- `routes/credentials.js`: manages Education and Certification rows with service-role replacement saves.
- `routes/projects.js`: manages project section text, projects, project draft validation, project media uploads, ordering, permalink creation, and deleted-project cleanup.
- `routes/projectsAgent.js`: exposes the local-only `POST /admin-api/projects/agent/run`, `POST /admin-api/projects/agent/sources/preview`, and `GET /admin-api/projects/agent/runtime` routes, accepts JSON or multipart source-backed requests, and delegates source bundling, Codex orchestration, and runtime metadata resolution to `agent/`.
- `routes/requestBody.js`: parses JSON and multipart admin requests, enforces body limits, and exposes uploaded file collections to route handlers.
- `routes/validation.js`: normalizes and validates admin payloads, URLs, arrays, booleans, IDs, and upload file limits.

## Boundary Notes

- This server must stay local-only; `index.js` refuses `NODE_ENV=production` and non-loopback hosts.
- Service-role access belongs here. Browser-facing reads belong in `src/api/public`.
- Pure browser/server-safe constants may come from `src/domain`, but do not import frontend-only modules into this directory.
- Keep UI draft defaults in `src/domain` or admin React code; keep persistence validation and storage writes here.
- Keep detailed architecture and drift notes in `docs/`. This README is only the local map for maintainers reading `server/admin`.

## Current Caveats

- `npm run admin:codex-spike` remains the terminal Phase 0 Codex bridge check. The Projects agent route invokes the logged-in local Codex runtime through `codex exec --cd <repo-root> --sandbox read-only --ephemeral --color never -` and does not require or pass `OPENAI_API_KEY`.
- The browser-facing Projects agent run resolves the local Codex executable from the latest installed OpenAI VS Code extension on this Windows machine. The spike command still supports `CODEX_BRIDGE_COMMAND` or `codex` on `PATH` for low-level bridge checks.
- `agent/codexRuntimeMetadata.js` owns the browser-safe Projects agent model metadata label. It reads only Codex `config.toml` model fields, exposes the configured model or `Codex default` through `GET /admin-api/projects/agent/runtime`, and does not expose auth files or raw config contents.
- The Codex bridge is the selected local path. No SDK dependency is installed; revisit SDK options only if `codex exec` proves unreliable while still preserving the no-OpenAI-API-key requirement.
- The Projects agent route accepts owner intent, not a user-selected mode. `revise` is the only editing intent and can return supported patch fields for the active unsaved draft. `review` derives either `review-current-case-study` or `review-with-source-context`, analyzes only, and suppresses any returned patch fields server-side before the browser can apply them.
- Run-plan derivation lives in `agent/projectAgentRunPlan.js`: revise on an effectively empty draft generates a new case study, revise on a non-empty draft revises the current case study, source-backed revise runs use `revise-with-source-context`, and source-backed review runs use `review-with-source-context`.
- Source material for Projects agent runs is transient request context. Browser no-file and pasted-source-only requests stay JSON; requests with selected local source files use multipart with a JSON `payload` part and repeated `sourceFiles` entries. `POST /admin-api/projects/agent/sources/preview` uses the same request shape and source bundle helper as the run route, returns only manifest/count/warning metadata, and never invokes Codex.
- `agent/sourceBundle.js` owns source IDs, file-count limits, aggregate source text limits, source manifests, and skipped-source warning aggregation. Source extraction remains under `agent/sourceIngestion/`: `fileSource.js` dispatches direct files, `textSourcePolicy.js` owns text filename/media/disallowed-name policy, `textSource.js` owns UTF-8 text/code/notebook normalization, `pdfSource.js` owns in-memory PDF text extraction through `pdf-parse`, `zipSource.js` and `zipEntryNormalizer.js` own in-memory archive inspection through `jszip`, `validation/` owns reusable file/text/byte validation helpers, and `sourcePathUtils.js` plus `sourceResult.js` own shared path/result primitives. These local-only dependencies do not shell out, add OCR, or expose browser-side parsing authority.
- The deferred GitHub repository source helper is isolated behind `agent/sourceIngestion/githubSource.js` and focused `agent/sourceIngestion/github/` modules for URL parsing, API fetch handling, path filtering, tree selection, manifest metadata, and file normalization. It is characterization-tested with injected fetch fixtures, but GitHub repo URLs are not yet wired into `sourceBundle.js`, routes, browser UI, prompt runs, or retry behavior.
- Supported curated evidence includes pasted text, broad UTF-8 developer text/code/config files, safe extensionless project files such as `Dockerfile` and `README`, direct PDFs, and direct zip archives containing supported text/code or PDF entries. The server rejects or skips secret-like names, binary/database dumps, generated/minified bundles, unsupported extensions, unreadable/undecodable files, nested archives, unsafe zip paths, dependency/build/generated zip folders, and over-limit files with metadata-only warnings. Extracted source text and zip entries are not written to disk, uploaded to Supabase, persisted as project data, saved as run history, or returned to the browser in preview or run results.
- `routes/about.js` and `routes/projects.js` each own singleton IDs for their current table shapes.
- Project media upload paths are owned by `utils/storage.js`: `projects/:id/preview-image.ext`, `projects/:id/preview-video.ext`, and `projects/:id/architecture.ext`.
- Architecture SVG viewer validation and the Netlify inline SVG proxy trust the same project-scoped `projects/:id/architecture.svg` path.
- Project classification validation accepts optional integer `featuredRank`, optional `projectType` values of `school`, `internship`, `competition`, `personal`, `client`, or `open-source`, and normalized display `labels`. Use `competition` for hackathons, game jams, and similar limited-time competitive work; keep event details in `labels`.
- Contact links use `published` for public visibility; service-role admin reads and replacement saves keep unpublished links editable.
- `POST /admin-api/projects/validate` reuses project state validation for draft feedback without calling service-role write methods or storage upload helpers.
- Credentials use simple replacement saves because the table is small display content; first-pass logo editing accepts known bundled keys (`wsu`, `edcc`, `microsoft`) or an optional public logo URL.
