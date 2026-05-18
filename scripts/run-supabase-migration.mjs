import { readFile } from 'node:fs/promises';
import path from 'node:path';

import postgres from 'postgres';

const migrationArg = process.argv[2];

if (!migrationArg) {
  console.error('Usage: npm run migrate:supabase -- database/migrations/<file>.sql');
  process.exit(1);
}

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('SUPABASE_DB_URL is required in .env.local');
  process.exit(1);
}

const root = process.cwd();
const migrationPath = path.resolve(root, migrationArg);
const migrationSql = await readFile(migrationPath, 'utf8');
const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require',
});

try {
  await sql.unsafe(migrationSql);

  const columns = await sql.unsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name IN ('featured_rank', 'project_type', 'labels')
    ORDER BY column_name
  `);

  const constraints = await sql.unsafe(`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.projects'::regclass
      AND conname IN ('projects_project_type_check', 'projects_labels_array_check')
    ORDER BY conname
  `);

  console.log(`Applied migration: ${path.relative(root, migrationPath)}`);
  console.log('Verified project classification columns:');
  columns.forEach((column) => {
    console.log(`- ${column.column_name}: ${column.data_type}, nullable=${column.is_nullable}`);
  });
  console.log('Verified project classification constraints:');
  constraints.forEach((constraint) => {
    console.log(`- ${constraint.conname}`);
  });
} finally {
  await sql.end();
}
