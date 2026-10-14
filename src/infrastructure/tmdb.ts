import type { TipoContenido } from '../domain/miLista'

const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'
// /popular pagina de a 20; elegir una página al azar da variedad sin necesitar otro endpoint.
const PAGINAS_POPULARES = 20

export interface TituloRecomendado {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  anio: string | null
  tipo: TipoContenido
}

interface TmdbMovie {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
}

export function posterUrl(posterPath: string | null): string | null {
  return posterPath ? `${IMAGE_BASE}${posterPath}` : null
}

// Fisher-Yates: un sort con Math.random() sesga el resultado.
function mezclar<T>(items: readonly T[]): T[] {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

export async function fetchRecomendacionesPeliculas(): Promise<TituloRecomendado[]> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  if (!apiKey) throw new Error('Falta VITE_TMDB_API_KEY en .env')

  const pagina = 1 + Math.floor(Math.random() * PAGINAS_POPULARES)
  const params = new URLSearchParams({ api_key: apiKey, language: 'es-ES', page: String(pagina) })
  const response = await fetch(`${API_BASE}/movie/popular?${params}`)
  if (!response.ok) throw new Error(`TMDB respondió con estado ${response.status}`)

  const data = (await response.json()) as { results: TmdbMovie[] }
  return mezclar(data.results).map((movie) => ({
    tmdbId: movie.id,
    titulo: movie.title,
    posterUrl: posterUrl(movie.poster_path),
    anio: movie.release_date ? movie.release_date.slice(0, 4) : null,
    tipo: 'pelicula',
  }))
}
