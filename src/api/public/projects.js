import { supabasePublic } from '../clients/supabasePublic.js';
import {
    mapProjectRowToPublicCard,
    mapProjectRowToPublicDetails,
} from '../../domain/projects/mappers.js';

const PROJECT_SECTION_ID = 1;

export async function fetchProjectSectionPublic() {
    if (!supabasePublic) return null;
    const client = supabasePublic;

    const sectionRes = await client
        .from('project_section')
        .select('about_projects')
        .limit(1)
        .eq('id', PROJECT_SECTION_ID)
        .maybeSingle();

    const section = sectionRes.data;
    if (!section) return null;

    return {
        aboutProjects: section?.about_projects || '',
    };
}

/**
 * Fetch public project cards.
 * Returns null on error / misconfig so UI can fall back to defaults.
 */
export async function fetchProjectsPublic() {
    if (!supabasePublic) return null;
    const client = supabasePublic;

    const projectRes = await 
        client
            .from('projects')
            .select('id, permalink, image_url, video_url, title, card_description, tech_tags, live_url, source_url, published, sort_order')
            .eq('published', true)
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true });

    const rows = projectRes.data;
    if (!rows || !rows.length) return null;

    return {
        projects: rows.map(mapProjectRowToPublicCard),
    };
}

/**
 * Fetch public project details for the modal.
 */
export async function fetchProjectByIdPublic(id) {
    if (!supabasePublic) return null;

    const { data: row, error } = await supabasePublic
        .from('projects')
        .select(`
            id, permalink, title,
            image_url, video_url, architecture_image_url,
            overview, role,
            live_url, source_url, writeup_url, video_page_url,
            tech_stack,
            features, metrics, challenges, improvements
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('[fetchProjectByIdPublic] projects error:', error);
        return null;
    }
    if (!row) return null;

    return mapProjectRowToPublicDetails(row);
}
