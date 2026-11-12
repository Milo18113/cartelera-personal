import type { ReactNode } from 'react'

interface PeliculaFilaProps {
  titulo: string
  posterUrl: string | null
  // Línea bajo el título: la duración, o el motivo de no estar disponible.
  detalle: ReactNode
  // Botón de la derecha (agregar o quitar); sin él, la fila es solo informativa.
  accion?: ReactNode
}

// Una película en una lista compacta: póster chico, título, detalle y una acción opcional.
export function PeliculaFila({ titulo, posterUrl, detalle, accion }: PeliculaFilaProps) {
  return (
    <li className="fila">
      {posterUrl ? (
        <img className="fila__poster" src={posterUrl} alt="" loading="lazy" />
      ) : (
        <div className="fila__poster" aria-hidden="true" />
      )}
      <div className="fila__info">
        <h3 className="fila__titulo">{titulo}</h3>
        <p className="fila__detalle">{detalle}</p>
      </div>
      {accion && <div className="fila__accion">{accion}</div>}
    </li>
  )
}
