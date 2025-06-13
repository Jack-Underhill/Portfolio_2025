import { useState } from 'react'
import avatarLogo from './assets/avatar.png'
import projectWorkLogo from './assets/Project_Work.png'
import projectStoreLogo from './assets/Project_Store.png'
import projectSimLogo from './assets/Project_Sim.png'
import './App.css'

function App() {
  return (
    <div className="justify-items-center">

      {/* SECTION 1 */}
      <div className="w-full h-[calc(100vh-6rem)] flex gap-x-0">
        <div className="flex-1/5 h-full flex flex-col gap-y-7 justify-center">
            <div className='text-6xl font-bold text-emerald-50'>
              Jack Underhill
            </div>
            <div className='text-4xl font-bold text-emerald-50'>
              Full-Stack Developer
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              WSU Computer Science senior student with a passion for video games, desktop applications, and building web applications.
            </div>
            <div className='text-xl font-semibold text-code'>
              /* I just started this;\n I will get to the responsiveness soon; */
            </div>
            <div className='flex gap-4'>
              <a className='p-3 text-xl font-bold rounded-xl text-emerald-50 bg-button border-2 border-button-border shadow-lg hover:bg-sky-600' href="https://github.com/Jack-Underhill" target="_blank" title='View My GitHub'>
                View Projects
              </a>
              <a 
                className='p-3 text-xl font-bold rounded-xl text-emerald-50 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600'
                href="/Jack_Underhill--Dev_Resume--5_20_2025.pdf"
                target="_blank"
                rel='noopener noreferrer'
                title='View My Resume'
              >
                View Resume
              </a>
            </div>
        </div>
        <div className="flex-1 md:w-32 h-full flex justify-center items-center">
          <a href="https://www.linkedin.com/in/underhill-jack/" target="_blank"  
          className="w-full aspect-8/9 rounded-3xl" title='View My LinkedIn'>
            <img src={avatarLogo} alt="Profile Avatar" className='size-full rounded-3xl animate-bounce hover:animate-pulse transition duration-200'/>
          </a>
        </div>
      </div>

      {/* SECTION 2 */}
      <div className="w-full h-[calc(100vh-6rem)] flex flex-col gap-y-12 justify-center">
        {/* About */}
        <div className='flex flex-col gap-y-7'>
            <div className='text-4xl font-bold text-emerald-50'>
              About Me | Projects
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              I'm a senior majoring in Computer Science at Washington State University. I enjoy building projects that combine functionality with thoughtful design - whether that's a full-stack web app, an algorithmic simulation, or a video game. The following projects best showcase my personal and school work.
            </div>
        </div>
        {/* Cards */}
        <div className='h-1/2 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Project--Portfolio */}
          <a href="https://github.com/Jack-Underhill/Portfolio_2025" target="_blank" title='View My Portfolio Repo' className='flex-1 px-6 py-4 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600 rounded-xl flex flex-col gap-y-4'>
            <div className='w-full aspect-video rounded-xl'>
              <img src={projectWorkLogo} alt="Profile Avatar" className='size-full object-contain rounded-xl'/>
            </div>
            <div className='text-2xl font-bold text-emerald-50'>
              This Portfolio
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              Showcase of my work and skills.
            </div>
            <div className='flex flex-wrap gap-4'>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                Vite
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                React
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                TailwindCSS
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                Netlify
              </div>
            </div>
          </a>
          
          {/* Project--MerchStore */}
          <a href="https://github.com/Jack-Underhill/Cpts489-Sp25-GroupProject-MerchStore" target="_blank" title='View My Merch Store Repo' className='flex-1 px-6 py-4 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600 rounded-xl flex flex-col gap-y-4'>
            <div className='w-full aspect-video rounded-xl'>
              <img src={projectStoreLogo} alt="Profile Avatar" className='size-full object-contain rounded-xl'/>
            </div>
            <div className='text-2xl font-bold text-emerald-50'>
              University Merch Store
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              Group Project building a full-featured e-commerce platform.
            </div>
            <div className='flex flex-wrap gap-4'>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                Express.js
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                React
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                SQLite
              </div>
            </div>
          </a>

          {/* Project--Simulator */}
          <a href="https://github.com/Jack-Underhill/PathfinderSim" target="_blank" title='View My Simulator Repo' className='flex-1 px-6 py-4 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600 rounded-xl flex flex-col gap-y-4'>
            <div className='w-full aspect-video rounded-xl'>
              <img src={projectSimLogo} alt="Profile Avatar" className='size-full object-contain rounded-xl'/>
            </div>
            <div className='text-2xl font-bold text-emerald-50'>
              Pathfinder Simulator & Maze Generator
            </div>
            <div className='text-xl font-semibold text-emerald-50'>
              Visualizer for different PS & MG algorithms.
            </div>
            <div className='flex flex-wrap gap-4'>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                C++
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                CMake
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                Qt
              </div>
              <div className='px-3 py-1 rounded-lg bg-card-att text-xl font-semibold text-emerald-50'>
                SGL
              </div>
            </div>
          </a>
        </div>
      </div>


      {/* SECTION 3 */}
      <div className="w-full  h-[calc(100vh-6rem)] flex flex-col gap-y-12 justify-center">
        <div className='text-4xl font-bold text-emerald-50'>
          Proficient Languages
        </div>
        <div className='flex flex-wrap gap-4'>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            Java
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            C++
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            JavaScript
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            C#
          </div>
        </div>

        <div className='text-4xl font-bold text-emerald-50'>
          Experience Using
        </div>
        <div className='flex flex-wrap gap-4'>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            C
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            Python
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            TailwindCSS
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            React
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            MySQL
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            SQLite
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            HTML
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            CSS
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            Node.js
          </div>
          <div className='px-5 py-1.5 rounded-lg bg-card-att text-3xl text-emerald-50'>
            Express.js
          </div>
        </div>
        
        <div className='text-4xl font-bold text-emerald-50'>
          Contact Me
        </div>
        <div className='text-xl font-semibold text-emerald-50'>
          jackmaierunderhill@gmail.com
        </div>
      </div>
      
    </div>
  )
}

export default App
