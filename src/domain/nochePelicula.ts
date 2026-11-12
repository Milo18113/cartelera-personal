// Regla de negocio de «Noche de película» (PRD, RN-02 a RN-08). Funciones puras: sin red, sin
// base de datos y sin fecha del sistema. Cada una recibe todo lo que necesita por parámetro
// (el tiempo, las duraciones y la pausa), así los tests no necesitan nada más que números.

export const PAUSA_MINUTOS = 10
export const TIEMPO_MINIMO = 30
export const TIEMPO_MAXIMO = 600

export type ResultadoTiempo =
  { ok: true; minutos: number } | { ok: false; motivo: 'vacio' | 'no_entero' | 'fuera_de_rango' }

export type EvaluacionAgregar =
  | { cabe: true; restante: number }
  | { cabe: false; motivo: 'sin_duracion' }
  | { cabe: false; motivo: 'excede'; faltan: number }

// Entero con signo opcional. Deja fuera los decimales ("90,5", "90.5"), la notación científica
// ("1e2") y el texto ("una hora"): todos son «no entero». El signo se acepta para que "-5" se
// reporte como fuera de rango y no como un formato desconocido.
const ENTERO = /^[+-]?\d+$/

// Valida lo que escribió la persona (RN-02). Los ceros a la izquierda se aceptan: "090" es 90.
export function validarTiempoDisponible(entrada: string): ResultadoTiempo {
  const texto = entrada.trim()
  if (texto === '') return { ok: false, motivo: 'vacio' }
  if (!ENTERO.test(texto)) return { ok: false, motivo: 'no_entero' }

  const minutos = Number(texto)
  if (minutos < TIEMPO_MINIMO || minutos > TIEMPO_MAXIMO) {
    return { ok: false, motivo: 'fuera_de_rango' }
  }
  return { ok: true, minutos }
}

// Suma de duraciones más una pausa por cada película después de la primera (RN-05 y RN-07).
// Una sesión vacía dura 0; con una sola película no hay pausa.
export function duracionTotal(
  duraciones: readonly number[],
  pausa: number = PAUSA_MINUTOS,
): number {
  if (duraciones.length === 0) return 0
  const suma = duraciones.reduce((acumulado, minutos) => acumulado + minutos, 0)
  return suma + pausa * (duraciones.length - 1)
}

// Negativo significa que la sesión se pasa por esa cantidad de minutos.
export function tiempoRestante(
  disponible: number,
  duraciones: readonly number[],
  pausa: number = PAUSA_MINUTOS,
): number {
  return disponible - duracionTotal(duraciones, pausa)
}

// El límite exacto cabe (RN-06): se compara con <=, no con <.
export function cabe(
  disponible: number,
  duraciones: readonly number[],
  pausa: number = PAUSA_MINUTOS,
): boolean {
  return duracionTotal(duraciones, pausa) <= disponible
}

// Una duración null, 0, negativa o NaN equivale a «sin duración conocida» (RN-04, SUP-08).
function esDuracionValida(minutos: number | null): minutos is number {
  return minutos !== null && Number.isFinite(minutos) && minutos > 0
}

// ¿Cabe `nueva` en lo que queda de la sesión? `faltan` ya incluye la pausa que se sumaría.
export function evaluarAgregar(
  disponible: number,
  duraciones: readonly number[],
  nueva: number | null,
  pausa: number = PAUSA_MINUTOS,
): EvaluacionAgregar {
  if (!esDuracionValida(nueva)) return { cabe: false, motivo: 'sin_duracion' }

  const total = duracionTotal([...duraciones, nueva], pausa)
  if (total > disponible) return { cabe: false, motivo: 'excede', faltan: total - disponible }
  return { cabe: true, restante: disponible - total }
}

// 45 -> "45 min" · 90 -> "1 h 30 min" · 120 -> "2 h".
export function formatearMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}
