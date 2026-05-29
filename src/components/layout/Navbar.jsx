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
        setIsOpen(!isOpen);
    }

    const hasElevatedSurface = isOpen || isScrolled;

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <nav
            aria-label="Primary sections"
            className="fixed right-5 top-5 z-40 h-14 w-fit sm:right-10 sm:top-10 md:right-15 lg:right-20 flex flex-col sm:flex-row-reverse gap-0 sm:gap-10 items-center"
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
                className={`pr-3 sm:pr-0 flex flex-col sm:flex-row gap-5 text-md font-semibold text-emerald-50 transition-all duration-400 ease-in-out items-center ${isOpen ? 'opacity-100 translate-y-10 sm:translate-x-0 sm:translate-y-0' : 'opacity-0 translate-y-0 sm:translate-x-10 pointer-events-none'}`}
            >
                {SECTION_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={menuClick}
                        tabIndex={isOpen ? undefined : -1}
                        className="block rounded-sm hover-animated-gradient focus:outline-none focus-visible:ring-1 focus-visible:ring-focus-ring"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;
