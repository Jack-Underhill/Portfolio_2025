# Data Flow Drift

Date: 2026-05-19

## Purpose

This document records active mismatches between database, admin UI, public API, domain helpers, and public components.

## Maintenance Rules

- Keep active data-flow mismatches, accepted caveats, and next actions.
- Remove resolved drift unless it remains a current guardrail.
- Preserve detailed implementation history outside this doc.

## Current Verdict

The active drift is limited:

- Projects have aligned persisted classification fields and centralized modal ownership, but the public presentation still needs explicit label-display and empty-state decisions.
- Contact link icon fallbacks remain positional.
- Education and Certifications are intentionally static until a database/admin/public flow is designed.

## Projects

Current classification flow:

- Table: `projects`
- Columns: `featured_rank`, `project_type`, and `labels`.
- Public read: `src/api/public/projects.js`
- Domain mapper/defaults: `src/domain/projects/mappers.js`
- Domain grouping helper: `src/domain/projects/viewModel.js`
- Public UI: `src/components/sections/Projects.jsx`
- Admin backend: `server/admin/routes/projects.js` and `server/admin/routes/validation.js`
- Admin UI: `src/admin/projects/editor/ProjectClassificationFields.jsx`

Current public presentation flow:

- `Projects.jsx` fetches once, maps once, and calls `groupProjectsForDisplay`.
- `FeaturedProjectsGroup.jsx` renders featured projects under the `#Projects` anchor.
- `StandardProjectsGroup.jsx` renders standard projects under the `#ProjectGallery` anchor.
- Modal routing uses one flattened featured-plus-standard list from `Projects.jsx`, and `ProjectModal` is rendered once from `Projects.jsx`.

Decision:

- Featured projects are selected by non-null `featured_rank`, not by hardcoded component IDs.
- Featured projects sort by `featuredRank`, then `sortOrder`, then `id`; standard projects sort by `sortOrder`, then `id`.
- `project_type` is constrained to `school`, `internship`, `personal`, `client`, or `open-source`.
- `labels` stay as optional JSON display labels until labels need analytics, filtering, or cross-project metadata.
- Decide whether the current two peer page sections are intended, or whether `Projects.jsx` should restore one top-level Projects wrapper with child groups.

Next actions:

- Keep `groupProjectsForDisplay` as the current grouping and sorting source.
- Move global loading and zero-project empty state decisions back to `Projects.jsx` if per-group empty states are not accepted.
- Hide empty group headings, or explicitly document that empty groups should remain visible.
- Render project labels on cards/details, or keep documenting them as mapped and admin-ready but visually dormant.

## Contact Links

Current flow:

- Database table `links` stores social/contact rows.
- Admin contact editor can edit labels, URLs, and uploaded icons.
- Public contact fetch maps links into `links`.
- `Contact.jsx` merges mapped links with static fallback icons.

Known caveat:

- Link icon fallbacks are positional. If the database order changes or a DB row omits an icon, the public component may use a fallback icon from the same index rather than from a stable platform key.

Next actions:

- Consider storing a stable platform key if icon fallback accuracy matters.
- Keep existing contact mapper tests updated if the link fallback strategy changes.

## Static Education and Certifications

Education and certifications are static by design right now.

Current shape:

- `src/components/sections/Education.jsx` owns static education entries.
- `src/components/sections/Certifications.jsx` owns static certification entries.
- Public database/admin flow does not currently include these sections.

Future direction:

- Education and certifications should eventually move into the same data flow used by other editable content.
- That future flow should include database tables, public fetches, pure domain mappers, admin editing, validation, and tests.

Next actions:

- Keep static source as the current truth until the data model is designed.
- Document future tables before implementation.
- Add tests after mappers exist, not while the data is still static component-local content.
