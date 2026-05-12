import { hasSupabaseServiceConfig } from '../clients/supabaseService.js';

export function handleHealth(_req, res) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(
    JSON.stringify({
      ok: true,
      service: 'portfolio-admin',
      supabaseConfigured: hasSupabaseServiceConfig(),
    }),
  );
}
