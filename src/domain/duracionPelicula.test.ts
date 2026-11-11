import { describe, expect, it } from 'vitest'
import { normalizarRuntime } from './duracionPelicula'

describe('normalizarRuntime', () => {
  it('una duración real es ok', () => {
    expect(normalizarRuntime(142)).toEqual({ estado: 'ok', minutos: 142 })
  })

  it.each([0, null, undefined, -5, Number.NaN, Number.POSITIVE_INFINITY])(
    '%s es sin duración',
    (runtime) => {
      expect(normalizarRuntime(runtime)).toEqual({ estado: 'sin_duracion' })
    },
  )

  it('redondea un valor con decimales para no romper la base de datos', () => {
    expect(normalizarRuntime(142.4)).toEqual({ estado: 'ok', minutos: 142 })
    expect(normalizarRuntime(142.5)).toEqual({ estado: 'ok', minutos: 143 })
  })

  it('un valor que redondea a 0 es sin duración', () => {
    expect(normalizarRuntime(0.4)).toEqual({ estado: 'sin_duracion' })
  })
})
