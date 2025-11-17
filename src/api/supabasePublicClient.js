import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
    if (import.meta.env.DEV) {
        console.warn(
            '[supabasePublic] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
            'Public read operations will fail.'
        );
    }
}

export const supabasePublic =
    supabaseUrl && anonKey
        ? createClient(supabaseUrl, anonKey, {
            auth: { persistSession: false },
        })
        : null;
