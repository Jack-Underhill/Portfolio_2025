import { adminShell, cx } from '../../styles/recipes';

function AdminStatusBanner({ message, onDismiss }) {
    if (!message) return null;

    const isError = message.tone === 'error';

    return (
        <section
            className={cx(
                adminShell.statusBanner,
                isError ? adminShell.statusBannerError : adminShell.statusBannerInfo,
            )}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? undefined : 'polite'}
            aria-labelledby="admin-status-banner-title"
        >
            <div className={adminShell.statusBannerText}>
                <h2 id="admin-status-banner-title" className={adminShell.statusBannerTitle}>
                    {message.title}
                </h2>
                <p className={adminShell.statusBannerDescription}>
                    {message.description}
                </p>
            </div>

            <button
                type="button"
                onClick={onDismiss}
                className={adminShell.statusBannerClose}
                aria-label="Dismiss admin status message"
            >
                Close
            </button>
        </section>
    );
}

export default AdminStatusBanner;
