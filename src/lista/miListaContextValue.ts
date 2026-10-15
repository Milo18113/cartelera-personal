import { createContext } from 'react'
import type { Estado, ItemLista } from '../domain/miLista'
import type { NuevoItem } from '../infrastructure/miListaRepository'

export interface MiListaContextValue {
  items: ItemLista[]
  loading: boolean
  error: string | null
  // Error de la última acción (agregar/cambiar/eliminar); null si salió bien.
  actionError: string | null
  // Claves (claveTitulo) con una petición en curso: la UI deshabilita sus botones.
  busy: ReadonlySet<string>
  agregar: (nuevo: NuevoItem) => Promise<void>
  cambiarEstado: (item: ItemLista, estado: Estado) => Promise<void>
  eliminar: (item: ItemLista) => Promise<void>
}

// Separado del Provider por la misma razón que AuthContext (react-refresh).
export const MiListaContext = createContext<MiListaContextValue | null>(null)
