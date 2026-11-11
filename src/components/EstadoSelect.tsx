import { ChevronDown } from 'lucide-react'
import { ESTADOS, ETIQUETA_ESTADO_SINGULAR, type Estado } from '../domain/miLista'
import { ICONO_AGREGAR, ICONO_ESTADO, ICON_PROPS } from './iconos'

interface EstadoSelectProps {
  // null = el título no está en mi lista.
  estado: Estado | null
  // Nombra el título en la etiqueta accesible: sin ella, varios selectores iguales no se distinguen.
  titulo: string
  variante: 'tarjeta' | 'detalle'
  busy: boolean
  disabled?: boolean
  onCambiar: (estado: Estado) => void
}

// Valor de la opción inicial «Agregar a…»: no es un estado, por eso no se puede elegir.
const SIN_ESTADO = ''

// Elegir el estado de un título: cualquiera de los tres, desde cualquier otro. Es un <select>
// nativo (accesible por teclado y lector de pantalla, abre el selector del sistema en el celular
// y no lo recorta el overflow de la tarjeta); el ícono y la flecha son propios.
export function EstadoSelect({
  estado,
  titulo,
  variante,
  busy,
  disabled,
  onCambiar,
}: EstadoSelectProps) {
  const Icono = estado === null ? ICONO_AGREGAR : ICONO_ESTADO[estado]
  const etiqueta = estado === null ? `Agregar “${titulo}” a mi lista` : `Estado de “${titulo}”`

  return (
    <span
      className={`estado-select estado-select--${estado ?? 'ninguna'} estado-select--${variante}`}
    >
      <Icono {...ICON_PROPS} aria-hidden="true" />
      <select
        className="estado-select__control"
        aria-label={etiqueta}
        aria-busy={busy}
        disabled={busy || disabled}
        value={estado ?? SIN_ESTADO}
        onChange={(e) => {
          // Se busca entre los estados válidos en lugar de forzar el tipo con un cast.
          const elegido = ESTADOS.find((valor) => valor === e.target.value)
          if (elegido) onCambiar(elegido)
        }}
      >
        {estado === null && (
          <option value={SIN_ESTADO} disabled>
            Agregar a…
          </option>
        )}
        {ESTADOS.map((valor) => (
          <option key={valor} value={valor}>
            {ETIQUETA_ESTADO_SINGULAR[valor]}
          </option>
        ))}
      </select>
      <ChevronDown {...ICON_PROPS} aria-hidden="true" />
    </span>
  )
}
