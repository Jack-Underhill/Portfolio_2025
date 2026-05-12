const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function PillHighlightList({
    textArray,

    // Outter div styling
    className = "mt-4",

    isOnlyHighlightedOnHover = false,

    // text styling
    textClassName = "px-3 py-1 text-xs font-semibold",
}) {
    const highlightClassName = 
        isOnlyHighlightedOnHover 
            ? "border-card-border/70 group-hover:border-button-border/40"
            : "border-button-border/40";

    return (
        <>
            {textArray?.length > 0 && (
                <div className={cx("flex flex-wrap gap-2", className)}>
                    {textArray.map((pill) => (
                        <span
                            key={pill}
                            className={[
                                "rounded-lg border",
                                "bg-card-att text-emerald-50/85",
                                highlightClassName,
                                textClassName,
                            ].join(" ")}
                        >
                            {pill}
                        </span>
                    ))}
                </div>
            )}
        </>
    );
}
