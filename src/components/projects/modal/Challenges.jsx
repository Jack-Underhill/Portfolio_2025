import { useCallback, useState } from "react";

function ChallengeItem({ idx, c, isOpen, onToggle }) {
    return (
        <details
            open={isOpen}
            onToggle={(e) => onToggle(idx, e.currentTarget.open)}
            className="
                group/challenge rounded-2xl 
                border border-button-border/40 open:border-button-border/80 open:bg-black/10
                bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
            "
        >
            <summary
                title="Toggle More Details"
                className="
                    list-none cursor-pointer select-none
                    group/summary flex items-center gap-3 p-4
                "
            >
                {/* Number pill */}
                <div
                    className="
                        mt-0.5 shrink-0 w-8 h-8 rounded-xl
                        grid place-items-center text-sm font-extrabold
                        bg-card-att text-emerald-50 border 
                        border-card-border/70 group-hover/summary:border-button-border/40
                        
                    "
                >
                    {idx + 1}
                </div>

                {/* Title + teaser */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold text-emerald-50 leading-snug">
                            {c.challenge}
                        </h4>

                        {/* Chevron */}
                        <div
                            className="
                                shrink-0 text-emerald-50/70
                                transition-transform duration-200
                                group-open/challenge:rotate-180
                                group-hover/summary:text-emerald-50
                            "
                        >
                            ▾
                        </div>
                    </div>

                    {/* Skimmable teaser line */}
                    {c.result && (
                        <p className="mt-1 pr-8 text-sm text-emerald-50/70 line-clamp-1">
                            <span className="font-semibold text-emerald-50/80">Result:</span>{" "}
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
                rounded-xl border border-card-border bg-black/10
                p-2.5
            "
        >
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-50/60">
                {label}
            </div>
            <div className="mt-1 text-sm leading-relaxed text-emerald-50/90">
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
