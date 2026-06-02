import { useCallback, useState } from "react";

function ChallengeItem({ idx, c, isOpen, onToggle }) {
    return (
        <details
            open={isOpen}
            onToggle={(e) => onToggle(idx, e.currentTarget.open)}
            className="
                group/challenge rounded-2xl 
                border border-button-border/40 open:border-button-border/80 open:bg-scrim/10
                bg-scrim/20 shadow-subtle-highlight
            "
        >
            <summary
                title="Toggle More Details"
                className="
                    list-none cursor-pointer select-none
                    group/summary flex items-center gap-2 md:gap-3 p-2 md:p-4
                "
            >
                {/* Number pill */}
                <div
                    className="
                        shrink-0 size-6 md:size-8 rounded-lg md:rounded-xl
                        grid place-items-center text-xs md:text-sm font-extrabold
                        bg-card-att text-text border 
                        border-card-border/70 group-hover/summary:border-button-border/40 group-focus/summary:border-button-border/40
                        
                    "
                >
                    {idx + 1}
                </div>

                {/* Title + teaser */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm lg:text-base font-semibold md:font-bold text-text leading-snug">
                            {c.challenge}
                        </h4>

                        {/* Chevron */}
                        <div
                            className="
                                shrink-0 text-text/70
                                transition-transform duration-200
                                group-open/challenge:rotate-180
                                group-hover/summary:text-text
                                group-focus/summary:text-text
                            "
                        >
                            ▾
                        </div>
                    </div>

                    {/* Skimmable teaser line */}
                    {c.result && (
                        <p className="mt-1 pr-8 text-xs lg:text-sm text-text/70 line-clamp-1">
                            <span className="font-semibold text-text/80">Result:</span>{" "}
                            {c.result}
                        </p>
                    )}
                </div>
            </summary>

            {/* Expanded content */}
            <div className="px-4 pb-4 pt-1">
                <div className="grid gap-3">
                    <Row label="What I did">{c.solution}</Row>
                    <Row label="Result">{c.result}</Row>
                </div>
            </div>
        </details>
    );
}

function Row({ label, children }) {
    return (
        <div
            className="
                rounded-xl border border-card-border bg-scrim/10
                p-2.5
            "
        >
            <div className="text-xs font-bold uppercase tracking-wide text-text/60">
                {label}
            </div>
            <div className="mt-1 text-sm leading-4.5 lg:leading-5 text-text/90">
                {children}
            </div>
        </div>
    );
}

export default function Challenges({ data }) {
    const items = data?.challenges ?? [];
    const [openIdx, setOpenIdx] = useState(null);

    const handleToggle = useCallback((idx, isNowOpen) => {
        setOpenIdx((prev) => {
            if (prev === idx) return null;  // closing the currently-open one
            if (isNowOpen) return idx;      // opening this one closes all others
            return prev;
        });
    }, []);

    if (!items.length) return null;

    return (
        <div className="space-y-3">
            {items.map((c, idx) => (
                <ChallengeItem 
                    key={`ch-${idx}`} 
                    idx={idx} 
                    c={c} 
                    isOpen={openIdx === idx} 
                    onToggle={handleToggle} 
                />
            ))}
        </div>
    );
}
