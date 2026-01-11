import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        '[supabaseAdmin] Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY. ' +
        'Admin save/load will not work.'
    );
}

const supabaseAdmin =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        })
        : null;

export function requireClient() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    return supabaseAdmin;
}

export const BUCKET = 'portfolio-assets';
