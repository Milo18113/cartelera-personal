import { useEffect, useState, type ReactNode } from 'react'
import { mensajeDeError } from '../domain/errores'
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
import { useNotificaciones } from '../notificaciones/useNotificaciones'
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
  const { notificar } = useNotificaciones()
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

  // Envuelve cada acción: marca la clave como ocupada, avisa el error con un snackbar (en lugar
  // de guardarlo para que cada pantalla lo pinte) y devuelve si salió bien.
  const ejecutar = async (clave: string, accion: () => Promise<void>): Promise<boolean> => {
    setBusy((prev) => new Set(prev).add(clave))
    try {
      await accion()
      return true
    } catch (err) {
      // Sin conexión se avisa con el mensaje amable y no con «TypeError: Failed to fetch» (E1-D06).
      const mensaje = mensajeDeError(
        err instanceof Error ? err.message : 'No se pudo completar la acción',
      )
      notificar({ tipo: 'error', mensaje })
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
