import type { Estado } from '../domain/miLista'
import { EstadoSelect } from './EstadoSelect'
import { ICONO_ELIMINAR, ICON_PROPS } from './iconos'

interface CardActionsProps {
  estado: Estado | null
  titulo: string
  busy: boolean
  onCambiarEstado: (estado: Estado) => void
  onEliminar: () => void
}

// Controles del overlay: eliminar arriba a la derecha y el selector de estado abajo.
export function CardActions({
  estado,
  titulo,
  busy,
  onCambiarEstado,
  onEliminar,
}: CardActionsProps) {
  return (
    <>
      {/* Eliminar solo existe si el título ya está en mi lista. */}
      {estado !== null && (
        <div className="card__actions">
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
        </div>
      )}

      <div className="card__estado">
        <EstadoSelect
          estado={estado}
          titulo={titulo}
          variante="tarjeta"
          busy={busy}
          onCambiar={onCambiarEstado}
        />
      </div>
    </>
  )
}
