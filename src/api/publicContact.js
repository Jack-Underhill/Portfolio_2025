import { supabasePublic } from './supabasePublicClient';

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

    const proficient =
        (skills || [])
            .filter((s) => s.level === 'proficient')
            .map((s) => s.name || '')
            .filter(Boolean);

    const experiencing =
        (skills || [])
            .filter((s) => s.level === 'experiencing')
            .map((s) => s.name || '')
            .filter(Boolean);

    const socialLinks =
        (links || [])
            .map((row) => ({
                id:       row.id,
                platform: row.label || '',
                url:      row.url || '',
                iconUrl:  row.svg || '',
            }))
            .filter((l) => l.url);

    if (!proficient.length && !experiencing.length && !socialLinks.length) {
        return null;
    }

    return {
        languages:  proficient,
        experience: experiencing,
        links:      socialLinks,
    };
}
