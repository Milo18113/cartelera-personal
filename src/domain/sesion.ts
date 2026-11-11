// Sesión de «Noche de película»: lo que la persona arma y lo que queda guardado (PRD, E2).
// Los tipos viven aquí, en el dominio, para que ni los componentes ni el servicio de Supabase
// dependan de cómo se guardan las filas.

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
