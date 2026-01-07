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
            <div className="relative w-full h-40 rounded-xl border border-card-border bg-black/20 overflow-hidden">
                <img
                    className="w-full h-full object-contain p-2"
                    src={archImg}
                    alt={`${data.title} architecture`}
                />
            </div>

            <a
                href={archImg}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-card-att text-emerald-50 border border-card-border hover:brightness-110 transition"
            >
                Open full diagram
            </a>
        </div>
    );
}