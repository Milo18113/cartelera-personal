import { formatearMinutos } from '../../domain/nochePelicula'
import { mensajeExcede } from './mensajes'

interface ResumenTiempoProps {
  total: number
  // null mientras no hay un tiempo válido; negativo si la sesión se pasa.
  restante: number | null
}

// Duración total y tiempo restante, siempre a la vista. Los cálculos llegan hechos desde el
// dominio: este componente solo los muestra.
export function ResumenTiempo({ total, restante }: ResumenTiempoProps) {
  return (
    // aria-live: un lector de pantalla anuncia los totales cuando cambian al agregar o quitar.
    <div className="resumen" aria-live="polite">
      <div className="resumen__pills">
        <span className="pill pill--ninguna">Duración total: {formatearMinutos(total)}</span>
        {restante !== null && restante >= 0 && (
          <span className="pill pill--ninguna">Te quedan {formatearMinutos(restante)}</span>
        )}
      </div>
      {restante === null && <p>Indica un tiempo válido para ver cuánto te queda.</p>}
      {restante !== null && restante < 0 && (
        <p role="alert" className="alert alert--error">
          {mensajeExcede(-restante)}
        </p>
      )}
    </div>
  )
}
