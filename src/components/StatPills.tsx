import type { Estado } from '../domain/miLista'
import { EstadoPill } from './EstadoPill'

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
      {PILLS.map(({ estado, singular, plural }) => (
        <li key={estado}>
          <EstadoPill estado={estado}>
            <strong>{conteo[estado]}</strong> {conteo[estado] === 1 ? singular : plural}
          </EstadoPill>
        </li>
      ))}
    </ul>
  )
}
