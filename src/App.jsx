import { useState } from 'react'
import tailwindLogo from './assets/tailwind.svg'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div class="justify-items-center">
      <div class="w-full p-10 text-3xl font-bold text-center bg-sky-950 text-emerald-300">
        Jack Underhill | Portfolio 2025
      </div>
      <div class="p-6 grid grid-flow-col bg-yellow-100 justify-items-center w-1/2">
          <a href="https://vite.dev" target="_blank" class="bg-red-100">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
          <a href="https://tailwindcss.com/docs/installation/using-vite" target="_blank">
            <img src={tailwindLogo} className="logo tailwind" alt="Tailwind logo" />
          </a>
      </div>
      <h1 class="bg-sky-50 p-4">Vite + React + TailwindCSS</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
