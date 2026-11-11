// Qué películas de la lista se ofrecen para armar una sesión y en qué orden (HU-01).
// Funciones puras: reciben la lista, las duraciones ya consultadas y el tiempo disponible.
import type { DuracionPelicula } from './duracionPelicula'
import type { ItemLista } from './miLista'
import { evaluarAgregar } from './nochePelicula'

export interface Candidata {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  minutos: number
}

export interface NoDisponible {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  motivo: 'sin_duracion' | 'error_consulta'
}

export interface Clasificacion {
  candidatas: Candidata[]
  noDisponibles: NoDisponible[]
  // 'sin_por_ver': la lista no tiene películas por ver. 'ninguna_cabe': las hay, pero ninguna
  // se ofrece. null si hay al menos una candidata. Solo es significativo cuando las duraciones
  // ya cargaron: mientras se consultan, la pantalla muestra «cargando» en lugar de este valor.
  vacio: 'sin_por_ver' | 'ninguna_cabe' | null
}

// DEC-02: la que lleva más tiempo en la lista va primero; si empatan, por título. Si una
// fecha no se pudiera leer, la resta da NaN, que `||` trata como empate y pasa al título.
function porAntiguedad(a: ItemLista, b: ItemLista): number {
  return (
    Date.parse(a.fecha_agregado) - Date.parse(b.fecha_agregado) ||
    a.titulo.localeCompare(b.titulo, 'es')
  )
}

// Solo películas (las series quedan fuera, RN-03) en estado «por ver», ya ordenadas.
// `filter` devuelve un arreglo nuevo, así que ordenar no toca el de entrada.
export function peliculasPorVer(items: readonly ItemLista[]): ItemLista[] {
  return items
    .filter((item) => item.tipo_contenido === 'pelicula' && item.estado === 'por_ver')
    .sort(porAntiguedad)
}

// Separa lo que se ofrece de lo que no está disponible. La clave del mapa es el tmdbId: es
// segura porque `peliculasPorVer` ya descartó las series, y TMDB solo repite IDs entre
// películas y series. Una película sin entrada en el mapa aún no se consultó y se omite.
export function clasificarCandidatas(
  porVer: readonly ItemLista[],
  duraciones: ReadonlyMap<number, DuracionPelicula>,
  disponible: number,
): Clasificacion {
  const candidatas: Candidata[] = []
  const noDisponibles: NoDisponible[] = []

  for (const item of [...porVer].sort(porAntiguedad)) {
    const duracion = duraciones.get(item.tmdb_id)
    if (duracion === undefined) continue

    const base = { tmdbId: item.tmdb_id, titulo: item.titulo, posterUrl: item.poster_url }

    if (duracion.estado === 'error') {
      noDisponibles.push({ ...base, motivo: 'error_consulta' })
    } else if (duracion.estado === 'sin_duracion') {
      noDisponibles.push({ ...base, motivo: 'sin_duracion' })
    } else {
      // «Cabe sola» es la misma regla que agregar a una sesión vacía: no se duplica la cuenta.
      const evaluacion = evaluarAgregar(disponible, [], duracion.minutos)
      if (evaluacion.cabe) {
        candidatas.push({ ...base, minutos: duracion.minutos })
      } else if (evaluacion.motivo === 'sin_duracion') {
        // Defensa: un 'ok' con minutos <= 0 no debería existir, pero no se ofrece.
        noDisponibles.push({ ...base, motivo: 'sin_duracion' })
      }
      // 'excede': dura más que todo el tiempo disponible; no se ofrece (SUP-03).
    }
  }

  const vacio =
    porVer.length === 0 ? 'sin_por_ver' : candidatas.length === 0 ? 'ninguna_cabe' : null
  return { candidatas, noDisponibles, vacio }
}
