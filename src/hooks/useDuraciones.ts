import { useEffect, useRef, useState } from 'react'
import type { DuracionPelicula } from '../domain/duracionPelicula'
import { fetchDuraciones } from '../infrastructure/tmdb'

interface Resultado {
  // Consulta a la que pertenece este resultado; si no coincide con la actual, es obsoleto.
  clave: string | null
  duraciones: ReadonlyMap<number, DuracionPelicula>
  error: string | null
}

interface UseDuraciones {
  // Todo lo que se conoce hasta ahora; una película aún sin consultar no aparece.
  duraciones: ReadonlyMap<number, DuracionPelicula>
  loading: boolean
  error: string | null
  reintentar: () => void
}

const SIN_RESULTADO: Resultado = { clave: null, duraciones: new Map(), error: null }

// Consulta la duración de cada película de la lista. Guarda lo ya conocido: si la lista cambia
// solo se piden las nuevas, y `reintentar` vuelve a pedir únicamente las que fallaron (HU-01-C9).
export function useDuraciones(tmdbIds: readonly number[]): UseDuraciones {
  const conocidas = useRef(new Map<number, DuracionPelicula>())
  const [resultado, setResultado] = useState<Resultado>(SIN_RESULTADO)
  const [reintentos, setReintentos] = useState(0)

  // El orden de los ids no cambia qué hay que consultar: se ordenan para que la clave sea estable.
  const ids = [...new Set(tmdbIds)].sort((a, b) => a - b).join(',')
  const clave = `${ids}|${reintentos}`

  useEffect(() => {
    // Cancela las peticiones si la lista cambia o la pantalla se cierra antes de terminar.
    const controller = new AbortController()
    const todos = ids === '' ? [] : ids.split(',').map(Number)
    const pendientes = todos.filter(
      (id) => !conocidas.current.has(id) || conocidas.current.get(id)?.estado === 'error',
    )

    const cargar = async () => {
      try {
        const nuevas = await fetchDuraciones(pendientes, controller.signal)
        if (controller.signal.aborted) return
        nuevas.forEach((duracion, id) => conocidas.current.set(id, duracion))
        setResultado({ clave, duraciones: new Map(conocidas.current), error: null })
      } catch (err) {
        if (controller.signal.aborted) return
        const error = err instanceof Error ? err.message : 'No se pudieron consultar las duraciones'
        setResultado({ clave, duraciones: new Map(conocidas.current), error })
      }
    }
    void cargar()

    return () => controller.abort()
  }, [ids, clave])

  // Derivado: mientras no llega el resultado de esta consulta, la pantalla muestra «cargando»
  // sin necesitar un setState síncrono dentro del efecto.
  const vigente = resultado.clave === clave
  return {
    duraciones: resultado.duraciones,
    loading: !vigente,
    error: vigente ? resultado.error : null,
    reintentar: () => setReintentos((n) => n + 1),
  }
}
