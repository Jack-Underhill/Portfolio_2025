import { supabasePublic } from './supabasePublicClient';

const PROJECT_SECTION_ID = 1;

const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

/**
 * Fetch public project (about) section + projects.
 * Returns null on error / misconfig so UI can fall back to defaults.
 */
export async function fetchProjectsPublic() {
    if (!supabasePublic) return null;

    const client = supabasePublic;

    const [sectionRes, projectRes] = await Promise.all([
        client
            .from('project_section')
            .select('about_projects')
            .limit(1)
            .eq('id', PROJECT_SECTION_ID)
            .maybeSingle(),
        client
            .from('projects')
            .select('id, permalink, image_url, video_url, title, card_description, tech_tags, live_url, source_url, published, sort_order')
            .eq('published', true)
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true }),
    ]);

    const section = sectionRes.data;
    const rows = projectRes.data;

    if (!section && (!rows || !rows.length)) return null;


    return {
        aboutProjects: section?.about_projects || '',
        projects: rows.map((row) => ({
            id: row.id,
            permalink: row.permalink || '',
            imageUrl: row.image_url || '',
            videoUrl: row.video_url || '',
            title: row.title || '',
            description: row.card_description || '',
            directUrl: row.live_url || row.source_url || '',
            techTags: Array.isArray(row.tech_tags) ? row.tech_tags : [],
        })),
    };
}

/**
 * Fetch Project Modal Specific Attributes.
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

    return {
        id: row.id,
        permalink: row.permalink || '',
        title: row.title || '',
        imageUrl: row.image_url || '',
        videoUrl: row.video_url && row.video_url !== 'NULL' ? row.video_url : '',

        liveUrl: row.live_url || '',
        sourceUrl: row.source_url || '',
        writeupUrl: row.writeup_url || '',
        videoPageUrl: row.video_page_url || '', // action link (NOT the hero video)

        overview: row.overview || '',
        role: row.role || '',

        architectureImageUrl: row.architecture_image_url || '',
        techStack: row.tech_stack || null,

        features: asArray(row.features),
        metrics: asArray(row.metrics),
        challenges: Array.isArray(row.challenges) ? row.challenges : (row.challenges || []),
        improvements: asArray(row.improvements),

        published: !!row.published,
        sortOrder: row.sort_order ?? 0,
    };
}
