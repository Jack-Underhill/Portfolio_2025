import { adminMasthead, adminUi } from '../../styles/recipes';
import { findAdminRouteById } from '../routing/adminRoutes.js';
import AdminSectionMasthead from './AdminSectionMasthead.jsx';

function AdminPageWrapper({ name, desc, component }) {
    const pageId = name.toLowerCase().replace(/\s+/g, '-');
    const titleId = `${pageId}-title`;
    const route = findAdminRouteById(pageId);
    const accentClasses = adminMasthead.accents[route?.accent] || adminMasthead.accents.sky;

    return (
        <section
            id={pageId}
            aria-labelledby={titleId}
            className={adminUi.pageSection}
            style={accentClasses.vars}
        >
            <AdminSectionMasthead
                titleId={titleId}
                title={name}
                description={desc}
                icon={route?.icon}
                accent={route?.accent}
            />

            <div className={adminUi.sectionContent}>
                {component}
            </div>
        </section>
    );
}

export default AdminPageWrapper;
