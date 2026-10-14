import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

// Shell de las rutas protegidas: el header con logout queda visible siempre.
export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto min-h-svh max-w-5xl px-4">
      <header className="flex items-center justify-between border-b border-slate-800 py-4">
        <span className="text-lg font-semibold">🎬 Mi Cartelera Personal</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-400 sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
