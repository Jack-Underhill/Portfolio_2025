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
                bg-card text-emerald-50 border border-button-border 
                hover:scale-110 hover:brightness-110
                inset_2px_2px_4px_#0a0f14 inset_-2px_-2px_4px_#1a232c
                transition-transform duration-100 ease-out
            "
        >
            {children}
        </a>
    );
}