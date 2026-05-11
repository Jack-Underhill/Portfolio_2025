export function getFileExtension(file) {
  if (!file?.name) return '';
  const dot = file.name.lastIndexOf('.');
  return dot === -1 ? '' : file.name.slice(dot);
}

export function slugify(label, fallback) {
  const base = (label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || fallback;
}

export function normalizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();

  for (const raw of arr) {
    const value = String(raw ?? '').trim();
    if (!value) continue;

    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    out.push(value);
  }

  return out;
}

export function flattenTechStack(techStack, techStackOrder) {
  if (!techStack || typeof techStack !== 'object') return [];

  const out = [];
  const seen = new Set();

  for (const category of techStackOrder) {
    const arr = Array.isArray(techStack?.[category]) ? techStack[category] : [];

    for (const raw of arr) {
      const value = String(raw ?? '').trim();
      if (!value) continue;

      const key = value.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      out.push(value);
    }
  }

  return out;
}
