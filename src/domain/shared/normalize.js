export function normalizeOptionalString(value) {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim();
  if (!normalized || normalized.toUpperCase() === 'NULL') return null;

  return normalized;
}

export function normalizeString(value, fallback = '') {
  return normalizeOptionalString(value) ?? fallback;
}

export function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;

  return value
    .map((item) => normalizeOptionalString(item))
    .filter(Boolean);
}

export function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}
