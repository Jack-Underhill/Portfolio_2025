const cx = (...classes) => classes.filter(Boolean).join(" ");

const variantClasses = {
    body: "text-xl font-semibold text-text",
    bodyStrong: "text-xl font-bold text-text",
    muted: "text-sm leading-relaxed text-text-muted",
    meta: "text-sm font-semibold tracking-wide text-text-subtle",
    cardTitle: "text-lg font-semibold leading-snug text-text",
    modalTitle: "text-2xl font-bold text-text",
    modalBody: "leading-relaxed text-text/90",
    adminLabel: "text-xs font-semibold text-admin-text-muted",
};

export default function Text({
    as = "p",
    variant = "body",
    className = "",
    children,
    ...props
}) {
    const Component = as;

    return (
        <Component
            {...props}
            className={cx(variantClasses[variant] || variantClasses.body, className)}
        >
            {children}
        </Component>
    );
}
