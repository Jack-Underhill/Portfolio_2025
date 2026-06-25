import { describe, expect, it } from 'vitest';

import {
  getAdminStickyToolbarViewportOffset,
} from '../../src/admin/shell/adminSectionToolbarGeometry.js';

function createToolbarRect(top, bottom) {
  return {
    getBoundingClientRect: () => ({ top, bottom }),
  };
}

function createRoot(...toolbars) {
  return {
    querySelectorAll: () => toolbars,
  };
}

describe('admin section toolbar measurements', () => {
  it('uses the rendered bottom edge of the toolbar obstructing the viewport top', () => {
    const root = createRoot(
      createToolbarRect(-24, 164),
      createToolbarRect(420, 560),
    );

    expect(getAdminStickyToolbarViewportOffset(root)).toBe(164);
  });

  it('tracks responsive toolbar height without a fixed offset', () => {
    const compactRoot = createRoot(createToolbarRect(0, 112));
    const wrappedRoot = createRoot(createToolbarRect(0, 224));

    expect(getAdminStickyToolbarViewportOffset(compactRoot)).toBe(112);
    expect(getAdminStickyToolbarViewportOffset(wrappedRoot)).toBe(224);
  });

  it('uses the remaining obstruction while a sticky toolbar is pushed away', () => {
    const root = createRoot(createToolbarRect(-180, 36));

    expect(getAdminStickyToolbarViewportOffset(root)).toBe(36);
  });

  it('returns no offset when no toolbar overlaps the viewport top', () => {
    const root = createRoot(
      createToolbarRect(24, 136),
      createToolbarRect(-220, -20),
    );

    expect(getAdminStickyToolbarViewportOffset(root)).toBe(0);
  });
});
