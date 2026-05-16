import GradientText from "../ui/GradientText";

function TechTagMarquee({ tags, className }) {
    // copies so the loop is seamless
    const duplicateTags = [...tags, ...tags, ...tags, ...tags];

    return (
        <div className="w-full overflow-hidden">
            <div className="flex w-max gap-4 tech-tag-marquee">
                {duplicateTags.map((tag, index) => (
                    <div
                        key={`${tag}-${index}`}
                        className={`${className} border-2 border-card-border shadow-tag-inset`}
                    >
                        <GradientText animated={false}>
                            {tag}
                        </GradientText>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TechTagMarquee;
