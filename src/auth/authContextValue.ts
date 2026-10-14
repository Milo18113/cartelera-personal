import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface SignUpResult {
  needsEmailConfirmation: boolean
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Separado del Provider: eslint-plugin-react-refresh exige que los archivos
// de componentes exporten solo componentes (si no, rompe el Fast Refresh).
export const AuthContext = createContext<AuthContextValue | null>(null)
