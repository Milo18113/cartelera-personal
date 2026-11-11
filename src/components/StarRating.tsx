import { Star } from 'lucide-react'
import { ICON_PROPS } from './iconos'

interface StarRatingProps {
  // 0 a 5; admite decimales (3.6 llena 3 estrellas y el 60% de la cuarta).
  valor: number
  // 'chica' para las tarjetas; 'normal' (por defecto) para el detalle.
  tamano?: 'normal' | 'chica'
}

const ESTRELLAS = 5
// Lado del ícono según el tamaño; el CSS (.stars__star y .stars--chica) fija la caja con el mismo valor.
const TAMANO_ESTRELLA = { normal: 22, chica: 14 } as const

// El dibujo de la estrella (con su trazo) no ocupa toda la caja de 24x24 del ícono: va de
// ~5% a ~95% del ancho. Mapear la fracción a ese tramo hace que "60%" se vea como 60% de la
// estrella y no como 60% de una caja con aire a los lados.
const BORDE_ESTRELLA = 5

function anchoRelleno(fraccion: number): number {
  if (fraccion <= 0) return 0
  if (fraccion >= 1) return 100
  return BORDE_ESTRELLA + fraccion * (100 - 2 * BORDE_ESTRELLA)
}

// Cada estrella calcula su propio relleno: la vacía va debajo y la llena encima, recortada.
// No depende del ancho del contenedor ni de los huecos entre estrellas.
export function StarRating({ valor, tamano = 'normal' }: StarRatingProps) {
  const acotado = Math.min(Math.max(valor, 0), ESTRELLAS)
  const lado = TAMANO_ESTRELLA[tamano]

  return (
    <div
      className={tamano === 'chica' ? 'stars stars--chica' : 'stars'}
      role="img"
      aria-label={`${acotado.toFixed(1)} de ${ESTRELLAS} estrellas`}
    >
      {Array.from({ length: ESTRELLAS }, (_, i) => {
        // Parte de la nota que le toca a esta estrella: 0 (vacía) a 1 (llena).
        const fraccion = Math.min(Math.max(acotado - i, 0), 1)
        return (
          <span key={i} className="stars__star">
            <Star {...ICON_PROPS} size={lado} aria-hidden="true" />
            <span className="stars__fill" style={{ width: `${anchoRelleno(fraccion)}%` }}>
              <Star
                {...ICON_PROPS}
                size={lado}
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}
