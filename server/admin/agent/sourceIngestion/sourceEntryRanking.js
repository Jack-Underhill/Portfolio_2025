const README_PATTERN = /^readme(?:\.[a-z0-9]+)?$/i;
const CONFIG_FILE_NAMES = new Set([
  '.editorconfig',
  '.env.example',
  'astro.config.js',
  'astro.config.mjs',
  'astro.config.ts',
  'composer.json',
  'docker-compose.yml',
  'Dockerfile',
  'Gemfile',
  'go.mod',
  'Makefile',
  'netlify.toml',
  'package.json',
  'Procfile',
  'pyproject.toml',
  'requirements.txt',
  'render.yaml',
  'tsconfig.json',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
  'vercel.json',
  'wrangler.toml',
]);
const SOURCE_ENTRYPOINT_PATTERN = /^(?:src|app|pages|server|client|web)\/(?:main|index|app|page|layout|server|client|api)\.[a-z0-9.]+$/i;
const TEST_PATH_PATTERN = /(?:^|\/)(?:tests?|__tests__)\/|(?:\.test|\.spec)\.[a-z0-9.]+$/i;
const IMPLEMENTATION_PATH_PATTERN = /^(?:src|app|pages|server|client|web|lib|components|routes)\//i;

function getBaseName(path) {
  return path.split('/').filter(Boolean).at(-1) || '';
}

export function getSourceEntryPathRank({
  path,
  ignoreReason = '',
  supported = false,
} = {}) {
  const safePath = typeof path === 'string' ? path : '';
  const baseName = getBaseName(safePath);
  const baseNameLower = baseName.toLowerCase();

  if (ignoreReason) return 80;
  if (README_PATTERN.test(baseName)) return 0;
  if (/^(?:docs?|documentation)\//i.test(safePath) && supported) return 10;
  if (CONFIG_FILE_NAMES.has(baseName) || CONFIG_FILE_NAMES.has(baseNameLower)) return 20;
  if (SOURCE_ENTRYPOINT_PATTERN.test(safePath) && supported) return 30;
  if (TEST_PATH_PATTERN.test(safePath) && supported) return 40;
  if (IMPLEMENTATION_PATH_PATTERN.test(safePath) && supported) return 50;
  if (supported) return 60;
  return 70;
}

export function sortSourceEntriesByPathRank(entries, {
  getPath = (entry) => entry?.path,
  getIgnoreReason = () => '',
  isSupported = () => false,
} = {}) {
  return Array.isArray(entries)
    ? entries
      .slice()
      .sort((left, right) => {
        const leftPath = typeof getPath(left) === 'string' ? getPath(left) : '';
        const rightPath = typeof getPath(right) === 'string' ? getPath(right) : '';
        const priorityDelta = getSourceEntryPathRank({
          path: leftPath,
          ignoreReason: getIgnoreReason(left, leftPath),
          supported: isSupported(left, leftPath),
        }) - getSourceEntryPathRank({
          path: rightPath,
          ignoreReason: getIgnoreReason(right, rightPath),
          supported: isSupported(right, rightPath),
        });

        if (priorityDelta !== 0) return priorityDelta;

        return leftPath.localeCompare(rightPath);
      })
    : [];
}
