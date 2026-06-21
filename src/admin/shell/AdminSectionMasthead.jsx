import { adminMasthead, cx } from '../../styles/recipes';
import AdminNavIcon from './AdminNavIcon.jsx';

function AdminSectionMasthead({
    titleId,
    title,
    description,
    icon = 'user',
    accent = 'sky',
}) {
    const accentClasses = adminMasthead.accents[accent] || adminMasthead.accents.sky;

    return (
        <header className={adminMasthead.surface}>
            <div className={adminMasthead.inner}>
                <div
                    className={cx(adminMasthead.iconBadge, accentClasses.badge)}
                    aria-hidden="true"
                >
                    <AdminNavIcon icon={icon} />
                </div>

                <div className={adminMasthead.copy}>
                    <h1 id={titleId} className={adminMasthead.title}>{title}</h1>
                    <p className={adminMasthead.description}>
                        {description}
                    </p>
                </div>
            </div>

            <div className={cx(adminMasthead.accentRule, accentClasses.rule)} aria-hidden="true" />
        </header>
    );
}

export default AdminSectionMasthead;
