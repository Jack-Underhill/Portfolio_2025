import { PROJECT_ROUTE_PATTERN } from './constants.js';

export function parseProjectPath(pathname) {
  const match = String(pathname ?? '').match(PROJECT_ROUTE_PATTERN);
  if (!match) return null;

  const permalink = decodeURIComponent(match[1] || '').trim();
  if (!permalink) return null;

  const id = Number(permalink.split('-')[0]);
  if (!Number.isFinite(id)) return null;

  return { id, permalink };
}

export function buildProjectPath(permalinkOrId) {
  const segment = String(permalinkOrId ?? '').trim();
  return `/p/${encodeURIComponent(segment)}`;
}
