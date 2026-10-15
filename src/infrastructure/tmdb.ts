import type { ConsultaBusqueda } from '../domain/busqueda'
import type { DetalleTitulo } from '../domain/detalle'
import { claveTitulo, type TipoContenido } from '../domain/miLista'

const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'
// Reparto mostrado en el detalle: los primeros del crédito (TMDB ya los ordena por importancia).
const MAX_REPARTO = 12
// /popular pagina de a 20; elegir una página al azar da variedad sin necesitar otro endpoint.
const PAGINAS_POPULARES = 20

export interface TituloTmdb {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  anio: string | null
  tipo: TipoContenido
  popularidad: number
}

export interface PaginaBusqueda {
  items: TituloTmdb[]
  hayMas: boolean
}

interface TmdbPagina<T> {
  results: T[]
  total_pages: number
}

interface TmdbMovie {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
  popularity: number
}

interface TmdbSerie {
  id: number
  name: string
  poster_path: string | null
  first_air_date?: string
  popularity: number
}

// w342 para tarjetas (y es lo que se guarda en mi_lista); w500 para el póster grande del detalle.
interface TmdbCreditos {
  cast: { name: string }[]
  crew: { name: string; job: string }[]
}

// Campos comunes de /movie/{id} y /tv/{id} con append_to_response=credits.
interface TmdbDetalleBase {
  id: number
  poster_path: string | null
  overview: string
  genres: { name: string }[]
  vote_average: number
  vote_count: number
  credits: TmdbCreditos
}

interface TmdbDetalleMovie extends TmdbDetalleBase {
  title: string
  release_date?: string
}

interface TmdbDetalleSerie extends TmdbDetalleBase {
  name: string
  first_air_date?: string
  created_by: { name: string }[]
}

export function posterUrl(
  posterPath: string | null,
  ancho: 'w342' | 'w500' = 'w342',
): string | null {
  return posterPath ? `${IMAGE_BASE}/${ancho}${posterPath}` : null
}

async function tmdbGet<T>(
  ruta: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  if (!apiKey) throw new Error('Falta VITE_TMDB_API_KEY en .env')

  const query = new URLSearchParams({
    api_key: apiKey,
    language: 'es-ES',
    include_adult: 'false',
    ...params,
  })
  const response = await fetch(`${API_BASE}${ruta}?${query}`, { signal })
  if (!response.ok) throw new Error(`TMDB respondió con estado ${response.status}`)
  return (await response.json()) as T
}

function deMovie(movie: TmdbMovie): TituloTmdb {
  return {
    tmdbId: movie.id,
    titulo: movie.title,
    posterUrl: posterUrl(movie.poster_path),
    anio: movie.release_date ? movie.release_date.slice(0, 4) : null,
    tipo: 'pelicula',
    popularidad: movie.popularity,
  }
}

