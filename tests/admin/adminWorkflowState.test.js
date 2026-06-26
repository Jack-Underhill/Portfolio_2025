import { describe, expect, it } from 'vitest';

import {
  ADMIN_WORKFLOW_LOCATION_IDS,
  getAdminWorkflowBranchLocationIds,
} from '../../src/admin/routing/adminRoutes.js';
import {
  getProjectFieldWorkflowLocationIds,
  getProjectWorkflowLocationId,
} from '../../src/admin/projects/projectEditorSections.js';
import { applyAgentProjectDraftPatch } from '../../src/domain/projects/agentDraft.js';
import {
  ADMIN_WORKFLOW_VALIDATION,
  ADMIN_WORKFLOW_VISUAL_STATE,
  applyAdminWorkflowBranchEdit,
  beginAdminWorkflowValidation,
  clearAdminWorkflowStateAfterSave,
  completeAdminWorkflowBranchValidationWithFailure,
  completeAdminWorkflowValidationSuccessfully,
  createAdminWorkflowState,
  deriveAdminWorkflowVisualState,
  deriveAdminWorkflowParentVisualState,
  deriveCollapsedAdminWorkflowParentState,
  deriveExpandedAdminWorkflowParentState,
  getAdminWorkflowLocationState,
  hasAdminWorkflowUnsavedChanges,
  markAdminWorkflowLocationsDirty,
  preserveAdminWorkflowStateAfterFailedSave,
} from '../../src/admin/workflow/adminWorkflowState.js';

const PROJECTS_LOCATION_IDS = getAdminWorkflowBranchLocationIds('projects');

function getLocationState(workflowState, locationId) {
  return getAdminWorkflowLocationState(workflowState, locationId);
}

