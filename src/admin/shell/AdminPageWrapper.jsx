import { adminUi } from '../../styles/recipes';

function AdminPageWrapper({ name, desc, component }) {
    const pageId = name.toLowerCase().replace(/\s+/g, '-');
    const titleId = `${pageId}-title`;

    return (
        <section id={pageId} aria-labelledby={titleId} className={adminUi.pageSection}>
            <header className="space-y-2">
                <h1 id={titleId} className="text-3xl font-semibold">{name} Section</h1>
                <p className="max-w-3xl text-sm text-admin-text-muted">
                    {desc}
                </p>
            </header>

            <div>
                {component}
            </div>
        </section>
    );
}

export default AdminPageWrapper;
