import { siguienteEstado, type Estado } from '../domain/miLista'
import { ETIQUETA_ACCION_ESTADO } from './etiquetasEstado'
import { ICONO_AGREGAR, ICONO_ELIMINAR, ICONO_ESTADO, ICON_PROPS } from './iconos'

interface CardActionsProps {
  estado: Estado | null
  busy: boolean
  onAvanzar: () => void
  onEliminar: () => void
}

export function CardActions({ estado, busy, onAvanzar, onEliminar }: CardActionsProps) {
  const Icono = estado === null ? ICONO_AGREGAR : ICONO_ESTADO[estado]
  const etiqueta = ETIQUETA_ACCION_ESTADO[estado ?? 'ninguna']
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
