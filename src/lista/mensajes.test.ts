import { describe, expect, it } from 'vitest'
import { mensajeAgregada, mensajeMovida, mensajeQuitada } from './mensajes'

describe('mensajeAgregada', () => {
  it.each([
    ['por_ver', '“Dune” agregada a Pendientes'],
    ['viendo', '“Dune” agregada a En progreso'],
    ['vista', '“Dune” agregada a Vistas'],
  ] as const)('con el estado «%s»', (estado, esperado) => {
    expect(mensajeAgregada('Dune', estado)).toBe(esperado)
  })
})

describe('mensajeMovida', () => {
  it.each([
    ['por_ver', '“Dune” movida a Pendientes'],
    ['viendo', '“Dune” movida a En progreso'],
    ['vista', '“Dune” movida a Vistas'],
  ] as const)('con el estado «%s»', (estado, esperado) => {
    expect(mensajeMovida('Dune', estado)).toBe(esperado)
  })
})

describe('mensajeQuitada', () => {
  it('nombra el título y dice que ya no está en la lista', () => {
    expect(mensajeQuitada('Dune')).toBe('“Dune” quitada de tu lista')
  })
})

describe('el título', () => {
  it('va entre comillas inglesas y se conserva tal cual, con sus propios signos', () => {
    expect(mensajeQuitada('¿Qué pasó ayer? (2024)')).toBe(
      '“¿Qué pasó ayer? (2024)” quitada de tu lista',
    )
  })
})
