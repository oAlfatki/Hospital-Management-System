import { useState } from 'react'

import './App.css'

import router from './core/router/router'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  const [count, setCount] = useState(0)

  return (
     <main>
      <Toaster />
      <RouterProvider router={router} />
    </main>
  )
}

export default App
