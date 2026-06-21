import { adminUi } from '../../styles/recipes';
import { findAdminRouteById } from '../routing/adminRoutes.js';
import AdminSectionMasthead from './AdminSectionMasthead.jsx';

function AdminPageWrapper({ name, desc, component }) {
    const pageId = name.toLowerCase().replace(/\s+/g, '-');
    const titleId = `${pageId}-title`;
    const route = findAdminRouteById(pageId);

    return (
        <section id={pageId} aria-labelledby={titleId} className={adminUi.pageSection}>
            <AdminSectionMasthead
                titleId={titleId}
                title={name}
                description={desc}
                icon={route?.icon}
                accent={route?.accent}
            />

            <div>
                {component}
            </div>
        </section>
    );
}

export default AdminPageWrapper;
