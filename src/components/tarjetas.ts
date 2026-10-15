import { claveTitulo, type ItemLista } from '../domain/miLista'
import type { TituloTmdb } from '../infrastructure/tmdb'
import type { TarjetaPelicula } from './MovieCard'

export function tarjetaDeItem(item: ItemLista): TarjetaPelicula {
  return {
    clave: claveTitulo(item.tipo_contenido, item.tmdb_id),
    tmdbId: item.tmdb_id,
    tipo: item.tipo_contenido,
    titulo: item.titulo,
    posterUrl: item.poster_url,
    calificacion: item.calificacion_personal,
    item,
  }
}

// `item` se pasa cuando el título ya está en mi lista, para que la tarjeta muestre su estado.
export function tarjetaDeTitulo(titulo: TituloTmdb, item?: ItemLista): TarjetaPelicula {
  return {
    clave: claveTitulo(titulo.tipo, titulo.tmdbId),
    tmdbId: titulo.tmdbId,
    tipo: titulo.tipo,
    titulo: titulo.titulo,
    anio: titulo.anio,
    posterUrl: titulo.posterUrl,
    calificacion: item?.calificacion_personal,
    item,
  }
}
