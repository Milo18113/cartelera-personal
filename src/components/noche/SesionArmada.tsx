import type { ReactNode } from 'react'
import { Clock } from 'lucide-react'
import { formatearMinutos } from '../../domain/nochePelicula'
import type { PeliculaEnSesion } from '../../domain/sesion'
import { ICON_PROPS } from '../iconos'
import { PeliculaFila } from './PeliculaFila'
import { ResumenTiempo } from './ResumenTiempo'

interface SesionArmadaProps {
  peliculas: readonly PeliculaEnSesion[]
  total: number
  restante: number | null
  // Por qué no se agregó la última película, si no se pudo.
  aviso: string | null
  onQuitar: (tmdbId: number) => void
  // Lo que va al pie de la sesión: el formulario para guardarla.
  children?: ReactNode
}

export function SesionArmada({
  peliculas,
  total,
  restante,
  aviso,
  onQuitar,
  children,
}: SesionArmadaProps) {
  return (
    <section className="noche__seccion">
      <h2 className="noche__subtitulo">Tu sesión</h2>

      {aviso && (
        <p role="alert" className="alert alert--error">
          {aviso}
        </p>
      )}

      {peliculas.length === 0 ? (
        <p className="status-message">Aún no agregaste películas.</p>
      ) : (
        <ul className="noche__lista">
          {peliculas.map((pelicula, indice) => (
            <PeliculaFila
              key={pelicula.tmdbId}
              // El número deja claro el orden en que se verán (SUP-05).
              titulo={`${indice + 1}. ${pelicula.titulo}`}
              posterUrl={pelicula.posterUrl}
              detalle={
                <>
                  <Clock {...ICON_PROPS} aria-hidden="true" />
                  {formatearMinutos(pelicula.minutos)}
                </>
              }
              accion={
                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-label={`Quitar ${pelicula.titulo}`}
                  onClick={() => onQuitar(pelicula.tmdbId)}
                >
                  Quitar
                </button>
              }
            />
          ))}
        </ul>
      )}

      <ResumenTiempo total={total} restante={restante} />

      {children}
    </section>
  )
}
