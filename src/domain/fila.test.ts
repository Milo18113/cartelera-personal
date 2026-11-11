import { describe, expect, it } from 'vitest'
import { extremosDeFila, llegoNuevaAlInicio, pasoDeDesplazamiento } from './fila'

describe('extremosDeFila', () => {
  it('al inicio solo hay «siguiente»', () => {
    expect(extremosDeFila(0, 500, 1500)).toEqual({ anterior: false, siguiente: true })
  })

  it('a la mitad hay las dos', () => {
    expect(extremosDeFila(400, 500, 1500)).toEqual({ anterior: true, siguiente: true })
  })

  it('al final solo hay «anterior»', () => {
    // scrollLeft + clientWidth llega justo a scrollWidth.
    expect(extremosDeFila(1000, 500, 1500)).toEqual({ anterior: true, siguiente: false })
  })

  it('si las tarjetas caben completas no hay ninguna', () => {
    expect(extremosDeFila(0, 500, 500)).toEqual({ anterior: false, siguiente: false })
    expect(extremosDeFila(0, 800, 500)).toEqual({ anterior: false, siguiente: false })
  })

  it('tolera 1 px de redondeo al final', () => {
    // 999.6 + 500 = 1499.6: a 0.4 px del final, que cuenta como llegado.
    expect(extremosDeFila(999.6, 500, 1500).siguiente).toBe(false)
  })

  it('tolera 1 px de redondeo al inicio', () => {
    expect(extremosDeFila(0.5, 500, 1500).anterior).toBe(false)
  })

  it('un desplazamiento de más de 1 px sí cuenta', () => {
    expect(extremosDeFila(2, 500, 1500).anterior).toBe(true)
    expect(extremosDeFila(990, 500, 1500).siguiente).toBe(true)
  })

  it('una fila que desborda por 1 px o menos no se considera desplazable', () => {
    expect(extremosDeFila(0, 500, 500.8)).toEqual({ anterior: false, siguiente: false })
  })
})

describe('pasoDeDesplazamiento', () => {
  it('es el 90 % del ancho visible', () => {
    expect(pasoDeDesplazamiento(1000)).toBe(900)
  })

  it('siempre es menor que el ancho visible, para no perder la última tarjeta', () => {
    expect(pasoDeDesplazamiento(500)).toBeLessThan(500)
  })
})

describe('llegoNuevaAlInicio', () => {
  it('llega una tarjeta nueva al principio: la fila debe volver al inicio', () => {
    expect(llegoNuevaAlInicio(['a', 'b'], ['c', 'a', 'b'])).toBe(true)
  })

  it('sin cambios no hay nada nuevo', () => {
    expect(llegoNuevaAlInicio(['a', 'b'], ['a', 'b'])).toBe(false)
  })

  it('si se quita la primera, la que queda primero ya estaba: no se mueve', () => {
    expect(llegoNuevaAlInicio(['a', 'b', 'c'], ['b', 'c'])).toBe(false)
  })

  it('un reorden no trae nada nuevo', () => {
    expect(llegoNuevaAlInicio(['a', 'b'], ['b', 'a'])).toBe(false)
  })

  it('una tarjeta que llega al final no mueve la fila', () => {
    expect(llegoNuevaAlInicio(['a'], ['a', 'b'])).toBe(false)
  })

  it('si se quita una del medio o del final no se mueve', () => {
    expect(llegoNuevaAlInicio(['a', 'b', 'c'], ['a', 'c'])).toBe(false)
    expect(llegoNuevaAlInicio(['a', 'b', 'c'], ['a', 'b'])).toBe(false)
  })

  it('una fila que queda vacía no tiene primera tarjeta', () => {
    expect(llegoNuevaAlInicio(['a'], [])).toBe(false)
  })

  it('la primera carga de una fila vacía cuenta como nueva (sin efecto: ya está al inicio)', () => {
    expect(llegoNuevaAlInicio([], ['a', 'b'])).toBe(true)
  })

  it('se quita la última y llega una nueva al inicio a la vez: sí vuelve', () => {
    expect(llegoNuevaAlInicio(['a', 'b'], ['c', 'a'])).toBe(true)
  })
})
