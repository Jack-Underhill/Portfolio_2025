import { adminShell, cx } from '../../styles/recipes';

function AdminNavChevron({ isExpanded }) {
    return (
        <svg
            aria-hidden="true"
            className={cx(
                adminShell.navChevron,
                isExpanded && adminShell.navChevronExpanded,
            )}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

export default AdminNavChevron;
