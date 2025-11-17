import InputText from './InputText';
import InputFile from './InputFile';
import ViewImage from './ViewImage';

function RowSocial({
    link,
    index,
    isDragging,
    isDragOver,
    onChange,
    onRemove,
    dragProps,
}) {
    return (
        <div
            {...dragProps}
            className={[
                'grid gap-2 md:grid-cols-[auto_minmax(0,120px)_minmax(0,140px)_minmax(0,1fr)_auto] items-start rounded-md border border-slate-700 px-3 py-2',
                isDragOver ? 'ring-1 ring-sky-500 bg-slate-900/70' : 'bg-slate-900',
                isDragging ? 'opacity-70' : '',
            ].join(' ')}
        >
            {/* drag handle */}
            <span className="cursor-grab select-none text-xs text-slate-400 mt-6">
                ☰
            </span>

            {/* icon upload + preview */}
            <div className="space-y-1">
                <InputFile
                    id={`social-icon-${index}`}
                    label="Icon"
                    accept="image/*"
                    onChange={(file) => onChange('iconFile', file)}
                />
                <ViewImage
                    file={link.iconFile || null}
                    url={link.iconUrl || ''}
                    alt={`${link.label || 'Social'} icon`}
                    isFixedSize={true}
                />
            </div>

            {/* label */}
            <InputText
                id={`social-label-${index}`}
                label="Label"
                value={link.label}
                onChange={(value) => onChange('label', value)}
                placeholder="LinkedIn"
            />

            {/* URL */}
            <InputText
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
                className="text-xs px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800 h-8 mt-6"
            >
                ✕
            </button>
        </div>
    );
}

export default RowSocial;
