import Text from '../../components/ui/Text';
import TextInput from '../forms/TextInput';
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

function SkillsSection({ state, onChange }) {
    const groups = Array.isArray(state?.groups) ? state.groups : [];

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

    return (
        <div className="space-y-6">
            <h2 id="admin-skills-heading" className="text-xl font-semibold">Skills Section</h2>

            <div className="space-y-4">
                {groups.map((group, groupIndex) => {
                    const items = Array.isArray(group.items) ? group.items : [];
                    const groupKey = group.id ?? `${group.sortOrder}-${group.label}-${groupIndex}`;

                    return (
                        <div key={groupKey} className={adminUi.editorPanel}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div className="flex-1">
                                    <TextInput
                                        id={`skill-group-${groupIndex}`}
                                        label={`Group ${groupIndex + 1}`}
                                        value={group.label || ''}
                                        onChange={(label) => updateGroup(groupIndex, { label })}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Text as="p" variant="adminLabel">
                                        order: {groupIndex}
                                    </Text>

                                    <button
                                        type="button"
                                        onClick={() => setGroups((current) => moveItem(
                                            current,
                                            groupIndex,
                                            groupIndex - 1,
                                        ))}
                                        disabled={groupIndex === 0}
                                        aria-label={`Move skill group ${groupIndex + 1} up`}
                                        className={adminUi.iconButton}
                                    >
                                        Up
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setGroups((current) => moveItem(
                                            current,
                                            groupIndex,
                                            groupIndex + 1,
                                        ))}
                                        disabled={groupIndex === groups.length - 1}
                                        aria-label={`Move skill group ${groupIndex + 1} down`}
                                        className={adminUi.iconButton}
                                    >
                                        Down
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setGroups((current) => (
                                            current.filter((_, index) => index !== groupIndex)
                                        ))}
                                        aria-label={`Remove skill group ${groupIndex + 1}`}
                                        className={adminUi.dangerLink}
                                    >
                                        Remove group
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {items.map((item, itemIndex) => {
                                    const itemKey = item.id ?? `${groupKey}-item-${itemIndex}`;

                                    return (
                                        <div
                                            key={itemKey}
                                            className={cx(
                                                'grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-end',
                                                adminUi.panel,
                                            )}
                                        >
                                            <TextInput
                                                id={`skill-${groupIndex}-${itemIndex}`}
                                                label={`Skill ${itemIndex + 1}`}
                                                value={item.label || ''}
                                                onChange={(label) => updateSkillItem(
                                                    groupIndex,
                                                    itemIndex,
                                                    { label },
                                                )}
                                            />

                                            <div className="flex flex-wrap items-center gap-3">
                                                <label className="flex items-center gap-2 text-xs text-admin-text-muted select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.published !== false}
                                                        aria-label={`Published state for skill ${itemIndex + 1} in group ${groupIndex + 1}`}
                                                        onChange={(e) => updateSkillItem(
                                                            groupIndex,
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
                                                        groupIndex,
                                                        (current) => moveItem(
                                                            current,
                                                            itemIndex,
                                                            itemIndex - 1,
                                                        ),
                                                    )}
                                                    disabled={itemIndex === 0}
                                                    aria-label={`Move skill ${itemIndex + 1} up in group ${groupIndex + 1}`}
                                                    className={adminUi.iconButton}
                                                >
                                                    Up
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => updateGroupItems(
                                                        groupIndex,
                                                        (current) => moveItem(
                                                            current,
                                                            itemIndex,
                                                            itemIndex + 1,
                                                        ),
                                                    )}
                                                    disabled={itemIndex === items.length - 1}
                                                    aria-label={`Move skill ${itemIndex + 1} down in group ${groupIndex + 1}`}
                                                    className={adminUi.iconButton}
                                                >
                                                    Down
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeSkillItem(groupIndex, itemIndex)}
                                                    aria-label={`Remove skill ${itemIndex + 1} from group ${groupIndex + 1}`}
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
                                onClick={() => updateGroupItems(groupIndex, (items) => [
                                    ...items,
                                    createEmptySkillItem(),
                                ])}
                                aria-label={`Add skill to group ${groupIndex + 1}`}
                                className={adminUi.addLink}
                            >
                                + Add skill
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => setGroups((current) => [
                    ...current,
                    createEmptySkillGroup(),
                ])}
                aria-label="Add skill group"
                className={adminUi.secondaryButton}
            >
                + Add Skill Group
            </button>
        </div>
    );
}

export default SkillsSection;
