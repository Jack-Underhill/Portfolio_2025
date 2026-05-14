export default function ActionButton({ href, children }) {
    if (!href) return null;
    return (
        <a
            href={href}
            title="Open Link"
            target="_blank"
            rel="noopener noreferrer"
            className="
                px-3 py-1.5 rounded-lg text-sm font-semibold 
                bg-card text-text border border-button-border 
                hover:scale-110 hover:brightness-110
                shadow-chip-inset
                transition-transform duration-100 ease-out
            "
        >
            {children}
        </a>
    );
}
