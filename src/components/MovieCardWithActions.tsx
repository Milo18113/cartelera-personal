import { CardActions } from './CardActions'
import { MovieCard, type TarjetaPelicula } from './MovieCard'

interface MovieCardWithActionsProps {
  pelicula: TarjetaPelicula
  busy: ReadonlySet<string>
  onAgregar: (pelicula: TarjetaPelicula) => void
  onEliminar: (pelicula: TarjetaPelicula) => void
}

// Tarjeta + su botón (agregar o quitar), compartida por las filas del inicio y la grilla de búsqueda.
export function MovieCardWithActions({
  pelicula,
  busy,
  onAgregar,
  onEliminar,
}: MovieCardWithActionsProps) {
  return (
    <MovieCard
      pelicula={pelicula}
      acciones={
        <CardActions
          enLista={pelicula.item !== undefined}
          titulo={pelicula.titulo}
          busy={busy.has(pelicula.clave)}
          onAgregar={() => onAgregar(pelicula)}
          onEliminar={() => onEliminar(pelicula)}
        />
      }
    />
  )
}
