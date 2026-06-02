const cx = (...classes) => classes.filter(Boolean).join(" ");

const variantClasses = {
    body: "leading-[1.35] md:leading-[1.45]  text-[18px] md:text-[19px] lg:text-[20px] font-semibold text-text",
    bodyStrong: "text-xl font-bold text-text",
    muted: "text-sm leading-relaxed text-text-muted",
    meta: "text-sm font-semibold tracking-wide text-text-subtle",
    cardTitle: "text-lg font-semibold leading-tight md:leading-snug text-text",
    cardBody: "leading-[1.35] md:leading-[1.45] text-[16px] md:text-[18px] font-semibold text-text-muted",
    modalTitle: "text-2xl font-bold text-text",
    modalBody: "leading-[1.35] md:leading-[1.45] text-text/90 text-[15px] lg:text-[16px]",
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
