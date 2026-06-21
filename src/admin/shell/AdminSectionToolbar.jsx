import { adminSectionToolbar, cx } from '../../styles/recipes';

function AdminSectionToolbar({
    children,
    actions,
    className,
    actionsClassName,
}) {
    if (!children && !actions) return null;

    return (
        <div className={cx(adminSectionToolbar.shell, className)}>
            <div className={adminSectionToolbar.body}>
                {children ? (
                    <div className={adminSectionToolbar.primary}>
                        {children}
                    </div>
                ) : null}

                {actions ? (
                    <div className={cx(adminSectionToolbar.actions, actionsClassName)}>
                        {actions}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdminSectionToolbar;
