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
                "shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c]",
                className
            )}
        >
            {Boolean(isPremiumSheenActive) && (
                <>
                    {/* premium sheen (tinted) */}
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl opacity-25" />
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_60%)]" />
                </>
            )}

            {children}
        </Tag>
    );
}
