import { useEffect, useState } from 'react';

import useModalOpenFlag from '../../hooks/useModalOpenFlag';

const SECTION_LINKS = [
    { href: '#Projects', label: 'Projects' },
    { href: '#Education', label: 'Education' },
    { href: '#Certifications', label: 'Certifications' },
    { href: '#Skills', label: 'Skills' },
    { href: '#Contact', label: 'Contact' },
];

function Navbar({ resetSignal = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isModalOpen = useModalOpenFlag();

    useEffect(() => {
        setIsOpen(false);
    }, [resetSignal]);

    useEffect(() => {
        const updateScrolledState = () => {
            setIsScrolled(window.scrollY > 24);
        };

        updateScrolledState();
        window.addEventListener('scroll', updateScrolledState, { passive: true });

        return () => window.removeEventListener('scroll', updateScrolledState);
    }, []);

    const menuClick = () => {
        setIsOpen((current) => !current);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const hasElevatedSurface = isOpen || isScrolled;

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <nav
            aria-label="Primary sections"
            className="fixed right-5 top-5 z-40 flex w-fit flex-col items-end gap-3 sm:right-10 sm:top-10 md:right-15 md:flex-row-reverse md:items-center md:gap-4 lg:right-20"
            data-aos="flip-up"
        >
            <button
                type="button"
                className={[
                    'group grid size-14 place-items-center self-end rounded-2xl border text-text',
                    'shadow-card-inset backdrop-blur-md',
                    'transition-[transform,translate,scale,rotate,background-color,border-color,box-shadow,filter] duration-500 ease-in-out',
                    'hover:scale-105 focus:scale-105 hover:rotate-360 focus:rotate-360',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page',
                    'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus:scale-100 motion-reduce:hover:rotate-0 motion-reduce:focus:rotate-0',
                    hasElevatedSurface
                        ? 'border-button-border/80 bg-card/90 [box-shadow:var(--shadow-card-inset),var(--shadow-accent-ring),var(--shadow-accent-glow-soft)]'
                        : 'border-button-border/55 bg-card/55 shadow-subtle-highlight hover:border-button-border/80 hover:bg-card/75 hover:[box-shadow:var(--shadow-card-inset),var(--shadow-accent-ring-soft),var(--shadow-accent-glow-soft)]',
                ].join(' ')}
                onClick={menuClick}
                aria-controls="primary-section-navigation"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close section navigation' : 'Open section navigation'}
            >
                <span
                    aria-hidden="true"
                    className="relative block h-6 w-8 opacity-85 transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                >
                    <span
                        className={[
                            'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                            'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                            isOpen ? 'w-8 -translate-y-1/2 rotate-45' : 'w-8 -translate-y-2 rotate-0',
                        ].join(' ')}
                    />
                    <span
                        className={[
                            'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                            'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                            isOpen ? 'w-0 -translate-y-1/2 opacity-0' : 'w-8 -translate-y-1/2 opacity-100',
                        ].join(' ')}
                    />
                    <span
                        className={[
                            'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                            'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                            isOpen ? 'w-8 -translate-y-1/2 -rotate-45' : 'w-5 translate-x-3 translate-y-1.5 rotate-0',
                        ].join(' ')}
                    />
                </span>
            </button>
            <div
                id="primary-section-navigation"
                aria-hidden={!isOpen}
                className={[
                    'flex min-w-48 origin-top-right flex-col gap-1 rounded-2xl border border-card-border/85 bg-card/85 p-2.5 text-sm font-semibold text-emerald-50',
                    'shadow-card-inset backdrop-blur-md md:min-w-0 md:origin-right md:flex-row md:items-center md:gap-2 md:rounded-full md:px-3',
                    'transition-[opacity,transform,visibility] duration-300 ease-in-out motion-reduce:transition-none',
                    isOpen
                        ? 'visible translate-y-0 scale-100 opacity-100 md:translate-x-0'
                        : 'invisible -translate-y-2 scale-95 opacity-0 pointer-events-none md:translate-x-3 md:translate-y-0',
                ].join(' ')}
            >
                {SECTION_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={closeMenu}
                        tabIndex={isOpen ? undefined : -1}
                        className="block min-h-11 rounded-xl px-4 py-2.5 text-center transition-[background-color,color,transform] duration-200 ease-in-out hover:scale-105 hover:bg-accent/10 hover:text-accent-soft focus:outline-none focus-visible:scale-105 focus-visible:ring-1 focus-visible:ring-focus-ring motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100 md:min-h-0 md:rounded-full md:px-3 md:py-2"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;
