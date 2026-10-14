import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

// Shell de las rutas protegidas: el header con logout queda visible siempre.
export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__brand">🎬 Mi Cartelera Personal</span>
        <div className="app__user">
          <span className="app__email">{user?.email}</span>
          <button type="button" onClick={() => void signOut()} className="btn btn--ghost">
            Cerrar sesión
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
