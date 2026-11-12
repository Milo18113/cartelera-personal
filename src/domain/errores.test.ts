import { describe, expect, it } from 'vitest'
import { MENSAJE_SIN_CONEXION, esErrorDeConexion, mensajeDeError } from './errores'

describe('esErrorDeConexion', () => {
  it('reconoce el mensaje de Chrome, con o sin el prefijo de supabase-js', () => {
    expect(esErrorDeConexion('Failed to fetch')).toBe(true)
    expect(esErrorDeConexion('TypeError: Failed to fetch')).toBe(true)
  })

  it('reconoce el mensaje de Firefox', () => {
    expect(esErrorDeConexion('NetworkError when attempting to fetch resource.')).toBe(true)
  })

  it('reconoce el mensaje de Safari', () => {
    expect(esErrorDeConexion('Load failed')).toBe(true)
  })

  it('no distingue mayúsculas', () => {
    expect(esErrorDeConexion('FAILED TO FETCH')).toBe(true)
    expect(esErrorDeConexion('networkerror')).toBe(true)
  })

  it('un error del servidor no es de conexión: hubo respuesta', () => {
    expect(esErrorDeConexion('TMDB respondió con estado 500')).toBe(false)
  })

  it('un error de la base de datos tampoco', () => {
    expect(
      esErrorDeConexion('duplicate key value violates unique constraint "mi_lista_unique"'),
    ).toBe(false)
  })

  it('el texto vacío no es de conexión', () => {
    expect(esErrorDeConexion('')).toBe(false)
  })
})

describe('mensajeDeError', () => {
  it('cambia el texto técnico de conexión por el mensaje amable', () => {
    expect(mensajeDeError('TypeError: Failed to fetch')).toBe(MENSAJE_SIN_CONEXION)
    expect(mensajeDeError('Load failed')).toBe(MENSAJE_SIN_CONEXION)
  })

  it('deja igual cualquier otro mensaje', () => {
    expect(mensajeDeError('TMDB respondió con estado 500')).toBe('TMDB respondió con estado 500')
    expect(mensajeDeError('')).toBe('')
  })

  it('el mensaje amable no tiene texto técnico', () => {
    expect(MENSAJE_SIN_CONEXION).toBe('No se pudo conectar con el servidor.')
    expect(esErrorDeConexion(MENSAJE_SIN_CONEXION)).toBe(false)
  })
})