describe('admin workflow state', () => {
  it('derives stable workflow location ids from the admin route tree', () => {
    expect(ADMIN_WORKFLOW_LOCATION_IDS).toEqual([
      'about',
      'projects',
      'projects/classification',
      'projects/intro',
      'projects/media',
      'projects/links',
      'projects/tech',
      'projects/lists',
      'projects/challenges',
      'projects/agent',
      'education',
      'certifications',
      'skills',
      'contact',
    ]);
    expect(PROJECTS_LOCATION_IDS).toEqual([
      'projects',
      'projects/classification',
      'projects/intro',
      'projects/media',
      'projects/links',
      'projects/tech',
      'projects/lists',
      'projects/challenges',
      'projects/agent',
    ]);
  });

  it('maps project fields and collection operations to explicit workflow owners', () => {
    expect(getProjectWorkflowLocationId('links')).toBe('projects/links');
    expect(getProjectFieldWorkflowLocationIds([
      'url',
      'sourceUrl',
      'techStack',
      'url',
    ])).toEqual([
      'projects/links',
      'projects/tech',
    ]);
    expect(getProjectFieldWorkflowLocationIds(['unsupportedField'])).toEqual([]);
  });

  it('attributes a single-owner agent import only to its changed subsection', () => {
    const result = applyAgentProjectDraftPatch(
      {
        title: 'Current title',
        description: 'Current description',
      },
      {
        title: 'Current title',
        description: 'Updated description',
      },
    );

    expect(result.changedFields).toEqual(['description']);
    expect(getProjectFieldWorkflowLocationIds(result.changedFields)).toEqual([
      'projects/intro',
    ]);
  });

  it('attributes a multi-owner agent import to every changed subsection once', () => {
    const result = applyAgentProjectDraftPatch(
      {
        title: 'Current title',
        url: 'https://current.example.test',
        techStack: {
          frontend: ['React'],
          backend: [],
          data: [],
          infrastructure: [],
        },
      },
      {
        title: 'Updated title',
        url: 'https://updated.example.test',
        techStack: {
          frontend: ['Astro'],
        },
      },
    );

    expect(result.changedFields).toEqual(['title', 'url', 'techStack']);
    expect(getProjectFieldWorkflowLocationIds(result.changedFields)).toEqual([
      'projects/intro',
      'projects/links',
      'projects/tech',
    ]);
  });

  it('keeps Links and Tech dirty when edited in sequence', () => {
    let workflowState = createAdminWorkflowState();

    workflowState = markAdminWorkflowLocationsDirty(workflowState, ['projects/links']);
    workflowState = markAdminWorkflowLocationsDirty(workflowState, ['projects/tech']);

    expect(getLocationState(workflowState, 'projects/links').dirty).toBe(true);
    expect(getLocationState(workflowState, 'projects/tech').dirty).toBe(true);
    expect(hasAdminWorkflowUnsavedChanges(workflowState)).toBe(true);
  });

  it('keeps multiple root sections dirty when edited in sequence', () => {
    let workflowState = createAdminWorkflowState();

    workflowState = markAdminWorkflowLocationsDirty(workflowState, ['education']);
    workflowState = markAdminWorkflowLocationsDirty(workflowState, ['certifications']);

    expect(getLocationState(workflowState, 'education').dirty).toBe(true);
    expect(getLocationState(workflowState, 'certifications').dirty).toBe(true);
    expect(hasAdminWorkflowUnsavedChanges(workflowState)).toBe(true);
  });

  it('preserves dirty state through successful validation', () => {
    let workflowState = markAdminWorkflowLocationsDirty(
      createAdminWorkflowState(),
      ['projects/links'],
    );

    workflowState = beginAdminWorkflowValidation(workflowState, PROJECTS_LOCATION_IDS);
    workflowState = completeAdminWorkflowValidationSuccessfully(
      workflowState,
      PROJECTS_LOCATION_IDS,
    );

    expect(getLocationState(workflowState, 'projects/links')).toEqual({
      dirty: true,
      validation: ADMIN_WORKFLOW_VALIDATION.VALID,
    });
    expect(deriveAdminWorkflowVisualState(
      getLocationState(workflowState, 'projects/links'),
    )).toBe(ADMIN_WORKFLOW_VISUAL_STATE.VALID);
    expect(hasAdminWorkflowUnsavedChanges(workflowState)).toBe(true);
  });

  it('clears stale branch validation after an edit without losing dirty owners', () => {
    let workflowState = markAdminWorkflowLocationsDirty(
      createAdminWorkflowState(),
      ['projects/links', 'projects/tech'],
    );
    workflowState = completeAdminWorkflowValidationSuccessfully(
      workflowState,
      PROJECTS_LOCATION_IDS,
    );

    workflowState = applyAdminWorkflowBranchEdit(
      workflowState,
      'projects',
      ['projects/media'],
    );

    expect(getLocationState(workflowState, 'projects/links')).toEqual({
      dirty: true,
      validation: ADMIN_WORKFLOW_VALIDATION.NONE,
    });
    expect(getLocationState(workflowState, 'projects/tech').dirty).toBe(true);
    expect(getLocationState(workflowState, 'projects/media').dirty).toBe(true);
    expect(PROJECTS_LOCATION_IDS.every(
      (locationId) => (
        getLocationState(workflowState, locationId).validation
        === ADMIN_WORKFLOW_VALIDATION.NONE
      ),
    )).toBe(true);
  });

  it('preserves dirty state when validation fails', () => {
    let workflowState = markAdminWorkflowLocationsDirty(
      createAdminWorkflowState(),
      ['projects/links', 'education'],
    );

    workflowState = beginAdminWorkflowValidation(
      workflowState,
      PROJECTS_LOCATION_IDS,
    );
    workflowState = completeAdminWorkflowBranchValidationWithFailure(
      workflowState,
      'projects',
    );

    expect(getLocationState(workflowState, 'projects')).toEqual({
      dirty: false,
      validation: ADMIN_WORKFLOW_VALIDATION.INVALID,
    });
    expect(getLocationState(workflowState, 'projects/links').dirty).toBe(true);
    expect(getLocationState(workflowState, 'projects/links').validation).toBe(
      ADMIN_WORKFLOW_VALIDATION.NONE,
    );
    expect(getLocationState(workflowState, 'education').dirty).toBe(true);
    expect(hasAdminWorkflowUnsavedChanges(workflowState)).toBe(true);
  });

  it('clears all workflow state only after a successful save', () => {
    const dirtyState = markAdminWorkflowLocationsDirty(
      createAdminWorkflowState(),
      ['about', 'projects/links'],
    );
    const failedSaveState = preserveAdminWorkflowStateAfterFailedSave(dirtyState);
    const savedState = clearAdminWorkflowStateAfterSave();

    expect(failedSaveState).toBe(dirtyState);
    expect(hasAdminWorkflowUnsavedChanges(failedSaveState)).toBe(true);
    expect(savedState).toEqual({});
    expect(hasAdminWorkflowUnsavedChanges(savedState)).toBe(false);
  });

  it('uses invalid, validating, dirty, valid, normal precedence for collapsed parents', () => {
    const normal = { dirty: false, validation: ADMIN_WORKFLOW_VALIDATION.NONE };
    const dirty = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.NONE };
    const validating = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.VALIDATING };
    const valid = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.VALID };
    const invalid = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.INVALID };

    expect(deriveCollapsedAdminWorkflowParentState({
      parentState: dirty,
      childStates: [valid, invalid, validating],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.INVALID);
    expect(deriveCollapsedAdminWorkflowParentState({
      parentState: dirty,
      childStates: [valid, validating],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING);
    expect(deriveCollapsedAdminWorkflowParentState({
      parentState: normal,
      childStates: [valid, dirty],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY);
    expect(deriveCollapsedAdminWorkflowParentState({
      parentState: normal,
      childStates: [valid, valid],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.VALID);
    expect(deriveCollapsedAdminWorkflowParentState({
      parentState: normal,
      childStates: [valid, normal],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.NORMAL);
  });

  it('suppresses aggregate child state for expanded parents while retaining direct state', () => {
    const normal = { dirty: false, validation: ADMIN_WORKFLOW_VALIDATION.NONE };
    const dirty = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.NONE };
    const valid = { dirty: true, validation: ADMIN_WORKFLOW_VALIDATION.VALID };
    const invalid = { dirty: false, validation: ADMIN_WORKFLOW_VALIDATION.INVALID };

    expect(deriveExpandedAdminWorkflowParentState({
      parentState: normal,
      childStates: [dirty, invalid],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.NORMAL);
    expect(deriveExpandedAdminWorkflowParentState({
      parentState: dirty,
      childStates: [invalid],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY);
    expect(deriveExpandedAdminWorkflowParentState({
      parentState: valid,
      childStates: [valid],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY);
    expect(deriveExpandedAdminWorkflowParentState({
      parentState: invalid,
      childStates: [dirty],
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.INVALID);
  });

  it('derives collapsed and expanded parent navigation state from one workflow map', () => {
    let workflowState = markAdminWorkflowLocationsDirty(
      createAdminWorkflowState(),
      ['projects/links'],
    );

    expect(deriveAdminWorkflowParentVisualState({
      workflowState,
      parentLocationId: 'projects',
      childLocationIds: ['projects/links', 'projects/tech'],
      isExpanded: false,
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY);
    expect(deriveAdminWorkflowParentVisualState({
      workflowState,
      parentLocationId: 'projects',
      childLocationIds: ['projects/links', 'projects/tech'],
      isExpanded: true,
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.NORMAL);

    workflowState = markAdminWorkflowLocationsDirty(workflowState, ['projects']);

    expect(getLocationState(workflowState, 'projects').dirty).toBe(true);
    expect(getLocationState(workflowState, 'projects/links').dirty).toBe(true);
    expect(deriveAdminWorkflowParentVisualState({
      workflowState,
      parentLocationId: 'projects',
      childLocationIds: ['projects/links', 'projects/tech'],
      isExpanded: true,
    })).toBe(ADMIN_WORKFLOW_VISUAL_STATE.DIRTY);
  });
});
