import { normalizeOptionalString } from '../shared/normalize.js';

function normalizeSortOrder(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function compareBySortOrderThenLabel(left, right) {
  if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
  return left.label.localeCompare(right.label);
}

function mapSkillRowToPublicItem(row) {
  const groupLabel = normalizeOptionalString(row?.group_label);
  const label = normalizeOptionalString(row?.label);

  if (!groupLabel || !label || row?.published === false) return null;

  return {
    groupLabel,
    groupSortOrder: normalizeSortOrder(row?.group_sort_order),
    label,
    sortOrder: normalizeSortOrder(row?.item_sort_order),
  };
}

export function mapSkillRowsToPublic(rows) {
  if (!Array.isArray(rows)) return null;

  const groupsByLabel = rows.reduce((groups, row) => {
    const item = mapSkillRowToPublicItem(row);
    if (!item) return groups;

    const currentGroup = groups.get(item.groupLabel);
    if (currentGroup) {
      currentGroup.sortOrder = Math.min(currentGroup.sortOrder, item.groupSortOrder);
      currentGroup.items.push({
        label: item.label,
        sortOrder: item.sortOrder,
      });
      return groups;
    }

    groups.set(item.groupLabel, {
      label: item.groupLabel,
      sortOrder: item.groupSortOrder,
      items: [
        {
          label: item.label,
          sortOrder: item.sortOrder,
        },
      ],
    });

    return groups;
  }, new Map());

  const groups = Array.from(groupsByLabel.values())
    .map((group) => ({
      ...group,
      items: group.items.toSorted(compareBySortOrderThenLabel),
    }))
    .toSorted(compareBySortOrderThenLabel);

  return groups.length ? { groups } : null;
}
