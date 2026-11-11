import { useState, type ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ItemLista, TipoContenido } from '../domain/miLista'
import { rutaDetalle } from '../lib/rutas'
import { ICON_PROPS } from './iconos'
import { StarRating } from './StarRating'

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
  // Controles que se dibujan encima del póster (aparecen con hover o foco).
  acciones?: ReactNode
}

export function MovieCard({ pelicula, acciones }: MovieCardProps) {
  const { titulo, anio, posterUrl, calificacion } = pelicula
  // El póster es lazy: hasta que baja, el recuadro muestra el mismo shimmer que el esqueleto.
  const [posterTerminado, setPosterTerminado] = useState(false)
  const cargandoPoster = posterUrl !== null && !posterTerminado
  // Las tarjetas de mi lista no traen año (mi_lista no lo guarda) ni todas tienen calificación.
  const hayMeta = Boolean(anio) || (calificacion !== null && calificacion !== undefined)

  return (
    <article className="card">
      <div className={cargandoPoster ? 'card__media skeleton' : 'card__media'}>
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
          // Sin póster: un ícono en lugar de repetir el título, que ya se ve debajo.
          <div className="card__poster card__poster--empty">
            <ImageOff {...ICON_PROPS} size={32} aria-hidden="true" />
          </div>
        )}

        {/* El overlay va sobre el póster (position: absolute) y aparece con hover/focus. Lleva
            solo los controles: título, año y calificación ya están siempre visibles abajo. */}
        <div className="card__overlay">
          <div className="card__actions">{acciones}</div>
        </div>
      </div>

      <div className="card__info">
        <h3 className="card__title">{titulo}</h3>
        {/* div y no p: StarRating es un div, y un div dentro de un p es HTML inválido. */}
        {hayMeta && (
          <div className="card__meta">
            {anio && <span>{anio}</span>}
            {calificacion !== null && calificacion !== undefined && (
              <StarRating valor={calificacion} tamano="chica" />
            )}
          </div>
        )}
      </div>

      {/* Link real (no onClick en el article): funciona con teclado, clic medio y "abrir en pestaña".
          Cubre toda la tarjeta, título incluido; el overlay queda encima solo para los botones. */}
      <Link
        className="card__link"
        to={rutaDetalle(pelicula.tipo, pelicula.tmdbId)}
        aria-label={`Ver detalle de ${titulo}`}
      />
    </article>
  )
}
