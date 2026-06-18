import { useEffect, useMemo, useState } from 'react';

import Text from '../../components/ui/Text';
import TextInput from '../forms/TextInput';
import CardSelector from '../navigation/CardSelector';
import { adminUi, cx } from '../../styles/recipes';

function createEmptySkillItem() {
    return {
        id: crypto.randomUUID(),
        label: '',
        sortOrder: 0,
        published: true,
    };
}

function createEmptySkillGroup() {
    return {
        id: crypto.randomUUID(),
        label: '',
        sortOrder: 0,
        items: [createEmptySkillItem()],
    };
}

function normalizeGroupOrder(groups) {
    return groups.map((group, groupIndex) => ({
        ...group,
        sortOrder: groupIndex,
        items: Array.isArray(group.items)
            ? group.items.map((item, itemIndex) => ({
                ...item,
                sortOrder: itemIndex,
                published: item.published !== false,
            }))
            : [],
    }));
}

function moveItem(list, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= list.length) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function getGroupSelectorId(group, index) {
    return group?.id ?? `skill-group-${group?.sortOrder ?? index}-${index}`;
}

function resolveActiveGroupId(groupCards, currentId) {
    if (!groupCards.length) return null;
    if (groupCards.some((card) => card.id === currentId)) return currentId;

    return groupCards[0].id;
}

