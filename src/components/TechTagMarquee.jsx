function TechTagMarquee({ tags, className }) {
    // copies so the loop is seamless
    const duplicateTags = [...tags, ...tags, ...tags, ...tags];

    return (
        <div className="w-full overflow-hidden">
            <div className="flex w-max gap-4 tech-tag-marquee">
                {duplicateTags.map((tag, index) => (
                    <div
                        key={`${tag}-${index}`}
                        className={`${className} border-2 border-card-border shadow-[inset_2px_2px_4px_#242a33,inset_-2px_-2px_4px_#3a4350]`}
                    >
                        <span className="animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">
                            {tag}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TechTagMarquee;
