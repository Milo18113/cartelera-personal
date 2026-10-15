import { useState } from 'react'
import { ICONO_ELIMINAR, ICON_PROPS } from './iconos'

interface RemoveFromListProps {
  disabled: boolean
  onConfirmar: () => void
}

// Quitar de mi lista borra también la calificación y el comentario, por eso pide confirmación
// (en las tarjetas del inicio no hace falta: ahí no hay nada más que perder).
export function RemoveFromList({ disabled, onConfirmar }: RemoveFromListProps) {
  const [confirmando, setConfirmando] = useState(false)

  if (!confirmando) {
    return (
      <button
        type="button"
        className="icon-btn icon-btn--eliminar"
        aria-label="Quitar de mi lista"
        title="Quitar de mi lista"
        disabled={disabled}
        onClick={() => setConfirmando(true)}
      >
        <ICONO_ELIMINAR {...ICON_PROPS} aria-hidden="true" />
      </button>
    )
  }

  return (
    <span className="confirm" role="alertdialog" aria-label="Confirmar">
      <span className="confirm__text">¿Quitar de tu lista? Se borrarán tu nota y comentario.</span>
      <button
        type="button"
        className="btn btn--danger"
        disabled={disabled}
        onClick={() => {
          setConfirmando(false)
          onConfirmar()
        }}
      >
        Quitar
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => setConfirmando(false)}>
        Cancelar
      </button>
    </span>
  )
}
