import { useEffect, useState } from 'react'
import type { DetalleTitulo } from '../domain/detalle'
import { claveTitulo, type TipoContenido } from '../domain/miLista'
import { fetchDetalleTitulo } from '../infrastructure/tmdb'

interface Resultado {
  // Título al que pertenece este resultado; si no coincide con el actual, es obsoleto.
  clave: string | null
  detalle: DetalleTitulo | null
  error: string | null
}

interface UseDetalleTitulo {
  detalle: DetalleTitulo | null
  loading: boolean
  error: string | null
}

export function useDetalleTitulo(tipo: TipoContenido, tmdbId: number): UseDetalleTitulo {
  const clave = claveTitulo(tipo, tmdbId)
  const [resultado, setResultado] = useState<Resultado>({ clave: null, detalle: null, error: null })

  useEffect(() => {
    // Cancela la petición si se navega a otro título antes de que responda.
    const controller = new AbortController()

    const cargar = async () => {
      try {
        const detalle = await fetchDetalleTitulo(tipo, tmdbId, controller.signal)
        if (!controller.signal.aborted) setResultado({ clave, detalle, error: null })
      } catch (err) {
        if (controller.signal.aborted) return
        const error = err instanceof Error ? err.message : 'No se pudo cargar el título'
        setResultado({ clave, detalle: null, error })
      }
    }
    void cargar()

    return () => controller.abort()
  }, [clave, tipo, tmdbId])

  // Derivado: al cambiar de título el resultado viejo deja de contar y vuelve a "cargando".
  const vigente = resultado.clave === clave
  return {
    detalle: vigente ? resultado.detalle : null,
    error: vigente ? resultado.error : null,
    loading: !vigente,
  }
}