function deSerie(serie: TmdbSerie): TituloTmdb {
  return {
    tmdbId: serie.id,
    titulo: serie.name,
    posterUrl: posterUrl(serie.poster_path),
    anio: serie.first_air_date ? serie.first_air_date.slice(0, 4) : null,
    tipo: 'serie',
    popularidad: serie.popularity,
  }
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

export async function fetchRecomendacionesPeliculas(): Promise<TituloTmdb[]> {
  const pagina = 1 + Math.floor(Math.random() * PAGINAS_POPULARES)
  const data = await tmdbGet<TmdbPagina<TmdbMovie>>('/movie/popular', { page: String(pagina) })
  return mezclar(data.results).map(deMovie)
}

// Con póster primero (una tarjeta sin imagen se ve rota) y luego por popularidad.
function ordenarPorRelevancia(titulos: TituloTmdb[]): TituloTmdb[] {
  return [...titulos].sort(
    (a, b) =>
      Number(b.posterUrl !== null) - Number(a.posterUrl !== null) ||
      b.popularidad - a.popularidad,
  )
}

function deduplicar(titulos: TituloTmdb[]): TituloTmdb[] {
  const vistos = new Map<string, TituloTmdb>()
  for (const titulo of titulos) {
    const clave = claveTitulo(titulo.tipo, titulo.tmdbId)
    if (!vistos.has(clave)) vistos.set(clave, titulo)
  }
  return [...vistos.values()]
}

// Búsqueda en dos grupos que se piden en paralelo:
//   1. texto completo (siempre): encuentra títulos que contienen números, como "Blade Runner 2049".
//   2. con el año como filtro (solo si hay año candidato): "matrix 1999" → Matrix filtrada a 1999.
//      Si solo se escribió un año, se usa /discover para listar lo estrenado ese año.
// El grupo 1 va primero: el año nunca puede esconder una coincidencia de título.
export async function buscarTitulos(
  consulta: ConsultaBusqueda,
  pagina: number,
  signal?: AbortSignal,
): Promise<PaginaBusqueda> {
  const page = String(pagina)

  const grupoTexto = Promise.all([
    tmdbGet<TmdbPagina<TmdbMovie>>('/search/movie', { query: consulta.textoCompleto, page }, signal),
    tmdbGet<TmdbPagina<TmdbSerie>>('/search/tv', { query: consulta.textoCompleto, page }, signal),
  ])

  const { anio, textoSinAnio } = consulta
  let grupoAnio: Promise<[TmdbPagina<TmdbMovie>, TmdbPagina<TmdbSerie>]> | null = null
  if (anio !== null) {
    const year = String(anio)
    grupoAnio =
      textoSinAnio === ''
        ? Promise.all([
            tmdbGet<TmdbPagina<TmdbMovie>>(
              '/discover/movie',
              { primary_release_year: year, sort_by: 'popularity.desc', page },
              signal,
            ),
            tmdbGet<TmdbPagina<TmdbSerie>>(
              '/discover/tv',
              { first_air_date_year: year, sort_by: 'popularity.desc', page },
              signal,
            ),
          ])
        : Promise.all([
            tmdbGet<TmdbPagina<TmdbMovie>>(
              '/search/movie',
              { query: textoSinAnio, year, page },
              signal,
            ),
            tmdbGet<TmdbPagina<TmdbSerie>>(
              '/search/tv',
              { query: textoSinAnio, first_air_date_year: year, page },
              signal,
            ),
          ])
  }

  const [respuestasTexto, respuestasAnio] = await Promise.all([grupoTexto, grupoAnio])

  const porTexto = ordenarPorRelevancia([
    ...respuestasTexto[0].results.map(deMovie),
    ...respuestasTexto[1].results.map(deSerie),
  ])
  const porAnio = respuestasAnio
    ? ordenarPorRelevancia([
        ...respuestasAnio[0].results.map(deMovie),
        ...respuestasAnio[1].results.map(deSerie),
      ])
    : []

  const totalPaginas = Math.max(
    ...[...respuestasTexto, ...(respuestasAnio ?? [])].map((r) => r.total_pages),
  )

  return { items: deduplicar([...porTexto, ...porAnio]), hayMas: pagina < totalPaginas }
}

// Una sola llamada trae datos + créditos (append_to_response) en vez de dos peticiones.
export async function fetchDetalleTitulo(
  tipo: TipoContenido,
  tmdbId: number,
  signal?: AbortSignal,
): Promise<DetalleTitulo> {
  const ruta = tipo === 'pelicula' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`
  const data = await tmdbGet<TmdbDetalleMovie | TmdbDetalleSerie>(
    ruta,
    { append_to_response: 'credits' },
    signal,
  )

  // TMDB devuelve la sinopsis vacía cuando no hay traducción al español: cae al inglés.
  let sinopsis = data.overview.trim()
  if (!sinopsis) {
    const original = await tmdbGet<{ overview: string }>(ruta, { language: 'en-US' }, signal)
    sinopsis = original.overview.trim()
  }

  const base = {
    tmdbId,
    tipo,
    posterUrl: posterUrl(data.poster_path, 'w500'),
    posterListaUrl: posterUrl(data.poster_path),
    generos: data.genres.map((g) => g.name),
    sinopsis,
    calificacion: data.vote_average / 2,
    votos: data.vote_count,
    reparto: data.credits.cast.slice(0, MAX_REPARTO).map((c) => c.name),
  }

  if ('title' in data) {
    return {
      ...base,
      titulo: data.title,
      anio: data.release_date ? data.release_date.slice(0, 4) : null,
      creditos: {
        etiqueta: 'Dirigida por',
        nombres: data.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name),
      },
    }
  }
  return {
    ...base,
    titulo: data.name,
    anio: data.first_air_date ? data.first_air_date.slice(0, 4) : null,
    creditos: { etiqueta: 'Creada por', nombres: data.created_by.map((c) => c.name) },
  }
}
