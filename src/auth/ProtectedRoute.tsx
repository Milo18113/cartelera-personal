import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="status-message">Cargando…</p>
  }
  return user ? children : <Navigate to="/login" replace />
}
