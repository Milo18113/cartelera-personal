import { CircleAlert, CircleCheck, X } from 'lucide-react'
import type { NotificacionActiva } from '../notificaciones/notificacionesContextValue'
import { ICON_PROPS } from './iconos'

interface SnackbarProps {
  notificacion: NotificacionActiva | null
  onCerrar: () => void
}

// Aviso flotante abajo de la pantalla. Nunca solo color: lleva ícono y texto, y un botón de cerrar.
export function Snackbar({ notificacion, onCerrar }: SnackbarProps) {
  const Icono = notificacion?.tipo === 'error' ? CircleAlert : CircleCheck

  return (
    // La región existe siempre, aunque esté vacía: un lector de pantalla anuncia lo que aparece
    // dentro de una región que ya estaba en la página. Los errores se anuncian con más urgencia.
    <div className="snackbar__region" role="status" aria-live="polite">
      {notificacion && (
        // key: cada aviso nuevo es un elemento nuevo, así su animación vuelve a empezar.
        <div
          key={notificacion.id}
          className={`snackbar snackbar--${notificacion.tipo}`}
          role={notificacion.tipo === 'error' ? 'alert' : undefined}
        >
          <Icono className="snackbar__icono" {...ICON_PROPS} aria-hidden="true" />
          <p className="snackbar__mensaje">{notificacion.mensaje}</p>
          <button
            type="button"
            className="icon-btn snackbar__cerrar"
            aria-label="Cerrar aviso"
            onClick={onCerrar}
          >
            <X {...ICON_PROPS} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
