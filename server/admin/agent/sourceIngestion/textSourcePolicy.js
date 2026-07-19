import {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES,
  PROJECT_AGENT_TEXT_SOURCE_MEDIA_TYPES_BY_EXTENSION,
} from '../../../../src/domain/projectAgentSourcePolicy.js';

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES,
  PROJECT_AGENT_TEXT_SOURCE_MEDIA_TYPES_BY_EXTENSION,
};

export const TEXT_SOURCE_ALLOWED_EXTENSION_SET = new Set(PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS);
export const TEXT_SOURCE_ALLOWED_FILENAME_SET = new Set(
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES.map((name) => name.toLowerCase()),
);
export const TEXT_SOURCE_DISALLOWED_SECRET_FILENAMES = new Set([
  '.env',
  '.npmrc',
  '.pypirc',
  '.netrc',
  '.pgpass',
  '.dockercfg',
  'id_rsa',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519',
]);
export const TEXT_SOURCE_DISALLOWED_SECRET_EXTENSIONS = new Set([
  '.pem',
  '.key',
  '.p12',
  '.pfx',
  '.crt',
  '.cer',
  '.der',
  '.jks',
  '.keystore',
]);
export const TEXT_SOURCE_DISALLOWED_BINARY_OR_DUMP_EXTENSIONS = new Set([
  '.db',
  '.sqlite',
  '.sqlite3',
  '.dump',
]);
export {
  SOURCE_GENERATED_BUNDLE_PATTERN as TEXT_SOURCE_GENERATED_BUNDLE_PATTERN,
  SOURCE_GENERATED_SOURCE_PATTERN as TEXT_SOURCE_GENERATED_SOURCE_PATTERN,
} from './sourcePathPolicy.js';
