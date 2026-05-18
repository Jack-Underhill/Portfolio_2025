import { describe, expect, it } from 'vitest';

import { DEFAULT_SKILL_GROUPS } from '../../../src/domain/skills/defaults.js';
import { mapSkillRowsToPublic } from '../../../src/domain/skills/mappers.js';

describe('skills public mapper', () => {
  it('keeps static fallback groups in the public grouped shape', () => {
    expect(DEFAULT_SKILL_GROUPS[0]).toEqual({
      label: 'Core Web Stack',
      sortOrder: 0,
      items: [
        { label: 'JavaScript', sortOrder: 0 },
        { label: 'React', sortOrder: 1 },
        { label: 'TailwindCSS', sortOrder: 2 },
        { label: 'Vite', sortOrder: 3 },
        { label: 'Netlify', sortOrder: 4 },
      ],
    });
  });

  it('groups trimmed skill rows by group label', () => {
    expect(mapSkillRowsToPublic([
      {
        group_label: ' Core Web Stack ',
        label: ' React ',
        group_sort_order: 0,
        item_sort_order: 1,
        published: true,
      },
      {
        group_label: 'Core Web Stack',
        label: ' Vite ',
        group_sort_order: 0,
        item_sort_order: 2,
        published: true,
      },
    ])).toEqual({
      groups: [
        {
          label: 'Core Web Stack',
          sortOrder: 0,
          items: [
            { label: 'React', sortOrder: 1 },
            { label: 'Vite', sortOrder: 2 },
          ],
        },
      ],
    });
  });

  it('sorts groups and items by sort order then label', () => {
    expect(mapSkillRowsToPublic([
      {
        group_label: 'Backend',
        label: 'Node',
        group_sort_order: 1,
        item_sort_order: 1,
        published: true,
      },
      {
        group_label: 'Core Web Stack',
        label: 'Vite',
        group_sort_order: 0,
        item_sort_order: 2,
        published: true,
      },
      {
        group_label: 'Core Web Stack',
        label: 'React',
        group_sort_order: 0,
        item_sort_order: 2,
        published: true,
      },
      {
        group_label: 'Backend',
        label: 'Express',
        group_sort_order: 1,
        item_sort_order: 0,
        published: true,
      },
    ])).toEqual({
      groups: [
        {
          label: 'Core Web Stack',
          sortOrder: 0,
          items: [
            { label: 'React', sortOrder: 2 },
            { label: 'Vite', sortOrder: 2 },
          ],
        },
        {
          label: 'Backend',
          sortOrder: 1,
          items: [
            { label: 'Express', sortOrder: 0 },
            { label: 'Node', sortOrder: 1 },
          ],
        },
      ],
    });
  });

  it('filters unpublished rows and rows with blank labels', () => {
    expect(mapSkillRowsToPublic([
      {
        group_label: 'Languages',
        label: 'Java',
        group_sort_order: 1,
        item_sort_order: 0,
        published: false,
      },
      {
        group_label: ' ',
        label: 'Python',
        group_sort_order: 1,
        item_sort_order: 1,
        published: true,
      },
      {
        group_label: 'Languages',
        label: 'NULL',
        group_sort_order: 1,
        item_sort_order: 2,
        published: true,
      },
      {
        group_label: 'Languages',
        label: 'C++',
        group_sort_order: 1,
        item_sort_order: 3,
        published: true,
      },
    ])).toEqual({
      groups: [
        {
          label: 'Languages',
          sortOrder: 1,
          items: [
            { label: 'C++', sortOrder: 3 },
          ],
        },
      ],
    });
  });

  it('returns null for fallback-ready empty output', () => {
    expect(mapSkillRowsToPublic([
      {
        group_label: 'Imported Proficient',
        label: 'JavaScript',
        published: false,
      },
    ])).toBeNull();

    expect(mapSkillRowsToPublic('React')).toBeNull();
    expect(mapSkillRowsToPublic()).toBeNull();
  });

  it('keeps the stable item shape without database ids', () => {
    expect(mapSkillRowsToPublic([
      {
        id: 12,
        group_label: 'Backend',
        label: 'Express',
        group_sort_order: '2',
        item_sort_order: '1',
        published: true,
      },
    ])).toEqual({
      groups: [
        {
          label: 'Backend',
          sortOrder: 2,
          items: [
            { label: 'Express', sortOrder: 1 },
          ],
        },
      ],
    });
  });
});
