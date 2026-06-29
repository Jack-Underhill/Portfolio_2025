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

- `agent/`: owns the local-only Codex bridge, controlled terminal harness, Projects agent intent/run-plan helpers, prompt/run helpers, browser-safe Codex runtime metadata, and strict agent output validation.
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
- `routes/projectsAgent.js`: exposes the local-only `POST /admin-api/projects/agent/run` route plus `GET /admin-api/projects/agent/runtime`, delegating Codex orchestration and runtime metadata resolution to `agent/`.
- `routes/requestBody.js`: parses JSON and multipart admin requests, enforces body limits, and attaches uploaded files to state objects.
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
- The Projects agent route accepts owner intent, not a user-selected mode. `revise` is the only editing intent and can return supported patch fields for the active unsaved draft. `review` derives the `review-current-case-study` run plan, analyzes only, and suppresses any returned patch fields server-side before the browser can apply them.
- Run-plan derivation lives in `agent/projectAgentRunPlan.js`: revise on an effectively empty draft generates a new case study, revise on a non-empty draft revises the current case study, and future source-context revision has a defined run-plan placeholder without source ingestion wired yet.
- `routes/about.js` and `routes/projects.js` each own singleton IDs for their current table shapes.
- Project media upload paths are owned by `utils/storage.js`: `projects/:id/preview-image.ext`, `projects/:id/preview-video.ext`, and `projects/:id/architecture.ext`.
- Architecture SVG viewer validation and the Netlify inline SVG proxy trust the same project-scoped `projects/:id/architecture.svg` path.
- Project classification validation accepts optional integer `featuredRank`, optional `projectType` values of `school`, `internship`, `competition`, `personal`, `client`, or `open-source`, and normalized display `labels`. Use `competition` for hackathons, game jams, and similar limited-time competitive work; keep event details in `labels`.
- Contact links use `published` for public visibility; service-role admin reads and replacement saves keep unpublished links editable.
- `POST /admin-api/projects/validate` reuses project state validation for draft feedback without calling service-role write methods or storage upload helpers.
- Credentials use simple replacement saves because the table is small display content; first-pass logo editing accepts known bundled keys (`wsu`, `edcc`, `microsoft`) or an optional public logo URL.
