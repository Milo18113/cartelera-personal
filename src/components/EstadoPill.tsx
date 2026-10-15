import type { ReactNode } from 'react'
import type { Estado } from '../domain/miLista'
import { ICONO_AGREGAR, ICONO_ESTADO, ICON_PROPS } from './iconos'

interface EstadoPillProps {
  // null = el título no está en mi lista.
  estado: Estado | null
  children: ReactNode
  // Si se pasa onClick, la pill es un botón (detalle); si no, es solo informativa (resumen del inicio).
  onClick?: () => void
  disabled?: boolean
  busy?: boolean
  // Describe la acción del click (aria-label y tooltip).
  etiquetaAccion?: string
}

// Pill de estado compartida por el resumen del inicio y la página de detalle.
export function EstadoPill({
  estado,
  children,
  onClick,
  disabled,
  busy,
  etiquetaAccion,
}: EstadoPillProps) {
  const Icono = estado === null ? ICONO_AGREGAR : ICONO_ESTADO[estado]
  const clase = `pill pill--${estado ?? 'ninguna'}`
  const contenido = (
    <>
      <Icono {...ICON_PROPS} aria-hidden="true" />
      {children}
    </>
  )

  if (!onClick) return <span className={clase}>{contenido}</span>

  return (
    <button
      type="button"
      className={`${clase} pill--btn`}
      aria-label={etiquetaAccion}
      title={etiquetaAccion}
      aria-busy={busy}
      disabled={disabled || busy}
      onClick={onClick}
    >
      {contenido}
    </button>
  )
}
