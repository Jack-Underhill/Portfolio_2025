# Portfolio 2025

React and Vite portfolio site with browser-safe public Supabase reads and a separate local-only admin backend for privileged writes.

## Public App

The deployed site runs from `src` and uses only browser-safe Vite env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Netlify deploys public-safe functions from `netlify/functions`. The `server/admin` backend is not configured as a Netlify functions directory.

## Local Admin

The admin UI calls a local backend at `http://localhost:8787/admin-api`. That backend runs from `server/admin` and is the only code path that should read `SUPABASE_SERVICE_ROLE_KEY`.

Start the pieces in separate terminals:

```sh
npm run dev
npm run admin:server
```

Required local-only env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The public deploy does not need the service role key. The admin backend refuses to start with `NODE_ENV=production` or a non-loopback `ADMIN_SERVER_HOST`.
