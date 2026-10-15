import type { Estado, ItemLista, TipoContenido } from '../domain/miLista'
import { supabase } from '../lib/supabase'

export interface NuevoItem {
  tmdbId: number
  titulo: string
  posterUrl: string | null
  tipo: TipoContenido
  estado: Estado
}

// No filtra por user_id: RLS ya limita el resultado a las filas del usuario autenticado.
export async function fetchMiLista(): Promise<ItemLista[]> {
  const { data, error } = await supabase
    .from('mi_lista')
    .select('*')
    .order('fecha_agregado', { ascending: false })

  if (error) throw new Error(error.message)
  return data as ItemLista[]
}

// user_id no se envía: la columna tiene default auth.uid() y la policy de insert lo valida.
export async function insertarEnLista(nuevo: NuevoItem): Promise<ItemLista> {
  const { data, error } = await supabase
    .from('mi_lista')
    .insert({
      tmdb_id: nuevo.tmdbId,
      titulo: nuevo.titulo,
      poster_url: nuevo.posterUrl,
      tipo_contenido: nuevo.tipo,
      estado: nuevo.estado,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ItemLista
}

// .select().single() hace que un update sin filas afectadas (RLS o id inexistente)
// falle en voz alta en vez de pasar como éxito silencioso.
export async function actualizarEstado(id: number, estado: Estado): Promise<ItemLista> {
  const { data, error } = await supabase
    .from('mi_lista')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ItemLista
}

export async function eliminarDeLista(id: number): Promise<void> {
  const { error } = await supabase.from('mi_lista').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
