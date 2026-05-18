import { describe, expect, it } from 'vitest';

import { validateSkillsState } from '../../../../server/admin/routes/validation.js';

describe('admin skills validation', () => {
  it('normalizes grouped skills and derives sort order from row order', () => {
    expect(validateSkillsState({
      groups: [
        {
          label: ' Core Web Stack ',
          items: [
            { label: ' React ', published: true },
            { label: '', published: false },
            { label: ' Vite ' },
          ],
        },
        {
          label: ' Backend ',
          items: [
            { label: ' Express ', published: false },
          ],
        },
      ],
    })).toEqual({
      groups: [
        {
          label: 'Core Web Stack',
          sortOrder: 0,
          items: [
            { label: 'React', published: true, sortOrder: 0 },
            { label: 'Vite', published: true, sortOrder: 1 },
          ],
        },
        {
          label: 'Backend',
          sortOrder: 1,
          items: [
            { label: 'Express', published: false, sortOrder: 0 },
          ],
        },
      ],
    });
  });

  it('drops fully blank groups so empty UI rows do not persist', () => {
    expect(validateSkillsState({
      groups: [
        { label: '', items: [{ label: '' }] },
        { label: ' Languages ', items: [{ label: ' Python ' }] },
      ],
    })).toEqual({
      groups: [
        {
          label: 'Languages',
          sortOrder: 0,
          items: [
            { label: 'Python', published: true, sortOrder: 0 },
          ],
        },
      ],
    });
  });

  it('rejects item labels without group labels', () => {
    expect(() => validateSkillsState({
      groups: [
        { label: '', items: [{ label: 'React' }] },
      ],
    })).toThrow('skill group 1 label is required');
  });

  it('rejects group labels without skill items', () => {
    expect(() => validateSkillsState({
      groups: [
        { label: 'Core Web Stack', items: [{ label: '' }] },
      ],
    })).toThrow('skill group 1 must include at least one item');
  });

  it('rejects duplicate group labels', () => {
    expect(() => validateSkillsState({
      groups: [
        { label: 'Backend', items: [{ label: 'Node' }] },
        { label: ' backend ', items: [{ label: 'Express' }] },
      ],
    })).toThrow('skill group label "backend" appears more than once');
  });

  it('enforces small portfolio-specific limits', () => {
    expect(() => validateSkillsState({
      groups: Array.from({ length: 21 }, (_, index) => ({
        label: `Group ${index + 1}`,
        items: [{ label: 'React' }],
      })),
    })).toThrow('skill groups must include 20 items or fewer');

    expect(() => validateSkillsState({
      groups: [
        {
          label: 'Core Web Stack',
          items: Array.from({ length: 41 }, (_, index) => ({
            label: `Skill ${index + 1}`,
          })),
        },
      ],
    })).toThrow('skill group 1 items must include 40 items or fewer');
  });
});
