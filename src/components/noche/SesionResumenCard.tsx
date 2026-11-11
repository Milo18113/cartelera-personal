import { Link } from 'react-router-dom'
import { duracionTotal, formatearMinutos } from '../../domain/nochePelicula'
import type { SesionGuardada } from '../../domain/sesion'
import { rutaSesion } from '../../lib/rutas'
import { formatoFecha, textoPeliculas } from './formato'

interface SesionResumenCardProps {
  sesion: SesionGuardada
}

// Un renglón de «Mis sesiones»: nombre, fecha y duración total. Todo el renglón es un enlace
// al detalle (igual que las tarjetas de película, funciona con teclado y «abrir en pestaña»).
export function SesionResumenCard({ sesion }: SesionResumenCardProps) {
  const total = duracionTotal(sesion.peliculas.map((pelicula) => pelicula.minutos))

  return (
    <li>
      <Link className="sesion-card" to={rutaSesion(sesion.id)}>
        <span className="sesion-card__nombre">{sesion.nombre}</span>
        <span className="sesion-card__meta">
          {formatoFecha(sesion.creadaEn)} · {textoPeliculas(sesion.peliculas.length)} ·{' '}
          {formatearMinutos(total)}
        </span>
      </Link>
    </li>
  )
}
