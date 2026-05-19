import ExternalLinkIcon from "../../assets/external-link.svg";

import CardSurface from "../ui/CardSurface";
import GradientText from "../ui/GradientText";
import Text from "../ui/Text";
import PillHighlightList from "../tags/PillHighlightList";

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

    return (
        <CardSurface
            link={link}
            title={`Open official page | ${title}`}
            isPremiumSheenActive={true}
            data-aos="flip-left"
            className={[
                "block h-full w-full no-underline",
                // Keep transitions limited to what's animating
                "transition-[transform,border-color,box-shadow] duration-700 ease-in-out",
                // On-theme hover: sky/button border + soft glow
                "hover:-translate-y-1 hover:border-button-border/70",
                "focus:-translate-y-1 focus:border-button-border/70",
                "hover-shadow-card-accent",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/50",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus:translate-y-0",
                "overflow-hidden",
                className,
            ].join(" ")}
        >
            <div className="relative z-10 flex h-full flex-col p-5">
                {/* header row */}
                <div className="flex items-start gap-4">
                    {/* logo container */}
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-card-border bg-card-att shadow-chip-inset">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={`${org} logo`}
                                style={{ width: logoScalePercent, height: logoScalePercent }}
                                className='object-contain opacity-100 transition-opacity group-hover:opacity-100 group-focus:opacity-100'
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-md bg-card-border/70" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <Text as="h3" variant="cardTitle" className="min-w-0 flex-1 break-words">
                                <GradientText>
                                    {title}
                                </GradientText>
                            </Text>

                            {/* external link button */}
                            {hasLink && (
                                <div
                                    className={[
                                        "shrink-0",
                                        "flex size-8 items-center justify-center rounded-lg",
                                        "border border-card-border bg-card-att",
                                        "transition-[border-color,transform] duration-700 ease-in-out",
                                        "group-hover:border-button-border/60",
                                        "group-focus:border-button-border/60",
                                    ].join(" ")}
                                >
                                    <img
                                        src={ExternalLinkIcon}
                                        alt="external link icon"
                                        className="h-5 w-5 object-contain opacity-80 transition-opacity group-hover:opacity-95 group-focus:opacity-95"
                                    />
                                </div>
                            )}
                        </div>

                        {(subtitle || gpa) && (
                            <div className="mt-1.5 flex items-end justify-between gap-4">
                                {subtitle && (
                                    <Text as="p" variant="muted" className="min-w-0 flex-1 break-words leading-snug">
                                        {subtitle}
                                    </Text>
                                )}

                                {gpa && (
                                    <Text as="p" variant="muted" className="shrink-0 whitespace-nowrap font-semibold">
                                        GPA {gpa}
                                    </Text>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* divider */}
                <div className="my-4 h-px w-full bg-card-border/70" />

                {/* body */}
                <div className="flex-1">
                    <Text as="p" variant="meta">
                        Highlights
                    </Text>

                    <Text as="p" variant="muted" className="mt-2 break-words">
                        {desc}
                    </Text>

                    {/* chips */}
                    <PillHighlightList 
                        textArray={chips}
                        isOnlyHighlightedOnHover={true}
                    />
                </div>

                {/* divider */}
                <div className="my-4 h-px w-full bg-card-border/70" />

                {/* footer */}
                <Text as="div" variant="meta" className="flex items-center justify-between">
                    <span>{issued || ""}</span>
                    <span className="opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 group-focus:opacity-100 motion-reduce:transition-none">
                        {hasLink ? "View details" : ""}
                    </span>
                </Text>
            </div>
        </CardSurface>
    );
}

export default EducationCard;
