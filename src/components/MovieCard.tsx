import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { ItemLista, TipoContenido } from '../domain/miLista'
import { rutaDetalle } from '../lib/rutas'

export interface TarjetaPelicula {
  // claveTitulo(tipo, tmdbId): única dentro de una fila y usada para marcar acciones en curso.
  clave: string
  tmdbId: number
  tipo: TipoContenido
  titulo: string
  anio?: string | null
  posterUrl: string | null
  calificacion?: number | null
  // Presente solo si el título ya está en mi_lista; su estado define el botón.
  item?: ItemLista
}

interface MovieCardProps {
  pelicula: TarjetaPelicula
  // Botones que se dibujan encima del póster (esquina superior derecha).
  acciones?: ReactNode
}

export function MovieCard({ pelicula, acciones }: MovieCardProps) {
  const { titulo, anio, posterUrl, calificacion } = pelicula
  // El póster es lazy: hasta que baja, la tarjeta muestra el mismo shimmer que el esqueleto.
  const [posterTerminado, setPosterTerminado] = useState(false)
  const cargandoPoster = posterUrl !== null && !posterTerminado

  return (
    <article className={cargandoPoster ? 'card card--cargando' : 'card'}>
      {posterUrl ? (
        <img
          className="card__poster"
          src={posterUrl}
          alt={`Póster de ${titulo}`}
          loading="lazy"
          onLoad={() => setPosterTerminado(true)}
          // Si falla, se corta el shimmer; si no, quedaría cargando para siempre.
          onError={() => setPosterTerminado(true)}
        />
      ) : (
        <div className="card__poster card__poster--empty">{titulo}</div>
      )}

      {/* Link real (no onClick en el article): funciona con teclado, clic medio y "abrir en pestaña".
          Cubre toda la tarjeta; el overlay queda encima solo para los botones. */}
      <Link
        className="card__link"
        to={rutaDetalle(pelicula.tipo, pelicula.tmdbId)}
        aria-label={`Ver detalle de ${titulo}`}
      />

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
