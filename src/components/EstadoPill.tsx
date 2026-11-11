import type { ReactNode } from 'react'
import type { Estado } from '../domain/miLista'
import { ICONO_AGREGAR, ICONO_ESTADO, ICON_PROPS } from './iconos'

interface EstadoPillProps {
  // null = el título no está en mi lista.
  estado: Estado | null
  children: ReactNode
}

// Pill informativa de estado (resumen del inicio). Elegir el estado de un título se hace con
// EstadoSelect; esta pill ya no es un botón.
export function EstadoPill({ estado, children }: EstadoPillProps) {
  const Icono = estado === null ? ICONO_AGREGAR : ICONO_ESTADO[estado]

  return (
    <span className={`pill pill--${estado ?? 'ninguna'}`}>
      <Icono {...ICON_PROPS} aria-hidden="true" />
      {children}
    </span>
  )
}
