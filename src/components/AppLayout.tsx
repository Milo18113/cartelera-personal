import { Link, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { MiListaProvider } from '../lista/MiListaProvider'
import { SearchBar } from './SearchBar'

// Shell de las rutas protegidas: el header con buscador y logout queda visible siempre.
export function AppLayout() {
  const { user, signOut } = useAuth()
  const [params] = useSearchParams()
  const busquedaActual = params.get('q') ?? ''

  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__brand">
          🎬 Mi Cartelera Personal
        </Link>
        {/* key: remonta el input cuando cambia la URL (botón atrás, otra ruta) para resincronizarlo. */}
        <SearchBar key={busquedaActual} inicial={busquedaActual} />
        <div className="app__user">
          <span className="app__email">{user?.email}</span>
          <button type="button" onClick={() => void signOut()} className="btn btn--ghost">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Dentro de la ruta protegida: la lista solo se pide con sesión activa. */}
      <MiListaProvider>
        <Outlet />
      </MiListaProvider>
    </div>
  )
}
