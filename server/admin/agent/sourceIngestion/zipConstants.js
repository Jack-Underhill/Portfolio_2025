export const PROJECT_AGENT_SOURCE_ZIP_EXTENSION = '.zip';
export const PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE = 'application/zip';
export const PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES = 20 * 1024 * 1024;
export const PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES = 200;
export const PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES = 10;
export const PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES = 512 * 1024;
export const PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES = 5 * 1024 * 1024;

export const IGNORED_ZIP_PATH_SEGMENTS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'generated',
  'coverage',
  '.next',
  '.cache',
  '.venv',
  'venv',
  '__pycache__',
]);
