import { normalizeString } from '../shared/normalize.js';

function mapLinkRowToPublic(row) {
  return {
    id: row?.id,
    platform: normalizeString(row?.label),
    url: normalizeString(row?.url),
    iconUrl: normalizeString(row?.svg),
  };
}

export function mapContactRowsToPublic({ links } = {}) {
  const socialLinks = Array.isArray(links)
    ? links.map(mapLinkRowToPublic).filter((link) => link.url)
    : [];

  if (!socialLinks.length) return null;

  return {
    links: socialLinks,
  };
}
