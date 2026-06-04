# Database

This folder documents the Supabase data contract used by the portfolio. It is the source of truth for table names, expected columns, public read access, local admin writes, and storage bucket conventions.

The current app uses browser-safe public reads from `src/api/public/*` and privileged local admin writes from `server/admin/*`. Domain mappers in `src/domain/*` shape rows for the UI, but they do not own persistence.

## Setup Order

Apply SQL in this order when setting up or refreshing a Supabase project:

1. `migrations/0001_current_portfolio_schema.sql`
2. `migrations/0002_public_read_policies.sql`
3. `migrations/0003_grouped_skills.sql`
4. `migrations/0004_project_classification.sql`
5. `migrations/0005_credentials.sql`
6. `migrations/0006_project_type_competition.sql`

Use `schema.sql` as the readable snapshot of the desired current schema. Do not apply destructive SQL to a live project without confirming the live schema and backing up data.

## Tables

Current runtime tables:

- `about`: singleton profile content. Admin upserts `id = 1`; public code reads profile image, profession title, bio, and resume URL.
- `project_section`: singleton project-section intro text. Admin upserts `id = 1`; public code reads `about_projects`.
- `projects`: project cards and modal details, including media URLs, permalink, publish state, sort order, classification fields, labels, and structured project lists.
- `skills`: grouped Skills rows with display group labels, item labels, sort order, and publish state.
- `credentials`: Education and Certification card rows, split by `credential_kind`, with highlight chips, issue labels, optional GPA, logo keys/URLs, publish state, and sort order.
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
- `projects` and `credentials` allow anon `SELECT` only when `published IS TRUE`.
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

Credential logos currently use bundled UI assets through stable `logo_key` values (`wsu`, `edcc`, and `microsoft`) or an optional public `logo_url`. UI-facing code should let `logo_url` win over `logo_key`. Credential logo uploads are not part of the first credentials persistence pass.

Existing stored project URLs may still point at older object paths until media is re-uploaded. New admin uploads use distinct image, video, and architecture stems so same-extension project media cannot overwrite another media type.

Architecture SVGs are trusted by the public viewer and `inline-svg` proxy only when they are Supabase public bucket URLs shaped as `projects/{id}/architecture.svg`. Non-SVG architecture files may remain stored in `architecture_image_url`, but they are not inputs for the SVG proxy.

## Evolving Fields

### Project Classification

`migrations/0004_project_classification.sql` adds optional project classification fields. `migrations/0006_project_type_competition.sql` updates the current `project_type` constraint:

- `featured_rank`: nullable integer. `NULL` means the project is not featured; lower numbers sort first for featured projects.
- `project_type`: nullable primary classification constrained to `school`, `internship`, `competition`, `personal`, `client`, or `open-source`.
- `labels`: nullable JSONB array for curated display labels available to public card/detail view models.

Existing project rows remain valid without classification values. Use `competition` for hackathons, game jams, and similar limited-time competitive work; keep finer context such as `Hackathon`, `Game Jam`, `Club`, event names, or duration in `labels`. Public mappers and admin validation should treat these fields as optional and normalize display labels before rendering or saving. Labels remain nullable JSONB display copy, not normalized metadata. Public cards currently render them through one cycling classification pill, while modal label sections, filters, analytics, and cross-project metadata remain out of scope.

Public grouping uses `src/domain/projects/viewModel.js`: featured projects are rows with a valid `featured_rank`, sorted by featured rank, `sort_order`, then `id`; standard projects sort by `sort_order`, then `id`.

### Skills Backfill

`migrations/0003_grouped_skills.sql` removes the old `skills.name` and `skills.level` columns after backfilling existing rows into grouped columns. Existing legacy rows become unpublished `Imported Proficient` or `Imported Experiencing` grouped rows, preserving the labels without making them the new public Skills display by accident.

Run `npm run backup:supabase` before applying that migration to a live Supabase project. Grouped Skills rows and labels are populated in the live database; the static grouped Skills defaults remain only as resilient public fallbacks when the public read is unavailable or returns no usable rows.

### Credentials

`migrations/0005_credentials.sql` adds the `credentials` runtime table for Education and Certifications. The table uses `credential_kind` to keep the two public sections distinct while sharing the same storage shape:

- `credential_kind`: constrained to `education` or `certification`.
- `title` and `organization`: required display fields.
- `credential_type`, `description`, `issued_label`, and `gpa`: optional display copy. `gpa` is intended for education rows.
- `highlights`: nullable JSONB string array for card chips.
- `credential_url`: optional official page or credential link.
- `logo_url`: optional public image URL.
- `logo_key`: optional bundled logo key resolved outside the domain layer.
- `logo_scale`: optional numeric display scale.
- `published` and `sort_order`: public visibility and ordering inside each kind.

Anon reads are policy-limited to published rows. Local admin saves should translate card-facing fields to these columns and keep service-role writes inside `server/admin`.

Live credential rows have been populated from the domain fallback defaults. Run `npm run backup:supabase` before changing live credential data; the backup script includes `credentials` alongside the other runtime tables. The one-time guarded population helper is `node --env-file=.env.local scripts/seed-credentials.mjs`; it refuses to overwrite existing rows unless `--replace` is passed after a fresh backup.

---

When adding or changing a persisted portfolio field, update the matching files in the same scoped change:

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
rg "project_cards" database src server docs README.md
rg "SUPABASE_SERVICE_ROLE_KEY|VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin" src
```

Prefer the documented npm script for these checks.

References:

- Supabase Storage bucket access models: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage RLS and service-key behavior: https://supabase.com/docs/guides/storage/security/access-control
