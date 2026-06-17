import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import ProfileDropdown from '@/components/navbar/ProfileDropdown'

export default function Navbar() {
  const { user, role, signOut } = useAuthStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => signOut()

  // Enlaces del navbar (según rol). "Mis productos" solo para productores.
  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalog', label: 'Catálogo' },
    ...(user && role === 'producer' ? [{ to: '/producer', label: 'Mis productos' }] : []),
    ...(user && role === 'admin' ? [{ to: '/admin', label: 'Administración' }] : []),
    { to: '/quienes-somos', label: 'Quiénes Somos' },
  ]

  const isCurrent = (to) => location.pathname === to

  // Clases de enlace (escritorio)
  const linkClass = (to) =>
    isCurrent(to)
      ? 'rounded-md bg-gray-950/50 px-3 py-2 text-base font-medium text-white'
      : 'rounded-md px-3 py-2 text-base font-medium text-white hover:bg-white/5 hover:text-white'

  // Clases de enlace (móvil)
  const mobileLinkClass = (to) =>
    isCurrent(to)
      ? 'block rounded-md bg-gray-950/50 px-3 py-2 text-base font-medium text-white'
      : 'block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-white/5 hover:text-white'

  return (
    <nav className="sticky top-0 z-50 relative bg-green-800 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">

          {/* Botón de menú móvil */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(o => !o)}
              aria-expanded={mobileOpen}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-6">
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-6">
                  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Logo + enlaces (escritorio) */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex shrink-0 items-center">
              <img
                src="/logos/LOGOMERCADOCAMPESINO.png"
                alt="Mercado Campesino"
                className="h-12 w-auto"
              />
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Lado derecho: perfil/salir si hay sesión; login/registro si no */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user ? (
              <div className="flex items-center gap-3">
                <ProfileDropdown />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-white hover:text-gray-300"
                >
                  Salir
                </button>
              </div>
            ) : (
              // En móvil estos botones se muestran dentro del menú hamburguesa
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-2 text-base font-medium text-white hover:text-gray-300">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-green-600 px-3 py-2 text-base font-medium text-white hover:bg-green-700"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileOpen && (
        <div className="block sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass(link.to)}
              >
                {link.label}
              </Link>
            ))}

            {/* Iniciar sesión / Registrarse dentro del menú (solo visitantes anónimos) */}
            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-white/5"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-green-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
