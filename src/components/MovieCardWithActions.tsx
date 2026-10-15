import { CardActions } from './CardActions'
import { MovieCard, type TarjetaPelicula } from './MovieCard'

interface MovieCardWithActionsProps {
  pelicula: TarjetaPelicula
  busy: ReadonlySet<string>
  onAvanzar: (pelicula: TarjetaPelicula) => void
  onEliminar: (pelicula: TarjetaPelicula) => void
}

// Tarjeta + sus botones, compartida por las filas del inicio y la grilla de búsqueda.
export function MovieCardWithActions({
  pelicula,
  busy,
  onAvanzar,
  onEliminar,
}: MovieCardWithActionsProps) {
  return (
    <MovieCard
      pelicula={pelicula}
      acciones={
        <CardActions
          estado={pelicula.item?.estado ?? null}
          busy={busy.has(pelicula.clave)}
          onAvanzar={() => onAvanzar(pelicula)}
          onEliminar={() => onEliminar(pelicula)}
        />
      }
    />
  )
}
