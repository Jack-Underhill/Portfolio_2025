import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const TABLES = [
  'about',
  'project_section',
  'projects',
  'skills',
  'links',
];

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-assets';
const PAGE_SIZE = 1000;
const STORAGE_PAGE_SIZE = 100;

const root = process.cwd();
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function timestampForPath(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-');
}

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function toSafeOutputPath(baseDir, objectPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, ...objectPath.split('/'));

  if (resolvedTarget !== resolvedBase && !resolvedTarget.startsWith(`${resolvedBase}${path.sep}`)) {
    throw new Error(`Refusing to write outside backup directory: ${objectPath}`);
  }

  return resolvedTarget;
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function copySchemaSnapshot(outputDir) {
  const schemaPath = path.join(root, 'database', 'schema.sql');
  const outputPath = path.join(outputDir, 'database', 'schema.sql');

  try {
    const schema = await readFile(schemaPath, 'utf8');
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, schema, 'utf8');
    return true;
  } catch (error) {
    console.warn(`[backup] Could not copy database/schema.sql: ${error.message}`);
    return false;
  }
}

async function backupTable(client, tableName, outputDir) {
  const rows = [];
  let total = null;
  let offset = 0;

  while (true) {
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Could not back up table "${tableName}": ${error.message}`);
    }

    if (total === null) total = count ?? null;

    const page = data || [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  await writeJson(path.join(outputDir, 'database', 'tables', `${tableName}.json`), rows);

  return {
    table: tableName,
    rows: rows.length,
    reportedRows: total,
  };
}

async function listStoragePage(client, prefix, offset) {
  const { data, error } = await client.storage
    .from(BUCKET)
    .list(prefix, {
      limit: STORAGE_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`Could not list storage path "${prefix || '/'}": ${error.message}`);
  }

  return data || [];
}

function isLikelyFolder(entry) {
  return entry.id === null || entry.metadata === null || entry.metadata === undefined;
}

async function downloadStorageObject(client, objectPath, storageOutputDir) {
  const { data, error } = await client.storage.from(BUCKET).download(objectPath);

  if (error) {
    return {
      downloaded: false,
      error: error.message,
    };
  }

  const arrayBuffer = await data.arrayBuffer();
  const outputPath = toSafeOutputPath(storageOutputDir, objectPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(arrayBuffer));

  return {
    downloaded: true,
    bytes: data.size,
    contentType: data.type || null,
  };
}

async function backupStoragePrefix(client, prefix, storageOutputDir, manifest) {
  let offset = 0;

  while (true) {
    const entries = await listStoragePage(client, prefix, offset);

    for (const entry of entries) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (isLikelyFolder(entry)) {
        await backupStoragePrefix(client, objectPath, storageOutputDir, manifest);
        continue;
      }

      const result = await downloadStorageObject(client, objectPath, storageOutputDir);

      if (!result.downloaded) {
        await backupStoragePrefix(client, objectPath, storageOutputDir, manifest).catch(() => {
          manifest.objects.push({
            path: objectPath,
            downloaded: false,
            error: result.error,
          });
        });
        continue;
      }

      manifest.objects.push({
        path: objectPath,
        size: result.bytes,
        contentType: result.contentType,
        updatedAt: entry.updated_at || null,
      });
    }

    if (entries.length < STORAGE_PAGE_SIZE) break;
    offset += STORAGE_PAGE_SIZE;
  }
}

async function main() {
  requireEnv('SUPABASE_URL', supabaseUrl);
  requireEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  const startedAt = new Date();
  const backupRoot = process.env.SUPABASE_BACKUP_DIR || path.join(root, 'backups', 'supabase');
  const outputDir = path.join(backupRoot, timestampForPath(startedAt));
  const databaseDir = path.join(outputDir, 'database');
  const storageDir = path.join(outputDir, 'storage', BUCKET);

  await mkdir(outputDir, { recursive: true });

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const url = new URL(supabaseUrl);
  const databaseTables = [];

  for (const tableName of TABLES) {
    const result = await backupTable(client, tableName, outputDir);
    databaseTables.push(result);
    console.log(`[backup] table ${tableName}: ${result.rows} rows`);
  }

  const schemaCopied = await copySchemaSnapshot(outputDir);

  const storageManifest = {
    bucket: BUCKET,
    objects: [],
  };

  await mkdir(storageDir, { recursive: true });
  await backupStoragePrefix(client, '', storageDir, storageManifest);
  await writeJson(path.join(outputDir, 'storage', `${BUCKET}.manifest.json`), storageManifest);

  const completedAt = new Date();
  const manifest = {
    kind: 'supabase-logical-app-backup',
    note: 'This backs up known portfolio app tables as JSON plus Supabase Storage objects. It is not a full pg_dump or full Supabase project export.',
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    supabaseHost: url.host,
    bucket: BUCKET,
    schemaSnapshotCopied: schemaCopied,
    tables: databaseTables,
    storageObjects: storageManifest.objects.length,
  };

  await writeJson(path.join(outputDir, 'manifest.json'), manifest);

  console.log(`[backup] storage ${BUCKET}: ${storageManifest.objects.length} objects`);
  console.log(`[backup] wrote ${path.relative(root, outputDir)}`);
}

main().catch((error) => {
  console.error(`[backup] ${error.message}`);
  process.exitCode = 1;
});
