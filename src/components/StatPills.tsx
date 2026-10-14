import { Clock, Eye, Play } from 'lucide-react'
import type { Estado } from '../domain/miLista'

interface StatPillsProps {
  conteo: Record<Estado, number>
}

const PILLS = [
  { estado: 'por_ver', Icono: Clock, singular: 'pendiente', plural: 'pendientes' },
  { estado: 'viendo', Icono: Play, singular: 'en progreso', plural: 'en progreso' },
  { estado: 'vista', Icono: Eye, singular: 'vista', plural: 'vistas' },
] as const

export function StatPills({ conteo }: StatPillsProps) {
  return (
    <ul className="pills" aria-label="Resumen de tu lista">
      {PILLS.map(({ estado, Icono, singular, plural }) => (
        <li key={estado} className={`pill pill--${estado}`}>
          <Icono size={16} aria-hidden="true" />
          <strong>{conteo[estado]}</strong> {conteo[estado] === 1 ? singular : plural}
        </li>
      ))}
    </ul>
  )
}
