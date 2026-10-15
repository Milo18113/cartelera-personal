import type { TarjetaPelicula } from './MovieCard'
import { MovieCardWithActions } from './MovieCardWithActions'

interface MovieRowProps {
  titulo: string
  peliculas: TarjetaPelicula[]
  loading: boolean
  error: string | null
  vacio: string
  busy: ReadonlySet<string>
  onAvanzar: (pelicula: TarjetaPelicula) => void
  onEliminar: (pelicula: TarjetaPelicula) => void
}

const SKELETONS = 8

export function MovieRow({
  titulo,
  peliculas,
  loading,
  error,
  vacio,
  busy,
  onAvanzar,
  onEliminar,
}: MovieRowProps) {
  return (
    <section className="row">
      <h2 className="row__title">{titulo}</h2>

      {error ? (
        <p role="alert" className="row__message row__message--error">
          {error}
        </p>
      ) : loading ? (
        <div className="row__track" aria-busy="true">
          {Array.from({ length: SKELETONS }, (_, i) => (
            <div key={i} className="card card--skeleton" />
          ))}
        </div>
      ) : peliculas.length === 0 ? (
        <p className="row__message">{vacio}</p>
      ) : (
        <div className="row__track">
          {peliculas.map((pelicula) => (
            <MovieCardWithActions
              key={pelicula.clave}
              pelicula={pelicula}
              busy={busy}
              onAvanzar={onAvanzar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}
    </section>
  )
}
