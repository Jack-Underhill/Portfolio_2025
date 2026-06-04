import {
  normalizeOptionalString,
  normalizeString,
  normalizeStringArray,
} from '../shared/normalize.js';

const VALID_CREDENTIAL_KINDS = new Set(['education', 'certification']);
const DEFAULT_LOGO_SCALE = 0.7;
const MIN_LOGO_SCALE = 0.4;
const MAX_LOGO_SCALE = 1.2;

function normalizeSortOrder(value) {
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) ? numberValue : 0;
}

function normalizeLogoScale(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return DEFAULT_LOGO_SCALE;

  return Math.min(MAX_LOGO_SCALE, Math.max(MIN_LOGO_SCALE, numberValue));
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

function normalizeCredentialKind(value) {
  const kind = normalizeOptionalString(value);
  return VALID_CREDENTIAL_KINDS.has(kind) ? kind : null;
}

function mapCredentialRowToPublic(row) {
  const kind = normalizeCredentialKind(row?.credential_kind);
  const title = normalizeOptionalString(row?.title);
  const org = normalizeOptionalString(row?.organization);

  if (!kind || !title || !org || row?.published === false) return null;

  return {
    id: row?.id,
    kind,
    title,
    org,
    credentialType: normalizeString(row?.credential_type),
    desc: normalizeString(row?.description),
    chips: normalizeStringArray(row?.highlights, []),
    issued: normalizeString(row?.issued_label),
    gpa: normalizeString(row?.gpa),
    link: normalizeString(row?.credential_url),
    logoUrl: normalizeOptionalString(row?.logo_url),
    logoKey: normalizeOptionalString(row?.logo_key),
    logoScale: normalizeLogoScale(row?.logo_scale),
    sortOrder: normalizeSortOrder(row?.sort_order),
  };
}

export function mapCredentialRowsToPublic(rows) {
  if (!Array.isArray(rows)) return null;

  const credentials = rows
    .map(mapCredentialRowToPublic)
    .filter(Boolean);

  if (!credentials.length) return null;

  const output = {
    education: [],
    certifications: [],
  };

  credentials.forEach((credential) => {
    if (credential.kind === 'education') {
      output.education.push(credential);
      return;
    }

    output.certifications.push(credential);
  });

  output.education = output.education.toSorted(compareBySortOrderThenId);
  output.certifications = output.certifications.toSorted(compareBySortOrderThenId);

  return output;
}
