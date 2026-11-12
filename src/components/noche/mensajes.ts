// Textos de «Noche de película» (spec, sección 6). Van aquí y no dispersos en los componentes
// para que cambiar una redacción sea tocar un solo archivo.
import type { Clasificacion, NoDisponible } from '../../domain/candidatas'
import {
  formatearMinutos,
  PAUSA_MINUTOS,
  TIEMPO_MAXIMO,
  TIEMPO_MINIMO,
  type ResultadoTiempo,
} from '../../domain/nochePelicula'
import { NOMBRE_MAXIMO, type ResultadoAgregar } from '../../domain/sesion'

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

// Por qué no se agregó una película a la sesión. `hayPausa` es verdadero cuando la sesión ya
// tenía alguna película: solo entonces la pausa forma parte de lo que falta.
export function mensajeAgregar(
  rechazo: Extract<ResultadoAgregar, { ok: false }>,
  titulo: string,
  hayPausa: boolean,
): string {
  switch (rechazo.motivo) {
    case 'duplicada':
      return `“${titulo}” ya está en tu sesión.`
    case 'sin_duracion':
      return 'Sin duración conocida: no se puede agregar.'
    case 'sin_tiempo':
      return 'Indica un tiempo válido para armar tu sesión.'
    case 'excede': {
      const pausa = hayPausa ? ` (incluye la pausa de ${PAUSA_MINUTOS} min)` : ''
      return `“${titulo}” no cabe: faltan ${rechazo.faltan} min${pausa}.`
    }
  }
}

// La sesión armada deja de caber cuando se baja el tiempo disponible (HU-02-C8).
export function mensajeExcede(minutos: number): string {
  return `Tu sesión se pasa por ${minutos} min. Quita películas para poder guardarla.`
}

export function mensajeNombreLargo(): string {
  return `El nombre admite hasta ${NOMBRE_MAXIMO} caracteres.`
}

export const MENSAJE_AGREGA_UNA = 'Agrega al menos una película para guardar.'
export const MENSAJE_SIN_TIEMPO_GUARDAR = 'Indica un tiempo válido para guardar.'
export const MENSAJE_GUARDADA = 'Sesión guardada.'
export const MENSAJE_SIN_SESIONES = 'Aún no tienes sesiones guardadas.'
export const MENSAJE_SESION_INEXISTENTE = 'No encontramos esa sesión.'
