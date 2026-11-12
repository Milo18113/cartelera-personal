import { describe, expect, it } from 'vitest'
import { clasificarCandidatas, peliculasPorVer } from './candidatas'
import type { DuracionPelicula } from './duracionPelicula'
import type { ItemLista } from './miLista'

let siguienteId = 1

function item(cambios: Partial<ItemLista> = {}): ItemLista {
  const id = siguienteId++
  return {
    id,
    user_id: 'usuario-a',
    tmdb_id: id,
    titulo: `Película ${id}`,
    poster_url: null,
    tipo_contenido: 'pelicula',
    estado: 'por_ver',
    calificacion_personal: null,
    comentario: null,
    fecha_agregado: '2026-01-01T00:00:00Z',
    ...cambios,
  }
}

const ok = (minutos: number): DuracionPelicula => ({ estado: 'ok', minutos })

describe('peliculasPorVer', () => {
  it('descarta las series y los estados distintos de por ver', () => {
    const peli = item()
    const serie = item({ tipo_contenido: 'serie' })
    const viendo = item({ estado: 'viendo' })
    const vista = item({ estado: 'vista' })

    expect(peliculasPorVer([serie, viendo, peli, vista])).toEqual([peli])
  })

  it('ordena de la más antigua en la lista a la más reciente', () => {
    const reciente = item({ fecha_agregado: '2026-03-01T00:00:00Z' })
    const antigua = item({ fecha_agregado: '2025-01-01T00:00:00Z' })
    const media = item({ fecha_agregado: '2026-01-01T00:00:00Z' })

    expect(peliculasPorVer([reciente, antigua, media])).toEqual([antigua, media, reciente])
  })

  it('si empatan en fecha, desempata por título', () => {
    const fecha = '2026-01-01T00:00:00Z'
    const b = item({ titulo: 'Bambi', fecha_agregado: fecha })
    const a = item({ titulo: 'Alien', fecha_agregado: fecha })
    const c = item({ titulo: 'Casablanca', fecha_agregado: fecha })

    expect(peliculasPorVer([c, a, b]).map((i) => i.titulo)).toEqual([
      'Alien',
      'Bambi',
      'Casablanca',
    ])
  })

  it('no muta el arreglo de entrada', () => {
    const reciente = item({ fecha_agregado: '2026-03-01T00:00:00Z' })
    const antigua = item({ fecha_agregado: '2025-01-01T00:00:00Z' })
    const entrada = [reciente, antigua]

    peliculasPorVer(entrada)

    expect(entrada).toEqual([reciente, antigua])
  })
})

describe('clasificarCandidatas', () => {
  it('ofrece las que caben solas, cada una con su duración', () => {
    const corta = item()
    const larga = item()
    const duraciones = new Map([
      [corta.tmdb_id, ok(90)],
      [larga.tmdb_id, ok(100)],
    ])

    const { candidatas, vacio } = clasificarCandidatas([corta, larga], duraciones, 120)

    expect(candidatas.map((c) => [c.tmdbId, c.minutos])).toEqual([
      [corta.tmdb_id, 90],
      [larga.tmdb_id, 100],
    ])
    expect(vacio).toBeNull()
  })

  it('una película cuya duración es exactamente el tiempo sí entra', () => {
    const justa = item()
    const { candidatas } = clasificarCandidatas([justa], new Map([[justa.tmdb_id, ok(120)]]), 120)
    expect(candidatas).toHaveLength(1)
  })

  it('una película más larga que el tiempo no se ofrece ni se lista como no disponible', () => {
    const demasiado = item()
    const { candidatas, noDisponibles } = clasificarCandidatas(
      [demasiado],
      new Map([[demasiado.tmdb_id, ok(121)]]),
      120,
    )
    expect(candidatas).toEqual([])
    expect(noDisponibles).toEqual([])
  })

  it('sin duración y con error van a no disponibles, cada una con su motivo', () => {
    // Fechas distintas: sin ellas, DEC-02 desempataría por título y «Con error» iría primero.
    const sinDuracion = item({ titulo: 'Sin duración', fecha_agregado: '2025-01-01T00:00:00Z' })
    const conError = item({ titulo: 'Con error', fecha_agregado: '2026-01-01T00:00:00Z' })
    const duraciones = new Map<number, DuracionPelicula>([
      [sinDuracion.tmdb_id, { estado: 'sin_duracion' }],
      [conError.tmdb_id, { estado: 'error' }],
    ])

    const { noDisponibles } = clasificarCandidatas([sinDuracion, conError], duraciones, 120)

    expect(noDisponibles.map((n) => [n.titulo, n.motivo])).toEqual([
      ['Sin duración', 'sin_duracion'],
      ['Con error', 'error_consulta'],
    ])
  })

  it('un ok con 0 minutos se trata como sin duración', () => {
    const raro = item()
    const { candidatas, noDisponibles } = clasificarCandidatas(
      [raro],
      new Map([[raro.tmdb_id, ok(0)]]),
      120,
    )
    expect(candidatas).toEqual([])
    expect(noDisponibles.map((n) => n.motivo)).toEqual(['sin_duracion'])
  })

  it('distingue una lista sin películas por ver de que ninguna quepa', () => {
    expect(clasificarCandidatas([], new Map(), 120).vacio).toBe('sin_por_ver')

    const larga = item()
    const resultado = clasificarCandidatas([larga], new Map([[larga.tmdb_id, ok(300)]]), 120)
    expect(resultado.vacio).toBe('ninguna_cabe')
  })

  it('una película que aún no se consultó se omite', () => {
    const pendiente = item()
    const { candidatas, noDisponibles } = clasificarCandidatas([pendiente], new Map(), 120)
    expect(candidatas).toEqual([])
    expect(noDisponibles).toEqual([])
  })

  it('devuelve las candidatas en el orden de la lista aunque lleguen desordenadas', () => {
    const reciente = item({ titulo: 'Reciente', fecha_agregado: '2026-03-01T00:00:00Z' })
    const antigua = item({ titulo: 'Antigua', fecha_agregado: '2025-01-01T00:00:00Z' })
    const duraciones = new Map([
      [reciente.tmdb_id, ok(90)],
      [antigua.tmdb_id, ok(90)],
    ])

    const { candidatas } = clasificarCandidatas([reciente, antigua], duraciones, 120)

    expect(candidatas.map((c) => c.titulo)).toEqual(['Antigua', 'Reciente'])
  })

  it('conserva el póster y el título de cada película', () => {
    const conPoster = item({ titulo: 'Con póster', poster_url: 'https://img/p.jpg' })
    const { candidatas } = clasificarCandidatas(
      [conPoster],
      new Map([[conPoster.tmdb_id, ok(90)]]),
      120,
    )
    expect(candidatas[0]).toEqual({
      tmdbId: conPoster.tmdb_id,
      titulo: 'Con póster',
      posterUrl: 'https://img/p.jpg',
      minutos: 90,
    })
  })
})
