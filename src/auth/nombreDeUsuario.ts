import type { User } from '@supabase/supabase-js'

// El nombre se guarda en user_metadata.display_name al registrarse.
// Las cuentas creadas antes de ese campo caen al prefijo del correo.
export function nombreDeUsuario(user: User | null): string {
  const displayName: unknown = user?.user_metadata?.display_name
  if (typeof displayName === 'string' && displayName.trim()) return displayName.trim()
  return user?.email?.split('@')[0] ?? ''
}
