import { useEffect, useState } from 'react'
import type { SesionGuardada } from '../domain/sesion'
import { fetchSesiones } from '../infrastructure/sesionesRepository'

interface Resultado {
  // Intento al que pertenece este resultado; si no coincide con el actual, es obsoleto.
  intento: number | null
  sesiones: SesionGuardada[]
  error: string | null
}

interface UseSesionesGuardadas {
  sesiones: SesionGuardada[]
  loading: boolean
  error: string | null
  reintentar: () => void
}

// Mis sesiones, de la más reciente a la más antigua. Sigue el patrón de los demás hooks de
// carga: el resultado queda atado a su intento, y «cargando» se deriva en lugar de guardarse.
export function useSesionesGuardadas(): UseSesionesGuardadas {
  const [reintentos, setReintentos] = useState(0)
  const [resultado, setResultado] = useState<Resultado>({
    intento: null,
    sesiones: [],
    error: null,
  })

  useEffect(() => {
    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera.
    let cancelado = false

    const cargar = async () => {
      try {
        const sesiones = await fetchSesiones()
        if (!cancelado) setResultado({ intento: reintentos, sesiones, error: null })
      } catch (err) {
        if (cancelado) return
        const error = err instanceof Error ? err.message : 'No se pudieron cargar tus sesiones'
        setResultado({ intento: reintentos, sesiones: [], error })
      }
    }
    void cargar()

    return () => {
      cancelado = true
    }
  }, [reintentos])

  const vigente = resultado.intento === reintentos
  return {
    sesiones: resultado.sesiones,
    loading: !vigente,
    error: vigente ? resultado.error : null,
    reintentar: () => setReintentos((n) => n + 1),
  }
}
