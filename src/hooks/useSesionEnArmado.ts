import { useState } from 'react'
import type { Candidata } from '../domain/candidatas'
import { duracionTotal, tiempoRestante } from '../domain/nochePelicula'
import {
  agregarPelicula,
  quitarPelicula,
  type PeliculaEnSesion,
  type ResultadoAgregar,
} from '../domain/sesion'

interface UseSesionEnArmado {
  peliculas: readonly PeliculaEnSesion[]
  total: number
  // null mientras no hay un tiempo disponible válido; negativo si la sesión se pasa.
  restante: number | null
  // Devuelve el resultado para que la pantalla muestre por qué no se agregó.
  agregar: (candidata: Candidata) => ResultadoAgregar
  quitar: (tmdbId: number) => void
  vaciar: () => void
}

// La sesión que la persona está armando. Vive en el estado de la pantalla: no se persiste ni
// sobrevive a recargar o a cambiar de pantalla (RF-23). Todas las cuentas salen del dominio.
// `disponible` es null mientras el campo de tiempo tiene un valor inválido; lo armado se
// conserva igual, para no perderlo por pasar por un valor intermedio al escribir.
export function useSesionEnArmado(disponible: number | null): UseSesionEnArmado {
  const [peliculas, setPeliculas] = useState<PeliculaEnSesion[]>([])

  const duraciones = peliculas.map((pelicula) => pelicula.minutos)
  const total = duracionTotal(duraciones)
  const restante = disponible === null ? null : tiempoRestante(disponible, duraciones)

  const agregar = (candidata: Candidata): ResultadoAgregar => {
    if (disponible === null) return { ok: false, motivo: 'sin_tiempo' }

    const resultado = agregarPelicula(peliculas, candidata, disponible)
    if (resultado.ok) setPeliculas(resultado.peliculas)
    return resultado
  }

  return {
    peliculas,
    total,
    restante,
    agregar,
    quitar: (tmdbId) => setPeliculas((actuales) => quitarPelicula(actuales, tmdbId)),
    vaciar: () => setPeliculas([]),
  }
}
