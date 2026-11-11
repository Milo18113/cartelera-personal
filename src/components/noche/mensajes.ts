// Textos de «Noche de película» (spec, sección 6). Van aquí y no dispersos en los componentes
// para que cambiar una redacción sea tocar un solo archivo.
import type { Clasificacion, NoDisponible } from '../../domain/candidatas'
import {
  formatearMinutos,
  TIEMPO_MAXIMO,
  TIEMPO_MINIMO,
  type ResultadoTiempo,
} from '../../domain/nochePelicula'

type MotivoTiempoInvalido = Extract<ResultadoTiempo, { ok: false }>['motivo']

export function mensajeTiempo(motivo: MotivoTiempoInvalido): string {
  switch (motivo) {
    case 'vacio':
      return 'Escribe cuántos minutos tienes.'
    case 'no_entero':
      return 'Usa un número entero de minutos, sin decimales ni texto.'
    case 'fuera_de_rango':
      return `El tiempo debe estar entre ${TIEMPO_MINIMO} y ${TIEMPO_MAXIMO} minutos.`
  }
}

export function mensajeVacio(vacio: NonNullable<Clasificacion['vacio']>, minutos: number): string {
  if (vacio === 'sin_por_ver') {
    return 'No tienes películas por ver. Agrégalas desde el inicio.'
  }
  return `Ninguna de tus películas por ver cabe en ${formatearMinutos(minutos)}.`
}

export function mensajeNoDisponible(motivo: NoDisponible['motivo']): string {
  return motivo === 'sin_duracion'
    ? 'Sin duración conocida: no se puede agregar.'
    : 'No se pudo consultar la duración.'
}
