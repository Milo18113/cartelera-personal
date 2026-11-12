import { describe, expect, it } from 'vitest'
import {
  cabe,
  duracionTotal,
  evaluarAgregar,
  formatearMinutos,
  PAUSA_MINUTOS,
  tiempoRestante,
  validarTiempoDisponible,
} from './nochePelicula'

describe('validarTiempoDisponible', () => {
  it('rechaza vacío y solo espacios', () => {
    expect(validarTiempoDisponible('')).toEqual({ ok: false, motivo: 'vacio' })
    expect(validarTiempoDisponible('   ')).toEqual({ ok: false, motivo: 'vacio' })
  })

  it.each(['90,5', '90.5', 'una hora', '1e2', '12abc', '9 0'])(
    'rechaza «%s» como no entero',
    (entrada) => {
      expect(validarTiempoDisponible(entrada)).toEqual({ ok: false, motivo: 'no_entero' })
    },
  )

  it.each(['29', '601', '0', '-5', '99999999999999999999'])(
    'rechaza «%s» por estar fuera de 30 a 600',
    (entrada) => {
      expect(validarTiempoDisponible(entrada)).toEqual({ ok: false, motivo: 'fuera_de_rango' })
    },
  )

  it('acepta los dos extremos del rango', () => {
    expect(validarTiempoDisponible('30')).toEqual({ ok: true, minutos: 30 })
    expect(validarTiempoDisponible('600')).toEqual({ ok: true, minutos: 600 })
  })

  it('acepta ceros a la izquierda y espacios alrededor', () => {
    expect(validarTiempoDisponible('090')).toEqual({ ok: true, minutos: 90 })
    expect(validarTiempoDisponible(' 120 ')).toEqual({ ok: true, minutos: 120 })
  })
})

describe('duracionTotal', () => {
  it('una sesión vacía dura 0', () => {
    expect(duracionTotal([])).toBe(0)
  })

  it('una sola película no lleva pausa', () => {
    expect(duracionTotal([100])).toBe(100)
  })

  it('suma las duraciones y una pausa por cada película después de la primera', () => {
    // 90 + 100 + 120 = 310, más 2 pausas de 10 = 330 (ejemplo del PRD).
    expect(duracionTotal([90, 100, 120])).toBe(330)
  })

  it('con pausa 0 es solo la suma', () => {
    expect(duracionTotal([90, 100, 120], 0)).toBe(310)
  })

  it('usa la pausa que se le pasa, no una fija', () => {
    expect(duracionTotal([60, 60], 25)).toBe(145)
  })

  it('no muta el arreglo de entrada', () => {
    const duraciones = [90, 100, 120]
    duracionTotal(duraciones)
    expect(duraciones).toEqual([90, 100, 120])
  })

  it('la pausa por defecto es de 10 minutos (RN-05)', () => {
    expect(PAUSA_MINUTOS).toBe(10)
  })
})

describe('cabe y tiempoRestante', () => {
  it('una sesión que ocupa exactamente el tiempo cabe y no sobra nada', () => {
    expect(cabe(330, [90, 100, 120])).toBe(true)
    expect(tiempoRestante(330, [90, 100, 120])).toBe(0)
  })

  it('un minuto menos y ya no cabe', () => {
    expect(cabe(329, [90, 100, 120])).toBe(false)
    expect(tiempoRestante(329, [90, 100, 120])).toBe(-1)
  })

  it('una sola película igual al tiempo cabe, sin pausa', () => {
    expect(cabe(100, [100])).toBe(true)
    expect(tiempoRestante(100, [100])).toBe(0)
  })

  it('una sesión vacía deja todo el tiempo disponible', () => {
    expect(cabe(120, [])).toBe(true)
    expect(tiempoRestante(120, [])).toBe(120)
  })

  it('al bajar el tiempo, una sesión armada puede dejar de caber', () => {
    expect(cabe(200, [100, 95])).toBe(false)
    expect(tiempoRestante(200, [100, 95])).toBe(-5)
  })
})

describe('evaluarAgregar', () => {
  it('a una sesión vacía no le suma pausa', () => {
    expect(evaluarAgregar(100, [], 100)).toEqual({ cabe: true, restante: 0 })
  })

  it('una película que cabe justo en lo que queda', () => {
    // 100 + 10 + 90 = 200.
    expect(evaluarAgregar(200, [100], 90)).toEqual({ cabe: true, restante: 0 })
  })

  it('una que no cabe dice cuántos minutos faltan, pausa incluida', () => {
    // 100 + 10 + 95 = 205 contra 200 disponibles (ejemplo del PRD).
    expect(evaluarAgregar(200, [100], 95)).toEqual({ cabe: false, motivo: 'excede', faltan: 5 })
  })

  it('una película más larga que todo el tiempo no cabe ni sola', () => {
    expect(evaluarAgregar(90, [], 120)).toEqual({ cabe: false, motivo: 'excede', faltan: 30 })
  })

  it.each([null, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'la duración %s se trata como sin duración',
    (nueva) => {
      expect(evaluarAgregar(200, [], nueva)).toEqual({ cabe: false, motivo: 'sin_duracion' })
    },
  )

  it('no muta las duraciones actuales', () => {
    const actuales = [100]
    evaluarAgregar(200, actuales, 50)
    expect(actuales).toEqual([100])
  })
})

describe('formatearMinutos', () => {
  it.each([
    [0, '0 min'],
    [45, '45 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [120, '2 h'],
    [605, '10 h 5 min'],
  ])('%i -> %s', (minutos, esperado) => {
    expect(formatearMinutos(minutos)).toBe(esperado)
  })
})
