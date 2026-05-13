import { supabasePublic } from '../clients/supabasePublic.js';
import { mapAboutRowToPublic } from '../../domain/about/mappers.js';

/**
 * Fetch the public About data from Supabase.
 * Returns a normalized object or null on error.
 */
export async function fetchAboutPublic() {
    if (!supabasePublic) {
        return null;
    }

    const { data, error } = await supabasePublic
        .from('about')
        .select('*')
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[fetchAboutPublic] Failed to load about:', error);
        return null;
    }

    if (!data) return null;

    return mapAboutRowToPublic(data);
}
