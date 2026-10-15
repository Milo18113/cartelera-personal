import { useState } from 'react'
import { Star } from 'lucide-react'
import { ICON_PROPS } from './iconos'

interface RatingInputProps {
  // 1 a 5, o null si aún no la calificas.
  valor: number | null
  disabled: boolean
  onChange: (valor: number | null) => void
}

const ESTRELLAS = 5
const TAMANO_ESTRELLA = 32

// Estrellas clicables, solo enteros. Click en la estrella ya elegida quita la calificación
// (la columna calificacion_personal admite null).
export function RatingInput({ valor, disabled, onChange }: RatingInputProps) {
  // Vista previa al pasar el mouse; null cuando el cursor no está sobre las estrellas.
  const [vistaPrevia, setVistaPrevia] = useState<number | null>(null)
  const mostrado = vistaPrevia ?? valor ?? 0

  return (
    <div className="rating-input">
      <div
        className="rating-input__stars"
        role="group"
        aria-label="Mi calificación"
        onMouseLeave={() => setVistaPrevia(null)}
      >
        {Array.from({ length: ESTRELLAS }, (_, i) => {
          const n = i + 1
          return (
            <button
              key={n}
              type="button"
              className="rating-input__star"
              data-activa={n <= mostrado}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              aria-pressed={valor === n}
              disabled={disabled}
              onMouseEnter={() => setVistaPrevia(n)}
              onClick={() => {
                // Sin esto, tras quitar la nota seguiría la vista previa llena bajo el cursor.
                setVistaPrevia(null)
                onChange(valor === n ? null : n)
              }}
            >
              <Star
                {...ICON_PROPS}
                size={TAMANO_ESTRELLA}
                fill={n <= mostrado ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
      <p className="rating-input__text">{valor === null ? 'Sin calificar' : `${valor} de 5`}</p>
    </div>
  )
}
