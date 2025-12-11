import { supabaseAdmin, BUCKET } from './supabaseAdminClient';

const PROJECT_SECTION_ID = 1;

function requireClient() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    return supabaseAdmin;
}

function getFileExtension(file) {
    if (!file?.name) return '';
    const dot = file.name.lastIndexOf('.');
    return dot === -1 ? '' : file.name.slice(dot); // includes "."
}

function slugify(label, fallback) {
    const base = (label || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return base || fallback;
}

function splitTechString(tech) {
    if (!tech) return [''];
    const parts = tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    return parts.length ? parts : [''];
}

function joinTechArray(techs) {
    if (!Array.isArray(techs)) return '';
    return techs
        .map((t) => (t || '').trim())
        .filter(Boolean)
        .join(', ');
}

/**
 * Load project bio + cards into admin state shape.
 */
export async function loadProjects() {
    const client = requireClient();

    const [{ data: section, error: sectionError }, { data: cards, error: cardsError }] =
        await Promise.all([
            client
                .from('project_section')
                .select('*')
                .eq('id', PROJECT_SECTION_ID)
                .maybeSingle(),
            client.from('project_cards').select('*').order('id', { ascending: true }),
        ]);

    if (sectionError) throw sectionError;
    if (cardsError)   throw cardsError;

    const projectBio = section?.about_projects || '';

    const projects = (cards || []).map((row) => ({
        id:          row.id,
        imageFile:   null,
        imageUrl:    row.image || '',
        videoFile:   null,
        videoUrl:    row.video || '',
        title:       row.title || '',
        description: row.description || '',
        techs:       splitTechString(row.tech),
        url:         row.url || '',
    }));

    return { projectBio, projects };
}

/**
 * Save project bio + cards.
 * - Upserts a single row in project_section
 * - Replaces all rows in project_cards (order = current state order)
 * - Uploads images if changed
 */
export async function saveProjects(state) {
    const client = requireClient();

    const projectBio = (state.projectBio || '').trim();

    // --- project_section (single row) ---
    const { error: sectionError } = await client
        .from('project_section')
        .upsert(
            [{ id: PROJECT_SECTION_ID, about_projects: projectBio }],
            { onConflict: 'id' }
        );

    if (sectionError) throw sectionError;

    // --- project_cards (delete + insert to preserve order) ---
    const { error: delError } = await client.from('project_cards').delete().neq('id', 0);
    if (delError) throw delError;

    const savedProjects = [];
    const rows = [];

    const projects = Array.isArray(state.projects) ? state.projects : [];

    for (let index = 0; index < projects.length; index++) {
        const project = projects[index];

        const title       = (project.title || '').trim();
        const description = (project.description || '').trim();
        const techs       = Array.isArray(project.techs)
            ? project.techs.map((t) => (t || '').trim()).filter(Boolean)
            : [];
        const url         = (project.url || '').trim();

        const hasImage = !!(project.imageFile || project.imageUrl);
        const hasVideo = !!(project.videoFile || project.videoUrl);

        // Skip totally empty projects
        if (
            !title && 
            !description && 
            !techs.length && 
            !url &&
            !hasImage && 
            !hasVideo
        ) {
            continue;
        }

        let imageUrl = project.imageUrl || '';
        let videoUrl = project.videoUrl || '';

        // --- upload image if changed ---
        if (project.imageFile) {
            const ext  = getFileExtension(project.imageFile) || '.png';
            const slug = slugify(title || `project-${index + 1}`, `project-${index + 1}`);
            const path = `projects/${slug}${ext}`;

            const { error: uploadError } = await client.storage
                .from(BUCKET)
                .upload(path, project.imageFile, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = client.storage
                .from(BUCKET)
                .getPublicUrl(path);
            imageUrl = publicUrlData.publicUrl;
        }

        // --- upload preview video if changed ---
        if (project.videoFile) {
            const ext  = getFileExtension(project.videoFile) || '.mp4';
            const slug = slugify(title || `project-${index + 1}`, `project-${index + 1}`);
            const path = `project-videos/${slug}${ext}`;

            const { error: uploadError } = await client.storage
                .from(BUCKET)
                .upload(path, project.videoFile, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = client.storage
                .from(BUCKET)
                .getPublicUrl(path);
            videoUrl = publicUrlData.publicUrl;
        }

        rows.push({
            image:       imageUrl,
            video:       videoUrl,
            title:       title || `Project ${index + 1}`,
            description,
            tech:        joinTechArray(techs),
            url,
        });

        savedProjects.push({
            ...project,
            title:       title || `Project ${index + 1}`,
            description,
            imageFile:   null,
            imageUrl,
            videoFile:   null,
            videoUrl,
            techs:       techs.length ? techs : [''],
            url,
        });
    }

    if (rows.length) {
        const { error: insertError } = await client
            .from('project_cards')
            .insert(rows, { returning: 'minimal' });

        if (insertError) throw insertError;
    }

    return {
        projectBio,
        projects: savedProjects,
    };
}
