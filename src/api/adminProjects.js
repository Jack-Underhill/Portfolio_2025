import { requireClient } from './supabaseAdminClient';
import { normalizeStringArray, flattenTechStack } from './utils/strings.js';
import { resolveProjectMediaUrls, makePermalink } from './utils/storage.js';

const PROJECT_SECTION_ID = 1; // treat "project section" as a singleton row with id = 1
const TECH_STACK_ORDER = ['frontend', 'backend', 'data', 'infrastructure'];

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
        return dbRowToUiProject(row);
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

    // --- project_section (single row) ---
    const projectBio = (state.projectBio || '').trim();
    const { error: sectionError } = await client
        .from('project_section')
        .upsert(
            [{ id: PROJECT_SECTION_ID, about_projects: projectBio }],
            { onConflict: 'id' }
        );
    if (sectionError) throw sectionError;

    const normalized = normalizeUiProjects(state);
    const existingById = await fetchExistingProjectsById(client, normalized);

    const savedProjects = [];
    const keepIds = [];

    // ---- update existing rows ----
    for (const p of normalized) {
        let id = p.id;
        let permalink;
        let imageUrl;
        let videoUrl;
        let architectureImageUrl;

        if (Number.isFinite(id)) {
            const { imageBucketUrl, videoBucketUrl, architectureImageBucketUrl } = 
                await resolveProjectMediaUrls(
                    id,
                    p.imageFile, p.imageUrl,
                    p.videoFile, p.videoUrl,
                    p.architectureImageFile, p.architectureImageUrl
                );

            imageUrl = imageBucketUrl;
            videoUrl = videoBucketUrl;
            architectureImageUrl = architectureImageBucketUrl;

            const updatePayload = {
                ...toDbProjectPayload(p),

                image_url: imageUrl,
                video_url: videoUrl,
                architecture_image_url: architectureImageUrl,
            };

            // Only set permalink if DB is missing it
            const dbPermalink = (existingById.get(id)?.permalink || '').trim();
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

            permalink = (updatedRow?.permalink || dbPermalink || '').trim();
        } else {
            // ---- insert new rows (then generate permalink + upload using the new id) ----
            // Insert first to get an id (permalink intentionally omitted)
            const insertPayload = {
                ...toDbProjectPayload(p),
            };

            const { data: inserted, error: insertError } = await client
                .from('projects')
                .insert([insertPayload])
                .select('id')
                .single();
            if (insertError) throw insertError;

            id = inserted.id;
            const { imageBucketUrl, videoBucketUrl, architectureImageBucketUrl } = 
                await resolveProjectMediaUrls(
                    id,
                    p.imageFile, p.imageUrl,
                    p.videoFile, p.videoUrl,
                    p.architectureImageFile, p.architectureImageUrl
                );
            imageUrl = imageBucketUrl;
            videoUrl = videoBucketUrl;
            architectureImageUrl = architectureImageBucketUrl;

            permalink = makePermalink(id, p.title);

            const { error: postInsertUpdateError } = await client
                .from('projects')
                .update({
                    permalink,
                    image_url: imageUrl,
                    video_url: videoUrl,
                    architecture_image_url: architectureImageUrl,
                })
                .eq('id', id);
            if (postInsertUpdateError) throw postInsertUpdateError;
        }

        keepIds.push(id);
        savedProjects.push(toUiProject(
            p,
            id,
            permalink,
            imageUrl,
            videoUrl,
            architectureImageUrl
        ));
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

function dbRowToUiProject(p) {
    const techStack = p.tech_stack ?? null;

    // Prefer stored tech_tags; if empty, fall back to flattening tech_stack
    const tagsFromDb = normalizeStringArray(p.tech_tags);
    const tagsFromStack = flattenTechStack(techStack, TECH_STACK_ORDER);
    const techTags = tagsFromDb.length ? tagsFromDb : tagsFromStack;

    const renamedP = {
        id: p.id,
        title: p.title,
        description: p.card_description,
        url: p.live_url,

        imageUrl: p.image_url,
        videoUrl: p.video_url,
        architectureImageUrl: p.architecture_image_url,

        permalink: p.permalink,
        overview: p.overview,
        role: p.role,
        sourceUrl: p.source_url,
        writeupUrl: p.writeup_url,
        videoPageUrl: p.video_page_url,

        techStack,
        techTags,

        features: p.features,
        metrics: p.metrics,
        challenges: p.challenges,
        improvements: p.improvements,

        published: p.published,
        sortOrder: p.sort_order,
    };

    return toUiProject(renamedP);
}

function toUiProject(
    project,
    id = null,
    permalink = null,
    imageUrl = null,
    videoUrl = null,
    architectureImageUrl = null
) {
    const p = project || {};
    const shapedP = {
        id:                     id ?? p.id ?? null,

        permalink:              permalink ?? p.permalink ?? '',
        imageUrl:               imageUrl ?? p.imageUrl ?? '',
        videoUrl:               videoUrl ?? p.videoUrl ?? '',
        architectureImageUrl:   architectureImageUrl ?? p.architectureImageUrl ?? '',

        imageFile:              null,
        videoFile:              null,
        architectureImageFile:  null,

        title:          p.title || '',
        description:    p.description || '',
        url:            p.url || '',

        overview:       p.overview || '',
        role:           p.role || '',
        sourceUrl:      p.sourceUrl || '',
        writeupUrl:     p.writeupUrl || '',
        videoPageUrl:   p.videoPageUrl || '',

        techStack:  p.techStack,
        challenges: p.challenges || [],

        techTags:       Array.isArray(p.techTags) ? p.techTags : [''],
        features:       Array.isArray(p.features) ? p.features : [],
        metrics:        Array.isArray(p.metrics) ? p.metrics : null,
        improvements:   Array.isArray(p.improvements) ? p.improvements : [],

        published: p.published !== false,
        sortOrder: Number.isFinite(p.sortOrder) ? p.sortOrder : 0,
    };

    return shapedP;
}

function toDbProjectPayload(p) {
    return {
        title: p.title,
        card_description: p.description,
        live_url: p.url,

        image_url: p.imageUrl,
        video_url: p.videoUrl,
        architecture_image_url: p.architectureImageUrl,

        overview: p.overview,
        role: p.role,
        source_url: p.sourceUrl,
        writeup_url: p.writeupUrl,
        video_page_url: p.videoPageUrl,

        tech_stack: p.techStack,
        tech_tags: p.techTags,

        features: p.features,
        metrics: p.metrics,
        challenges: p.challenges,
        improvements: p.improvements,

        published: p.published,
        sort_order: p.sortOrder,
    };
}

function normalizeUiProjects(state) {
    const inputProjects = Array.isArray(state.projects) ? state.projects : [];

    const trimString = (str) => {
        return (str || '').trim() || null;
    };

    const normalized = [];
    for (let index = 0; index < inputProjects.length; index++) {
        const project = inputProjects[index];

        const permalink             = trimString(project.permalink);
        const title                 = trimString(project.title);
        const description           = trimString(project.description);
        const url                   = trimString(project.url);
        const overview              = trimString(project.overview);
        const role                  = trimString(project.role);
        const sourceUrl             = trimString(project.sourceUrl);
        const writeupUrl            = trimString(project.writeupUrl);
        const videoPageUrl          = trimString(project.videoPageUrl);
        const imageUrl              = trimString(project.imageUrl);
        const videoUrl              = trimString(project.videoUrl);
        const architectureImageUrl  = trimString(project.architectureImageUrl);

        const imageFile             = project.imageFile || null;
        const videoFile             = project.videoFile || null;
        const architectureImageFile = project.architectureImageFile || null;

        const techStack  = project.techStack ?? null;
        const challenges = project.challenges ?? null;

        const tagsFromStack = flattenTechStack(techStack, TECH_STACK_ORDER);
        const tagsManual    = normalizeStringArray(project.techTags);
        const techTags      = tagsFromStack.length ? tagsFromStack : tagsManual;

        const hasImage = !!(imageFile || imageUrl);
        const hasVideo = !!(videoFile || videoUrl);

        // Skip empty projects
        const isEmpty =
            !title &&
            !description &&
            techTags.length === 0 &&
            !url &&
            !hasImage &&
            !hasVideo;
        if (isEmpty) continue;

        const id = Number.isFinite(project?.id) ? project.id : null;

        // Authoritative order = current array order
        const sortOrder = index;

        const features      = Array.isArray(project.features) ? project.features : null;
        const metrics       = Array.isArray(project.metrics) ? project.metrics : null;
        const improvements  = Array.isArray(project.improvements) ? project.improvements : null;

        const published = project.published !== false;

        normalized.push({
            id,
            permalink,
            sortOrder,
            published,
            title: title || `Project ${index + 1}`,
            description,
            url,
            overview,
            role,
            sourceUrl,
            writeupUrl,
            videoPageUrl,
            imageFile,
            videoFile,
            architectureImageFile,
            imageUrl,
            videoUrl,
            architectureImageUrl,
            techStack,
            techTags,
            features,
            metrics,
            challenges,
            improvements,
        });
    }

    return normalized;
}

async function fetchExistingProjectsById(client, normalized) {
    // ---- prefetch existing permalinks to NEVER overwrite ----
    const existingIds = normalized.filter(p => Number.isFinite(p.id)).map(p => p.id);

    const existingById = new Map();
    if (existingIds.length) {
        const { data: existingRows, error: existingError } = await client
            .from('projects')
            .select('id, permalink')
            .in('id', existingIds);

        if (existingError) throw existingError;

        for (const row of existingRows || []) {
            existingById.set(row.id, row);
        }
    }

    return existingById;
}
