import { useState } from 'react';
import InputLabel from './InputLabel';
import RowTech from './RowTech'

function ListTech({ idPrefix, label, values, onChange }) {
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
                <InputLabel htmlFor={idPrefix}>
                    {label}
                </InputLabel>
            }

            <div className="space-y-2">
                {list.map((value, index) => (
                    <RowTech
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
                className="text-xs text-sky-300 hover:text-sky-200"
            >
                + Add tech
            </button>
        </div>
    );
}

export default ListTech;
