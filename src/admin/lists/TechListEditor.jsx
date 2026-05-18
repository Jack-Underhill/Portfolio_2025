import { useState } from 'react';
import FieldLabel from '../forms/FieldLabel';
import TechListItem from './TechListItem'
import { adminUi } from '../../styles/recipes';

function TechListEditor({ idPrefix, label, values, onChange, addLabel = '+ Add tech' }) {
    const list = Array.isArray(values) ? values : [];

    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const SCROLL_MARGIN = 80;
    const SCROLL_SPEED = 12;

    // --- add / update / remove ---
    const handleAdd = () => onChange([...list, '']);

    const handleChangeItem = (index, value) => {
        const next = [...list];
        next[index] = value;
        onChange(next);
    };

    const handleRemove = (index) => {
        const next = list.filter((_, i) => i !== index);
        onChange(next.length ? next : ['']);
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

        const next = [...list];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);

        onChange(next);
        resetDragState();
    };

    const handleDragEnd = () => resetDragState();

    return (
        <div className="space-y-2">
            {label && 
                <FieldLabel htmlFor={idPrefix}>
                    {label}
                </FieldLabel>
            }

            <div className="space-y-2">
                {list.map((value, index) => (
                    <TechListItem
                        key={`${idPrefix}-${index}`}
                        id={`${idPrefix}-${index}`}
                        value={value}
                        isDragging={dragIndex === index}
                        isDragOver={dragOverIndex === index}
                        onChange={(v) => handleChangeItem(index, v)}
                        onRemove={() => handleRemove(index)}
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
                onClick={handleAdd}
                className={adminUi.addLink}
            >
                {addLabel}
            </button>
        </div>
    );
}

export default TechListEditor;
