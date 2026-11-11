// Sesión de «Noche de película»: lo que la persona arma y lo que queda guardado (PRD, E2).
// Los tipos viven aquí, en el dominio, para que ni los componentes ni el servicio de Supabase
// dependan de cómo se guardan las filas.
import { evaluarAgregar } from './nochePelicula'

export const NOMBRE_MAXIMO = 60

// Una película dentro de una sesión. En una sesión guardada es una copia de lo que se vio al
// armarla (DEC-04): no se actualiza si la lista de la persona cambia después.
export interface PeliculaEnSesion {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  minutos: number
}

export interface NuevaSesion {
  nombre: string
  tiempoDisponible: number
  // En el orden en que se agregaron (SUP-05).
  peliculas: PeliculaEnSesion[]
}

export interface SesionGuardada extends NuevaSesion {
  id: number
  // Fecha ISO de cuando se guardó.
  creadaEn: string
}

export type ResultadoAgregarPelicula =
  | { ok: true; peliculas: PeliculaEnSesion[] }
  | { ok: false; motivo: 'duplicada' | 'sin_duracion' }
  | { ok: false; motivo: 'excede'; faltan: number }

// Lo que devuelve el armado de la sesión: el resultado del dominio, o 'sin_tiempo' cuando
// todavía no hay un tiempo disponible válido contra el cual comparar.
export type ResultadoAgregar = ResultadoAgregarPelicula | { ok: false; motivo: 'sin_tiempo' }

// Agrega una película al final de la sesión (SUP-05). Devuelve una copia nueva y nunca muta
// `actuales`. Una película solo entra una vez (SUP-02) y solo si cabe en lo que queda (RN-08).
export function agregarPelicula(
  actuales: readonly PeliculaEnSesion[],
  candidata: { tmdbId: number; titulo: string; posterUrl: string | null; minutos: number | null },
  disponible: number,
): ResultadoAgregarPelicula {
  if (actuales.some((pelicula) => pelicula.tmdbId === candidata.tmdbId)) {
    return { ok: false, motivo: 'duplicada' }
  }

  const { minutos } = candidata
  if (minutos === null) return { ok: false, motivo: 'sin_duracion' }

  const evaluacion = evaluarAgregar(
    disponible,
    actuales.map((pelicula) => pelicula.minutos),
    minutos,
  )
  if (!evaluacion.cabe) {
    return evaluacion.motivo === 'sin_duracion'
      ? { ok: false, motivo: 'sin_duracion' }
      : { ok: false, motivo: 'excede', faltan: evaluacion.faltan }
  }

  return {
    ok: true,
    peliculas: [
      ...actuales,
      {
        tmdbId: candidata.tmdbId,
        titulo: candidata.titulo,
        posterUrl: candidata.posterUrl,
        minutos,
      },
    ],
  }
}

// Las pausas no se restan aparte: se recalculan con la regla sobre las películas que quedan.
export function quitarPelicula(
  actuales: readonly PeliculaEnSesion[],
  tmdbId: number,
): PeliculaEnSesion[] {
  return actuales.filter((pelicula) => pelicula.tmdbId !== tmdbId)
}
