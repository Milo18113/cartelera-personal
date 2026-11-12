import { useEffect, useState } from 'react'
import type { SesionGuardada } from '../domain/sesion'
import { fetchSesion } from '../infrastructure/sesionesRepository'

interface Resultado {
  // Consulta a la que pertenece este resultado; si no coincide con la actual, es obsoleto.
  clave: string | null
  sesion: SesionGuardada | null
  error: string | null
}

interface UseSesion {
  // null si no existe, si es de otra persona o si el id no es válido: se ven igual (HU-05-C3).
  sesion: SesionGuardada | null
  loading: boolean
  error: string | null
  reintentar: () => void
}

// `id` es null cuando el parámetro de la ruta no es un número: no hay nada que consultar.
export function useSesion(id: number | null): UseSesion {
  const [reintentos, setReintentos] = useState(0)
  const [resultado, setResultado] = useState<Resultado>({ clave: null, sesion: null, error: null })
  const clave = `${id}|${reintentos}`

  useEffect(() => {
    if (id === null) return
    let cancelado = false

    const cargar = async () => {
      try {
        const sesion = await fetchSesion(id)
        if (!cancelado) setResultado({ clave, sesion, error: null })
      } catch (err) {
        if (cancelado) return
        const error = err instanceof Error ? err.message : 'No se pudo cargar la sesión'
        setResultado({ clave, sesion: null, error })
      }
    }
    void cargar()

    return () => {
      cancelado = true
    }
  }, [id, clave])

  const vigente = id === null || resultado.clave === clave
  return {
    sesion: id !== null && resultado.clave === clave ? resultado.sesion : null,
    loading: !vigente,
    error: vigente && id !== null ? resultado.error : null,
    reintentar: () => setReintentos((n) => n + 1),
  }
}
