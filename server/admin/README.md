# Admin Server

`server/admin` contains the local Node backend used by the portfolio admin UI.

Use this directory for privileged admin reads and writes that require the Supabase service role key, storage uploads, request validation, and admin-only persistence behavior.

## Scope

- Start the local admin HTTP server on loopback only.
- Serve `/admin-api/*` endpoints for health, bootstrap, About, Contact, Projects, and save-all flows.
- Read and write Supabase tables with the service-role client.
- Validate admin payloads and uploaded files before persistence.
- Upload admin-managed media into the `portfolio-assets` bucket and return public URLs.

Keep this directory free of browser code, React components, public anon-key reads, Netlify function handlers, and frontend-only Vite imports.

## Folders

- `clients/`: owns the Supabase service-role client and storage bucket constant.
- `routes/`: owns admin endpoint handlers, request parsing, validation, and JSON/error responses.
- `utils/`: owns shared server helpers for storage paths, permalink creation, strings, and tech-stack flattening.

## Files

- `index.js`: creates the local HTTP server, applies CORS for the Vite dev origin, and routes `/admin-api/*` requests.
- `routes/bootstrap.js`: loads or saves About, Projects, and Contact data together.
- `routes/about.js`: manages the singleton About row and About media uploads.
- `routes/contact.js`: manages skills, social links, and social icon uploads.
- `routes/projects.js`: manages project section text, projects, project media uploads, ordering, permalink creation, and deleted-project cleanup.
- `routes/requestBody.js`: parses JSON and multipart admin requests, enforces body limits, and attaches uploaded files to state objects.
- `routes/validation.js`: normalizes and validates admin payloads, URLs, arrays, booleans, IDs, and upload file limits.

## Boundary Notes

- This server must stay local-only; `index.js` refuses `NODE_ENV=production` and non-loopback hosts.
- Service-role access belongs here. Browser-facing reads belong in `src/api/public`.
- Pure browser/server-safe constants may come from `src/domain`, but do not import frontend-only modules into this directory.
- Keep UI draft defaults in `src/domain` or admin React code; keep persistence validation and storage writes here.
- Keep detailed architecture and drift notes in `docs/`. This README is only the local map for maintainers reading `server/admin`.

## Current Caveats

- `routes/about.js` and `routes/projects.js` each own singleton IDs for their current table shapes.
- Project media upload paths are owned by `utils/storage.js`: `projects/:id/preview-image.ext`, `projects/:id/preview-video.ext`, and `projects/:id/architecture.ext`.
- Architecture SVG viewer validation and the Netlify inline SVG proxy trust the same project-scoped `projects/:id/architecture.svg` path.
