const TOP_EDGE_BAND_START = 0.2;
const TOP_EDGE_BAND_END = 0.4;
const ACTIVE_LINE_RATIO = 0.25;
const ACTIVE_LINE_MIN = 48;
const ACTIVE_LINE_MAX = 96;
const EDGE_EPSILON = 4;

export function getVisibleArea(rect, viewport) {
  const visibleTop = Math.max(rect.top, viewport.top);
  const visibleBottom = Math.min(rect.bottom, viewport.bottom);
  return Math.max(0, visibleBottom - visibleTop);
}

function getActiveLine(viewportTop, viewportHeight) {
  const offset = Math.min(
    Math.max(viewportHeight * ACTIVE_LINE_RATIO, ACTIVE_LINE_MIN),
    ACTIVE_LINE_MAX,
  );

  return viewportTop + offset;
}

export function isScrollSectionAcceptablyVisible(rect, {
  alignmentTolerance = 24,
  viewportTop = 0,
  viewportHeight = 0,
} = {}) {
  if (!rect || viewportHeight <= 0) return false;

  const viewportBottom = viewportTop + viewportHeight;
  if (rect.bottom <= viewportTop || rect.top >= viewportBottom) return false;

  const activeLine = getActiveLine(viewportTop, viewportHeight);
  const coversActiveLine = rect.top <= activeLine && rect.bottom > activeLine;
  const startsNearStickyTop = Math.abs(rect.top - viewportTop) <= alignmentTolerance;
  const startsInComfortBand = rect.top >= viewportTop && rect.top <= activeLine;

  return coversActiveLine || startsNearStickyTop || startsInComfortBand;
}

export function getActiveScrollSection(sectionRects, {
  currentSectionId = null,
  scrollTop = 0,
  scrollBottom = 0,
  scrollHeight = 0,
  viewportTop = 0,
  viewportHeight = 0,
} = {}) {
  const viewportBottom = viewportTop + viewportHeight;
  const visibleSections = sectionRects.filter(({ rect }) => rect && rect.bottom > viewportTop && rect.top < viewportBottom);

  if (sectionRects.length === 0) return null;
  if (scrollTop <= EDGE_EPSILON) return sectionRects[0].id;
  if (scrollBottom >= scrollHeight - EDGE_EPSILON) return sectionRects[sectionRects.length - 1].id;
  if (visibleSections.length === 0) return currentSectionId || sectionRects[0].id;

  const activeLine = getActiveLine(viewportTop, viewportHeight);
  const activeLineSection = visibleSections.find(({ rect }) => (
    rect.top <= activeLine && rect.bottom > activeLine
  ));

  if (activeLineSection) {
    return activeLineSection.id;
  }

  const crossedActiveLineSections = visibleSections.filter(({ rect }) => rect.top <= activeLine);
  if (crossedActiveLineSections.length > 0) {
    return crossedActiveLineSections[crossedActiveLineSections.length - 1].id;
  }

  const bandTop = viewportTop + (viewportHeight * TOP_EDGE_BAND_START);
  const bandBottom = viewportTop + (viewportHeight * TOP_EDGE_BAND_END);
  const sectionsInBand = visibleSections.filter(({ rect }) => rect.top >= bandTop && rect.top <= bandBottom);

  if (sectionsInBand.length > 0) {
    const currentInBand = sectionsInBand.find(({ id }) => id === currentSectionId);
    if (currentInBand) return currentInBand.id;

    return sectionsInBand
      .slice()
      .sort((a, b) => Math.abs(a.rect.top - bandTop) - Math.abs(b.rect.top - bandTop))[0].id;
  }

  const viewport = {
    top: viewportTop,
    bottom: viewportBottom,
  };
  const visibleSectionsByArea = visibleSections
    .map((section) => ({
      ...section,
      visibleArea: getVisibleArea(section.rect, viewport),
    }))
    .sort((a, b) => b.visibleArea - a.visibleArea);

  const currentVisibleSection = visibleSectionsByArea.find(({ id }) => id === currentSectionId);
  if (
    currentVisibleSection
    && visibleSectionsByArea[0]
    && currentVisibleSection.visibleArea >= visibleSectionsByArea[0].visibleArea * 0.75
  ) {
    return currentVisibleSection.id;
  }

  return visibleSectionsByArea[0]?.id || currentSectionId || sectionRects[0].id;
}
