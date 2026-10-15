import type { TarjetaPelicula } from '../components/MovieCard'
import { siguienteEstado } from '../domain/miLista'
import { useMiLista } from '../lista/useMiLista'

// Conecta los botones de una tarjeta con la lista. Lo comparten inicio y búsqueda.
export function useAccionesTarjeta() {
  const lista = useMiLista()

  // Click en el botón de estado: ninguna → por_ver (insert) y luego avanza (update).
  const onAvanzar = (pelicula: TarjetaPelicula) => {
    const siguiente = siguienteEstado(pelicula.item?.estado ?? null)
    if (siguiente === null) return

    if (pelicula.item) {
      void lista.cambiarEstado(pelicula.item, siguiente)
    } else {
      void lista.agregar({
        tmdbId: pelicula.tmdbId,
        titulo: pelicula.titulo,
        posterUrl: pelicula.posterUrl,
        tipo: pelicula.tipo,
        estado: siguiente,
      })
    }
  }

  const onEliminar = (pelicula: TarjetaPelicula) => {
    if (pelicula.item) void lista.eliminar(pelicula.item)
  }

  return { busy: lista.busy, actionError: lista.actionError, onAvanzar, onEliminar }
}
