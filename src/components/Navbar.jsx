import { useState } from 'react';

import menu from '../assets/menu.svg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

    const menuClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div
            className="w-fit z-12 h-full flex flex-col sm:flex-row-reverse gap-0 sm:gap-10 items-center"
            data-aos="flip-up"
        >
            <button className='h-full self-end hover:animate-pulse hover:scale-125' onClick={menuClick}>
                <img
                    src={menu}
                    alt={`View svg`}
                    title='Open Menu'
                    className='h-full transition-transform duration-300 ease-in-out hover:rotate-360'
                />
            </button>
            <div className={`pr-3 sm:pr-0 flex flex-col sm:flex-row gap-5 text-md font-semibold text-emerald-50 transition-all duration-400 ease-in-out items-center ${isOpen ? 'opacity-100 translate-y-10 sm:translate-x-0 sm:translate-y-0' : 'opacity-0 translate-y-0 sm:translate-x-10 pointer-events-none'}`}>
                <button onClick={menuClick}>
                    <a href="#Projects">
                        <div className='hover-animated-gradient'>Projects</div>
                    </a>
                </button>
                <button onClick={menuClick}>
                    <a href="#Education">
                        <div className='hover-animated-gradient'>Education</div>
                    </a>
                </button>
                <button onClick={menuClick}>
                    <a href="#Certifications">
                        <div className='hover-animated-gradient'>Certifications</div>
                    </a>
                </button>
                <button onClick={menuClick}>
                    <a href="#Contact">
                        <div className='hover-animated-gradient'>Contact</div>
                    </a>
                </button>
            </div>
        </div>
    );
}

export default Navbar;