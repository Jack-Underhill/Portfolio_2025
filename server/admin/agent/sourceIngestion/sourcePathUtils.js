export function normalizeSourcePathSlashes(value) {
  return typeof value === 'string' ? value.replace(/\\/g, '/') : '';
}

export function getSourcePathSegments(value) {
  return normalizeSourcePathSlashes(value)
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getSourceFileBaseName(name) {
  return getSourcePathSegments(typeof name === 'string' ? name.trim() : '').at(-1) || '';
}

export function getSourceFileExtension(name) {
  const baseName = getSourceFileBaseName(name);
  const lastDotIndex = baseName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === baseName.length - 1) {
    return '';
  }

  return baseName.slice(lastDotIndex).toLowerCase();
}

export function hasWindowsDrivePathPrefix(path) {
  return /^[A-Za-z]:(?:\/|\\)/.test(String(path || ''));
}

export function isSafeRelativeSourcePath(path, { allowWindowsDrivePrefix = false } = {}) {
  if (typeof path !== 'string' || !path.trim()) return false;
  if (path.startsWith('/') || path.startsWith('\\') || path.includes('\\')) return false;
  if (!allowWindowsDrivePrefix && hasWindowsDrivePathPrefix(path)) return false;

  return path
    .split('/')
    .every((part) => part && part !== '.' && part !== '..');
}

export function cleanUnsafeRelativeSourcePath(path, fallback = 'unsafe entry') {
  const label = normalizeSourcePathSlashes(String(path || ''))
    .split('/')
    .filter((part) => (
      part
      && part !== '.'
      && part !== '..'
      && !/^[A-Za-z]:$/.test(part)
    ))
    .join('/');

  return label || fallback;
}

export function joinSourceDisplayPath(...parts) {
  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' / ');
}

export function encodeSourcePathForUrl(path) {
  return String(path)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}
