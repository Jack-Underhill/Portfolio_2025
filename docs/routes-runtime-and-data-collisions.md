# Routes, Runtime, and Data Collisions

Date: 2026-05-16

## Purpose

This document records runtime paths, route constants, storage paths, singleton IDs, and collision risks that should be centralized or clarified.

## Current Verdict

Several important runtime values are still scattered. This is now a cleanup candidate, not a sign that the architecture is wrong.

Keep the fix small. The goal is one obvious home for important constants, not a broad configuration framework.

## Public Routes

Current active routes:

- `/`
- `/p/:project`
- `/architecture-viewer`

Current files:

- `src/domain/projects/constants.js` owns `PROJECT_ROUTE_PATTERN`.
- `src/domain/projects/routing.js` builds `/p/:project`.
- `src/components/projects/modal/ArchitecturePreview.jsx` also manually builds `/p/:project` return paths.
- `src/main.jsx` detects `/architecture-viewer` and `/admin`.
- `netlify.toml` rewrites `/p/*` and `/architecture-viewer` to `index.html`.

Next actions:

- Centralize public route path constants.
- Keep route parsing/building in domain where it is pure.
- Make components import route helpers instead of rebuilding strings locally.

## Netlify Function Paths

Current active function paths:

- `/.netlify/functions/track-visit`
- `/.netlify/functions/inline-svg`

Current files:

- `src/components/layout/VisitCount.jsx`
- `src/components/projects/viewer/viewerUrl.js`
- `netlify/functions/track-visit.mjs`
- `netlify/functions/inline-svg.js`

Next actions:

- Centralize browser-visible function paths in a tiny browser-safe config module.
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
- `projects/{id}/preview{ext}`

Current issue:

- Project image, video, and architecture image uploads share the same `projects/{id}/preview{ext}` stem.
- Different extensions usually avoid collisions.
- Same-extension uploads can overwrite one another.

Best-practice direction:

- Store each media type under a distinct, stable path.
- Keep paths predictable and project-scoped.

Recommended future convention:

- `projects/{id}/preview-image{ext}`
- `projects/{id}/preview-video{ext}`
- `projects/{id}/architecture{ext}`

## Architecture Diagram Storage

Current viewer trust rule:

- `netlify/functions/inline-svg.js` and `viewerUrl.js` only trust SVGs under:

```txt
/storage/v1/object/public/portfolio-assets/project-architecture/
```

Current admin upload behavior:

- Admin-uploaded architecture images are stored through the same `projects/{id}/preview{ext}` helper as project image/video media.
- Public project rows expose `architecture_image_url`.

Decision:

- Admin-uploaded architecture diagrams should be uploaded to Supabase, stored as the project's architecture diagram, fetched through public project data, and used by the public site.
- The implementation should align the admin upload path with the viewer trust rule.

Open implementation choice:

- Either update the viewer trust rule to accept `projects/{id}/architecture.svg`, or store architecture diagrams under `project-architecture/{id}.svg`.
- Prefer one convention and document it in database docs, server upload utilities, viewer validation, and Netlify function validation.

Recommendation:

- Prefer `projects/{id}/architecture{ext}` for project ownership and collision avoidance.
- If SVG proxying remains SVG-only, allow only `.svg` architecture URLs through the inline viewer proxy.
- Non-SVG architecture images can still render as normal images, but should not go through the inline SVG proxy.

## Collision Definition of Done

This area is stable when:

- Public route strings have one obvious home.
- Function paths have one obvious home.
- Admin API defaults are documented and not duplicated without reason.
- Project media paths cannot overwrite each other by media type.
- Architecture viewer validation matches the admin upload convention.

