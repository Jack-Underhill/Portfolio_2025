import { describe, expect, it } from 'vitest';

import {
  buildProjectArchitecturePath,
  buildProjectPreviewImagePath,
  buildProjectPreviewVideoPath,
  ensureDotExt,
} from '../../../../server/admin/utils/storage.js';

describe('admin storage path helpers', () => {
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
});
