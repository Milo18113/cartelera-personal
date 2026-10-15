import { siguienteEstado, type Estado } from '../domain/miLista'
import { ICONO_AGREGAR, ICONO_ELIMINAR, ICONO_ESTADO, ICON_PROPS } from './iconos'

interface CardActionsProps {
  estado: Estado | null
  busy: boolean
  onAvanzar: () => void
  onEliminar: () => void
}

// Cada etiqueta dice el estado actual y qué pasará al hacer click (también es el tooltip).
const ETIQUETA_BOTON: Record<Estado | 'ninguna', string> = {
  ninguna: 'Agregar a pendientes',
  por_ver: 'Pendiente · pasar a en progreso',
  viendo: 'En progreso · marcar como vista',
  vista: 'Vista',
}

export function CardActions({ estado, busy, onAvanzar, onEliminar }: CardActionsProps) {
  const Icono = estado === null ? ICONO_AGREGAR : ICONO_ESTADO[estado]
  const etiqueta = ETIQUETA_BOTON[estado ?? 'ninguna']
  const esFinal = siguienteEstado(estado) === null

  return (
    <>
      {/* Eliminar solo existe si el título ya está en mi lista. */}
      {estado !== null && (
        <button
          type="button"
          className="icon-btn icon-btn--eliminar"
          aria-label="Quitar de mi lista"
          title="Quitar de mi lista"
          aria-busy={busy}
          disabled={busy}
          onClick={onEliminar}
        >
          <ICONO_ELIMINAR {...ICON_PROPS} aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        className={`icon-btn icon-btn--${estado ?? 'ninguna'}`}
        aria-label={etiqueta}
        title={etiqueta}
        aria-busy={busy}
        disabled={busy || esFinal}
        onClick={onAvanzar}
      >
        <Icono {...ICON_PROPS} aria-hidden="true" />
      </button>
    </>
  )
}
