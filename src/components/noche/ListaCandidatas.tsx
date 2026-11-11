import type { ReactNode } from 'react'
import { Clock } from 'lucide-react'
import type { Candidata } from '../../domain/candidatas'
import { formatearMinutos } from '../../domain/nochePelicula'
import { ICON_PROPS } from '../iconos'
import { PeliculaFila } from './PeliculaFila'

interface ListaCandidatasProps {
  candidatas: readonly Candidata[]
  // Cada pantalla decide qué botón lleva la fila (agregar a la sesión, por ejemplo).
  accionPara?: (candidata: Candidata) => ReactNode
}

export function ListaCandidatas({ candidatas, accionPara }: ListaCandidatasProps) {
  return (
    <ul className="noche__lista">
      {candidatas.map((candidata) => (
        <PeliculaFila
          key={candidata.tmdbId}
          titulo={candidata.titulo}
          posterUrl={candidata.posterUrl}
          detalle={
            <>
              <Clock {...ICON_PROPS} aria-hidden="true" />
              {formatearMinutos(candidata.minutos)}
            </>
          }
          accion={accionPara?.(candidata)}
        />
      ))}
    </ul>
  )
}
