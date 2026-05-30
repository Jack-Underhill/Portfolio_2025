# Current Errors and Warnings

Date: 2026-05-29

## Purpose

This document records known current failures, lint warnings/errors, local runtime warnings, and quality gate status.

## Maintenance Rules

- Keep only current failures, expected warnings, and the latest verified quality gate.
- Remove resolved failures after the fix is verified.
- Keep local-machine caveats only when they still affect how commands should be run.

## Command Status

Last full baseline checked on 2026-05-29 with Windows `cmd /c` because direct PowerShell `npm` execution is blocked by the local unsigned `npm.ps1` policy. The fixed navigation refresh verification also passed lint, build, unit tests, schema drift, and the accessibility smoke.

Passing:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
cmd /c npm run test:a11y
```

Focused accessibility smoke check included in the current verification baseline:

```sh
cmd /c npm run test:a11y
```

Direct PowerShell caveat:

```txt
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded.
The file C:\Program Files\nodejs\npm.ps1 is not digitally signed.
```

Use `cmd /c npm ...` on this machine unless the PowerShell execution policy is changed.

## Current Lint Errors

No current lint errors are known. `cmd /c npm run lint` is part of the passing baseline above.

## Local Runtime Warnings

`VisitCount.jsx` calls:

```txt
/.netlify/functions/track-visit
```

When running the public app with plain Vite instead of Netlify dev, the function endpoint can return HTML instead of JSON. The component intentionally warns:

```txt
[VisitCount] Netlify dev is not running, so the Netlify function track-visit cannot run. Use `netlify dev` instead of plain `npm run dev` to test visit tracking locally.
```

Decision:

- This is an expected local development warning, not a production error.
- It remains documented so it is not mistaken for a broken visit counter.
- Use `netlify dev` when testing deployed-function behavior locally.

## Architecture Viewer Local Warning

Architecture previews rely on `/.netlify/functions/inline-svg` for trusted SVG proxying.

When Netlify functions are disabled or unavailable, `ArchitecturePreview.jsx` shows:

```txt
Architecture preview unavailable in local dev without Netlify
```

Decision:

- This is expected behavior for local dev without Netlify functions.
- The public site should use the function path when deployed or when tested through Netlify dev.
- `netlify/functions/README.md` names `netlify dev` as the local command for function behavior.
- `cmd /c npm run test:a11y` covers invalid architecture viewer URLs and safe fallback states through a local Vite browser smoke check.

## Public Project Data Local Caveat

The standard project desktop marquee depends on public project rows. In constrained plain-Vite local environments, the project gallery can render empty when live public data is unavailable.

Decision:

- This is a local data availability caveat, not a known marquee rendering error.
- Duplicate marquee copies are guarded structurally with duplicate-wrapper `aria-hidden` plus duplicate-anchor `tabIndex="-1"`; visible duplicates are intentionally not `inert` so pointer hover and clicks work.
- `cmd /c npm run test:a11y` still passes.
- Full desktop keyboard and pointer traversal through live standard project cards should be checked with available public project rows. In the 2026-05-26 verification window, sandboxed live fetches were blocked with `ERR_NETWORK_ACCESS_DENIED`, so rendered interaction checks used mocked Supabase project responses in local Playwright.

## Quality Gate Target

Current baseline:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Focused accessibility smoke:

```sh
cmd /c npm run test:a11y
```

Definition of done for this quality gate:

- All four commands pass.
- The focused accessibility smoke passes when accessibility or public structure changes are in scope.
- Known local dev warnings are documented as expected behavior.
- README verification section points to the same baseline commands.
