// Duración de una película según TMDB. Vive en el dominio (y no en infrastructure/tmdb.ts)
// porque la regla «0 o ausente es sin duración» es del negocio, no del servicio externo.

export type DuracionPelicula =
  | { estado: 'ok'; minutos: number }
  | { estado: 'sin_duracion' }
  // La consulta falló (red, TMDB caído): se puede reintentar. No es lo mismo que sin_duracion.
  | { estado: 'error' }

// runtime de TMDB: 0, null o ausente = sin duración conocida (SUP-08). TMDB entrega enteros;
// el redondeo evita que un valor con decimales rompa la columna entera de la base de datos.
export function normalizarRuntime(runtime: number | null | undefined): DuracionPelicula {
  if (typeof runtime !== 'number' || !Number.isFinite(runtime)) return { estado: 'sin_duracion' }

  const minutos = Math.round(runtime)
  if (minutos <= 0) return { estado: 'sin_duracion' }
  return { estado: 'ok', minutos }
}
