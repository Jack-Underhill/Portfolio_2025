const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });
const TEXT_ENCODER = new TextEncoder();

export const PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS = [
  '.txt',
  '.text',
  '.md',
  '.markdown',
  '.mdx',
  '.rst',
  '.adoc',
  '.json',
  '.jsonc',
  '.json5',
  '.csv',
  '.tsv',
  '.ndjson',
  '.log',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.mts',
  '.cts',
  '.tsx',
  '.py',
  '.pyw',
  '.java',
  '.c',
  '.cc',
  '.cpp',
  '.cxx',
  '.h',
  '.hh',
  '.hpp',
  '.hxx',
  '.cs',
  '.go',
  '.rs',
  '.rb',
  '.php',
  '.swift',
  '.kt',
  '.kts',
  '.r',
  '.dart',
  '.scala',
  '.sc',
  '.lua',
  '.ex',
  '.exs',
  '.erl',
  '.hrl',
  '.clj',
  '.cljs',
  '.cljc',
  '.fs',
  '.fsx',
  '.fsi',
  '.vb',
  '.svelte',
  '.vue',
  '.astro',
  '.graphql',
  '.gql',
  '.proto',
  '.prisma',
  '.sql',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.ini',
  '.cfg',
  '.conf',
  '.properties',
  '.editorconfig',
  '.dockerfile',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.bat',
  '.cmd',
  '.tf',
  '.tfvars',
  '.hcl',
  '.gradle',
  '.groovy',
  '.sln',
  '.csproj',
  '.fsproj',
  '.vbproj',
  '.ipynb',
];

export const PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE = 'text/plain';

export const PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES = [
  'Dockerfile',
  'Makefile',
  'Procfile',
  'LICENSE',
  'README',
  '.gitignore',
  '.dockerignore',
  '.editorconfig',
  '.env.example',
];

const MEDIA_TYPES_BY_EXTENSION = new Map([
  ['.txt', 'text/plain'],
  ['.text', 'text/plain'],
  ['.md', 'text/markdown'],
  ['.markdown', 'text/markdown'],
  ['.mdx', 'text/markdown'],
  ['.rst', 'text/plain'],
  ['.adoc', 'text/plain'],
  ['.json', 'application/json'],
  ['.jsonc', 'application/json'],
  ['.json5', 'application/json'],
  ['.csv', 'text/csv'],
  ['.tsv', 'text/tab-separated-values'],
  ['.ndjson', 'application/x-ndjson'],
  ['.log', 'text/plain'],
  ['.html', 'text/html'],
  ['.htm', 'text/html'],
  ['.css', 'text/css'],
  ['.scss', 'text/x-scss'],
  ['.sass', 'text/x-sass'],
  ['.less', 'text/less'],
  ['.js', 'text/javascript'],
  ['.mjs', 'text/javascript'],
  ['.cjs', 'text/javascript'],
  ['.jsx', 'text/javascript'],
  ['.ts', 'text/typescript'],
  ['.mts', 'text/typescript'],
  ['.cts', 'text/typescript'],
  ['.tsx', 'text/typescript'],
  ['.py', 'text/x-python'],
  ['.pyw', 'text/x-python'],
  ['.java', 'text/x-java-source'],
  ['.c', 'text/x-c'],
  ['.cc', 'text/x-c++src'],
  ['.cpp', 'text/x-c++src'],
  ['.cxx', 'text/x-c++src'],
  ['.h', 'text/x-c'],
  ['.hh', 'text/x-c++hdr'],
  ['.hpp', 'text/x-c++hdr'],
  ['.hxx', 'text/x-c++hdr'],
  ['.cs', 'text/x-csharp'],
  ['.go', 'text/x-go'],
  ['.rs', 'text/rust'],
  ['.rb', 'text/x-ruby'],
  ['.php', 'text/x-php'],
  ['.swift', 'text/x-swift'],
  ['.kt', 'text/x-kotlin'],
  ['.kts', 'text/x-kotlin'],
  ['.r', 'text/x-r'],
  ['.dart', 'text/x-dart'],
  ['.scala', 'text/x-scala'],
  ['.sc', 'text/x-scala'],
  ['.lua', 'text/x-lua'],
  ['.ex', 'text/x-elixir'],
  ['.exs', 'text/x-elixir'],
  ['.erl', 'text/x-erlang'],
  ['.hrl', 'text/x-erlang'],
  ['.clj', 'text/x-clojure'],
  ['.cljs', 'text/x-clojure'],
  ['.cljc', 'text/x-clojure'],
  ['.fs', 'text/x-fsharp'],
  ['.fsx', 'text/x-fsharp'],
  ['.fsi', 'text/x-fsharp'],
  ['.vb', 'text/x-vb'],
  ['.svelte', 'text/html'],
  ['.vue', 'text/html'],
  ['.astro', 'text/html'],
  ['.graphql', 'application/graphql'],
  ['.gql', 'application/graphql'],
  ['.proto', 'text/x-protobuf'],
  ['.prisma', 'text/plain'],
  ['.sql', 'application/sql'],
  ['.yaml', 'application/yaml'],
  ['.yml', 'application/yaml'],
  ['.toml', 'application/toml'],
  ['.xml', 'application/xml'],
  ['.ini', 'text/plain'],
  ['.cfg', 'text/plain'],
  ['.conf', 'text/plain'],
  ['.properties', 'text/plain'],
  ['.editorconfig', 'text/plain'],
  ['.dockerfile', 'text/plain'],
  ['.sh', 'application/x-sh'],
  ['.bash', 'application/x-sh'],
  ['.zsh', 'application/x-sh'],
  ['.fish', 'application/x-sh'],
  ['.ps1', 'text/plain'],
  ['.bat', 'text/plain'],
  ['.cmd', 'text/plain'],
  ['.tf', 'text/plain'],
  ['.tfvars', 'text/plain'],
  ['.hcl', 'text/plain'],
  ['.gradle', 'text/plain'],
  ['.groovy', 'text/x-groovy'],
  ['.sln', 'text/plain'],
  ['.csproj', 'application/xml'],
  ['.fsproj', 'application/xml'],
  ['.vbproj', 'application/xml'],
  ['.ipynb', 'application/x-ipynb+json'],
]);

