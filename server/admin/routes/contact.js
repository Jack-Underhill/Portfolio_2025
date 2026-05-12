import { requireServiceClient } from '../clients/supabaseService.js';
import { getFileExtension, slugify } from '../utils/strings.js';
import { uploadAndGetPublicUrl } from '../utils/storage.js';
import {
  applyMultipartFiles,
  getStatePayload,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';
import { validateContactState } from './validation.js';

export async function loadContactData() {
  const client = requireServiceClient();

  const [
    { data: skills, error: skillsError },
    { data: links, error: linksError },
  ] = await Promise.all([
    client.from('skills').select('*').order('id', { ascending: true }),
    client.from('links').select('*').order('id', { ascending: true }),
  ]);

  if (skillsError) throw skillsError;
  if (linksError) throw linksError;

  const proficient = (skills || [])
    .filter((skill) => skill.level === 'proficient')
    .map((skill) => skill.name || '');
  const experiencing = (skills || [])
    .filter((skill) => skill.level === 'experiencing')
    .map((skill) => skill.name || '');

  const socialLinks = (links || []).map((row) => ({
    id: row.id,
    label: row.label || '',
    url: row.url || '',
    iconFile: null,
    iconUrl: row.svg || '',
  }));

  return {
    proficientTechs: proficient.length ? proficient : [''],
    experiencingTechs: experiencing.length ? experiencing : [''],
    socialLinks,
  };
}

export async function handleContactRead(_req, res) {
  try {
    sendJson(res, 200, await loadContactData());
  } catch (error) {
    sendRouteError(res, error);
  }
}

export async function saveContactData(state) {
  const validState = validateContactState(state);
  const client = requireServiceClient();

  const proficient = validState.proficientTechs;
  const experiencing = validState.experiencingTechs;

  const { error: deleteSkillsError } = await client
    .from('skills')
    .delete()
    .neq('id', 0);
  if (deleteSkillsError) throw deleteSkillsError;

  const skillRows = [
    ...proficient.map((name) => ({ name, level: 'proficient' })),
    ...experiencing.map((name) => ({ name, level: 'experiencing' })),
  ];

  if (skillRows.length) {
    const { error } = await client
      .from('skills')
      .insert(skillRows, { returning: 'minimal' });
    if (error) throw error;
  }

  const { error: deleteLinksError } = await client
    .from('links')
    .delete()
    .neq('id', 0);
  if (deleteLinksError) throw deleteLinksError;

  const linkRows = [];
  const savedSocialLinks = [];

  for (let index = 0; index < validState.socialLinks.length; index += 1) {
    const link = validState.socialLinks[index] || {};
    const label = link.label;
    const url = link.url;

    if (!label && !url) continue;

    let iconUrl = link.iconUrl;
    if (link.iconFile) {
      const ext = getFileExtension(link.iconFile) || '.png';
      const slug = slugify(label || `link-${index + 1}`, `link-${index + 1}`);
      iconUrl = await uploadAndGetPublicUrl(`links/${slug}${ext}`, link.iconFile);
    }

    const savedLabel = label || `Link ${index + 1}`;
    linkRows.push({
      label: savedLabel,
      url,
      svg: iconUrl,
    });

    savedSocialLinks.push({
      ...link,
      label: savedLabel,
      url,
      iconFile: null,
      iconUrl,
    });
  }

  let inserted = [];
  if (linkRows.length) {
    const { data, error } = await client
      .from('links')
      .insert(linkRows)
      .select('id');
    if (error) throw error;
    inserted = data || [];
  }

  for (let index = 0; index < savedSocialLinks.length && index < inserted.length; index += 1) {
    savedSocialLinks[index].id = inserted[index].id;
  }

  return {
    ...validState,
    proficientTechs: proficient.length ? proficient : [''],
    experiencingTechs: experiencing.length ? experiencing : [''],
    socialLinks: savedSocialLinks,
  };
}

export async function handleContactWrite(req, res) {
  try {
    const { body, form } = await parseAdminRequest(req);
    const state = getStatePayload(body, 'contact');
    attachContactFiles(state, form);
    sendJson(res, 200, await saveContactData(state));
  } catch (error) {
    sendRouteError(res, error);
  }
}

export function attachContactFiles(state, form) {
  if (!form || !Array.isArray(state.socialLinks)) return;

  state.socialLinks.forEach((link, index) => {
    applyMultipartFiles(link, form, [
      {
        names: [
          `socialLinks.${index}.iconFile`,
          `contact.socialLinks.${index}.iconFile`,
          `socialLinks[${index}][iconFile]`,
          `contact.socialLinks[${index}][iconFile]`,
          `contact[socialLinks][${index}][iconFile]`,
        ],
        set: (target, file) => {
          target.iconFile = file;
        },
      },
    ]);
  });
}
