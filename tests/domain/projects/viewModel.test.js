import { describe, expect, it } from 'vitest';

import {
  groupProjectsForDisplay,
  groupProjectsForMarquees,
} from '../../../src/domain/projects/viewModel.js';

function createProjects(count) {
  return Array.from({ length: count }, (_, index) => ({ id: index + 1 }));
}

describe('project display view model helpers', () => {
  it('splits projects into featured and standard groups without changing item shape', () => {
    const featured = {
      id: 2,
      title: 'Featured',
      isFeatured: true,
      featuredRank: 1,
      sortOrder: 4,
      labels: ['School'],
    };
    const standard = {
      id: 1,
      title: 'Standard',
      isFeatured: false,
      featuredRank: null,
      sortOrder: 1,
      labels: ['Personal'],
    };

    expect(groupProjectsForDisplay([standard, featured])).toEqual({
      featuredProjects: [featured],
      standardProjects: [standard],
    });
  });

  it('sorts featured projects by rank, sort order, then id', () => {
    const projects = [
      { id: 3, isFeatured: true, featuredRank: 2, sortOrder: 0 },
      { id: 5, isFeatured: true, featuredRank: 1, sortOrder: 2 },
      { id: 4, isFeatured: true, featuredRank: 1, sortOrder: 1 },
      { id: 2, isFeatured: true, featuredRank: 1, sortOrder: 1 },
    ];

    expect(groupProjectsForDisplay(projects).featuredProjects.map((project) => project.id)).toEqual([
      2,
      4,
      5,
      3,
    ]);
  });

  it('sorts standard projects by sort order, then id', () => {
    const projects = [
      { id: 9, isFeatured: false, featuredRank: null, sortOrder: 2 },
      { id: 7, isFeatured: false, featuredRank: null, sortOrder: 1 },
      { id: 4, isFeatured: false, featuredRank: null, sortOrder: 1 },
      { id: 3, isFeatured: false, featuredRank: null, sortOrder: 0 },
    ];

    expect(groupProjectsForDisplay(projects).standardProjects.map((project) => project.id)).toEqual([
      3,
      4,
      7,
      9,
    ]);
  });

  it('treats malformed or incomplete featured state as standard', () => {
    const projects = [
      { id: 1, isFeatured: true, featuredRank: null, sortOrder: 1 },
      { id: 2, featuredRank: 1, sortOrder: 2 },
      { id: 3, isFeatured: true, featuredRank: 0, sortOrder: 3 },
      { id: 4, isFeatured: true, sortOrder: 4 },
    ];

    const grouped = groupProjectsForDisplay(projects);

    expect(grouped.featuredProjects.map((project) => project.id)).toEqual([3]);
    expect(grouped.standardProjects.map((project) => project.id)).toEqual([1, 2, 4]);
  });

  it('returns empty groups for non-array input', () => {
    expect(groupProjectsForDisplay(null)).toEqual({
      featuredProjects: [],
      standardProjects: [],
    });
  });

  it('groups standard projects into marquees once another full minimum group can be created', () => {
    expect(groupProjectsForMarquees(createProjects(5), 3).map((group) => group.length)).toEqual([5]);
    expect(groupProjectsForMarquees(createProjects(6), 3).map((group) => group.length)).toEqual([3, 3]);
    expect(groupProjectsForMarquees(createProjects(7), 3).map((group) => group.length)).toEqual([3, 4]);
    expect(groupProjectsForMarquees(createProjects(8), 3).map((group) => group.length)).toEqual([3, 5]);
    expect(groupProjectsForMarquees(createProjects(10), 3).map((group) => group.length)).toEqual([3, 3, 4]);
  });

  it('preserves project order and item references when grouping marquee projects', () => {
    const projects = createProjects(7);
    const groups = groupProjectsForMarquees(projects, 3);

    expect(groups.flat()).toEqual(projects);
    expect(groups[0][0]).toBe(projects[0]);
  });

  it('returns empty marquee groups for non-array input', () => {
    expect(groupProjectsForMarquees(null)).toEqual([]);
  });

  it('falls back to one project per marquee for invalid minimum group sizes', () => {
    expect(groupProjectsForMarquees(createProjects(3), 0).map((group) => group.length)).toEqual([1, 1, 1]);
  });
});
