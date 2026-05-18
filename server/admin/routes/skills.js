import { requireServiceClient } from '../clients/supabaseService.js';
import {
  getStatePayload,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';
import { validateSkillsState } from './validation.js';

const SKILL_COLUMNS = 'id, group_label, label, group_sort_order, item_sort_order, published';

export async function loadSkillsData() {
  const client = requireServiceClient();

  const { data, error } = await client
    .from('skills')
    .select(SKILL_COLUMNS)
    .order('group_sort_order', { ascending: true })
    .order('group_label', { ascending: true })
    .order('item_sort_order', { ascending: true })
    .order('label', { ascending: true });

  if (error) throw error;

  return dbRowsToUiSkills(data || []);
}

export async function handleSkillsRead(_req, res) {
  try {
    sendJson(res, 200, await loadSkillsData());
  } catch (error) {
    sendRouteError(res, error);
  }
}

export async function saveSkillsData(state) {
  const validState = validateSkillsState(state);
  const client = requireServiceClient();

  const { error: deleteError } = await client
    .from('skills')
    .delete()
    .neq('id', 0);
  if (deleteError) throw deleteError;

  const skillRows = uiSkillsToDbRows(validState);
  if (!skillRows.length) return { groups: [] };

  const { data, error } = await client
    .from('skills')
    .insert(skillRows)
    .select(SKILL_COLUMNS);
  if (error) throw error;

  return dbRowsToUiSkills(data || []);
}

export async function handleSkillsWrite(req, res) {
  try {
    const { body } = await parseAdminRequest(req);
    const state = getStatePayload(body, 'skills');
    sendJson(res, 200, await saveSkillsData(state));
  } catch (error) {
    sendRouteError(res, error);
  }
}

function dbRowsToUiSkills(rows) {
  const groupsByLabel = new Map();

  for (const row of rows) {
    const groupLabel = stringOrEmpty(row.group_label);
    const label = stringOrEmpty(row.label);
    if (!groupLabel || !label) continue;

    let group = groupsByLabel.get(groupLabel);
    if (!group) {
      group = {
        label: groupLabel,
        sortOrder: normalizeSortOrder(row.group_sort_order),
        items: [],
      };
      groupsByLabel.set(groupLabel, group);
    }

    group.sortOrder = Math.min(group.sortOrder, normalizeSortOrder(row.group_sort_order));
    group.items.push({
      id: row.id ?? null,
      label,
      sortOrder: normalizeSortOrder(row.item_sort_order),
      published: row.published !== false,
    });
  }

  return {
    groups: Array.from(groupsByLabel.values())
      .map((group) => ({
        ...group,
        items: group.items.toSorted(compareBySortOrderThenLabel),
      }))
      .toSorted(compareBySortOrderThenLabel),
  };
}

function uiSkillsToDbRows(state) {
  const rows = [];

  for (const group of state.groups) {
    for (const item of group.items) {
      rows.push({
        group_label: group.label,
        label: item.label,
        group_sort_order: group.sortOrder,
        item_sort_order: item.sortOrder,
        published: item.published,
      });
    }
  }

  return rows;
}

function compareBySortOrderThenLabel(left, right) {
  if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
  return left.label.localeCompare(right.label);
}

function normalizeSortOrder(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}
