import TextInput from '../forms/TextInput';
import FileInput from '../forms/FileInput';
import ImagePreview from '../media/ImagePreview';
import { adminUi, cx } from '../../styles/recipes';

function SocialLinkItem({
    link,
    index,
    isDragging,
    isDragOver,
    onChange,
    onRemove,
    dragProps,
}) {
    const linkName = link.label || `link ${index + 1}`;

    return (
        <div
            {...dragProps}
            className={cx(
                'grid gap-2 md:grid-cols-[auto_minmax(0,120px)_minmax(0,140px)_minmax(0,1fr)_auto] items-start px-3 py-2',
                adminUi.panel,
                isDragOver && adminUi.panelDragOver,
                isDragging && 'opacity-70',
            )}
        >
            {/* drag handle */}
            <span
                aria-hidden="true"
                className="cursor-grab select-none text-xs text-admin-text-subtle mt-6"
            >
                ☰
            </span>

            {/* icon upload + preview */}
            <div className="space-y-1">
                <FileInput
                    id={`social-icon-${index}`}
                    label="Icon"
                    accept="image/*"
                    onChange={(file) => onChange('iconFile', file)}
                />
                <ImagePreview
                    file={link.iconFile || null}
                    url={link.iconUrl || ''}
                    alt={`${linkName} icon preview`}
                    isFixedSize={true}
                />
            </div>

            {/* label */}
            <TextInput
                id={`social-label-${index}`}
                label="Label"
                value={link.label}
                onChange={(value) => onChange('label', value)}
                placeholder="LinkedIn"
            />

            {/* URL */}
            <TextInput
                id={`social-url-${index}`}
                label="URL"
                value={link.url}
                onChange={(value) => onChange('url', value)}
                placeholder="https://..."
            />

            {/* remove button */}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${linkName}`}
                className={`${adminUi.iconButton} h-8 mt-6`}
            >
                ✕
            </button>
        </div>
    );
}

export default SocialLinkItem;
