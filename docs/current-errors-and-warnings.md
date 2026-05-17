# Current Errors and Warnings

Date: 2026-05-17

## Purpose

This document records known current failures, lint warnings/errors, local runtime warnings, and quality gate status.

## Command Status

Last checked after the P2.6 grouped Skills cleanup with Windows `cmd /c` because direct PowerShell `npm` execution is blocked by the local unsigned `npm.ps1` policy.

Passing:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
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
- Browser smoke coverage for invalid architecture viewer URLs and safe fallback states remains future work.

## Quality Gate Target

Current baseline:

```sh
cmd /c npm run test
cmd /c npm run lint
cmd /c npm run check:schema
cmd /c npm run build
```

Definition of done for this quality gate:

- All four commands pass.
- Known local dev warnings are documented as expected behavior.
- README verification section points to the same baseline commands.
