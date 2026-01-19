import { useState, useRef } from 'react';

import InputLabel from './InputLabel';


function NavItem({
    id,
    title,
    isActive,
    isDragging,
    isDragOver,
    onSelect,
    ...dragProps
}) {
    return (
        <button
            type="button"
            {...dragProps}
            className={
                [
                    'px-3 py-2 text-sm font-semibold rounded-md select-none',
                    isActive
                        ? 'bg-sky-600 text-slate-50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
                    isDragOver ? 'ring-2 ring-sky-500' : '',
                    isDragging ? 'opacity-60' : '',
                ].join(' ')
            }
            onClick={() => onSelect(id)}
        >
            {title || id}
        </button>
    );
};

function NavProjects({ projects = [], activeId, onSelect, onReorder }) {
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const didDragRef = useRef(false);

    const resetDrag = () => {
        setDragIndex(null);
        setDragOverIndex(null);
        
        // prevents “drop then click selects” weirdness
        setTimeout(() => {
            didDragRef.current = false;
        }, 0);
    };

    const handleDragStart = (index) => (e) => {
        didDragRef.current = true;
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index) => (e) => {
        e.preventDefault();
        if (index !== dragIndex) setDragOverIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index) => (e) => {
        e.preventDefault();

        if (dragIndex === null || dragIndex === index) {
            resetDrag();
            return;
        }

        onReorder(dragIndex, index);
        resetDrag();
    };

    return (
        <>
            <InputLabel htmlFor="project-nav">Select Project to Edit</InputLabel>

            <div id="project-nav" className="flex gap-3 flex-wrap">
                {projects.map((p, index) => (
                    <NavItem
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        isActive={p.id === activeId}
                        isDragging={dragIndex === index}
                        isDragOver={dragOverIndex === index}
                        onSelect={(id) => {
                            if (didDragRef.current) return;
                            onSelect(id);
                        }}
                        draggable
                        onDragStart={handleDragStart(index)}
                        onDragEnter={handleDragEnter(index)}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop(index)}
                        onDragEnd={resetDrag}
                    />
                ))}
            </div>
        </>
    );
};

export default NavProjects;