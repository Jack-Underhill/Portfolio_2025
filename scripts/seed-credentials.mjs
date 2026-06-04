import { createClient } from '@supabase/supabase-js';

import { DEFAULT_CREDENTIALS } from '../src/domain/credentials/defaults.js';
import { validateCredentialsState } from '../server/admin/routes/validation.js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const replaceExisting = process.argv.includes('--replace');

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function credentialToDbRow(credential, kind) {
  return {
    credential_kind: kind,
    title: credential.title,
    organization: credential.org,
    credential_type: credential.credentialType || null,
    description: credential.desc || null,
    highlights: credential.chips.length ? credential.chips : null,
    issued_label: credential.issued || null,
    gpa: credential.gpa || null,
    credential_url: credential.link || null,
    logo_url: credential.logoUrl || null,
    logo_key: credential.logoKey || null,
    logo_scale: credential.logoScale,
    published: credential.published,
    sort_order: credential.sortOrder,
  };
}

function credentialsToDbRows(state) {
  return [
    ...state.education.map((credential) => credentialToDbRow(credential, 'education')),
    ...state.certifications.map((credential) => credentialToDbRow(credential, 'certification')),
  ];
}

function stripFallbackIds(credentials) {
  return credentials.map(({ id: _id, ...credential }) => credential);
}

async function getExistingCount(client) {
  const { error, count } = await client
    .from('credentials')
    .select('id', { count: 'exact', head: true });

  if (error) throw new Error(`Could not inspect credentials table: ${error.message}`);
  return count ?? 0;
}

async function verifyPublicRead() {
  if (!anonKey) {
    console.warn('[credentials-seed] Skipping anon verification: VITE_SUPABASE_ANON_KEY is not set');
    return null;
  }

  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await publicClient
    .from('credentials')
    .select('id, credential_kind, published')
    .eq('published', true)
    .order('credential_kind', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw new Error(`Anon read verification failed: ${error.message}`);
  return data || [];
}

async function main() {
  requireEnv('SUPABASE_URL', supabaseUrl);
  requireEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const state = validateCredentialsState({
    education: stripFallbackIds(DEFAULT_CREDENTIALS.education),
    certifications: stripFallbackIds(DEFAULT_CREDENTIALS.certifications),
  });
  const rows = credentialsToDbRows(state);
  const existingCount = await getExistingCount(serviceClient);

  if (existingCount > 0 && !replaceExisting) {
    console.log(`[credentials-seed] credentials already has ${existingCount} rows; no changes made`);
    console.log('[credentials-seed] pass --replace to replacement-save defaults after taking a fresh backup');
  } else {
    if (replaceExisting) {
      const { error: deleteError } = await serviceClient
        .from('credentials')
        .delete()
        .neq('id', 0);

      if (deleteError) throw new Error(`Could not clear credentials table: ${deleteError.message}`);
    }

    const { error } = await serviceClient.from('credentials').insert(rows);
    if (error) throw new Error(`Could not seed credentials: ${error.message}`);

    console.log(`[credentials-seed] inserted ${rows.length} credential rows`);
  }

  const publicRows = await verifyPublicRead();
  if (publicRows) {
    const educationCount = publicRows.filter((row) => row.credential_kind === 'education').length;
    const certificationCount = publicRows.filter((row) => row.credential_kind === 'certification').length;
    console.log(
      `[credentials-seed] anon read verified ${educationCount} education rows and ${certificationCount} certification rows`,
    );
  }
}

main().catch((error) => {
  console.error(`[credentials-seed] ${error.message}`);
  process.exitCode = 1;
});
