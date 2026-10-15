import { useEffect, useState } from 'react'
import { fetchRecomendacionesPeliculas, type TituloTmdb } from '../infrastructure/tmdb'

interface RecomendacionesState {
  items: TituloTmdb[]
  loading: boolean
  error: string | null
}

export function useRecomendaciones(): RecomendacionesState {
  const [state, setState] = useState<RecomendacionesState>({
    items: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const items = await fetchRecomendacionesPeliculas()
        if (!cancelled) setState({ items, loading: false, error: null })
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err.message : 'No se pudieron cargar las recomendaciones'
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
