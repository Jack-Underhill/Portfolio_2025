# Routes, Runtime, and Data Collisions

Date: 2026-05-16

## Purpose

This document records runtime paths, route constants, storage paths, singleton IDs, and collision risks that should be centralized or clarified.

## Current Verdict

Some runtime, storage, and architecture SVG boundary values have been centralized or clarified. The remaining cleanup is narrow and mostly about documenting local runtime expectations and future data-model work.

Keep the fix small. The goal is one obvious home for important constants, not a broad configuration framework.

## Public Routes

Current active routes:

- `/`
- `/p/:project`
- `/architecture-viewer`

Current files:

- `src/runtime/paths.js` owns public route constants.
- `src/domain/projects/constants.js` owns `PROJECT_ROUTE_PATTERN`.
- `src/domain/projects/routing.js` builds `/p/:project`.
- `src/components/projects/modal/ArchitecturePreview.jsx` uses the route helper for `/p/:project` return paths.
- `src/main.jsx` detects `/architecture-viewer` and `/admin`.
- `netlify.toml` rewrites `/p/*` and `/architecture-viewer` to `index.html`.

Next actions:

- Keep route parsing/building in domain where it is pure.

## Netlify Function Paths

Current active function paths:

- `/.netlify/functions/track-visit`
- `/.netlify/functions/inline-svg`

Current files:

- `src/runtime/paths.js`
- `src/components/layout/VisitCount.jsx`
- `src/components/projects/viewer/viewerUrl.js`
- `netlify/functions/track-visit.mjs`
- `netlify/functions/inline-svg.js`

Next actions:

- Document local testing requirements for Netlify functions.

## Admin Runtime Paths

Current admin paths:

- `/admin`
- `/admin-api`
- `http://localhost:8787/admin-api`
- CORS origin `http://localhost:5173`

Current files:

- `src/main.jsx`
- `src/admin/api/adminClient.js`
- `server/admin/index.js`

Next actions:

- Keep the admin backend local-only.
- Consider centralizing admin defaults in a server-safe module or documenting them in `server/admin/README.md`.
- Avoid importing frontend/Vite-only modules from server code.

## Singleton IDs

Current singleton IDs:

- `ABOUT_ID = 1` in `server/admin/routes/about.js`.
- `PROJECT_SECTION_ID = 1` in `src/api/public/projects.js`.
- `PROJECT_SECTION_ID = 1` in `server/admin/routes/projects.js`.

Next actions:

- Centralize singleton IDs only if a shared module can stay dependency-free and safe for both browser and Node.
- At minimum, document singleton IDs in database docs.

## Storage Bucket and Object Paths

Current bucket:

- `portfolio-assets`

Current object paths:

- `about/profile{ext}`
- `docs/resume{ext}`
- `links/{slug}{ext}`
- `projects/{id}/preview-image{ext}`
- `projects/{id}/preview-video{ext}`
- `projects/{id}/architecture{ext}`

Current behavior:

- New project image, video, and architecture uploads use distinct media-type stems.
- Existing stored URLs may still point at older objects until re-uploaded.

Path direction:

- Store each media type under a distinct, stable path.
- Keep paths predictable and project-scoped.

## Architecture Diagram Storage

Current admin upload behavior:

- Admin-uploaded architecture images are stored under `projects/{id}/architecture{ext}`.
- Public project rows expose `architecture_image_url`.

Current SVG trust rule:

- `netlify/functions/inline-svg.js` and `viewerUrl.js` only trust project-scoped Supabase SVGs with this path shape:

```txt
/storage/v1/object/public/portfolio-assets/projects/{id}/architecture.svg
```

Notes:

- The inline SVG proxy remains SVG-only.
- Non-SVG architecture images can render as normal images in supported UI, but they should not go through the inline SVG proxy.
- Older `project-architecture/*.svg` URLs are not trusted by the current viewer/proxy contract.

## Collision Definition of Done

This area is stable when:

- Public route strings have one obvious home.
- Function paths have one obvious home.
- Admin API defaults are documented and not duplicated without reason.
- Project media paths cannot overwrite each other by media type.
- Architecture viewer validation matches the admin upload convention.
