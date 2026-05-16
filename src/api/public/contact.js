import { supabasePublic } from '../clients/supabasePublic.js';
import { mapContactRowsToPublic } from '../../domain/contact/mappers.js';

/**
 * Fetch public Contact data: languages, experience, and social links.
 * Returns null on error / misconfig so UI can fall back to defaults.
 */
export async function fetchContactPublic() {
    if (!supabasePublic) return null;

    const [
        { data: skills, error: skillsError },
        { data: links,  error: linksError },
    ] = await Promise.all([
        supabasePublic
            .from('skills')
            .select('id, name, level')
            .order('id', { ascending: true }),
        supabasePublic
            .from('links')
            .select('id, label, url, svg')
            .order('id', { ascending: true }),
    ]);

    if (skillsError) {
        console.error('[fetchContactPublic] skills error:', skillsError);
    }
    if (linksError) {
        console.error('[fetchContactPublic] links error:', linksError);
    }

    return mapContactRowsToPublic({ skills, links });
}
