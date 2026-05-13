import { normalizeString } from '../shared/normalize.js';

function mapSkillsByLevel(skills, level) {
  if (!Array.isArray(skills)) return [];

  return skills
    .filter((skill) => skill?.level === level)
    .map((skill) => normalizeString(skill?.name))
    .filter(Boolean);
}

function mapLinkRowToPublic(row) {
  return {
    id: row?.id,
    platform: normalizeString(row?.label),
    url: normalizeString(row?.url),
    iconUrl: normalizeString(row?.svg),
  };
}

export function mapContactRowsToPublic({ skills, links } = {}) {
  const languages = mapSkillsByLevel(skills, 'proficient');
  const experience = mapSkillsByLevel(skills, 'experiencing');
  const socialLinks = Array.isArray(links)
    ? links.map(mapLinkRowToPublic).filter((link) => link.url)
    : [];

  if (!languages.length && !experience.length && !socialLinks.length) return null;

  return {
    languages,
    experience,
    links: socialLinks,
  };
}
