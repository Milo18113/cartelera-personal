import type { ItemLista } from '../domain/miLista'
import { supabase } from '../lib/supabase'

// No filtra por user_id: RLS ya limita el resultado a las filas del usuario autenticado.
export async function fetchMiLista(): Promise<ItemLista[]> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('*')
    .order('fecha_agregado', { ascending: false })

  if (error) throw new Error(error.message)
  return data as ItemLista[]
}
