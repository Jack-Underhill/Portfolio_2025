# Portfolio 2025

React and Vite portfolio site with browser-safe public Supabase reads and a separate local-only admin backend for privileged reads, writes, deletes, and uploads.

## Architecture

The browser is treated as untrusted. Code under `src` may use only public Supabase credentials and must not import privileged admin clients or server modules.

Public app:

- Runs from `src`.
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Performs browser-safe portfolio reads through `src/api/public`.
- Deploys to Netlify with public-safe functions from `netlify/functions`.

Local admin:

- Runs the React admin UI in development.
- Calls `http://localhost:8787/admin-api` through `src/admin/api/adminClient.js`.
- Sends privileged operations to `server/admin`.
- Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only from server-side Node code.

`server/admin` is not configured as a Netlify functions directory. The public deploy does not need the service role key.

## Local Development

Install dependencies:

```sh
npm install
```

Start the public app:

```sh
npm run dev
```

Start the local admin backend in a separate terminal:

```sh
npm run admin:server
```

Required local env vars in `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional admin backend env vars:

- `ADMIN_SERVER_HOST`, defaults to `127.0.0.1`
- `ADMIN_SERVER_PORT`, defaults to `8787`

The admin backend refuses to start with `NODE_ENV=production` or a non-loopback `ADMIN_SERVER_HOST`.

## Verification

Useful checks before shipping changes:

```sh
npm run build
rg "VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin|requireClient" src
rg "SUPABASE_SERVICE_ROLE_KEY" src
rg "SUPABASE_SERVICE_ROLE_KEY" server
```
