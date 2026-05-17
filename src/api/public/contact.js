import { supabasePublic } from '../clients/supabasePublic.js';
import { mapContactRowsToPublic } from '../../domain/contact/mappers.js';

/**
 * Fetch public Contact data: social links.
 * Returns null on error / misconfig so UI can fall back to defaults.
 */
export async function fetchContactPublic() {
    if (!supabasePublic) return null;

    const { data: links, error: linksError } = await supabasePublic
        .from('links')
        .select('id, label, url, svg')
        .order('id', { ascending: true });

    if (linksError) {
        console.error('[fetchContactPublic] links error:', linksError);
    }

    return mapContactRowsToPublic({ links });
}
