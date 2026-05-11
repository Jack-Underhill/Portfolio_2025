import { requireServiceClient } from '../clients/supabaseService.js';
import { sendJson, sendRouteError } from './responses.js';

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
