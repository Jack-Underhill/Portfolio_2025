# Database

This folder documents the Supabase data contract used by the portfolio. It is the source of truth for table names, expected columns, public read access, local admin writes, and storage bucket conventions.

The current app uses browser-safe public reads from `src/api/public/*` and privileged local admin writes from `server/admin/*`. Domain mappers in `src/domain/*` shape rows for the UI, but they do not own persistence.

## Setup Order

Apply SQL in this order when setting up or refreshing a Supabase project:

1. `migrations/0001_current_portfolio_schema.sql`
2. `migrations/0002_public_read_policies.sql`
3. `migrations/0003_grouped_skills.sql`

Use `schema.sql` as the readable snapshot of the desired current schema. Do not apply destructive SQL to a live project without confirming the live schema and backing up data.

## Tables

Current runtime tables:

- `about`: singleton profile content. Admin upserts `id = 1`; public code reads profile image, profession title, bio, and resume URL.
- `project_section`: singleton project-section intro text. Admin upserts `id = 1`; public code reads `about_projects`.
- `projects`: project cards and modal details, including media URLs, permalink, publish state, sort order, and structured project lists.
- `skills`: grouped Skills rows with display group labels, item labels, sort order, and publish state.
- `links`: contact/social link rows with optional uploaded icon URL.

`database/schema.sql` owns the detailed column list.

## Access Boundary

Public frontend:

- Runs from `src`.
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Reads only portfolio display data through `src/api/public/*`.
- Filters project cards with `published = true`; RLS policies should enforce the same rule for anon reads.

Local admin backend:

- Runs from `server/admin`.
- Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Performs privileged reads, writes, deletes, and uploads.
- Must remain server-only. Do not reference `SUPABASE_SERVICE_ROLE_KEY` or service-role clients from `src`.

RLS expectation:

- `about`, `project_section`, `skills`, and `links` allow anon `SELECT`.
- `projects` allows anon `SELECT` only when `published IS TRUE`.
- No anon insert, update, delete, or storage upload policies are expected for this portfolio.
- Service-role admin operations run from `server/admin` and bypass RLS.

## Storage

Expected Supabase Storage bucket:

- `portfolio-assets`

The bucket is public so generated asset URLs can be served by the portfolio. Public bucket reads still should not imply public writes; uploads, updates, and deletes are performed only by the local admin backend with the service role key.

Current object path conventions:

- `about/profile{ext}`
- `docs/resume{ext}`
- `links/{slug}{ext}`
- `projects/{id}/preview-image{ext}`
- `projects/{id}/preview-video{ext}`
- `projects/{id}/architecture{ext}`

Existing stored project URLs may still point at older object paths until media is re-uploaded. New admin uploads use distinct image, video, and architecture stems so same-extension project media cannot overwrite another media type.

Architecture SVGs are trusted by the public viewer and `inline-svg` proxy only when they are Supabase public bucket URLs shaped as `projects/{id}/architecture.svg`. Non-SVG architecture files may remain stored in `architecture_image_url`, but they are not inputs for the SVG proxy.

## Evolving Fields

### Skills Backfill

`migrations/0003_grouped_skills.sql` removes the old `skills.name` and `skills.level` columns after backfilling existing rows into grouped columns. Existing legacy rows become unpublished `Imported Proficient` or `Imported Experiencing` grouped rows, preserving the labels without making them the new public Skills display by accident.

Run `npm run backup:supabase` before applying that migration to a live Supabase project. The current static Skills groups remain the public fallback source until grouped rows are curated and published.

---

When adding or changing a persisted portfolio field, update the matching files in the same substep:

- SQL snapshot and migrations in `database/`.
- Public select list in `src/api/public/*` if the public site reads it.
- Domain mapper/default in `src/domain/*`.
- Admin route serializer and reader in `server/admin/routes/*`.
- Admin validation in `server/admin/routes/validation.js`.
- This README or related database notes if the field changes setup expectations.

Keep SQL explicit and project-specific. Prefer `jsonb` for structured project arrays and objects already handled as structured data by the app.

## Verification

Useful local checks:

```sh
npm run check:schema
npm run build
rg "project_cards" database src server planning README.md
rg "SUPABASE_SERVICE_ROLE_KEY|VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin" src
```

Prefer the documented npm script for these checks.

References:

- Supabase Storage bucket access models: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage RLS and service-key behavior: https://supabase.com/docs/guides/storage/security/access-control
