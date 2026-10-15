import { createContext } from 'react'
import type { Estado, ItemLista } from '../domain/miLista'
import type { CambiosOpinion, NuevoItem } from '../infrastructure/miListaRepository'

// Las acciones devuelven true si se completaron: permite a la UI mostrar "Guardado"
// sin tener que interpretar actionError.
export interface MiListaContextValue {
  items: ItemLista[]
  loading: boolean
  error: string | null
  // Error de la última acción (agregar/cambiar/eliminar/guardar); null si salió bien.
  actionError: string | null
  // Claves (claveTitulo) con una petición en curso: la UI deshabilita sus botones.
  busy: ReadonlySet<string>
  agregar: (nuevo: NuevoItem) => Promise<boolean>
  cambiarEstado: (item: ItemLista, estado: Estado) => Promise<boolean>
  actualizarOpinion: (item: ItemLista, cambios: CambiosOpinion) => Promise<boolean>
  eliminar: (item: ItemLista) => Promise<boolean>
}

// Separado del Provider por la misma razón que AuthContext (react-refresh).
export const MiListaContext = createContext<MiListaContextValue | null>(null)
