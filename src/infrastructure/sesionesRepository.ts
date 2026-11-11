import type { NuevaSesion, PeliculaEnSesion, SesionGuardada } from '../domain/sesion'
import { supabase } from '../lib/supabase'

// Filas tal como las devuelve la base. Se mapean a los tipos del dominio para que el resto de
// la app no conozca los nombres de las columnas.
interface FilaPelicula {
  tmdb_id: number
  titulo: string
  poster_url: string | null
  duracion_min: number
  orden: number
}

interface FilaSesion {
  id: number
  nombre: string
  tiempo_disponible: number
  creada_en: string
  sesion_peliculas: FilaPelicula[]
}

// Una sola consulta trae la sesión con sus películas (relación sesion_peliculas -> sesiones).
const COLUMNAS =
  'id, nombre, tiempo_disponible, creada_en, sesion_peliculas(tmdb_id, titulo, poster_url, duracion_min, orden)'

function aPelicula(fila: FilaPelicula): PeliculaEnSesion {
  return {
    tmdbId: fila.tmdb_id,
    titulo: fila.titulo,
    posterUrl: fila.poster_url,
    minutos: fila.duracion_min,
  }
}

function aSesion(fila: FilaSesion): SesionGuardada {
  return {
    id: fila.id,
    nombre: fila.nombre,
    tiempoDisponible: fila.tiempo_disponible,
    creadaEn: fila.creada_en,
    // El orden también se pide a la base, pero aquí se asegura: el resultado no debe depender
    // de cómo se resolvió la consulta.
    peliculas: [...fila.sesion_peliculas].sort((a, b) => a.orden - b.orden).map(aPelicula),
  }
}

// Una sola llamada a la función guardar_sesion: la sesión y todas sus películas se guardan en
// una transacción, o no se guarda nada. user_id no se envía: la base lo toma de la sesión.
export async function guardarSesion(nueva: NuevaSesion): Promise<number> {
  const { data, error } = await supabase.rpc('guardar_sesion', {
    p_nombre: nueva.nombre,
    p_tiempo_disponible: nueva.tiempoDisponible,
    p_peliculas: nueva.peliculas.map((pelicula) => ({
      tmdb_id: pelicula.tmdbId,
      titulo: pelicula.titulo,
      poster_url: pelicula.posterUrl,
      duracion_min: pelicula.minutos,
    })),
  })

  if (error) throw new Error(error.message)
  return data as number
}

// No filtra por user_id: RLS ya limita el resultado a las sesiones de quien pregunta.
// De la más reciente a la más antigua.
export async function fetchSesiones(): Promise<SesionGuardada[]> {
  const { data, error } = await supabase
    .from('sesiones')
    .select(COLUMNAS)
    .order('creada_en', { ascending: false })
    .order('orden', { referencedTable: 'sesion_peliculas' })

  if (error) throw new Error(error.message)
  return (data as FilaSesion[]).map(aSesion)
}

// null si no existe o si es de otra persona: RLS la oculta y se ve igual que una inexistente
// (HU-05-C3), sin revelar que existe.
export async function fetchSesion(id: number): Promise<SesionGuardada | null> {
  const { data, error } = await supabase
    .from('sesiones')
    .select(COLUMNAS)
    .eq('id', id)
    .order('orden', { referencedTable: 'sesion_peliculas' })
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data === null ? null : aSesion(data as FilaSesion)
}
