import { useState } from 'react';
import ListTech from './ListTech';
import RowSocial from './RowSocial';

function SectionContact({ state, onChange }) {
    const { proficientTechs, experiencingTechs, socialLinks } = state;

    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const SCROLL_MARGIN = 80;
    const SCROLL_SPEED = 12;

    // --- add / update / remove ---
    const updateField = (field, value) => {
        onChange({ ...state, [field]: value });
    };

    const handleSocialChange = (index, field, value) => {
        const next = [...socialLinks];
        next[index] = { ...next[index], [field]: value };
        updateField('socialLinks', next);
    };

    const handleAddLink = () => {
        const next = [
            ...socialLinks,
            {
                id: crypto.randomUUID(),
                label: '',
                url: '',
                iconFile: null,
                iconUrl: '',
            },
        ];
        updateField('socialLinks', next);
    };

    const handleRemoveLink = (index) => {
        const next = socialLinks.filter((_, i) => i !== index);
        updateField('socialLinks', next);
    };

    // --- drag logic ---
    const resetDragState = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragStart = (index) => (e) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index) => (e) => {
        e.preventDefault();
        if (index !== dragIndex) setDragOverIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();

        const { clientY } = e;
        const { innerHeight } = window;

        if (clientY < SCROLL_MARGIN) {
            window.scrollBy(0, -SCROLL_SPEED);
        } else if (clientY > innerHeight - SCROLL_MARGIN) {
            window.scrollBy(0, SCROLL_SPEED);
        }
    };

    const handleDrop = (index) => (e) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            resetDragState();
            return;
        }

        const next = [...socialLinks];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);

        updateField('socialLinks', next);
        resetDragState();
    };

    const handleDragEnd = () => resetDragState();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Contact / Skills Section</h2>

            {/* Proficient techs */}
            <ListTech
                idPrefix="proficient-tech"
                label="Proficient technologies"
                values={proficientTechs || []}
                onChange={(next) => updateField('proficientTechs', next)}
            />

            {/* Experiencing techs */}
            <ListTech
                idPrefix="experiencing-tech"
                label="Currently using / learning"
                values={experiencingTechs || []}
                onChange={(next) => updateField('experiencingTechs', next)}
            />

            {/* Social / professional links */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300">
                    Social / professional links
                </p>

                <div className="space-y-2">
                    {socialLinks.map((link, index) => (
                        <RowSocial
                            key={link.id ?? index}
                            link={link}
                            index={index}
                            isDragging={dragIndex === index}
                            isDragOver={dragOverIndex === index}
                            onChange={(field, value) =>
                                handleSocialChange(index, field, value)
                            }
                            onRemove={() => handleRemoveLink(index)}
                            dragProps={{
                                draggable:      true,
                                onDragStart:    handleDragStart(index),
                                onDragEnter:    handleDragEnter(index),
                                onDragOver:     handleDragOver,
                                onDrop:         handleDrop(index),
                                onDragEnd:      handleDragEnd,
                            }}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleAddLink}
                    className="text-xs text-sky-300 hover:text-sky-200"
                >
                    + Add link
                </button>
            </div>
        </div>
    );
}

export default SectionContact;
