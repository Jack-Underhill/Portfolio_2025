function AdminNavChevron({ isExpanded }) {
    const path = isExpanded ? 'm6 9 6 6 6-6' : 'm9 6 6 6-6 6';

    return (
        <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path d={path} />
        </svg>
    );
}

export default AdminNavChevron;
