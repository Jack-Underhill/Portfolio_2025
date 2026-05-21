# Domain

`src/domain` contains small, dependency-light helpers that describe portfolio data shapes and route semantics.

Use this directory for pure transformations and shared domain constants that need to work from both browser code and server/admin code.

## Scope

- Map raw database rows into public API objects or frontend view models.
- Normalize optional text, string arrays, and array-shaped values.
- Build and parse project routes such as `/p/:project`.
- Provide editable defaults for project drafts and empty project details.
- Share project constants, including tech stack keys and route patterns.

Keep this directory free of React components, browser lifecycle code, API clients, database clients, request handlers, and storage upload behavior.

## Folders

- `about/`: maps the singleton About row into the public About shape.
- `contact/`: maps contact links into the public Contact shape.
- `projects/`: owns project row mappers, draft preview mapping, agent draft import/context helpers, view-model helpers, project route helpers, editable draft defaults, and project-specific constants.
- `shared/`: holds generic normalization helpers used by feature folders.
- `skills/`: owns grouped Skills defaults and row mapping for the public Skills section.

## Boundary Notes

- Domain modules should be side-effect free and safe to import from Node or the browser.
- Prefer camelCase for public/domain output, even when database rows arrive as snake_case.
- Keep validation and permission rules outside this directory; domain helpers may normalize shape, but should not decide whether a request is allowed.
- Keep detailed architecture status in `docs/`. This README is only the local map for maintainers reading `src/domain`.

## Current Caveat

Singleton IDs and persistence permissions still live outside `src/domain`; keep them at their owning runtime boundaries unless a future shared home is clearly browser-safe and server-safe.

Project classification notes:

- `projects/constants.js` owns accepted project types.
- `projects/mappers.js` maps classification fields into `isFeatured`, `featuredRank`, `projectType`, and `labels`.
- `projects/preview.js` maps local admin project drafts into the public modal-compatible preview shape without side effects.
- `projects/agentDraft.js` parses agent-produced project draft JSON, normalizes supported import fields into local project patches, preserves identity/media fields during apply, and serializes safe current project review context.
- `projects/viewModel.js` owns the featured/standard grouping and sort rules for public project presentation.
