const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function CardSurface({
    link,
    title,
    isPremiumSheenActive = false,

    className = "",
    children,
    ...props
}) {
    const hasLink = Boolean(link);
    const Tag = hasLink ? "a" : "div";
    const linkProps = hasLink
        ? {
            href: link,
            target: "_blank",
            rel: "noreferrer noopener",
            title: `${title}`,
            "aria-label": `${title}`,
        }
        : {};

    return (
        <Tag
            {...linkProps}
            {...props}
            className={cx(
                "group relative rounded-xl border-2 border-card-border bg-card",
                "shadow-card-inset",
                className
            )}
        >
            {Boolean(isPremiumSheenActive) && (
                <>
                    {/* premium sheen (tinted) */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-accent-soft/10 blur-3xl opacity-25" />
                    <div className="surface-sheen-radial pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </>
            )}

            {children}
        </Tag>
    );
}
