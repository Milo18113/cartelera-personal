import { useEffect, useState } from 'react'
import type { ItemLista } from '../domain/miLista'
import { fetchMiLista } from '../infrastructure/miListaRepository'

interface MiListaState {
  items: ItemLista[]
  loading: boolean
  error: string | null
}

export function useMiLista(): MiListaState {
  const [state, setState] = useState<MiListaState>({ items: [], loading: true, error: null })

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

  return state
}
