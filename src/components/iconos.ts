import { Clock, Eye, Play, Plus, Trash2, type LucideIcon } from 'lucide-react'
import type { Estado } from '../domain/miLista'

// Todos los íconos salen de lucide (misma familia) con el mismo tamaño y trazo,
// para que pills, botones y futuras vistas se vean como un solo set.
export const ICON_PROPS = { size: 18, strokeWidth: 2 } as const

export const ICONO_ESTADO: Record<Estado, LucideIcon> = {
  por_ver: Clock,
  viendo: Play,
  vista: Eye,
}

export const ICONO_AGREGAR: LucideIcon = Plus
export const ICONO_ELIMINAR: LucideIcon = Trash2
