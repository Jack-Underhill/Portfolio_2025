import { describe, expect, it } from 'vitest';

import { getExpandedAdminRouteIds } from '../../src/admin/routing/adminNavExpansion.js';

function createNavigationTarget({
  destinationId,
  originLeafId,
}) {
  return {
    destinationId,
    originLeafId,
  };
}

describe('admin expandable route policy', () => {
  it('follows the observed expandable route during passive scrolling', () => {
    expect(getExpandedAdminRouteIds({
      observedLeafId: 'projects/media',
    })).toEqual(['projects']);

    expect(getExpandedAdminRouteIds({
      observedLeafId: 'education',
    })).toEqual([]);
  });

  it('opens an expandable destination immediately during intentional navigation', () => {
    expect(getExpandedAdminRouteIds({
      observedLeafId: 'about',
      navigationTarget: createNavigationTarget({
        destinationId: 'projects/media',
        originLeafId: 'about',
      }),
    })).toEqual(['projects']);
  });

  it('keeps an unrelated expandable route closed while traveling through it', () => {
    expect(getExpandedAdminRouteIds({
      observedLeafId: 'projects/intro',
      navigationTarget: createNavigationTarget({
        destinationId: 'education',
        originLeafId: 'about',
      }),
    })).toEqual([]);
  });

  it('keeps the expandable origin open until observation exits it', () => {
    const navigationTarget = createNavigationTarget({
      destinationId: 'education',
      originLeafId: 'projects/challenges',
    });

    expect(getExpandedAdminRouteIds({
      observedLeafId: 'projects/challenges',
      navigationTarget,
    })).toEqual(['projects']);

    expect(getExpandedAdminRouteIds({
      observedLeafId: 'education',
      navigationTarget,
    })).toEqual([]);
  });
});
