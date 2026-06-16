import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de ruta, lleva la vista al inicio de la página.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
