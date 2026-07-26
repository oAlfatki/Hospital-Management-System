
import './App.css'

import router from './core/router/router'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  

  return (
     <main>
      <Toaster />
      <RouterProvider router={router} />
    </main>
  )
}

export default App
