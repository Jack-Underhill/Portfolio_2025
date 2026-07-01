import { describe, expect, it } from 'vitest';

import {
  normalizeUploadedPdfSourceFile,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
} from '../../../../../server/admin/agent/sourceIngestion/pdfSource.js';
import { createPdfBuffer } from './pdfTestFixture.js';

const encoder = new TextEncoder();

function createFakeFile({ name, bytes, type = 'application/pdf', size }) {
  const data = bytes || encoder.encode('');

  return {
    name,
    size: size ?? data.byteLength,
    type,
    arrayBuffer: async () => data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ),
  };
}

describe('project agent PDF source normalization', () => {
  it('extracts text from direct PDF files with page metadata', async () => {
    const result = await normalizeUploadedPdfSourceFile(
      createFakeFile({
        name: 'case-study.pdf',
        bytes: createPdfBuffer(['Portfolio PDF source evidence']),
      }),
      { id: 'source-1' },
    );

    expect(result.item).toEqual(expect.objectContaining({
      id: 'source-1',
      kind: 'pdf',
      label: 'case-study.pdf',
      mediaType: 'application/pdf',
      text: '[PDF: case-study.pdf]\n[Page 1]\nPortfolio PDF source evidence',
    }));
    expect(result.manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      kind: 'pdf',
      label: 'case-study.pdf',
      mediaType: 'application/pdf',
      included: true,
      warnings: [],
      pages: 1,
    }));
    expect(result.manifest).not.toHaveProperty('text');
    expect(result.warnings).toEqual([]);
  });

  it('warns and skips PDFs with no extractable text', async () => {
    const result = await normalizeUploadedPdfSourceFile(
      createFakeFile({
        name: 'scanned.pdf',
        bytes: createPdfBuffer(['']),
      }),
      { id: 'source-1' },
    );

    expect(result.item).toBeNull();
    expect(result.manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      kind: 'pdf',
      label: 'scanned.pdf',
      included: false,
      warnings: ['PDF source file "scanned.pdf" did not contain extractable text. It may be scanned/image-only.'],
      pages: 1,
    }));
    expect(result.warnings).toEqual([
      'Skipped PDF source file "scanned.pdf" because no extractable text was found.',
    ]);
  });

  it('skips oversized PDFs before reading the file body', async () => {
    const result = await normalizeUploadedPdfSourceFile(
      {
        name: 'huge.pdf',
        size: PROJECT_AGENT_SOURCE_PDF_MAX_BYTES + 1,
        type: 'application/pdf',
        arrayBuffer: async () => {
          throw new Error('should not read oversized file');
        },
      },
      { id: 'source-1' },
    );

    expect(result.item).toBeNull();
    expect(result.manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      label: 'huge.pdf',
      bytes: PROJECT_AGENT_SOURCE_PDF_MAX_BYTES + 1,
      included: false,
      warnings: [`PDF source file "huge.pdf" exceeds the ${PROJECT_AGENT_SOURCE_PDF_MAX_BYTES} byte limit.`],
    }));
    expect(result.warnings).toEqual(['Skipped oversized PDF source file "huge.pdf".']);
  });

  it('warns and skips PDFs that cannot be parsed', async () => {
    const result = await normalizeUploadedPdfSourceFile(
      createFakeFile({
        name: 'broken.pdf',
        bytes: encoder.encode('not a pdf'),
      }),
      { id: 'source-1' },
    );

    expect(result.item).toBeNull();
    expect(result.manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      label: 'broken.pdf',
      included: false,
      warnings: ['PDF source file "broken.pdf" could not be extracted as text.'],
    }));
    expect(result.warnings).toEqual(['Skipped unreadable PDF source file "broken.pdf".']);
  });

  it('limits extracted PDF pages and text length with metadata warnings', async () => {
    const result = await normalizeUploadedPdfSourceFile(
      createFakeFile({
        name: 'long.pdf',
        bytes: createPdfBuffer([
          'First page source evidence with a long tail.',
          'Second page should not be extracted.',
        ]),
      }),
      {
        id: 'source-1',
        maxPages: 1,
        maxTextLength: 48,
      },
    );

    expect(result.item.text).toBe('[PDF: long.pdf]\n[Page 1]\nFirst page source evide');
    expect(result.manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      label: 'long.pdf',
      included: true,
      pages: 2,
      truncated: true,
      warnings: [
        'PDF source file "long.pdf" has 2 pages; only the first 1 pages were extracted.',
        'Truncated extracted PDF text from "long.pdf" to 48 characters.',
      ],
    }));
    expect(result.warnings).toEqual([
      'PDF source file "long.pdf" has 2 pages; only the first 1 pages were extracted.',
      'Truncated extracted PDF text from "long.pdf" to 48 characters.',
    ]);
  });
});
