import type { TipoContenido } from '../domain/miLista'

// Patrón de la ruta en App.tsx: /titulo/:tipo/:id
export function rutaDetalle(tipo: TipoContenido, tmdbId: number): string {
  return `/titulo/${tipo}/${tmdbId}`
}
