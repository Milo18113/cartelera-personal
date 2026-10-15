import type { Estado } from '../domain/miLista'
import { ICONO_ESTADO, ICON_PROPS } from './iconos'

interface StatPillsProps {
  conteo: Record<Estado, number>
}

const PILLS = [
  { estado: 'por_ver', singular: 'pendiente', plural: 'pendientes' },
  { estado: 'viendo', singular: 'en progreso', plural: 'en progreso' },
  { estado: 'vista', singular: 'vista', plural: 'vistas' },
] as const

export function StatPills({ conteo }: StatPillsProps) {
  return (
    <ul className="pills" aria-label="Resumen de tu lista">
      {PILLS.map(({ estado, singular, plural }) => {
        const Icono = ICONO_ESTADO[estado]
        return (
          <li key={estado} className={`pill pill--${estado}`}>
            <Icono {...ICON_PROPS} aria-hidden="true" />
            <strong>{conteo[estado]}</strong> {conteo[estado] === 1 ? singular : plural}
          </li>
        )
      })}
    </ul>
  )
}
