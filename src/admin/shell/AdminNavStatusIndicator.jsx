import { ADMIN_WORKFLOW_VISUAL_STATE } from '../workflow/adminWorkflowState.js';
import { adminShell, cx } from '../../styles/recipes.js';

const STATUS_COPY = Object.freeze({
    [ADMIN_WORKFLOW_VISUAL_STATE.DIRTY]: 'unsaved changes',
    [ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING]: 'validation in progress',
    [ADMIN_WORKFLOW_VISUAL_STATE.VALID]: 'draft validated',
    [ADMIN_WORKFLOW_VISUAL_STATE.INVALID]: 'draft validation failed',
});

function StatusIcon({ visualState }) {
    if (visualState === ADMIN_WORKFLOW_VISUAL_STATE.DIRTY) {
        return <span className={adminShell.navStatusDirtyDot} />;
    }

    const commonProps = {
        'aria-hidden': 'true',
        className: adminShell.navStatusIcon,
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        viewBox: '0 0 20 20',
    };

    if (visualState === ADMIN_WORKFLOW_VISUAL_STATE.VALIDATING) {
        return (
            <svg {...commonProps} className={cx(commonProps.className, 'animate-spin')}>
                <path d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5" strokeWidth="2" />
            </svg>
        );
    }

    if (visualState === ADMIN_WORKFLOW_VISUAL_STATE.VALID) {
        return (
            <svg {...commonProps}>
                <circle cx="10" cy="10" r="7.25" strokeWidth="1.5" />
                <path d="m6.5 10.25 2.25 2.25 4.75-5" strokeWidth="1.8" />
            </svg>
        );
    }

    return (
        <svg {...commonProps}>
            <path d="M10 2.5 18 17H2Z" strokeWidth="1.5" />
            <path d="M10 7v4.25" strokeWidth="1.8" />
            <path d="M10 14.25h.01" strokeWidth="2.2" />
        </svg>
    );
}

function AdminNavStatusIndicator({ label, visualState }) {
    const statusCopy = STATUS_COPY[visualState];

    return (
        <span className={adminShell.navStatusSlot}>
            {statusCopy && (
                <span
                    role="img"
                    aria-label={`${label}: ${statusCopy}`}
                    title={`${label}: ${statusCopy}`}
                    className={cx(
                        adminShell.navStatusIndicator,
                        adminShell.navStatusIndicatorStates[visualState],
                    )}
                >
                    <StatusIcon visualState={visualState} />
                </span>
            )}
        </span>
    );
}

export default AdminNavStatusIndicator;
