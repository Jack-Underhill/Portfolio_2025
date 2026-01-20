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

function CardNav({
    cardTypeId, // e.g., "project", "education"
    cards = [],
    activeId,
    onSelect,
    onReorder
}) {
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

    const getHTMLId = () => {
        return `card-nav-${cardTypeId.toLowerCase()}`;
    };

    return (
        <>
            <InputLabel htmlFor={getHTMLId()}>Select {cardTypeId} to Edit</InputLabel>

            <div id={getHTMLId()} className="flex gap-3 flex-wrap">
                {cards.map((card, index) => (
                    <NavItem
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        isActive={card.id === activeId}
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

export default CardNav;