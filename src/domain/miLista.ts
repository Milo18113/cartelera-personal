export type Estado = 'por_ver' | 'viendo' | 'vista'
export type TipoContenido = 'pelicula' | 'serie'
export type FiltroEstado = Estado | 'todas'
export type CriterioOrden = 'fecha' | 'calificacion'

// Refleja las columnas de la tabla mi_lista (docs/schema.sql).
export interface ItemLista {
  id: number
  user_id: string
  tmdb_id: number
  titulo: string
  poster_url: string | null
  tipo_contenido: TipoContenido
  estado: Estado
  calificacion_personal: number | null
  comentario: string | null
  fecha_agregado: string
}

export const ESTADOS: readonly Estado[] = ['por_ver', 'viendo', 'vista']

// Se usa tanto en los chips de filtro como en el h2 de cada fila.
export const ETIQUETA_ESTADO: Record<Estado, string> = {
  por_ver: 'Pendientes',
  viendo: 'En progreso',
  vista: 'Vistas',
}

// ninguna lista (null) → por_ver → viendo → vista. "vista" es final: devuelve null.
const SIGUIENTE_ESTADO: Record<Estado, Estado | null> = {
  por_ver: 'viendo',
  viendo: 'vista',
  vista: null,
}

export function siguienteEstado(actual: Estado | null): Estado | null {
  return actual === null ? 'por_ver' : SIGUIENTE_ESTADO[actual]
}

// Para mostrar el estado de un solo título (pill del detalle).
export const ETIQUETA_ESTADO_SINGULAR: Record<Estado, string> = {
  por_ver: 'Pendiente',
  viendo: 'En progreso',
  vista: 'Vista',
}

export function contarPorEstado(items: readonly ItemLista[]): Record<Estado, number> {
  const conteo: Record<Estado, number> = { por_ver: 0, viendo: 0, vista: 0 }
  for (const item of items) conteo[item.estado] += 1
  return conteo
}

// Devuelve una copia ordenada; nunca muta el arreglo de entrada.
export function ordenarLista(
  items: readonly ItemLista[],
  criterio: CriterioOrden,
): ItemLista[] {
  const porFechaDesc = (a: ItemLista, b: ItemLista) =>
    Date.parse(b.fecha_agregado) - Date.parse(a.fecha_agregado)

  if (criterio === 'fecha') return [...items].sort(porFechaDesc)

  // Las sin calificar van al final; el empate se resuelve por fecha.
  return [...items].sort((a, b) => {
    const notaA = a.calificacion_personal ?? -1
    const notaB = b.calificacion_personal ?? -1
    return notaB - notaA || porFechaDesc(a, b)
  })
}

// TMDB reutiliza IDs entre películas y series, por eso el tipo forma parte de la clave.
export function claveTitulo(tipo: TipoContenido, tmdbId: number): string {
  return `${tipo}-${tmdbId}`
}
