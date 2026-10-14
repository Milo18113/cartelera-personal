import type { ReactNode } from 'react'
import { Star } from 'lucide-react'

export interface TarjetaPelicula {
  clave: string
  titulo: string
  anio?: string | null
  posterUrl: string | null
  calificacion?: number | null
}

interface MovieCardProps {
  pelicula: TarjetaPelicula
  // Botones que se dibujan encima del póster (esquina superior). Se conectan después.
  acciones?: ReactNode
}

export function MovieCard({ pelicula, acciones }: MovieCardProps) {
  const { titulo, anio, posterUrl, calificacion } = pelicula

  return (
    <article className="card">
      {posterUrl ? (
        <img className="card__poster" src={posterUrl} alt={`Póster de ${titulo}`} loading="lazy" />
      ) : (
        <div className="card__poster card__poster--empty">{titulo}</div>
      )}

      {/* El overlay va sobre el póster (position: absolute) y aparece con hover/focus. */}
      <div className="card__overlay">
        <div className="card__actions">{acciones}</div>
        <div className="card__info">
          <h3 className="card__title">{titulo}</h3>
          <p className="card__meta">
            {anio}
            {calificacion != null && (
              <span className="card__rating">
                <Star size={12} fill="currentColor" aria-hidden="true" /> {calificacion}/5
              </span>
            )}
          </p>
        </div>
      </div>
    </article>
  )
}