const ALLOWED_EXTENSION_SET = new Set(PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS);
const ALLOWED_FILENAME_SET = new Set(
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES.map((name) => name.toLowerCase()),
);
const DISALLOWED_SECRET_FILENAMES = new Set([
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
const DISALLOWED_SECRET_EXTENSIONS = new Set([
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
const DISALLOWED_BINARY_OR_DUMP_EXTENSIONS = new Set([
  '.db',
  '.sqlite',
  '.sqlite3',
  '.dump',
]);
const GENERATED_SOURCE_PATTERN = /(?:^|[._-])generated\.[a-z0-9]+$/i;
const GENERATED_BUNDLE_PATTERN = /(?:^|[._-])(?:bundle|min)\.(?:cjs|css|js|mjs)$/i;

export function getUtf8ByteLength(text) {
  return TEXT_ENCODER.encode(text).byteLength;
}

export function getSourceFileBaseName(name) {
  if (typeof name !== 'string') return '';

  const trimmedName = name.trim().replace(/\\/g, '/');
  const parts = trimmedName
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.at(-1) || '';
}

export function getSourceFileExtension(name) {
  const trimmedName = getSourceFileBaseName(name);
  const lastDotIndex = trimmedName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === trimmedName.length - 1) {
    return '';
  }

  return trimmedName.slice(lastDotIndex).toLowerCase();
}

export function isSupportedTextSourceFileName(name) {
  const baseName = getSourceFileBaseName(name).toLowerCase();
  return ALLOWED_EXTENSION_SET.has(getSourceFileExtension(baseName))
    || ALLOWED_FILENAME_SET.has(baseName);
}

export function getDisallowedTextSourceReason(name) {
  const baseName = getSourceFileBaseName(name).toLowerCase();
  const extension = getSourceFileExtension(baseName);

  if (baseName.startsWith('.env.') && baseName !== '.env.example') {
    return 'secret-like source file name';
  }

  if (DISALLOWED_SECRET_FILENAMES.has(baseName) || DISALLOWED_SECRET_EXTENSIONS.has(extension)) {
    return 'secret-like source file name';
  }

  if (DISALLOWED_BINARY_OR_DUMP_EXTENSIONS.has(extension)) {
    return 'binary or database dump source file type';
  }

  if (GENERATED_SOURCE_PATTERN.test(baseName) || GENERATED_BUNDLE_PATTERN.test(baseName)) {
    return 'generated or minified bundle source file name';
  }

  return '';
}

export function normalizePastedSourceText(sourceText, { id }) {
  const text = typeof sourceText === 'string' ? sourceText.trim() : '';

  if (!text) return null;

  return {
    id,
    kind: 'pasted-text',
    label: 'Pasted source material',
    mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
    bytes: getUtf8ByteLength(text),
    text,
  };
}

function getSafeFileLabel(file) {
  const name = typeof file?.name === 'string' ? file.name.trim() : '';
  return name || 'Unnamed source file';
}

function getFileMediaType(file, extension) {
  return typeof file?.type === 'string' && file.type.trim()
    ? file.type.trim()
    : MEDIA_TYPES_BY_EXTENSION.get(extension) || PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE;
}

function normalizeNotebookCellSource(source) {
  if (Array.isArray(source)) {
    return source.join('');
  }

  if (typeof source === 'string') {
    return source;
  }

  return '';
}

function extractNotebookText(text) {
  let notebook;

  try {
    notebook = JSON.parse(text);
  } catch {
    return {
      text: '',
      warning: 'Source file could not be parsed as a Jupyter notebook.',
    };
  }

  if (!Array.isArray(notebook?.cells)) {
    return {
      text: '',
      warning: 'Source file is not a supported Jupyter notebook.',
    };
  }

  const parts = [];

  notebook.cells.forEach((cell, index) => {
    const cellType = typeof cell?.cell_type === 'string' ? cell.cell_type : 'unknown';

    if (cellType !== 'markdown' && cellType !== 'code') {
      return;
    }

    const cellText = normalizeNotebookCellSource(cell.source).trim();

    if (!cellText) {
      return;
    }

    const label = cellType === 'markdown' ? 'Markdown' : 'Code';
    parts.push(`[${label} cell ${index + 1}]\n${cellText}`);
  });

  return {
    text: parts.join('\n\n').trim(),
    warning: '',
  };
}

export async function normalizeUploadedTextSourceFile(file, { id, maxBytes }) {
  const label = getSafeFileLabel(file);
  const extension = getSourceFileExtension(label);
  const size = Number.isFinite(file?.size) ? file.size : null;
  const disallowedReason = getDisallowedTextSourceReason(label);

  if (disallowedReason) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size ?? 0,
        included: false,
        warnings: [`Source file "${label}" is not allowed because it has a ${disallowedReason}.`],
      },
      warnings: [`Skipped disallowed source file "${label}".`],
    };
  }

  if (!isSupportedTextSourceFileName(label)) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        bytes: size ?? 0,
        included: false,
        warnings: [`Unsupported source file type for "${label}".`],
      },
      warnings: [`Skipped unsupported source file "${label}".`],
    };
  }

  if (size === 0) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: 0,
        included: false,
        warnings: [`Source file "${label}" is empty.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  if (size != null && size > maxBytes) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size,
        included: false,
        warnings: [`Source file "${label}" exceeds the ${maxBytes} byte limit.`],
      },
      warnings: [`Skipped oversized source file "${label}".`],
    };
  }

  if (typeof file?.arrayBuffer !== 'function') {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size ?? 0,
        included: false,
        warnings: [`Source file "${label}" could not be read.`],
      },
      warnings: [`Skipped unreadable source file "${label}".`],
    };
  }

  let buffer;

  try {
    buffer = await file.arrayBuffer();
  } catch {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size ?? 0,
        included: false,
        warnings: [`Source file "${label}" could not be read.`],
      },
      warnings: [`Skipped unreadable source file "${label}".`],
    };
  }

  const byteLength = buffer.byteLength ?? size ?? 0;

  if (byteLength === 0) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: 0,
        included: false,
        warnings: [`Source file "${label}" is empty.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  if (byteLength > maxBytes) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" exceeds the ${maxBytes} byte limit.`],
      },
      warnings: [`Skipped oversized source file "${label}".`],
    };
  }

  let text;

  try {
    text = TEXT_DECODER.decode(buffer).trim();
  } catch {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" could not be decoded as UTF-8.`],
      },
      warnings: [`Skipped undecodable source file "${label}".`],
    };
  }

  if (!text) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" is empty after trimming.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  if (extension === '.ipynb') {
    const notebookResult = extractNotebookText(text);

    if (!notebookResult.text) {
      return {
        item: null,
        manifest: {
          id,
          kind: 'file',
          label,
          mediaType: getFileMediaType(file, extension),
          bytes: byteLength,
          included: false,
          warnings: [notebookResult.warning || `Source file "${label}" is empty after trimming.`],
        },
        warnings: [`Skipped unreadable source file "${label}".`],
      };
    }

    text = notebookResult.text;
  }

  return {
    item: {
      id,
      kind: 'file',
      label,
      mediaType: getFileMediaType(file, extension),
      bytes: byteLength,
      text,
    },
    manifest: {
      id,
      kind: 'file',
      label,
      mediaType: getFileMediaType(file, extension),
      bytes: byteLength,
      included: true,
      warnings: [],
    },
    warnings: [],
  };
}
