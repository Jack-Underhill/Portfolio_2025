import { useEffect, useState } from 'react';

import menu from '../../assets/menu.svg';
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
    const isModalOpen = useModalOpenFlag();

    useEffect(() => {
        setIsOpen(false);
    }, [resetSignal]);

    const menuClick = () => {
        setIsOpen(!isOpen);
    }

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <nav
            aria-label="Primary sections"
            className="w-fit z-12 h-full flex flex-col sm:flex-row-reverse gap-0 sm:gap-10 items-center"
            data-aos="flip-up"
        >
            <button
                type="button"
                className='h-full self-end hover:animate-pulse hover:scale-125 focus:animate-pulse focus:scale-125 motion-reduce:hover:scale-100 motion-reduce:focus:scale-100 motion-reduce:hover:animate-none motion-reduce:focus:animate-none'
                onClick={menuClick}
                aria-controls="primary-section-navigation"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close section navigation' : 'Open section navigation'}
            >
                <img
                    src={menu}
                    alt=""
                    aria-hidden="true"
                    className='h-full transition-transform duration-300 ease-in-out hover:rotate-360 motion-reduce:transition-none motion-reduce:hover:rotate-0'
                />
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
