# Data Flow Drift

Date: 2026-05-16

## Purpose

This document records where the database, admin UI, public API, and public components do not fully agree. Some drift is legacy from the earlier database shape. Some drift is intentional product direction that has not yet been mapped back into the data flow.

## Current Verdict

The main active drift is contact and skills.

The database and admin backend still treat `skills` as editable rows grouped by old levels. The public site no longer displays skills that way. `Skills.jsx` now renders deliberate static groups such as Core Web Stack, Backend, Data, Infra and Tooling, Languages, and Also Built With.

That means the database is partially legacy for skills. The future direction is not to return to the old `languages` and `experience` display. The future direction is to map the new public skills grouping back into the data flow.

## Contact and Skills

Current database/admin shape:

- Table: `skills`
- Columns include `name` and `level`.
- Admin state uses `proficientTechs` and `experiencingTechs`.
- `server/admin/routes/contact.js` reads and writes skills using levels `proficient` and `experiencing`.
- `src/api/public/contact.js` fetches `skills` and `links`.
- `src/domain/contact/mappers.js` maps skill rows into `languages` and `experience`.

Current public UI shape:

- `src/components/sections/Contact.jsx` consumes only `links`.
- `src/components/sections/Skills.jsx` renders static grouped skills.
- `languages` and `experience` from the contact public mapper are stale and unused.

Decision:

- Treat `languages` and `experience` as stale.
- Do not preserve them as the future public Skills contract.
- Future work should define a new grouped skills data model that matches the public display.
- Once the new model exists, public Skills should consume it through the same boundary pattern as projects/about/contact: database -> public API -> domain mapper -> component.

Next actions:

- Decide the new persisted skills shape. Likely fields: group label, item label, sort order, and publish state.
- Update database schema/migration docs once the shape is chosen.
- Update admin editing to manage grouped skills instead of old proficient/experiencing arrays.
- Update public API and domain mapper to return grouped skills.
- Update `Skills.jsx` to render mapped public data with static fallbacks.
- Remove or rename stale `languages` and `experience` mapper output.

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
- Add tests for mapped links and fallback behavior.

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

- Add a small test around the about mapper and Hero fallback merge behavior when tests are introduced.

