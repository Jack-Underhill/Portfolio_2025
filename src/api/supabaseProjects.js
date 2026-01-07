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

const TECH_STACK_ORDER = ['frontend', 'backend', 'data', 'infrastructure'];

function normalizeStringArray(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();

    for (const raw of arr) {
        const t = String(raw ?? '').trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
    }
    return out;
}

function flattenTechStack(techStack) {
    if (!techStack || typeof techStack !== "object") return [];

    const out = [];
    const seen = new Set();

    for (const cat of TECH_STACK_ORDER) {
        const arr = Array.isArray(techStack?.[cat]) ? techStack[cat] : [];
        for (const raw of arr) {
            const t = String(raw ?? '').trim();
            if (!t) continue;

            const key = t.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(t);
        }
    }
    return out;
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
            client
                .from('projects')
                .select('id, permalink, image_url, video_url, title, card_description, live_url, overview, role, source_url, writeup_url, video_page_url, architecture_image_url, tech_stack, tech_tags, features, metrics, challenges, improvements, published, sort_order')
                .order('sort_order', { ascending: true })
                .order('id', { ascending: true }),
        ]);

    if (sectionError) throw sectionError;
    if (cardsError) throw cardsError;

    const projectBio = section?.about_projects || '';

    const projects = (cards || []).map((row) => {
        const techStack = row.tech_stack ?? null;

        // Prefer stored tech_tags; if empty, fall back to flattening tech_stack
        const tagsFromDb = normalizeStringArray(row.tech_tags);
        const tagsFromStack = flattenTechStack(techStack);
        const techTags = tagsFromDb.length ? tagsFromDb : tagsFromStack;

        return {
            id: row.id,
            imageFile: null,
            imageUrl: row.image_url || '',
            videoFile: null,
            videoUrl: row.video_url || '',
            title: row.title || '',
            description: row.card_description || '',
            url: row.live_url || '',

            permalink: row.permalink || '',
            overview: row.overview || '',
            role: row.role || '',
            sourceUrl: row.source_url || '',
            writeupUrl: row.writeup_url || '',
            videoPageUrl: row.video_page_url || '',
            architectureImageUrl: row.architecture_image_url || '',

            techStack,
            techTags: techTags.length ? techTags : [''],

            features: Array.isArray(row.features) ? row.features : [],
            metrics: Array.isArray(row.metrics) ? row.metrics : null,
            challenges: row.challenges || [],
            improvements: Array.isArray(row.improvements) ? row.improvements : [],

            published: row.published !== false,
            sortOrder: Number.isFinite(row.sort_order) ? row.sort_order : 0,
        };
    });

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

    // ---- helpers ----
    const ensureDotExt = (ext, fallback) => {
        const e = (ext || '').trim();
        if (e && e.startsWith('.')) return e;
        if (e) return `.${e}`;
        return fallback;
    };

    const makePermalink = (id, titleAtCreation) => {
        const suffix = slugify(titleAtCreation, `project-${id}`);
        return `${id}-${suffix}`;
    };

    async function uploadAndGetPublicUrl(path, file) {
        const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(path);
        return publicUrlData?.publicUrl || '';
    }

    // ---- normalize + filter empty projects ----
    const inputProjects = Array.isArray(state.projects) ? state.projects : [];

    const normalized = [];
    for (let index = 0; index < inputProjects.length; index++) {
        const project = inputProjects[index];

        const id = Number.isFinite(project?.id) ? project.id : null;

        const title = (project.title || '').trim();
        const description = (project.description || '').trim();
        const url = (project.url || '').trim();

        const overview = (project.overview || '').trim();
        const role = (project.role || '').trim();
        const sourceUrl = (project.sourceUrl || '').trim();
        const writeupUrl = (project.writeupUrl || '').trim();
        const videoPageUrl = (project.videoPageUrl || '').trim();
        const architectureImageUrl = (project.architectureImageUrl || '').trim();

        const techStack = project.techStack ?? null;
        const tagsFromStack = flattenTechStack(techStack);
        const tagsManual = normalizeStringArray(project.techTags);
        const techTags = tagsFromStack.length ? tagsFromStack : tagsManual;

        const features = Array.isArray(project.features) ? project.features : null;
        const metrics = Array.isArray(project.metrics) ? project.metrics : null;
        const challenges = project.challenges ?? null;
        const improvements = Array.isArray(project.improvements) ? project.improvements : null;

        const published = project.published !== false;

        const hasImage = !!(project.imageFile || project.imageUrl);
        const hasVideo = !!(project.videoFile || project.videoUrl);

        // Skip empty projects
        const isEmpty =
            !title &&
            !description &&
            techTags.length === 0 &&
            !url &&
            !hasImage &&
            !hasVideo;
        if (isEmpty) continue;

        // Authoritative order = current array order
        const sortOrder = index;

        normalized.push({
            original: project,
            id,

            // keep existing permalink from state (but WILL NOT overwrite DB’s permalink)
            permalink: (project.permalink || '').trim(),

            title: title || `Project ${index + 1}`,
            description,
            url,

            overview: overview || null,
            role: role || null,
            sourceUrl: sourceUrl || null,
            writeupUrl: writeupUrl || null,
            videoPageUrl: videoPageUrl || null,
            architectureImageUrl: architectureImageUrl || null,

            techStack,
            techTags,

            features,
            metrics,
            challenges,
            improvements,

            published,
            sortOrder,

            imageFile: project.imageFile || null,
            imageUrl: project.imageUrl || '',
            videoFile: project.videoFile || null,
            videoUrl: project.videoUrl || '',
        });
    }

    // ---- prefetch existing permalinks to NEVER overwrite ----
    const existingIds = normalized.filter(p => Number.isFinite(p.id)).map(p => p.id);

    const existingById = new Map();
    if (existingIds.length) {
        const { data: existingRows, error: existingError } = await client
            .from('projects')
            .select('id, permalink, image_url, video_url')
            .in('id', existingIds);

        if (existingError) throw existingError;

        for (const row of existingRows || []) {
            existingById.set(row.id, row);
        }
    }

    const savedProjects = [];
    const keepIds = [];

    // ---- update existing rows ----
    for (const p of normalized.filter(x => Number.isFinite(x.id))) {
        const id = p.id;
        const dbPermalink = (existingById.get(id)?.permalink || '').trim();

        let imageUrl = p.imageUrl;
        let videoUrl = p.videoUrl;

        // Uploads use id-based paths (stable even if title changes)
        if (p.imageFile) {
            const ext = ensureDotExt(getFileExtension(p.imageFile), '.png');
            const path = `projects/${id}/cover${ext}`;
            imageUrl = await uploadAndGetPublicUrl(path, p.imageFile);
        }

        if (p.videoFile) {
            const ext = ensureDotExt(getFileExtension(p.videoFile), '.mp4');
            const path = `project-videos/${id}/preview${ext}`;
            videoUrl = await uploadAndGetPublicUrl(path, p.videoFile);
        }

        const updatePayload = {
            image_url: imageUrl,
            video_url: videoUrl,
            title: p.title,
            card_description: p.description,
            live_url: p.url,

            overview: p.overview,
            role: p.role,
            source_url: p.sourceUrl,
            writeup_url: p.writeupUrl,
            video_page_url: p.videoPageUrl,
            architecture_image_url: p.architectureImageUrl,

            tech_stack: p.techStack,
            tech_tags: p.techTags,

            features: p.features,
            metrics: p.metrics,
            challenges: p.challenges,
            improvements: p.improvements,

            published: p.published,
            sort_order: p.sortOrder,
        };

        // Only set permalink if DB is missing it
        if (!dbPermalink) {
            updatePayload.permalink = makePermalink(id, p.title);
        }

        const { data: updatedRow, error: updateError } = await client
            .from('projects')
            .update(updatePayload)
            .eq('id', id)
            .select('id, permalink')
            .single();

        if (updateError) throw updateError;

        const finalPermalink = (updatedRow?.permalink || dbPermalink || '').trim();

        keepIds.push(id);

        savedProjects.push({
            ...p.original,
            id,
            permalink: finalPermalink,

            title: p.title,
            description: p.description,
            url: p.url,

            imageFile: null,
            imageUrl,
            videoFile: null,
            videoUrl,

            overview: p.overview || '',
            role: p.role || '',
            sourceUrl: p.sourceUrl || '',
            writeupUrl: p.writeupUrl || '',
            videoPageUrl: p.videoPageUrl || '',
            architectureImageUrl: p.architectureImageUrl || '',

            techStack: p.techStack,
            techTags: p.techTags.length ? p.techTags : [''],

            features: p.features || [],
            metrics: p.metrics || null,
            challenges: p.challenges || [],
            improvements: p.improvements || [],

            published: p.published,
            sortOrder: p.sortOrder,
        });
    }

    // ---- insert new rows (then generate permalink + upload using the new id) ----
    for (const p of normalized.filter(x => !Number.isFinite(x.id))) {
        // Insert first to get an id (permalink intentionally omitted)
        const insertPayload = {
            image_url: p.imageUrl || '',
            video_url: p.videoUrl || '',
            title: p.title,
            card_description: p.description,
            live_url: p.url,

            overview: p.overview,
            role: p.role,
            source_url: p.sourceUrl,
            writeup_url: p.writeupUrl,
            video_page_url: p.videoPageUrl,
            architecture_image_url: p.architectureImageUrl,

            tech_stack: p.techStack,
            tech_tags: p.techTags,

            features: p.features,
            metrics: p.metrics,
            challenges: p.challenges,
            improvements: p.improvements,

            published: p.published,
            sort_order: p.sortOrder,
        };

        const { data: inserted, error: insertError } = await client
            .from('projects')
            .insert([insertPayload])
            .select('id')
            .single();

        if (insertError) throw insertError;

        const id = inserted.id;

        let imageUrl = p.imageUrl || '';
        let videoUrl = p.videoUrl || '';

        // Now with id, upload media (if provided) to stable id paths
        if (p.imageFile) {
            const ext = ensureDotExt(getFileExtension(p.imageFile), '.png');
            const path = `projects/${id}/cover${ext}`;
            imageUrl = await uploadAndGetPublicUrl(path, p.imageFile);
        }

        if (p.videoFile) {
            const ext = ensureDotExt(getFileExtension(p.videoFile), '.mp4');
            const path = `project-videos/${id}/preview${ext}`;
            videoUrl = await uploadAndGetPublicUrl(path, p.videoFile);
        }

        const permalink = makePermalink(id, p.title);

        const { error: postInsertUpdateError } = await client
            .from('projects')
            .update({
                permalink,
                image_url: imageUrl,
                video_url: videoUrl,
            })
            .eq('id', id);

        if (postInsertUpdateError) throw postInsertUpdateError;

        keepIds.push(id);

        savedProjects.push({
            ...p.original,
            id,
            permalink,

            title: p.title,
            description: p.description,
            url: p.url,

            imageFile: null,
            imageUrl,
            videoFile: null,
            videoUrl,

            overview: p.overview || '',
            role: p.role || '',
            sourceUrl: p.sourceUrl || '',
            writeupUrl: p.writeupUrl || '',
            videoPageUrl: p.videoPageUrl || '',
            architectureImageUrl: p.architectureImageUrl || '',

            techStack: p.techStack,
            techTags: p.techTags.length ? p.techTags : [''],

            features: p.features || [],
            metrics: p.metrics || null,
            challenges: p.challenges || [],
            improvements: p.improvements || [],

            published: p.published,
            sortOrder: p.sortOrder,
        });
    }

    // ---- delete rows removed from admin list (keeps DB in sync with state) ----
    if (keepIds.length) {
        const idList = `(${keepIds.join(',')})`;
        const { error: deleteError } = await client
            .from('projects')
            .delete()
            .not('id', 'in', idList);

        if (deleteError) throw deleteError;
    } else {
        // If admin list is empty, wipe table
        const { error: deleteAllError } = await client.from('projects').delete().neq('id', 0);
        if (deleteAllError) throw deleteAllError;
    }

    return {
        projectBio,
        projects: savedProjects,
    };
}
