import { adminMasthead } from '../../styles/recipes';
import AdminNavIcon from './AdminNavIcon.jsx';

function AdminSectionMasthead({
    titleId,
    title,
    description,
    icon = 'user',
}) {
    return (
        <header className={adminMasthead.surface}>
            <div className={adminMasthead.inner}>
                <div
                    className={adminMasthead.iconBadge}
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

            <div className={adminMasthead.accentRule} aria-hidden="true" />
        </header>
    );
}

export default AdminSectionMasthead;
