import { useRef, useState } from 'react'
import { puedeGuardar, type NuevaSesion } from '../domain/sesion'
import { guardarSesion } from '../infrastructure/sesionesRepository'

interface UseGuardarSesion {
  guardando: boolean
  // Mensaje del último intento fallido; null si salió bien o aún no se intentó.
  error: string | null
  // Devuelve el id de la sesión guardada, o null si no se guardó (error o intento repetido).
  guardar: (nueva: NuevaSesion) => Promise<number | null>
}

export function useGuardarSesion(): UseGuardarSesion {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Un ref y no solo el estado: setGuardando no es inmediato, y un segundo clic rápido pasaría
  // antes de que el botón se deshabilite. El ref lo bloquea al instante (HU-03-C10).
  const enCurso = useRef(false)

  const guardar = async (nueva: NuevaSesion): Promise<number | null> => {
    if (enCurso.current) return null
    // La pantalla ya deshabilita el botón en estos casos; esto es una segunda barrera.
    if (!puedeGuardar(nueva.peliculas, nueva.tiempoDisponible).ok) return null

    enCurso.current = true
    setGuardando(true)
    setError(null)
    try {
      return await guardarSesion(nueva)
    } catch (err) {
      // Lo armado se conserva: la pantalla solo lo vacía cuando devuelve un id (HU-03-C9).
      setError(err instanceof Error ? err.message : 'No se pudo guardar la sesión')
      return null
    } finally {
      enCurso.current = false
      setGuardando(false)
    }
  }

  return { guardando, error, guardar }
}
