const JSON_BODY_LIMIT_BYTES = 512 * 1024;
const MULTIPART_BODY_LIMIT_BYTES = 40 * 1024 * 1024;

export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

export function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestError(`${label} must be an object`);
  }
}

export function getStatePayload(body, key) {
  assertPlainObject(body, 'Request body');

  const value = body[key] ?? body.state ?? body.payload ?? body;
  assertPlainObject(value, `${key} payload`);
  return value;
}

export async function parseAdminRequest(req) {
  const contentType = getHeader(req, 'content-type');

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartRequest(req);
  }

  if (
    contentType.includes('application/json') ||
    contentType.includes('text/plain') ||
    !contentType
  ) {
    return parseJsonRequest(req);
  }

  throw new BadRequestError('Unsupported admin request content type');
}

export function applyMultipartFiles(state, form, mappings) {
  if (!form) return state;

  for (const mapping of mappings) {
    const file = firstUploadedFile(form, mapping.names);
    if (!file) continue;
    mapping.set(state, file);
  }

  return state;
}

async function parseJsonRequest(req) {
  assertContentLength(req, JSON_BODY_LIMIT_BYTES, 'Admin JSON request body');
  const text = await readRequestText(req, JSON_BODY_LIMIT_BYTES);
  if (!text.trim()) return { body: {}, form: null };

  try {
    return { body: JSON.parse(text), form: null };
  } catch {
    throw new BadRequestError('Admin request body must be valid JSON');
  }
}

async function parseMultipartRequest(req) {
  assertContentLength(req, MULTIPART_BODY_LIMIT_BYTES, 'Admin multipart request body');

  const headers = new globalThis.Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else if (value) {
      headers.set(key, value);
    }
  }

  let form;
  try {
    const request = new globalThis.Request('http://localhost/admin-api/upload', {
      method: 'POST',
      headers,
      body: req,
      duplex: 'half',
    });
    form = await request.formData();
  } catch {
    throw new BadRequestError('Admin multipart request could not be parsed');
  }

  const rawPayload =
    form.get('payload') ??
    form.get('state') ??
    form.get('data') ??
    '{}';

  if (typeof rawPayload !== 'string') {
    throw new BadRequestError('Multipart payload must be a JSON string field');
  }

  try {
    return { body: JSON.parse(rawPayload), form };
  } catch {
    throw new BadRequestError('Multipart payload must contain valid JSON');
  }
}

function firstUploadedFile(form, names) {
  for (const name of names) {
    const value = form.get(name);
    if (isUploadedFile(value)) return value;
  }

  return null;
}

function isUploadedFile(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.name === 'string' &&
    value.size > 0
  );
}

function assertContentLength(req, limitBytes, label) {
  const value = req.headers['content-length'];
  if (!value) return;

  const size = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
  if (Number.isFinite(size) && size > limitBytes) {
    throw new BadRequestError(`${label} is too large`);
  }
}

function readRequestText(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new BadRequestError('Admin request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

function getHeader(req, name) {
  const value = req.headers[name];
  if (Array.isArray(value)) return value.join(', ').toLowerCase();
  return String(value || '').toLowerCase();
}
