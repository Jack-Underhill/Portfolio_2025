import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'portfolio-assets';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseService = null;

export function hasSupabaseServiceConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function requireServiceClient() {
  if (!hasSupabaseServiceConfig()) {
    throw new Error('Supabase service client is not configured');
  }

  if (!supabaseService) {
    supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseService;
}