function SkillsSection({ state, onChange }) {
    const groups = useMemo(
        () => (Array.isArray(state?.groups) ? state.groups : []),
        [state?.groups],
    );
    const groupCards = useMemo(() => groups.map((group, index) => ({
        id: getGroupSelectorId(group, index),
        title: group.label || `Group ${index + 1}`,
    })), [groups]);
    const [activeGroupId, setActiveGroupId] = useState(groupCards[0]?.id ?? null);

    useEffect(() => {
        setActiveGroupId((currentId) => resolveActiveGroupId(groupCards, currentId));
    }, [groupCards]);

    const activeGroupIndex = groupCards.findIndex((card) => card.id === activeGroupId);
    const activeGroup = activeGroupIndex >= 0 ? groups[activeGroupIndex] : null;
    const activeItems = Array.isArray(activeGroup?.items) ? activeGroup.items : [];

    const setGroups = (updater) => {
        const nextRaw = typeof updater === 'function' ? updater(groups) : updater;
        onChange({ ...(state || {}), groups: normalizeGroupOrder(nextRaw) });
    };

    const updateGroup = (groupIndex, patch) => {
        setGroups((current) => current.map((group, index) => (
            index === groupIndex ? { ...group, ...patch } : group
        )));
    };

    const updateGroupItems = (groupIndex, updater) => {
        setGroups((current) => current.map((group, index) => {
            if (index !== groupIndex) return group;

            const items = Array.isArray(group.items) ? group.items : [];
            const nextItems = typeof updater === 'function' ? updater(items) : updater;
            return { ...group, items: nextItems };
        }));
    };

    const updateSkillItem = (groupIndex, itemIndex, patch) => {
        updateGroupItems(groupIndex, (items) => items.map((item, index) => (
            index === itemIndex ? { ...item, ...patch } : item
        )));
    };

    const removeSkillItem = (groupIndex, itemIndex) => {
        updateGroupItems(groupIndex, (items) => {
            const next = items.filter((_, index) => index !== itemIndex);
            return next.length ? next : [createEmptySkillItem()];
        });
    };

    const addGroup = () => {
        const group = createEmptySkillGroup();

        setGroups((current) => [...current, group]);
        setActiveGroupId(group.id);
    };

    const removeGroup = (groupIndex) => {
        const nextActiveGroup = groups[groupIndex + 1] ?? groups[groupIndex - 1] ?? null;

        setGroups((current) => current.filter((_, index) => index !== groupIndex));
        setActiveGroupId(nextActiveGroup?.id ?? null);
    };

    return (
        <div className="space-y-4">
            {groups.length > 0 ? (
                <>
                    <CardSelector
                        cardTypeId="Skill Group"
                        cards={groupCards}
                        activeId={activeGroupId}
                        onSelect={setActiveGroupId}
                        onReorder={(fromIndex, toIndex) => {
                            setGroups((current) => moveItem(current, fromIndex, toIndex));
                        }}
                    />

                    <button
                        type="button"
                        onClick={addGroup}
                        aria-label="Add skill group"
                        className={adminUi.secondaryButton}
                    >
                        + Add Skill Group
                    </button>

                    {activeGroup && (
                        <div className={adminUi.editorPanel}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div className="flex-1">
                                    <TextInput
                                        id={`skill-group-${activeGroupIndex}`}
                                        label={`Group ${activeGroupIndex + 1}`}
                                        value={activeGroup.label || ''}
                                        onChange={(label) => updateGroup(activeGroupIndex, { label })}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Text as="p" variant="adminLabel">
                                        order: {activeGroupIndex}
                                    </Text>

                                    <button
                                        type="button"
                                        onClick={() => removeGroup(activeGroupIndex)}
                                        aria-label={`Remove skill group ${activeGroupIndex + 1}`}
                                        className={adminUi.dangerLink}
                                    >
                                        Remove group
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {activeItems.map((item, itemIndex) => {
                                    const itemKey = item.id
                                        ?? `${getGroupSelectorId(activeGroup, activeGroupIndex)}-item-${itemIndex}`;

                                    return (
                                        <div
                                            key={itemKey}
                                            className={cx(
                                                'grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-end',
                                                adminUi.panel,
                                            )}
                                        >
                                            <TextInput
                                                id={`skill-${activeGroupIndex}-${itemIndex}`}
                                                label={`Skill ${itemIndex + 1}`}
                                                value={item.label || ''}
                                                onChange={(label) => updateSkillItem(
                                                    activeGroupIndex,
                                                    itemIndex,
                                                    { label },
                                                )}
                                            />

                                            <div className="flex flex-wrap items-center gap-3">
                                                <label className="flex items-center gap-2 text-xs text-admin-text-muted select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.published !== false}
                                                        aria-label={`Published state for skill ${itemIndex + 1} in group ${activeGroupIndex + 1}`}
                                                        onChange={(e) => updateSkillItem(
                                                            activeGroupIndex,
                                                            itemIndex,
                                                            { published: e.target.checked },
                                                        )}
                                                        className="h-4 w-4 rounded border-admin-checkbox-border bg-admin-panel"
                                                    />
                                                    Published
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => updateGroupItems(
                                                        activeGroupIndex,
                                                        (current) => moveItem(
                                                            current,
                                                            itemIndex,
                                                            itemIndex - 1,
                                                        ),
                                                    )}
                                                    disabled={itemIndex === 0}
                                                    aria-label={`Move skill ${itemIndex + 1} up in group ${activeGroupIndex + 1}`}
                                                    className={adminUi.iconButton}
                                                >
                                                    Up
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => updateGroupItems(
                                                        activeGroupIndex,
                                                        (current) => moveItem(
                                                            current,
                                                            itemIndex,
                                                            itemIndex + 1,
                                                        ),
                                                    )}
                                                    disabled={itemIndex === activeItems.length - 1}
                                                    aria-label={`Move skill ${itemIndex + 1} down in group ${activeGroupIndex + 1}`}
                                                    className={adminUi.iconButton}
                                                >
                                                    Down
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSkillItem(activeGroupIndex, itemIndex)}
                                                    aria-label={`Remove skill ${itemIndex + 1} from group ${activeGroupIndex + 1}`}
                                                    className={adminUi.dangerLink}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => updateGroupItems(activeGroupIndex, (items) => [
                                    ...items,
                                    createEmptySkillItem(),
                                ])}
                                aria-label={`Add skill to group ${activeGroupIndex + 1}`}
                                className={adminUi.addLink}
                            >
                                + Add skill
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className={adminUi.emptyText}>No skill groups.</p>
            )}
        </div>
    );
}

export default SkillsSection;
