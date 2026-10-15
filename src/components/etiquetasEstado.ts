import type { Estado } from '../domain/miLista'

// Cada etiqueta dice el estado actual y qué pasará al hacer click (sirve de aria-label y tooltip).
// La comparten los botones de las tarjetas y la pill del detalle.
export const ETIQUETA_ACCION_ESTADO: Record<Estado | 'ninguna', string> = {
  ninguna: 'Agregar a pendientes',
  por_ver: 'Pendiente · pasar a en progreso',
  viendo: 'En progreso · marcar como vista',
  vista: 'Vista',
}
