import { useEffect } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

import VisitCount from './components/layout/VisitCount'
import Navbar from './components/layout/Navbar'
import BackToTopButton from './components/buttons/BackToTopButton';

import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Education from './components/sections/Education'
import Certifications from './components/sections/Certifications'
import Skills from './components/sections/Skills'
import Contact from './components/sections/Contact'


function App() {
  useEffect(() => {
    AOS.init({duration: 1000});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className='relative w-full h-full'>
      {/* Background gradient + linen noise */}
      <div 
        className='page-radial-overlay pointer-events-none fixed inset-0 z-0 bg-blend-soft bg-cover opacity-100'
      />

      {/* Top Bar */}
      <header className="m-5 sm:m-10 md:mx-15 lg:mx-20 h-12 flex justify-between">
        <VisitCount />
        <Navbar />
      </header>

      {/* Layout */}
      <main
        id="main-content"
        tabIndex={-1}
        className='relative z-10 flex flex-col gap-30 sm:gap-35 lg:gap-35 px-10 sm:px-15 md:px-20 lg:px-30 xl:px-40 pb-40'
      >
        <Hero />
        <About />
        <Projects />
        <Education />
        <Certifications />
        <Skills />
        <Contact />
      </main>

      <BackToTopButton showAfter={500} />
    </div>
  );
}

export default App
