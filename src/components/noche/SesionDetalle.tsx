import { Clock } from 'lucide-react'
import { duracionTotal, formatearMinutos, tiempoRestante } from '../../domain/nochePelicula'
import type { SesionGuardada } from '../../domain/sesion'
import { ICON_PROPS } from '../iconos'
import { formatoFecha, textoPeliculas } from './formato'
import { PeliculaFila } from './PeliculaFila'

interface SesionDetalleProps {
  sesion: SesionGuardada
}

// Una sesión guardada, solo para leer: lo que se ve es la copia de cuando se armó (DEC-04) y
// no hay forma de modificarla ni de eliminarla (DEC-03).
export function SesionDetalle({ sesion }: SesionDetalleProps) {
  const duraciones = sesion.peliculas.map((pelicula) => pelicula.minutos)
  const total = duracionTotal(duraciones)
  const sobrante = tiempoRestante(sesion.tiempoDisponible, duraciones)

  return (
    <section className="noche__seccion">
      <header className="noche__seccion">
        <h1 className="noche__title">{sesion.nombre}</h1>
        <p>
          Guardada el {formatoFecha(sesion.creadaEn)} · {textoPeliculas(sesion.peliculas.length)}
        </p>
      </header>

      <div className="resumen__pills">
        <span className="pill pill--ninguna">Duración total: {formatearMinutos(total)}</span>
        <span className="pill pill--ninguna">
          Tiempo disponible: {formatearMinutos(sesion.tiempoDisponible)}
        </span>
        <span className="pill pill--ninguna">Sobraban {formatearMinutos(sobrante)}</span>
      </div>

      <ol className="noche__lista">
        {sesion.peliculas.map((pelicula, indice) => (
          <PeliculaFila
            key={pelicula.tmdbId}
            titulo={`${indice + 1}. ${pelicula.titulo}`}
            posterUrl={pelicula.posterUrl}
            detalle={
              <>
                <Clock {...ICON_PROPS} aria-hidden="true" />
                {formatearMinutos(pelicula.minutos)}
              </>
            }
          />
        ))}
      </ol>
    </section>
  )
}
