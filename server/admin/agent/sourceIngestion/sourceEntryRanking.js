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
const TEST_PATH_PATTERN = /(?:^|\/)(?:tests?|__tests__|specs?)(?:\/|$)|(?:^|\/)[^/]*(?:[._-](?:tests?|specs?))(?:\/|$)|(?:\.test|\.spec)\.[a-z0-9.]+$/i;
const PASCAL_TEST_FILE_PATTERN = /(?:Test|Tests|Spec|Specs)\.[A-Za-z0-9.]+$/;
const IMPLEMENTATION_PATH_PATTERN = /^(?:src|app|pages|server|client|web|lib|components|routes)\//i;

function getBaseName(path) {
  return path.split('/').filter(Boolean).at(-1) || '';
}

function isTestPath(path) {
  return TEST_PATH_PATTERN.test(path) || PASCAL_TEST_FILE_PATTERN.test(getBaseName(path));
}

function getPathSegments(path) {
  return path.split('/').filter(Boolean);
}

function getSourceCategoryKey(path) {
  const segments = getPathSegments(path);

  if (isTestPath(path)) return 'tests';
  return segments[0]?.toLowerCase() || '__root__';
}

function compareRankedEntries(left, right) {
  const priorityDelta = left.rank - right.rank;

  if (priorityDelta !== 0) return priorityDelta;

  return left.path.localeCompare(right.path);
}

function getGroupedEntries(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const key = getSourceCategoryKey(entry.path);
    const group = groups.get(key) || [];

    group.push(entry);
    groups.set(key, group);
  });

  groups.forEach((group) => group.sort(compareRankedEntries));

  return Array
    .from(groups.entries())
    .map(([key, group]) => ({ key, group }))
    .sort((left, right) => {
      const rankDelta = left.group[0].rank - right.group[0].rank;

      if (rankDelta !== 0) return rankDelta;

      return left.group[0].path.localeCompare(right.group[0].path);
    });
}

function interleaveSupportedSourceEntries(entries) {
  const testEntries = entries
    .filter((entry) => isTestPath(entry.path))
    .sort(compareRankedEntries);
  const groups = getGroupedEntries(entries.filter((entry) => !isTestPath(entry.path)));
  const result = [];
  let round = 0;

  while (groups.some(({ group }) => group.length > 0)) {
    groups.forEach(({ group }) => {
      const nextEntry = group.shift();

      if (nextEntry) result.push(nextEntry);
    });

    if (testEntries.length > 0 && round % 2 === 0) {
      result.push(testEntries.shift());
    }

    round += 1;
  }

  return [...result, ...testEntries];
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
  if (IMPLEMENTATION_PATH_PATTERN.test(safePath) && supported) return 40;
  if (supported && !isTestPath(safePath)) return 50;
  if (supported) return 60;
  return 70;
}

export function sortSourceEntriesByPathRank(entries, {
  getPath = (entry) => entry?.path,
  getIgnoreReason = () => '',
  isSupported = () => false,
} = {}) {
  if (!Array.isArray(entries)) return [];

  const rankedEntries = entries.map((entry) => {
    const path = typeof getPath(entry) === 'string' ? getPath(entry) : '';
    const ignoreReason = getIgnoreReason(entry, path);
    const supported = isSupported(entry, path);

    return {
      entry,
      path,
      rank: getSourceEntryPathRank({
        path,
        ignoreReason,
        supported,
      }),
      ignoreReason,
      supported,
    };
  });
  const leadingEntries = rankedEntries
    .filter((entry) => entry.rank < 40)
    .sort(compareRankedEntries);
  const sourceEntries = rankedEntries
    .filter((entry) => entry.supported && !entry.ignoreReason && entry.rank >= 40 && entry.rank <= 60);
  const trailingEntries = rankedEntries
    .filter((entry) => !leadingEntries.includes(entry) && !sourceEntries.includes(entry))
    .sort(compareRankedEntries);

  return [
    ...leadingEntries,
    ...interleaveSupportedSourceEntries(sourceEntries),
    ...trailingEntries,
  ].map(({ entry }) => entry);
}
