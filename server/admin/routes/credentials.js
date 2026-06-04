import { requireServiceClient } from '../clients/supabaseService.js';
import {
  getStatePayload,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';
import { validateCredentialsState } from './validation.js';

const CREDENTIAL_COLUMNS = [
  'id',
  'credential_kind',
  'title',
  'organization',
  'credential_type',
  'description',
  'highlights',
  'issued_label',
  'gpa',
  'credential_url',
  'logo_url',
  'logo_key',
  'logo_scale',
  'published',
  'sort_order',
].join(', ');

export async function loadCredentialsData() {
  const client = requireServiceClient();

  const { data, error } = await client
    .from('credentials')
    .select(CREDENTIAL_COLUMNS)
    .order('credential_kind', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  return dbRowsToUiCredentials(data || []);
}

export async function handleCredentialsRead(_req, res) {
  try {
    sendJson(res, 200, await loadCredentialsData());
  } catch (error) {
    sendRouteError(res, error);
  }
}

export async function saveCredentialsData(state) {
  const validState = validateCredentialsState(state);
  const client = requireServiceClient();

  const { error: deleteError } = await client
    .from('credentials')
    .delete()
    .neq('id', 0);
  if (deleteError) throw deleteError;

  const rows = uiCredentialsToDbRows(validState);
  if (!rows.length) return { education: [], certifications: [] };

  const { data, error } = await client
    .from('credentials')
    .insert(rows)
    .select(CREDENTIAL_COLUMNS);
  if (error) throw error;

  return dbRowsToUiCredentials(data || []);
}

export async function handleCredentialsWrite(req, res) {
  try {
    const { body } = await parseAdminRequest(req);
    const state = getStatePayload(body, 'credentials');
    sendJson(res, 200, await saveCredentialsData(state));
  } catch (error) {
    sendRouteError(res, error);
  }
}

function dbRowsToUiCredentials(rows) {
  const output = {
    education: [],
    certifications: [],
  };

  for (const row of rows) {
    const credential = dbRowToUiCredential(row);
    if (!credential) continue;

    if (credential.kind === 'education') {
      output.education.push(credential);
      continue;
    }

    output.certifications.push(credential);
  }

  output.education = output.education.toSorted(compareBySortOrderThenId);
  output.certifications = output.certifications.toSorted(compareBySortOrderThenId);

  return output;
}

function dbRowToUiCredential(row) {
  const kind = stringOrEmpty(row.credential_kind);
  if (kind !== 'education' && kind !== 'certification') return null;

  return {
    id: row.id ?? null,
    kind,
    title: stringOrEmpty(row.title),
    org: stringOrEmpty(row.organization),
    credentialType: stringOrEmpty(row.credential_type),
    desc: stringOrEmpty(row.description),
    chips: normalizeStringList(row.highlights),
    issued: stringOrEmpty(row.issued_label),
    gpa: stringOrEmpty(row.gpa),
    link: stringOrEmpty(row.credential_url),
    logoUrl: stringOrEmpty(row.logo_url),
    logoKey: stringOrEmpty(row.logo_key),
    logoScale: normalizeLogoScale(row.logo_scale),
    published: row.published !== false,
    sortOrder: normalizeSortOrder(row.sort_order),
  };
}

function uiCredentialsToDbRows(state) {
  return [
    ...state.education.map((credential) => uiCredentialToDbRow(credential, 'education')),
    ...state.certifications.map((credential) => uiCredentialToDbRow(credential, 'certification')),
  ];
}

function uiCredentialToDbRow(credential, kind) {
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

function compareBySortOrderThenId(left, right) {
  if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;

  const leftId = Number(left.id);
  const rightId = Number(right.id);
  if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
    return leftId - rightId;
  }

  return String(left.id ?? '').localeCompare(String(right.id ?? ''));
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => stringOrEmpty(item))
    .filter(Boolean);
}

function normalizeLogoScale(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0.7;
}

function normalizeSortOrder(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}
