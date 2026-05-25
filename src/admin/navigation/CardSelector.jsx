import { useRef, useState } from 'react';

import Text from '../../components/ui/Text';

function NavItem({
    id,
    title,
    isActive,
    isDragging,
    isDragOver,
    onSelect,
    ...dragProps
}) {
    const label = title || id;

    return (
        <button
            type="button"
            {...dragProps}
            className={
                [
                    'px-3 py-2 text-sm font-semibold rounded-md select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text',
                    isActive
                        ? 'bg-admin-accent text-admin-text'
                        : 'bg-admin-panel-hover text-admin-text-muted hover:bg-admin-border',
                    isDragOver ? 'ring-2 ring-admin-accent-hover' : '',
                    isDragging ? 'opacity-60' : '',
                ].join(' ')
            }
            aria-pressed={isActive}
            aria-label={`Edit ${label}`}
            onClick={() => onSelect(id)}
        >
            {label}
        </button>
    );
}

function CardSelector({
    cardTypeId,
    cards = [],
    activeId,
    onSelect,
    onReorder,
}) {
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const didDragRef = useRef(false);

    const resetDrag = () => {
        setDragIndex(null);
        setDragOverIndex(null);

        // Prevents drop-then-click selection during drag cleanup.
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

    const getHTMLId = () => `card-nav-${cardTypeId.toLowerCase()}`;
    const labelId = `${getHTMLId()}-label`;

    return (
        <>
            <Text id={labelId} as="p" variant="adminLabel" className="mb-1">
                Select {cardTypeId} to Edit
            </Text>

            <div
                id={getHTMLId()}
                className="flex gap-3 flex-wrap"
                role="group"
                aria-labelledby={labelId}
            >
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
}

export default CardSelector;
