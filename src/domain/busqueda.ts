export interface ConsultaBusqueda {
  // Lo que escribió el usuario, tal cual (normalizado). Siempre se busca con esto.
  textoCompleto: string
  // El texto sin el año candidato; vacío si el usuario escribió solo un año.
  textoSinAnio: string
  // Año candidato. Es una pista, nunca un filtro obligatorio (ver interpretarBusqueda).
  anio: number | null
}

// 1888: primera película registrada. Cualquier número menor no puede ser un año de estreno.
const ANIO_MINIMO = 1888

// Devuelve null si la entrada es demasiado corta para buscar.
//
// El año solo cuenta como candidato si es plausible (hasta el año actual + 1). Por eso
// "blade runner 2049" no se interpreta como año: 2049 queda como parte del título.
// Aun siendo candidato (1984, 2001...), el texto completo se busca igual, porque puede
// ser parte del título ("Wonder Woman 1984" se estrenó en 2020).
export function interpretarBusqueda(
  entrada: string,
  anioActual: number = new Date().getFullYear(),
): ConsultaBusqueda | null {
  const textoCompleto = entrada.trim().replace(/\s+/g, ' ')
  if (textoCompleto.length < 2) return null

  const candidatos = [...textoCompleto.matchAll(/\b\d{4}\b/g)]
    .map((coincidencia) => Number(coincidencia[0]))
    .filter((numero) => numero >= ANIO_MINIMO && numero <= anioActual + 1)
  const anio = candidatos.at(-1) ?? null

  // Quita el año y los paréntesis que lo rodeen: "matrix (1999)" → "matrix".
  const textoSinAnio =
    anio === null
      ? textoCompleto
      : textoCompleto
          .replace(new RegExp(`\\(?\\b${anio}\\b\\)?`), '')
          .replace(/\s+/g, ' ')
          // Sobras de puntuación: "2001: a space odyssey" → "a space odyssey".
          .replace(/^[\s:,\-–]+|[\s:,\-–]+$/g, '')

  return { textoCompleto, textoSinAnio, anio }
}
