function AdminNavIcon({ icon }) {
    const commonProps = {
        'aria-hidden': 'true',
        className: 'h-6 w-6 shrink-0',
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1.8,
        viewBox: '0 0 24 24',
    };

    switch (icon) {
        case 'folder':
            return (
                <svg {...commonProps}>
                    <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                    <path d="M3 7.5V6a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v1.5" />
                </svg>
            );
        case 'graduation':
            return (
                <svg {...commonProps}>
                    <path d="m3 8.5 9-4 9 4-9 4Z" />
                    <path d="M7 10.5v4.25c0 1.5 2.25 2.75 5 2.75s5-1.25 5-2.75V10.5" />
                    <path d="M20 9v5" />
                </svg>
            );
        case 'badge':
            return (
                <svg {...commonProps}>
                    <path d="M8 4h8l2 3-6 13L6 7Z" />
                    <path d="M8.5 8h7" />
                    <path d="m9.5 4 2.5 4 2.5-4" />
                </svg>
            );
        case 'spark':
            return (
                <svg {...commonProps}>
                    <path d="M12 3v5" />
                    <path d="M12 16v5" />
                    <path d="M4.2 7.5 8.5 10" />
                    <path d="m15.5 14 4.3 2.5" />
                    <path d="m19.8 7.5-4.3 2.5" />
                    <path d="M8.5 14l-4.3 2.5" />
                    <circle cx="12" cy="12" r="3.5" />
                </svg>
            );
        case 'mail':
            return (
                <svg {...commonProps}>
                    <rect width="18" height="14" x="3" y="5" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                </svg>
            );
        case 'user':
        default:
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
                </svg>
            );
    }
}

export default AdminNavIcon;
