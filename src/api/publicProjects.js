import { supabasePublic } from './supabasePublicClient';

function splitTechString(tech) {
    if (!tech) return [];
    return tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}

/**
 * Fetch public project section + project cards.
 * Returns null on error / misconfig so UI can fall back to defaults.
 */
export async function fetchProjectsPublic() {
    if (!supabasePublic) return null;

    const [
        { data: section, error: sectionError },
        { data: cards,   error: cardsError },
    ] = await Promise.all([
        supabasePublic
            .from('project_section')
            .select('about_projects')
            .limit(1)
            .maybeSingle(),
        supabasePublic
            .from('project_cards')
            .select('*')
            .order('id', { ascending: true }),
    ]);

    if (sectionError) {
        console.error('[fetchProjectsPublic] project_section error:', sectionError);
    }
    if (cardsError) {
        console.error('[fetchProjectsPublic] project_cards error:', cardsError);
    }

    if (!section && (!cards || !cards.length)) return null;

    return {
        aboutProjects: section?.about_projects || '',
        projects: (cards || []).map((row) => ({
            id:             row.id,
            imageUrl:       row.image || '',
            title:          row.title || '',
            description:    row.description || '',
            url:            row.url || '',
            techs:          splitTechString(row.tech),
        })),
    };
}
