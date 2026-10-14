import {
  ESTADOS,
  ETIQUETA_ESTADO,
  type CriterioOrden,
  type FiltroEstado,
} from '../domain/miLista'

interface FilterBarProps {
  filtro: FiltroEstado
  orden: CriterioOrden
  onFiltroChange: (filtro: FiltroEstado) => void
  onOrdenChange: (orden: CriterioOrden) => void
}

const OPCIONES_FILTRO: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  ...ESTADOS.map((estado) => ({ valor: estado, etiqueta: ETIQUETA_ESTADO[estado] })),
]

export function FilterBar({ filtro, orden, onFiltroChange, onOrdenChange }: FilterBarProps) {
  return (
    <div className="filters">
      <div className="filters__chips" role="group" aria-label="Filtrar por estado">
        {OPCIONES_FILTRO.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            className="chip"
            aria-pressed={filtro === valor}
            onClick={() => onFiltroChange(valor)}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <label className="filters__sort">
        Ordenar por
        <select value={orden} onChange={(e) => onOrdenChange(e.target.value as CriterioOrden)}>
          <option value="fecha">Más recientes</option>
          <option value="calificacion">Mi calificación</option>
        </select>
      </label>
    </div>
  )
}
