import { describe, expect, it } from 'vitest'
import { ESTADOS, decidirCambioEstado, type Estado } from './miLista'

describe('decidirCambioEstado', () => {
  it.each(ESTADOS)('un título fuera de la lista se agrega directamente como «%s»', (nuevo) => {
    expect(decidirCambioEstado(null, nuevo)).toBe('agregar')
  })

  it.each<[Estado, Estado]>([
    ['vista', 'viendo'],
    ['vista', 'por_ver'],
    ['viendo', 'por_ver'],
    ['viendo', 'vista'],
    ['por_ver', 'viendo'],
    ['por_ver', 'vista'],
  ])('de «%s» a «%s» se cambia (el estado ya no solo avanza)', (actual, nuevo) => {
    expect(decidirCambioEstado(actual, nuevo)).toBe('cambiar')
  })

  it.each(ESTADOS)('elegir el estado que ya tiene («%s») no hace nada', (estado) => {
    expect(decidirCambioEstado(estado, estado)).toBe('ninguno')
  })
})
