import ExternalLinkIcon from "../assets/external-link.svg";

import CardSurface from "./CardSurface";
import PillHighlightList from "./PillHighlightList";

function CertificationCard({
    title,
    org,
    desc,
    link,
    chips = [],
    issued,
    credentialType, // e.g. "Certification", "Certificate"
    logoSrc,
    logoScale = 0.7, // Percent of parent container size (e.g. 0.7 for 70%)

    className = "",
}) {
    const subtitle = [org, credentialType].filter(Boolean).join(" • ");
    const hasLink = Boolean(link);

    const logoScalePercent = `${logoScale * 100}%`;

    return (
        <CardSurface
            link={link}
            title={`Open official page | ${title}`}
            isPremiumSheenActive={true}
            data-aos="flip-left"
            className={[
                "block h-full w-full no-underline",
                // Match ProjectCard surface language (solid + inset)
                "transition-[transform,border-color] duration-700 ease-in-out",
                // Premium but on-theme hover: sky/button border + soft glow
                "hover:-translate-y-1 hover:border-button-border/70",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/50",
                "overflow-hidden",
                className,
            ].join(" ")}
        >
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
                                className="object-contain opacity-100 transition-opacity group-hover:opacity-100"
                            />
                        ) : (
                            <div className="size-7 rounded-md bg-card-border/70" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 truncate text-lg font-semibold text-emerald-50">
                                <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">
                                    {title}
                                </span>
                            </h3>

                            {/* external link button */}
                            {hasLink && (
                                <div
                                    className={[
                                        "flex size-8 items-center justify-center rounded-lg",
                                        "border border-card-border bg-card-att",
                                        "transition-[transform,border-color] duration-700 ease-in-out",
                                        "group-hover:border-button-border/60",
                                    ].join(" ")}
                                >
                                    <img
                                        src={ExternalLinkIcon}
                                        alt="external link icon"
                                        className="size-8/10 object-contain opacity-80 transition-opacity group-hover:opacity-95"
                                    />
                                </div>
                            )}
                        </div>

                        {subtitle && (
                            <p className="text-sm text-emerald-50/65">{subtitle}</p>
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

                    <p className="mt-2 text-sm leading-relaxed text-emerald-50/85">
                        {desc}
                    </p>

                    {/* chips */}
                    <PillHighlightList 
                        textArray={chips}
                        isOnlyHighlightedOnHover={true}
                    />
                </div>

                {/* divider */}
                <div className="my-4 h-px w-full bg-card-border/70" />

                {/* footer */}
                <div className="flex items-center justify-between text-sm text-emerald-50/60">
                    <span>{issued ? `Issued ${issued}` : ""}</span>
                    <span className="opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100">
                        {hasLink ? "View credential" : ""}
                    </span>
                </div>
            </div>
        </CardSurface>
    );
}

export default CertificationCard;
