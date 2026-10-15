import { useEffect, useState, type ReactNode } from 'react'
import { claveTitulo, type Estado, type ItemLista } from '../domain/miLista'
import {
  actualizarEstado,
  actualizarOpinion,
  eliminarDeLista,
  fetchMiLista,
  insertarEnLista,
  type CambiosOpinion,
  type NuevoItem,
} from '../infrastructure/miListaRepository'
import { MiListaContext } from './miListaContextValue'

interface MiListaState {
  items: ItemLista[]
  loading: boolean
  error: string | null
}

// Una sola copia de la lista para inicio, búsqueda y detalle: así todas las pantallas
// muestran el mismo estado de cada título y no repiten la consulta a Supabase.
export function MiListaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MiListaState>({ items: [], loading: true, error: null })
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    // Evita actualizar estado si el componente se desmontó (o StrictMode remonta) antes de responder.
    let cancelled = false

    const load = async () => {
      try {
        const items = await fetchMiLista()
        if (!cancelled) setState({ items, loading: false, error: null })
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err.message : 'No se pudo cargar tu lista'
          setState({ items: [], loading: false, error })
        }
      }
    }
    void load()

    return () => {
      cancelled = true
    }
  }, [])

  // Envuelve cada acción: marca la clave como ocupada, captura el error para la UI y
  // devuelve si salió bien.
  const ejecutar = async (clave: string, accion: () => Promise<void>): Promise<boolean> => {
    setActionError(null)
    setBusy((prev) => new Set(prev).add(clave))
    try {
      await accion()
      return true
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo completar la acción')
      return false
    } finally {
      setBusy((prev) => {
        const siguiente = new Set(prev)
        siguiente.delete(clave)
        return siguiente
      })
    }
  }

  const reemplazar = (actualizado: ItemLista) =>
    setState((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === actualizado.id ? actualizado : i)),
    }))

  // Se espera a la DB antes de tocar el estado local: la UI nunca muestra algo no persistido.
  const agregar = (nuevo: NuevoItem) =>
    ejecutar(claveTitulo(nuevo.tipo, nuevo.tmdbId), async () => {
      const creado = await insertarEnLista(nuevo)
      setState((s) => ({ ...s, items: [creado, ...s.items] }))
    })

  const cambiarEstado = (item: ItemLista, estado: Estado) =>
    ejecutar(claveTitulo(item.tipo_contenido, item.tmdb_id), async () => {
      reemplazar(await actualizarEstado(item.id, estado))
    })

  const guardarOpinion = (item: ItemLista, cambios: CambiosOpinion) =>
    ejecutar(claveTitulo(item.tipo_contenido, item.tmdb_id), async () => {
      reemplazar(await actualizarOpinion(item.id, cambios))
    })

  const eliminar = (item: ItemLista) =>
    ejecutar(claveTitulo(item.tipo_contenido, item.tmdb_id), async () => {
      await eliminarDeLista(item.id)
      setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== item.id) }))
    })

  return (
    <MiListaContext.Provider
      value={{
        ...state,
        actionError,
        busy,
        agregar,
        cambiarEstado,
        actualizarOpinion: guardarOpinion,
        eliminar,
      }}
    >
      {children}
    </MiListaContext.Provider>
  )
}
