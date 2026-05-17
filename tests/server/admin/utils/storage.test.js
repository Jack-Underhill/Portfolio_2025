import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildProjectArchitecturePath,
  buildProjectPreviewImagePath,
  buildProjectPreviewVideoPath,
  ensureDotExt,
  resolveProjectMediaUrls,
} from '../../../../server/admin/utils/storage.js';

const storageMock = vi.hoisted(() => ({
  from: vi.fn(),
  getPublicUrl: vi.fn(),
  upload: vi.fn(),
}));

vi.mock('../../../../server/admin/clients/supabaseService.js', () => ({
  BUCKET: 'portfolio-assets',
  requireServiceClient: () => ({
    storage: {
      from: storageMock.from,
    },
  }),
}));

describe('admin storage path helpers', () => {
  beforeEach(() => {
    storageMock.from.mockReset();
    storageMock.getPublicUrl.mockReset();
    storageMock.upload.mockReset();

    storageMock.upload.mockResolvedValue({ error: null });
    storageMock.getPublicUrl.mockImplementation((path) => ({
      data: { publicUrl: `https://cdn.example.test/${path}` },
    }));
    storageMock.from.mockReturnValue({
      getPublicUrl: storageMock.getPublicUrl,
      upload: storageMock.upload,
    });
  });

  it('builds distinct project media paths by media type', () => {
    expect(buildProjectPreviewImagePath(7, '.png')).toBe('projects/7/preview-image.png');
    expect(buildProjectPreviewVideoPath(7, 'mp4')).toBe('projects/7/preview-video.mp4');
    expect(buildProjectArchitecturePath('7', '.svg')).toBe('projects/7/architecture.svg');
  });

  it('rejects unsafe project media path inputs', () => {
    expect(() => buildProjectPreviewImagePath(null, '.png')).toThrow(
      'project media path requires a positive project id',
    );
    expect(() => buildProjectPreviewImagePath(7, '')).toThrow(
      'project media path requires a safe file extension',
    );
    expect(() => buildProjectPreviewImagePath(7, '../preview.svg')).toThrow(
      'project media path requires a safe file extension',
    );
  });

  it('normalizes file extensions with a fallback', () => {
    expect(ensureDotExt('webp', '.png')).toBe('.webp');
    expect(ensureDotExt('.svg', '.png')).toBe('.svg');
    expect(ensureDotExt('', '.png')).toBe('.png');
  });

  it('uploads project media through the distinct current storage paths', async () => {
    await expect(resolveProjectMediaUrls(
      7,
      { name: 'preview.webp' },
      'https://old.example.test/preview.png',
      { name: 'demo.webm' },
      'https://old.example.test/demo.mp4',
      { name: 'architecture.svg' },
      'https://old.example.test/architecture.svg',
    )).resolves.toEqual({
      imageBucketUrl: 'https://cdn.example.test/projects/7/preview-image.webp',
      videoBucketUrl: 'https://cdn.example.test/projects/7/preview-video.webm',
      architectureImageBucketUrl: 'https://cdn.example.test/projects/7/architecture.svg',
    });

    expect(storageMock.upload.mock.calls.map(([path]) => path)).toEqual([
      'projects/7/preview-image.webp',
      'projects/7/preview-video.webm',
      'projects/7/architecture.svg',
    ]);
    expect(storageMock.from).toHaveBeenCalledWith('portfolio-assets');
  });

  it('keeps existing project media URLs when no replacement file is uploaded', async () => {
    await expect(resolveProjectMediaUrls(
      7,
      null,
      'https://old.example.test/preview.png',
      null,
      'https://old.example.test/demo.mp4',
      null,
      'https://old.example.test/architecture.svg',
    )).resolves.toEqual({
      imageBucketUrl: 'https://old.example.test/preview.png',
      videoBucketUrl: 'https://old.example.test/demo.mp4',
      architectureImageBucketUrl: 'https://old.example.test/architecture.svg',
    });

    expect(storageMock.upload).not.toHaveBeenCalled();
  });
});
