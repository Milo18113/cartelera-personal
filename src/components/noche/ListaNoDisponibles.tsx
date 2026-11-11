import type { NoDisponible } from '../../domain/candidatas'
import { mensajeNoDisponible } from './mensajes'
import { PeliculaFila } from './PeliculaFila'

interface ListaNoDisponiblesProps {
  items: readonly NoDisponible[]
  onReintentar: () => void
}

export function ListaNoDisponibles({ items, onReintentar }: ListaNoDisponiblesProps) {
  // Un solo «Reintentar» para toda la lista: vuelve a pedir únicamente las que fallaron.
  const hayErrores = items.some((item) => item.motivo === 'error_consulta')

  return (
    <section className="noche__seccion">
      <h2 className="noche__subtitulo">No disponibles</h2>
      <ul className="noche__lista">
        {items.map((item) => (
          <PeliculaFila
            key={item.tmdbId}
            titulo={item.titulo}
            posterUrl={item.posterUrl}
            detalle={mensajeNoDisponible(item.motivo)}
          />
        ))}
      </ul>
      {hayErrores && (
        <button type="button" className="btn btn--ghost noche__reintentar" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </section>
  )
}
