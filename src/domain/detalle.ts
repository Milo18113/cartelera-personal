import type { TipoContenido } from './miLista'

export interface DetalleTitulo {
  tmdbId: number
  tipo: TipoContenido
  titulo: string
  // Póster grande (w500) para la página.
  posterUrl: string | null
  // Póster chico (w342): el mismo que usan las tarjetas y el que se guarda en mi_lista.
  posterListaUrl: string | null
  anio: string | null
  generos: string[]
  sinopsis: string
  // Calificación general de TMDB ya escalada a 0-5 (TMDB la entrega sobre 10).
  calificacion: number
  votos: number
  // Películas: "Dirigida por" (director). Series: "Creada por" (TMDB no da director de serie).
  creditos: { etiqueta: string; nombres: string[] }
  reparto: string[]
}
