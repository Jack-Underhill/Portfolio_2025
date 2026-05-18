import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schemaPath = path.join(root, 'database', 'schema.sql');

const runtimeSearchRoots = [
  'src',
  'server',
  path.join('database', 'schema.sql'),
  path.join('database', 'migrations'),
];

const forbiddenRuntimePatterns = [
  {
    label: 'stale project_cards table reference',
    pattern: /\bproject_cards\b/,
    roots: runtimeSearchRoots,
  },
  {
    label: 'service-role reference under src',
    pattern: /\b(?:SUPABASE_SERVICE_ROLE_KEY|VITE_SUPABASE_SERVICE_ROLE_KEY|supabaseAdmin|requireServiceClient)\b/,
    roots: ['src'],
  },
];

const requiredTables = [
  'about',
  'project_section',
  'projects',
  'skills',
  'links',
];

const requiredProjectColumns = [
  'id',
  'permalink',
  'image_url',
  'video_url',
  'architecture_image_url',
  'title',
  'card_description',
  'live_url',
  'overview',
  'role',
  'source_url',
  'writeup_url',
  'video_page_url',
  'tech_stack',
  'tech_tags',
  'features',
  'metrics',
  'challenges',
  'improvements',
  'featured_rank',
  'project_type',
  'labels',
  'published',
  'sort_order',
];

function toAbsolute(relativePath) {
  return path.join(root, relativePath);
}

function listFiles(target) {
  const absolute = toAbsolute(target);
  const stats = statSync(absolute);

  if (stats.isFile()) return [absolute];

  const files = [];
  for (const entry of readdirSync(absolute)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;

    const child = path.join(target, entry);
    const childStats = statSync(toAbsolute(child));
    if (childStats.isDirectory()) {
      files.push(...listFiles(child));
    } else {
      files.push(toAbsolute(child));
    }
  }

  return files;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

function findPatternMatches({ pattern, roots }) {
  const matches = [];

  for (const searchRoot of roots) {
    for (const filePath of listFiles(searchRoot)) {
      const text = readFileSync(filePath, 'utf8');
      const lines = text.split(/\r?\n/);

      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          matches.push(`${relative(filePath)}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }

  return matches;
}

function assertSchemaContains(schema, kind, names) {
  const missing = [];

  for (const name of names) {
    const pattern = new RegExp(`\\b${name}\\b`, 'i');
    if (!pattern.test(schema)) missing.push(`${kind}: ${name}`);
  }

  return missing;
}

const failures = [];

for (const check of forbiddenRuntimePatterns) {
  const matches = findPatternMatches(check);
  if (matches.length) {
    failures.push({
      title: check.label,
      details: matches,
    });
  }
}

const schema = readFileSync(schemaPath, 'utf8');
const missingSchemaNames = [
  ...assertSchemaContains(schema, 'table', requiredTables),
  ...assertSchemaContains(schema, 'projects column', requiredProjectColumns),
];

if (missingSchemaNames.length) {
  failures.push({
    title: 'database/schema.sql is missing required runtime names',
    details: missingSchemaNames,
  });
}

if (failures.length) {
  console.error('Schema drift check failed.');
  for (const failure of failures) {
    console.error(`\n${failure.title}`);
    failure.details.forEach((detail) => console.error(`- ${detail}`));
  }
  process.exitCode = 1;
} else {
  console.log('Schema drift check passed.');
  console.log(`Checked ${requiredTables.length} tables and ${requiredProjectColumns.length} project columns.`);
}
