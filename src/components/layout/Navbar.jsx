import { useEffect, useRef, useState } from 'react';

import useModalOpenFlag from '../../hooks/useModalOpenFlag';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const SECTION_LINKS = [
    { href: '#Hero', label: 'Home', scrollToTop: true },
    { href: '#Projects', label: 'Projects' },
    { href: '#Education', label: 'Education' },
    { href: '#Certifications', label: 'Certifications' },
    { href: '#Skills', label: 'Skills' },
    { href: '#Contact', label: 'Contact' },
];

const SECTION_IDS = SECTION_LINKS.map((link) => link.href.slice(1));
const LG_NAV_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const NAVBAR_CLASSES = cx(
    'fixed right-5 top-5 z-40',
    'flex w-fit flex-col justify-center items-end gap-3',
    'sm:right-10 sm:top-9',
    'md:right-15 md:flex-row-reverse md:items-center md:gap-2',
    'lg:right-20',
);

const TOGGLE_BASE_CLASSES = cx(
    'group/toggle grid place-items-center self-end border text-text md:self-center',
    'shadow-card-inset backdrop-blur-md',
    'transition-[transform,translate,scale,rotate,background-color,border-color,box-shadow,filter] duration-500 ease-in-out',
    'hover:scale-105 focus:scale-105',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page',
    'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus:scale-100 motion-reduce:rotate-0',
);

const TOGGLE_ELEVATED_CLASSES = cx(
    'border-button-border/80 bg-card/90',
    '[box-shadow:var(--shadow-card-inset),var(--shadow-accent-ring),var(--shadow-accent-glow-soft)]',
);

const TOGGLE_RESTING_CLASSES = cx(
    'border-button-border/55 bg-card/55 shadow-subtle-highlight',
    'hover:border-button-border/80 hover:bg-card/75',
    'hover:[box-shadow:var(--shadow-card-inset),var(--shadow-accent-ring-soft),var(--shadow-accent-glow-soft)]',
);

const MENU_PANEL_BASE_CLASSES = cx(
    'flex min-w-48 origin-top-right flex-col gap-1 rounded-2xl border border-card-border/85 bg-card/85 p-2.5 text-sm font-semibold text-emerald-50',
    'shadow-card-inset backdrop-blur-md md:min-w-0 md:origin-right md:flex-row md:items-center md:gap-2 md:rounded-full md:px-3',
    'transition-[opacity,transform,visibility] duration-300 ease-in-out motion-reduce:transition-none',
);

const NAV_LINK_BASE_CLASSES = cx(
    'group/link relative block min-h-11 rounded-xl px-4 py-2.5 text-center',
    'transition-[background-color,color,transform] duration-200 ease-in-out',
    'hover:scale-105 hover:bg-accent/10',
    'focus:outline-none focus-visible:scale-105 focus-visible:ring-1 focus-visible:ring-focus-ring',
    'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100 motion-reduce:after:transition-none',
    'md:min-h-0 md:rounded-full md:px-3 md:py-2',
);

function getCurrentSectionId(sectionIds) {
    const sections = sectionIds
        .map((id) => ({
            id,
            element: document.getElementById(id),
        }))
        .filter((section) => section.element);

    if (!sections.length) return '';

    const documentHeight = document.documentElement.scrollHeight;
    const viewportBottom = window.scrollY + window.innerHeight;

    // 4 pixels of leeway to account for minor discrepancies in scroll position 
    // and document height, ensuring the last section is activated when near 
    // the bottom.
    if (viewportBottom >= documentHeight - 4) {
        return sections[sections.length - 1].id;
    }

    const viewportCenter = window.innerHeight / 2;

    return sections.reduce((closestSection, section) => {
        const closestRect = closestSection.element.getBoundingClientRect();
        const sectionRect = section.element.getBoundingClientRect();
        const closestDistance = Math.abs(closestRect.top + closestRect.height / 2 - viewportCenter);
        const sectionDistance = Math.abs(sectionRect.top + sectionRect.height / 2 - viewportCenter);

        return sectionDistance < closestDistance ? section : closestSection;
    }, sections[0]).id;
}

function useActiveSection(sectionIds) {
    const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? '');

    useEffect(() => {
        let animationFrameId = 0;

        const updateActiveSection = () => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                setActiveSectionId(getCurrentSectionId(sectionIds));
            });
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        let observer;

        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(updateActiveSection, {
                rootMargin: '-18% 0px -58% 0px',
                threshold: [0, 0.15, 0.4],
            });

            sectionIds.forEach((id) => {
                const section = document.getElementById(id);
                if (section) observer.observe(section);
            });
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('resize', updateActiveSection);
            observer?.disconnect();
        };
    }, [sectionIds]);

    return [activeSectionId, setActiveSectionId];
}

function useMediaQuery(query) {
    const getMatches = () => (
        typeof window === 'undefined'
            ? false
            : window.matchMedia(query).matches
    );

    const [matches, setMatches] = useState(getMatches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const updateMatches = () => setMatches(mediaQueryList.matches);

        updateMatches();
        mediaQueryList.addEventListener?.('change', updateMatches);
        window.addEventListener('resize', updateMatches);

        return () => {
            mediaQueryList.removeEventListener?.('change', updateMatches);
            window.removeEventListener('resize', updateMatches);
        };
    }, [query]);

    return matches;
}

