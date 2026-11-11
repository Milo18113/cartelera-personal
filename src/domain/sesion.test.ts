import { describe, expect, it } from 'vitest'
import { duracionTotal } from './nochePelicula'
import { agregarPelicula, quitarPelicula, type PeliculaEnSesion } from './sesion'

function pelicula(tmdbId: number, minutos: number): PeliculaEnSesion {
  return { tmdbId, titulo: `Película ${tmdbId}`, posterUrl: null, minutos }
}

function candidata(tmdbId: number, minutos: number | null) {
  return { tmdbId, titulo: `Película ${tmdbId}`, posterUrl: null, minutos }
}

describe('agregarPelicula', () => {
  it('agrega al final de una sesión vacía', () => {
    const resultado = agregarPelicula([], candidata(1, 100), 120)
    expect(resultado).toEqual({ ok: true, peliculas: [pelicula(1, 100)] })
  })

  it('agrega al final y conserva el orden en que se agregaron', () => {
    const resultado = agregarPelicula([pelicula(1, 60), pelicula(2, 60)], candidata(3, 60), 300)
    expect(resultado.ok && resultado.peliculas.map((p) => p.tmdbId)).toEqual([1, 2, 3])
  })

  it('una película que cabe justo en lo que queda se agrega', () => {
    // 100 + 10 + 90 = 200 con 200 disponibles.
    expect(agregarPelicula([pelicula(1, 100)], candidata(2, 90), 200).ok).toBe(true)
  })

  it('una que no cabe se rechaza diciendo cuántos minutos faltan, pausa incluida', () => {
    // 100 + 10 + 95 = 205 con 200 disponibles (ejemplo del PRD).
    expect(agregarPelicula([pelicula(1, 100)], candidata(2, 95), 200)).toEqual({
      ok: false,
      motivo: 'excede',
      faltan: 5,
    })
  })

  it('una película repetida se rechaza como duplicada, aunque quepa', () => {
    expect(agregarPelicula([pelicula(1, 60)], candidata(1, 60), 300)).toEqual({
      ok: false,
      motivo: 'duplicada',
    })
  })

  it.each([null, 0, -1, Number.NaN])('la duración %s se rechaza como sin duración', (minutos) => {
    expect(agregarPelicula([], candidata(1, minutos), 300)).toEqual({
      ok: false,
      motivo: 'sin_duracion',
    })
  })

  it('no muta la sesión de entrada', () => {
    const actuales = [pelicula(1, 60)]
    agregarPelicula(actuales, candidata(2, 60), 300)
    expect(actuales).toEqual([pelicula(1, 60)])
  })

  it('al agregar se conservan título y póster de la candidata', () => {
    const resultado = agregarPelicula(
      [],
      { tmdbId: 7, titulo: 'Siete', posterUrl: 'https://img/7.jpg', minutos: 90 },
      120,
    )
    expect(resultado.ok && resultado.peliculas[0]).toEqual({
      tmdbId: 7,
      titulo: 'Siete',
      posterUrl: 'https://img/7.jpg',
      minutos: 90,
    })
  })
})

describe('quitarPelicula', () => {
  it('quita la película indicada y deja las demás en su orden', () => {
    const actuales = [pelicula(1, 60), pelicula(2, 70), pelicula(3, 80)]
    expect(quitarPelicula(actuales, 2).map((p) => p.tmdbId)).toEqual([1, 3])
  })

  it('al quitar del medio se recalculan las pausas, no solo se resta la duración', () => {
    const antes = [pelicula(1, 90), pelicula(2, 100), pelicula(3, 120)]
    const despues = quitarPelicula(antes, 2)
    // Antes: 90 + 100 + 120 + 2 pausas = 330. Después: 90 + 120 + 1 pausa = 220.
    expect(duracionTotal(antes.map((p) => p.minutos))).toBe(330)
    expect(duracionTotal(despues.map((p) => p.minutos))).toBe(220)
  })

  it('quitar una película que no está no cambia nada', () => {
    const actuales = [pelicula(1, 60)]
    expect(quitarPelicula(actuales, 99)).toEqual(actuales)
  })

  it('no muta la sesión de entrada', () => {
    const actuales = [pelicula(1, 60), pelicula(2, 70)]
    quitarPelicula(actuales, 1)
    expect(actuales).toHaveLength(2)
  })
})
