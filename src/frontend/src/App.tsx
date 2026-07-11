import { useState } from 'react'

import './App.css'
import ProductsPage from './features/products/pages/productsPage'
import router from './core/router/router'
import { RouterProvider } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
     <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App
