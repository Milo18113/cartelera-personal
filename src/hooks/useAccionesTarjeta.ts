import type { TarjetaPelicula } from '../components/MovieCard'
import { decidirCambioEstado, type Estado } from '../domain/miLista'
import { useMiLista } from '../lista/useMiLista'

// Conecta los controles de una tarjeta con la lista. Lo comparten inicio, búsqueda y detalle.
export function useAccionesTarjeta() {
  const lista = useMiLista()

  // Elegir un estado en el selector: agrega el título si aún no está en la lista y, si ya está,
  // lo cambia. Elegir el estado que ya tiene no hace ninguna petición.
  const onCambiarEstado = (pelicula: TarjetaPelicula, estado: Estado) => {
    const { item } = pelicula

    switch (decidirCambioEstado(item?.estado ?? null, estado)) {
      case 'ninguno':
        return
      case 'cambiar':
        if (item) void lista.cambiarEstado(item, estado)
        return
      case 'agregar':
        void lista.agregar({
          tmdbId: pelicula.tmdbId,
          titulo: pelicula.titulo,
          posterUrl: pelicula.posterUrl,
          tipo: pelicula.tipo,
          estado,
        })
        return
    }
  }

  const onEliminar = (pelicula: TarjetaPelicula) => {
    if (pelicula.item) void lista.eliminar(pelicula.item)
  }

  return { busy: lista.busy, actionError: lista.actionError, onCambiarEstado, onEliminar }
}
