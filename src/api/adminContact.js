import { requireClient, BUCKET } from './supabaseAdminClient';
import { getFileExtension, slugify } from './utils/strings.js';

/**
 * Load contact data (skills + links) into admin state shape.
 */
export async function loadContact() {
    const client = requireClient();

    const [{ data: skills, error: skillsError }, { data: links, error: linksError }] =
        await Promise.all([
            client.from('skills').select('*').order('id', { ascending: true }),
            client.from('links').select('*').order('id', { ascending: true }),
        ]);

    if (skillsError) throw skillsError;
    if (linksError) throw linksError;

    let proficientTechs = [''];
    let experiencingTechs = [''];

    if (skills && skills.length) {
        const prof = skills.filter((s) => s.level === 'proficient').map((s)   => s.name || '');
        const exp  = skills.filter((s) => s.level === 'experiencing').map((s) => s.name || '');

        proficientTechs   = prof.length ? prof : [''];
        experiencingTechs = exp.length  ? exp  : [''];
    }

    let socialLinks;

    if (links && links.length) {
        socialLinks = links.map((row) => ({
            id:         row.id,
            label:      row.label || '',
            url:        row.url || '',
            iconFile:   null,
            iconUrl:    row.svg || '',
        }));
    } else {
        socialLinks = [];
    }

    return {
        proficientTechs,
        experiencingTechs,
        socialLinks,
    };
}

/**
 * Save contact data:
 * - replaces all rows in `skills` and `links`
 * - uploads new social icons if selected
 * - returns cleaned-up state (files cleared, URLs filled, DB ids attached)
 */
export async function saveContact(state) {
    const client = requireClient();

    const cleanList = (list) =>
        (Array.isArray(list) ? list : [])
            .map((s) => (s || '').trim())
            .filter(Boolean);

    const proficient   = cleanList(state.proficientTechs);
    const experiencing = cleanList(state.experiencingTechs);

    // ---------- SKILLS ----------
    // delete everything then re-insert in current order
    const { error: delSkillsError } = await client.from('skills').delete().neq('id', 0);
    if (delSkillsError) throw delSkillsError;

    const skillsRows = [
        ...proficient.map((name)   => ({ name, level: 'proficient' })),
        ...experiencing.map((name) => ({ name, level: 'experiencing' })),
    ];

    if (skillsRows.length) {
        const { error: insSkillsError } = await client
            .from('skills')
            .insert(skillsRows, { returning: 'minimal' });
        if (insSkillsError) throw insSkillsError;
    }

    // ---------- LINKS ----------
    const { error: delLinksError } = await client.from('links').delete().neq('id', 0);
    if (delLinksError) throw delLinksError;

    const linkRows         = [];
    const savedSocialLinks = [];

    for (let index = 0; index < state.socialLinks.length; index++) {
        const link  = state.socialLinks[index];
        const label = (link.label || '').trim();
        const url   = (link.url || '').trim();

        // skip totally empty rows
        if (!label && !url) continue;

        let iconUrl = link.iconUrl || '';

        if (link.iconFile) {
            const ext  = getFileExtension(link.iconFile) || '.png';
            const slug = slugify(label || `link-${index + 1}`, `link-${index + 1}`);
            const path = `links/${slug}${ext}`;

            const { error: uploadError } = await client.storage
                .from(BUCKET)
                .upload(path, link.iconFile, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(path);
            iconUrl = publicUrlData.publicUrl;
        }

        linkRows.push({
            label: label || `Link ${index + 1}`,
            url,
            svg:   iconUrl,
        });

        savedSocialLinks.push({
            ...link,
            label:    label || `Link ${index + 1}`,
            url,
            iconFile: null,
            iconUrl,
        });
    }

    let inserted = [];
    if (linkRows.length) {
        const { error: insLinksError, data } = await client
            .from('links')
            .insert(linkRows)
            .select('id');
        if (insLinksError) throw insLinksError;
        inserted = data || [];
    }

    // attach DB ids to the savedSocialLinks (for stable keys next load)
    for (let i = 0; i < savedSocialLinks.length && i < inserted.length; i++) {
        savedSocialLinks[i].id = inserted[i].id;
    }

    return {
        ...state,
        proficientTechs:   proficient.length   ? proficient   : [''],
        experiencingTechs: experiencing.length ? experiencing : [''],
        socialLinks:       savedSocialLinks,
    };
}
