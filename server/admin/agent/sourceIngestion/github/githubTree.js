import { validateTextSourceFileName } from '../validation/textValidation.js';
import { getGitHubPathIgnoreReason } from './githubPathPolicy.js';

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

function getGitHubBlobPath(entry) {
  return typeof entry?.path === 'string' ? entry.path : '';
}

function getBaseName(path) {
  return path.split('/').filter(Boolean).at(-1) || '';
}

function getGitHubBlobPriority(entry) {
  const path = getGitHubBlobPath(entry);
  const baseName = getBaseName(path);
  const baseNameLower = baseName.toLowerCase();
  const ignoreReason = getGitHubPathIgnoreReason(path);

  if (ignoreReason) return 80;
  if (README_PATTERN.test(baseName)) return 0;
  if (/^(?:docs?|documentation)\//i.test(path) && validateTextSourceFileName(path).ok) return 10;
  if (CONFIG_FILE_NAMES.has(baseName) || CONFIG_FILE_NAMES.has(baseNameLower)) return 20;
  if (SOURCE_ENTRYPOINT_PATTERN.test(path) && validateTextSourceFileName(path).ok) return 30;
  if (TEST_PATH_PATTERN.test(path) && validateTextSourceFileName(path).ok) return 40;
  if (IMPLEMENTATION_PATH_PATTERN.test(path) && validateTextSourceFileName(path).ok) return 50;
  if (validateTextSourceFileName(path).ok) return 60;
  return 70;
}

export function getSortedGitHubBlobEntries(tree) {
  return Array.isArray(tree)
    ? tree
      .filter((entry) => entry?.type === 'blob')
      .slice()
      .sort((left, right) => {
        const priorityDelta = getGitHubBlobPriority(left) - getGitHubBlobPriority(right);
        if (priorityDelta !== 0) return priorityDelta;

        return getGitHubBlobPath(left).localeCompare(getGitHubBlobPath(right));
      })
    : [];
}

export function getGitHubTreeWarnings({ repoLabel, treeResult, blobEntries, maxTreeEntries }) {
  const warnings = [];

  if (treeResult?.data?.truncated) {
    warnings.push(`GitHub repository "${repoLabel}" tree was truncated by GitHub before all files could be inspected.`);
  }

  if (blobEntries.length > maxTreeEntries) {
    warnings.push(`GitHub repository "${repoLabel}" has ${blobEntries.length} file entries; only the first ${maxTreeEntries} entries were inspected.`);
  }

  return warnings;
}
