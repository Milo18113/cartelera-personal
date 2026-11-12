import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFilaDesplazable } from '../hooks/useFilaDesplazable'
import { ICON_PROPS } from './iconos'
import type { TarjetaPelicula } from './MovieCard'
import { MovieCardSkeleton } from './MovieCardSkeleton'
import { MovieCardWithActions } from './MovieCardWithActions'

interface MovieRowProps {
  titulo: string
  peliculas: TarjetaPelicula[]
  loading: boolean
  error: string | null
  vacio: string
  busy: ReadonlySet<string>
  onAgregar: (pelicula: TarjetaPelicula) => void
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
  onAgregar,
  onEliminar,
}: MovieRowProps) {
  const { pistaRef, anteriorRef, siguienteRef, puedeAnterior, puedeSiguiente, desplazar } =
    // Las claves permiten saber cuándo llega una tarjeta nueva al principio de la fila.
    useFilaDesplazable(peliculas.map((pelicula) => pelicula.clave))

  return (
    <section className="row">
      <h2 className="row__title">{titulo}</h2>

      {error ? (
        <p role="alert" className="row__message row__message--error">
          {error}
        </p>
      ) : !loading && peliculas.length === 0 ? (
        <p className="row__message">{vacio}</p>
      ) : (
        // El viewport ancla las flechas sobre los bordes; la pista es lo que se desplaza.
        <div className="row__viewport">
          {/* Una flecha solo existe si hay más tarjetas hacia ese lado. Van antes de las tarjetas
              para que, con teclado, se alcancen primero: en pantalla da igual, están posicionadas
              de forma absoluta sobre los bordes de la fila. */}
          {puedeAnterior && (
            <button
              type="button"
              ref={anteriorRef}
              className="icon-btn row__flecha row__flecha--anterior"
              aria-label="Ver anteriores"
              onClick={() => desplazar('anterior')}
            >
              <ChevronLeft {...ICON_PROPS} aria-hidden="true" />
            </button>
          )}
          {puedeSiguiente && (
            <button
              type="button"
              ref={siguienteRef}
              className="icon-btn row__flecha row__flecha--siguiente"
              aria-label="Ver siguientes"
              onClick={() => desplazar('siguiente')}
            >
              <ChevronRight {...ICON_PROPS} aria-hidden="true" />
            </button>
          )}
          <div className="row__track" ref={pistaRef} aria-busy={loading}>
            {loading
              ? Array.from({ length: SKELETONS }, (_, i) => <MovieCardSkeleton key={i} />)
              : peliculas.map((pelicula) => (
                  <MovieCardWithActions
                    key={pelicula.clave}
                    pelicula={pelicula}
                    busy={busy}
                    onAgregar={onAgregar}
                    onEliminar={onEliminar}
                  />
                ))}
          </div>
        </div>
      )}
    </section>
  )
}
