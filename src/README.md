# Source

`src` contains the browser application code for the portfolio, including the public site, the development-only admin UI, shared frontend data access, domain helpers, hooks, styles, and static assets.

Use this directory for code that is bundled by Vite and safe to run in the browser.

## Entry Points

- `main.jsx`: selects the root surface from the current route.
- `App.jsx`: renders the public portfolio page.
- `admin/AppAdmin.jsx`: renders the admin UI in development on `/admin`.
- `components/projects/viewer/ArchitectureViewer.jsx`: renders the standalone `/architecture-viewer` surface.
- `index.css`: imports Tailwind and shared theme styles.

## Route Surfaces

- `/`: public portfolio.
- `/p/:project`: public portfolio with a project modal opened from route state.
- `/architecture-viewer`: focused architecture diagram viewer.
- `/admin`: development-only admin UI; `main.jsx` only mounts it when `import.meta.env.DEV` is true.

## Folders

- `admin/`: React admin UI, form controls, project editors, admin navigation, and the browser client for the local admin backend.
- `api/`: browser-safe public data readers and public Supabase client. See `src/api/README.md`.
- `assets/`: bundled images, icons, logos, and videos used by the public site.
- `components/`: public portfolio components, section components, project modal/viewer components, and shared UI primitives.
- `domain/`: pure data mappers, route helpers, defaults, and browser/server-safe domain constants. See `src/domain/README.md`.
- `hooks/`: reusable React hooks for browser lifecycle behavior and shared UI state. See `src/hooks/README.md`.
- `runtime/`: tiny browser runtime helpers, including public route constants, browser-visible Netlify function paths, and Netlify function availability.
- `styles/`: shared theme tokens, global CSS utilities, and reusable admin class recipes. See `src/styles/README.md`.

## Data Boundaries

- Public browser reads go through `src/api/public` and use anon-safe Supabase access.
- Privileged writes go through the local admin backend in `server/admin`; browser admin code calls it through `src/admin/api/adminClient.js`.
- Pure row shaping and route semantics belong in `src/domain`.
- Netlify serverless handlers live in `netlify/functions` and should be called over `/.netlify/functions/*`, not imported into browser code.

## UI Boundaries

- Keep presentational markup in `components/` or `admin/`.
- Keep reusable lifecycle behavior in `hooks/`.
- Keep repeated styling tokens and admin class recipes in `styles/`.
- Keep one-off layout and component-specific classes near the component that uses them.

## Local Development Notes

- The public portfolio can run with plain Vite.
- Admin editing needs the local admin server from `server/admin` and the `VITE_ADMIN_API_BASE_URL` setting if the default `http://localhost:8787/admin-api` is not used.
- Netlify functions such as visit tracking and inline SVG proxying need Netlify Dev for local testing.

## Current Caveats

- Singleton IDs and local admin defaults still live at their owning runtime boundaries.
- Skills have their own grouped public/admin flow and static grouped fallbacks; Contact owns links only.
- Keep detailed architecture status and cleanup notes in `docs/`; this README is the local map for maintainers working inside `src`.
