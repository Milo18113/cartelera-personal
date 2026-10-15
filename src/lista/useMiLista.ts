import { useContext } from 'react'
import { MiListaContext, type MiListaContextValue } from './miListaContextValue'

export function useMiLista(): MiListaContextValue {
  const ctx = useContext(MiListaContext)
  if (!ctx) throw new Error('useMiLista debe usarse dentro de <MiListaProvider>')
  return ctx
}
