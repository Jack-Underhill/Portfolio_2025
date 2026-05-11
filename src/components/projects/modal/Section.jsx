const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Section({ title, children, isSingleColumn = false }) {
    const singleColumnClass = isSingleColumn ? "md:col-span-2" : "";

    return (
        <section className={cx(singleColumnClass, "space-y-2")}>
            <h3 className="text-lg font-bold animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text">
                {title}
            </h3>
            
            <div className="text-emerald-50/90 leading-relaxed">
                {children}
            </div>
        </section>
    );
}