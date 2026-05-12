export default function ArchitecturePreview({ data }) {
    const archImg = data.architectureImageUrl || null;
    if (!archImg) {
        return (
            <div className="w-full h-40 rounded-xl border border-card-border bg-black/20 grid place-items-center text-emerald-50/60 text-sm">
                No architecture image yet
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="relative rounded-xl border border-card-border bg-black/20 overflow-hidden">
                {/* Clickable overlay */}
                <a
                    href={archImg}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${data.title} architecture diagram in a new tab`}
                    className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                >
                    <span className="sr-only">Open full diagram</span>
                </a>

                {/* SVG Architecture Image */}
                <div className="w-full aspect-[16/9]">
                    <object
                        data={archImg}
                        type="image/svg+xml"
                        className="w-full h-full block"
                        aria-label={`${data.title} architecture`}
                    />
                </div>
            </div>
        </div>
    );
}