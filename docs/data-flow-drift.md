# Data Flow Drift

Date: 2026-05-16

## Purpose

This document records where the database, admin UI, public API, and public components do not fully agree. Some drift is legacy from the earlier database shape. Some drift is intentional product direction that has not yet been mapped back into the data flow.

## Current Verdict

The main Skills and Contact drift has been resolved.

Skills now use one grouped data flow: database rows, browser-safe public fetch, pure domain mapper/defaults, public `Skills.jsx`, local admin route, and admin Skills editor all agree on grouped rows with labels, sort order, and publish state. Contact owns contact/social links only.

## Skills

Current flow:

- Table: `skills`
- Columns: `group_label`, `label`, `group_sort_order`, `item_sort_order`, and `published`.
- Public read: `src/api/public/skills.js`
- Domain mapper/defaults: `src/domain/skills/mappers.js` and `src/domain/skills/defaults.js`
- Public UI: `src/components/sections/Skills.jsx`
- Admin backend: `server/admin/routes/skills.js`
- Admin UI: `src/admin/sections/SkillsSection.jsx`

Decision:

- Skills are no longer coupled to Contact.
- The public Skills section uses grouped database rows when available and falls back to static grouped defaults when public data is missing, empty, or errored.
- Admin Skills saves use simple full-table replacement after validation normalizes row order and publish state.

Next actions:

- Keep `database/migrations/0003_grouped_skills.sql` in setup order for live Supabase migration.
- Run `npm run backup:supabase` before applying the grouped Skills migration to live data.
- Curate and publish grouped Skills rows in Supabase when ready; static defaults remain the resilient public fallback.

## Contact Links

Contact links are mostly aligned.

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

## Education and Certifications

Education and certifications are not current drift. They are static by design right now.

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

## About and Hero

The Hero resume fallback mismatch from the latest audit appears fixed.

Current flow:

- Database column `about.resume_pdf`.
- Public mapper returns `resumeUrl`.
- `Hero.jsx` default data uses `resumeUrl`.
- `Hero.jsx` merge function preserves previous fallback values when public data is empty.

Next actions:

- Keep existing about mapper and Hero fallback merge tests updated if the public about shape changes.
