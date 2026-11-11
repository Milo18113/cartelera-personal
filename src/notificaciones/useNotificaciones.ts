import { useContext } from 'react'
import {
  NotificacionesContext,
  type NotificacionesContextValue,
} from './notificacionesContextValue'

// Cualquier parte de la app puede avisar algo: notificar({ tipo: 'exito', mensaje: '...' }).
export function useNotificaciones(): NotificacionesContextValue {
  const ctx = useContext(NotificacionesContext)
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de <NotificacionesProvider>')
  return ctx
}
