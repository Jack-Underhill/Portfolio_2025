import ExternalLinkIcon from "../assets/external-link.svg";

function EducationCard({
    title,
    org,
    desc,
    link,
    chips = [],
    issued, // e.g. "2019–2022" or "2024–2026 (Expected)"
    credentialType, // e.g. "Bachelor’s Degree", "Associate Degree", "Minor"
    gpa, // e.g. "3.52" (optional)

    logoSrc, 
    logoScale = 0.7, // Percent of parent container size (e.g. 0.7 for 70%)

    className = "",
}) {
    const subtitle = [org, credentialType].filter(Boolean).join(" • ");
    const hasLink = Boolean(link);

    const logoScalePercent = `${logoScale * 100}%`;

    const CardTag = hasLink ? "a" : "div";
    const cardProps = hasLink
        ? {
            href: link,
            target: "_blank",
            rel: "noreferrer noopener",
            title: `View: ${title}`,
            "aria-label": `Open: ${title}`,
        }
        : {};

    return (
        <CardTag
            {...cardProps}
            className={[
                "group relative block h-full w-full no-underline",
                // Match ProjectCard surface language (solid + inset)
                "rounded-xl border-2 border-card-border bg-card",
                "shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c]",
                // Keep transitions limited to what you’re animating
                "transition-[transform,border-color,box-shadow] duration-700 ease-in-out",
                // On-theme hover: sky/button border + soft glow
                "hover:-translate-y-1 hover:border-button-border/70",
                "hover:shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c,0_0_0_1px_rgba(27,149,204,0.30),0_0_26px_rgba(14,138,194,0.16)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/50",
                "overflow-hidden",
                className,
            ].join(" ")}
            data-aos="flip-left"
        >
            {/* premium sheen (tinted) */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl opacity-25" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_60%)]" />

            <div className="relative z-10 flex h-full flex-col p-5">
                {/* header row */}
                <div className="flex items-start gap-4">
                    {/* logo container */}
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-card-border bg-card-att shadow-[inset_2px_2px_4px_#0a0f14,inset_-2px_-2px_4px_#1a232c]">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={`${org} logo`}
                                style={{ width: logoScalePercent, height: logoScalePercent }}
                                className='object-contain opacity-100 transition-opacity group-hover:opacity-100'
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-md bg-card-border/70" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 flex-1 break-words text-lg font-semibold text-emerald-50 leading-snug">
                                <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">
                                    {title}
                                </span>
                            </h3>

                            {/* external link button */}
                            {hasLink && (
                                <div
                                    className={[
                                        "shrink-0",
                                        "flex size-8 items-center justify-center rounded-lg",
                                        "border border-card-border bg-card-att",
                                        "transition-[border-color,transform] duration-700 ease-in-out",
                                        "group-hover:border-button-border/60",
                                    ].join(" ")}
                                >
                                    <img
                                        src={ExternalLinkIcon}
                                        alt="external link icon"
                                        className="h-5 w-5 object-contain opacity-80 transition-opacity group-hover:opacity-95"
                                    />
                                </div>
                            )}
                        </div>

                        {(subtitle || gpa) && (
                            <div className="mt-1.5 flex items-end justify-between gap-4">
                                {subtitle && (
                                    <p className="min-w-0 flex-1 break-words text-sm leading-snug text-emerald-50/65">
                                        {subtitle}
                                    </p>
                                )}

                                {gpa && (
                                    <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-50/65">
                                        GPA {gpa}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* divider */}
                <div className="my-4 h-px w-full bg-card-border/70" />

                {/* body */}
                <div className="flex-1">
                    <p className="text-sm font-semibold tracking-wide text-emerald-50/60">
                        Highlights
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-emerald-50/85 break-words">
                        {desc}
                    </p>

                    {/* chips */}
                    {chips?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {chips.map((chip) => (
                                <span
                                    key={chip}
                                    className={[
                                        "rounded-lg px-3 py-1 text-xs font-semibold",
                                        "border border-card-border/70 bg-card-att text-emerald-50/85",
                                        "transition-colors group-hover:border-button-border/40",
                                    ].join(" ")}
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* divider */}
                <div className="my-4 h-px w-full bg-card-border/70" />

                {/* footer */}
                <div className="flex items-center justify-between text-sm text-emerald-50/60">
                    <span>{issued || ""}</span>
                    <span className="opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100">
                        {hasLink ? "View details" : ""}
                    </span>
                </div>
            </div>
        </CardTag>
    );
}

export default EducationCard;
