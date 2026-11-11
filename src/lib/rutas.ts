import type { TipoContenido } from '../domain/miLista'

// Patrón de la ruta en App.tsx: /titulo/:tipo/:id
export function rutaDetalle(tipo: TipoContenido, tmdbId: number): string {
  return `/titulo/${tipo}/${tmdbId}`
}

// Noche de película (E2). Patrones en App.tsx: /noche, /noche/sesiones y /noche/sesiones/:id
export function rutaNoche(): string {
  return '/noche'
}

export function rutaSesiones(): string {
  return '/noche/sesiones'
}

export function rutaSesion(id: number): string {
  return `/noche/sesiones/${id}`
}