function useMenuButtonRotation() {
    const [rotation, setRotation] = useState(0);
    const isPointerInsideRef = useRef(false);

    const rotateIn = () => setRotation((current) => current - 360);
    const rotateOut = () => setRotation((current) => current + 360);

    return {
        rotation,
        handlers: {
            onPointerEnter: () => {
                isPointerInsideRef.current = true;
                rotateIn();
            },
            onPointerLeave: () => {
                isPointerInsideRef.current = false;
                rotateOut();
            },
            onFocus: () => {
                if (!isPointerInsideRef.current) rotateIn();
            },
            onBlur: () => {
                if (!isPointerInsideRef.current) rotateOut();
            },
        },
    };
}

function MenuIcon({ isOpen }) {
    return (
        <span
            aria-hidden="true"
            className="relative block h-5 w-7 opacity-85 transition-opacity duration-300 ease-in-out group-hover/toggle:opacity-100 group-focus-visible/toggle:opacity-100 motion-reduce:transition-none"
        >
            <span
                className={cx(
                    'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                    'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                    isOpen ? 'w-5 translate-x-1 -translate-y-1/2 rotate-45' : 'w-7 -translate-y-2 rotate-0',
                )}
            />
            <span
                className={cx(
                    'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                    'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                    isOpen ? 'w-0 -translate-y-1/2 opacity-0' : 'w-7 -translate-y-1/2 opacity-100',
                )}
            />
            <span
                className={cx(
                    'absolute left-0 top-1/2 h-0.5 rounded-full bg-emerald-50 shadow-subtle-highlight',
                    'transition-[transform,width,opacity] duration-300 ease-in-out motion-reduce:transition-none',
                    isOpen ? 'w-5 translate-x-1 -translate-y-1/2 -rotate-45' : 'w-4 translate-x-3 translate-y-1.5 rotate-0',
                )}
            />
        </span>
    );
}

function MenuToggle({ hasElevatedSurface, isOpen, onClick }) {
    const { rotation, handlers } = useMenuButtonRotation();
    const label = cx(
        isOpen ? 'Close' : 'Open',
        'navigation',
    );

    return (
        <button
            type="button"
            className={cx(
                TOGGLE_BASE_CLASSES,
                'relative',
                'rotate-[var(--navbar-menu-rotation)]',
                isOpen ? 'size-8 rounded-xl' : 'size-12 rounded-2xl',
                hasElevatedSurface ? TOGGLE_ELEVATED_CLASSES : TOGGLE_RESTING_CLASSES,
            )}
            style={{ '--navbar-menu-rotation': `${rotation}deg` }}
            onClick={onClick}
            aria-controls="primary-section-navigation"
            aria-expanded={isOpen}
            aria-label={label}
            title={label}
            {...handlers}
        >
            <MenuIcon isOpen={isOpen} />
        </button>
    );
}

function NavLink({ isActive, isMenuOpen, link, onSelect }) {
    const sectionId = link.href.slice(1);

    const handleClick = (event) => {
        if (link.scrollToTop) {
            const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
            });
        }

        onSelect(sectionId);
    };

    return (
        <a
            href={link.href}
            onClick={handleClick}
            tabIndex={isMenuOpen ? undefined : -1}
            aria-current={isActive ? 'location' : undefined}
            data-nav-link
            title={`Jump to ${link.label}`}
            className={cx(
                NAV_LINK_BASE_CLASSES,
                isActive ? 'bg-accent/10 after:opacity-100' : 'after:opacity-0',
            )}
        >
            <span className="nav-link-gradient-text">{link.label}</span>
        </a>
    );
}

function NavLinks({ activeSectionId, isOpen, links, onSelect }) {
    return (
        <div
            id="primary-section-navigation"
            aria-hidden={!isOpen}
            className={cx(
                MENU_PANEL_BASE_CLASSES,
                isOpen
                    ? 'visible translate-y-0 scale-100 opacity-100 md:translate-x-0'
                    : 'invisible -translate-y-2 scale-95 opacity-0 pointer-events-none md:translate-x-3 md:translate-y-0',
            )}
        >
            {links.map((link) => {
                const sectionId = link.href.slice(1);

                return (
                    <NavLink
                        key={link.href}
                        link={link}
                        isActive={activeSectionId === sectionId}
                        isMenuOpen={isOpen}
                        onSelect={onSelect}
                    />
                );
            })}
        </div>
    );
}

function Navbar({ resetSignal = 0 }) {
    const isLargeScreen = useMediaQuery(LG_NAV_QUERY);
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSectionId, setActiveSectionId] = useActiveSection(SECTION_IDS);
    const isModalOpen = useModalOpenFlag();

    useEffect(() => {
        setIsOpen(isLargeScreen);
    }, [isLargeScreen, resetSignal]);

    useEffect(() => {
        const updateScrolledState = () => {
            setIsScrolled(window.scrollY > 24);
        };

        updateScrolledState();
        window.addEventListener('scroll', updateScrolledState, { passive: true });

        return () => window.removeEventListener('scroll', updateScrolledState);
    }, []);

    const toggleMenu = () => {
        setIsOpen((current) => !current);
    };

    const selectSection = (sectionId) => {
        setActiveSectionId(sectionId);
        if (!isLargeScreen) {
            setIsOpen(false);
        }
    };

    const hasElevatedSurface = isOpen || isScrolled;

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <nav
            aria-label="Primary sections"
            className={NAVBAR_CLASSES}
            // data-aos="flip-up"
        >
            <MenuToggle
                isOpen={isOpen}
                hasElevatedSurface={hasElevatedSurface}
                onClick={toggleMenu}
            />
            <NavLinks
                links={SECTION_LINKS}
                isOpen={isOpen}
                activeSectionId={activeSectionId}
                onSelect={selectSection}
            />
        </nav>
    );
}

export default Navbar;
