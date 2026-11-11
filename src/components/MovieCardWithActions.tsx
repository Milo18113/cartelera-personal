import type { Estado } from '../domain/miLista'
import { CardActions } from './CardActions'
import { MovieCard, type TarjetaPelicula } from './MovieCard'

interface MovieCardWithActionsProps {
  pelicula: TarjetaPelicula
  busy: ReadonlySet<string>
  onCambiarEstado: (pelicula: TarjetaPelicula, estado: Estado) => void
  onEliminar: (pelicula: TarjetaPelicula) => void
}

// Tarjeta + sus controles, compartida por las filas del inicio y la grilla de búsqueda.
export function MovieCardWithActions({
  pelicula,
  busy,
  onCambiarEstado,
  onEliminar,
}: MovieCardWithActionsProps) {
  return (
    <MovieCard
      pelicula={pelicula}
      acciones={
        <CardActions
          estado={pelicula.item?.estado ?? null}
          titulo={pelicula.titulo}
          busy={busy.has(pelicula.clave)}
          onCambiarEstado={(estado) => onCambiarEstado(pelicula, estado)}
          onEliminar={() => onEliminar(pelicula)}
        />
      }
    />
  )
}
