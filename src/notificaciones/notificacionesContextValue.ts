import { createContext } from 'react'

export type TipoNotificacion = 'exito' | 'error'

export interface Notificacion {
  tipo: TipoNotificacion
  mensaje: string
}

// La notificación que se está mostrando. El id cambia con cada aviso nuevo: reinicia el
// temporizador y la animación aunque el mensaje sea el mismo que el anterior.
export interface NotificacionActiva extends Notificacion {
  id: number
}

export interface NotificacionesContextValue {
  // Muestra un aviso abajo en la pantalla. Reemplaza al que hubiera: nunca se apilan.
  notificar: (notificacion: Notificacion) => void
  cerrar: () => void
}

// Separado del Provider por la misma razón que AuthContext y MiListaContext (react-refresh).
export const NotificacionesContext = createContext<NotificacionesContextValue | null>(null)
