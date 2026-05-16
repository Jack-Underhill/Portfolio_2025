import TextAreaInput from '../forms/TextAreaInput';
import { adminUi, cx } from '../../styles/recipes';

function TechListItem({
    id,
    value,
    isDragging,
    isDragOver,
    onChange,
    onRemove,
    dragProps,
}) {
    return (
        <div
            {...dragProps}
            className={cx(
                'flex gap-2 items-center px-2 py-1',
                adminUi.panel,
                isDragOver && 'bg-admin-panel-hover/70',
                isDragging && 'opacity-70',
            )}
        >
            <span className="cursor-grab select-none text-xs text-admin-text-subtle">
                ☰
            </span>

            <div className="flex-1">
                <TextAreaInput
                    id={id}
                    label={null}
                    value={value}
                    onChange={onChange}
                />
            </div>

            <button
                type="button"
                onClick={onRemove}
                className={adminUi.iconButton}
            >
                ✕
            </button>
        </div>
    );
}

export default TechListItem;
