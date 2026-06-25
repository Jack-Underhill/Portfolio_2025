import { useCallback } from 'react';

import { adminMasthead, adminUi } from '../../styles/recipes';
import { findAdminRouteById } from '../routing/adminRoutes.js';
import AdminSectionMasthead from './AdminSectionMasthead.jsx';

function AdminPageWrapper({ name, desc, component, onSectionMount }) {
    const pageId = name.toLowerCase().replace(/\s+/g, '-');
    const titleId = `${pageId}-title`;
    const route = findAdminRouteById(pageId);
    const accentClasses = adminMasthead.accents[route?.accent] || adminMasthead.accents.sky;
    const setSectionRef = useCallback((element) => {
        onSectionMount?.(pageId, element);
    }, [onSectionMount, pageId]);

    return (
        <section
            id={pageId}
            ref={setSectionRef}
            aria-labelledby={titleId}
            className={adminUi.pageSection}
            style={accentClasses.vars}
        >
            <AdminSectionMasthead
                titleId={titleId}
                title={name}
                description={desc}
                icon={route?.icon}
            />

            <div className={adminUi.sectionContent}>
                {component}
            </div>
        </section>
    );
}

export default AdminPageWrapper;
