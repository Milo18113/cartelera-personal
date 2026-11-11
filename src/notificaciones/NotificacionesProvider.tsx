import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Snackbar } from '../components/Snackbar'
import {
  NotificacionesContext,
  type Notificacion,
  type NotificacionActiva,
  type TipoNotificacion,
} from './notificacionesContextValue'

// Cuánto dura cada aviso. El de error se queda un poco más: hay que leer qué falló.
const DURACION_MS: Record<TipoNotificacion, number> = { exito: 4000, error: 6000 }

// Guarda una sola notificación: una nueva reemplaza a la anterior, así que varias acciones
// seguidas no dejan una pila de avisos. También dibuja el snackbar.
export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [activa, setActiva] = useState<NotificacionActiva | null>(null)
  const ultimoId = useRef(0)

  const notificar = useCallback((notificacion: Notificacion) => {
    ultimoId.current += 1
    setActiva({ ...notificacion, id: ultimoId.current })
  }, [])

  const cerrar = useCallback(() => setActiva(null), [])

  // Cada aviso nuevo (otro objeto) reinicia el temporizador. El cleanup lo cancela cuando lo
  // reemplaza otro aviso o cuando el provider se desmonta.
  useEffect(() => {
    if (!activa) return
    const temporizador = setTimeout(() => setActiva(null), DURACION_MS[activa.tipo])
    return () => clearTimeout(temporizador)
  }, [activa])

  const valor = useMemo(() => ({ notificar, cerrar }), [notificar, cerrar])

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
      <Snackbar notificacion={activa} onCerrar={cerrar} />
    </NotificacionesContext.Provider>
  )
}
