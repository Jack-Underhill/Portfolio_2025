import TextInput from '../forms/TextInput';
import FileInput from '../forms/FileInput';
import ImagePreview from '../media/ImagePreview';
import { adminUi } from '../../styles/recipes';

function SocialLinkItem({
    link,
    index,
    onChange,
    onRemove,
}) {
    const linkName = link.label || `link ${index + 1}`;

    return (
        <div
            className={`grid items-start gap-2 md:grid-cols-[minmax(0,120px)_minmax(0,140px)_minmax(0,1fr)_auto_auto] ${adminUi.editorPanel}`}
        >
            {/* icon upload + preview */}
            <div className="space-y-1">
                <FileInput
                    id={`social-icon-${index}`}
                    label="Icon"
                    accept="image/*"
                    selectedFile={link.iconFile || null}
                    hasCurrentFile={Boolean(link.iconUrl)}
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

            {/* published toggle */}
            <label className="flex items-center gap-2 text-xs text-admin-text-muted select-none mt-6">
                <input
                    type="checkbox"
                    checked={link.published !== false}
                    aria-label={`Published state for ${linkName}`}
                    onChange={(event) => onChange('published', event.target.checked)}
                    className="h-4 w-4 rounded border-admin-checkbox-border bg-admin-control"
                />
                Published
            </label>

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
