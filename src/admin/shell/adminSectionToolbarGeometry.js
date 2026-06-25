const ADMIN_SECTION_TOOLBAR_SELECTOR = '[data-admin-section-toolbar]';
const STICKY_TOP_TOLERANCE_PX = 1;

export function getAdminStickyToolbarViewportOffset(
  root = typeof document === 'undefined' ? null : document,
) {
  if (!root?.querySelectorAll) return 0;

  return Array.from(root.querySelectorAll(ADMIN_SECTION_TOOLBAR_SELECTOR))
    .reduce((largestOffset, toolbar) => {
      const rect = toolbar.getBoundingClientRect?.();
      if (
        !rect
        || !Number.isFinite(rect.top)
        || !Number.isFinite(rect.bottom)
        || rect.top > STICKY_TOP_TOLERANCE_PX
        || rect.bottom <= 0
      ) {
        return largestOffset;
      }

      return Math.max(largestOffset, rect.bottom);
    }, 0);
}
