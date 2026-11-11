import { ICONO_AGREGAR, ICONO_ELIMINAR, ICON_PROPS } from './iconos'

interface CardActionsProps {
  // ¿El título ya está en mi lista? Define cuál de los dos botones se dibuja.
  enLista: boolean
  titulo: string
  busy: boolean
  onAgregar: () => void
  onEliminar: () => void
}

// Un solo botón sobre el póster que alterna según el título: «+» para agregarlo como «por ver»
// o la papelera para quitarlo. Cambiar el estado de un título ya agregado se hace en el detalle
// (EstadoSelect), donde está la información completa.
export function CardActions({ enLista, titulo, busy, onAgregar, onEliminar }: CardActionsProps) {
  const Icono = enLista ? ICONO_ELIMINAR : ICONO_AGREGAR
  // La etiqueta nombra el título: en una fila hay muchos botones iguales y deben distinguirse.
  const etiqueta = enLista ? `Quitar “${titulo}” de mi lista` : `Agregar “${titulo}” a pendientes`

  return (
    <div className="card__actions">
      <button
        type="button"
        className={enLista ? 'icon-btn icon-btn--eliminar' : 'icon-btn'}
        aria-label={etiqueta}
        title={etiqueta}
        aria-busy={busy}
        disabled={busy}
        onClick={enLista ? onEliminar : onAgregar}
      >
        <Icono {...ICON_PROPS} aria-hidden="true" />
      </button>
    </div>
  )
}
