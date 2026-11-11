import { describe, expect, it } from 'vitest'
import { duracionTotal } from './nochePelicula'
import {
  agregarPelicula,
  nombreDemasiadoLargo,
  nombrePorDefecto,
  normalizarNombre,
  puedeGuardar,
  quitarPelicula,
  type PeliculaEnSesion,
} from './sesion'

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

describe('puedeGuardar', () => {
  it('una sesión vacía no se puede guardar', () => {
    expect(puedeGuardar([], 120)).toEqual({ ok: false, motivo: 'vacia' })
  })

  it('una sesión que cabe se puede guardar', () => {
    expect(puedeGuardar([pelicula(1, 100)], 120)).toEqual({ ok: true })
  })

  it('el límite exacto se puede guardar', () => {
    // 90 + 100 + 120 + 2 pausas = 330.
    const sesion = [pelicula(1, 90), pelicula(2, 100), pelicula(3, 120)]
    expect(puedeGuardar(sesion, 330)).toEqual({ ok: true })
  })

  it('una sesión que se pasa no se guarda y dice por cuánto', () => {
    const sesion = [pelicula(1, 90), pelicula(2, 100), pelicula(3, 120)]
    expect(puedeGuardar(sesion, 329)).toEqual({ ok: false, motivo: 'excede', sobran: 1 })
  })

  it('al bajar el tiempo una sesión armada deja de poder guardarse', () => {
    const sesion = [pelicula(1, 100), pelicula(2, 95)]
    expect(puedeGuardar(sesion, 210)).toEqual({ ok: true })
    expect(puedeGuardar(sesion, 200)).toEqual({ ok: false, motivo: 'excede', sobran: 5 })
  })
})

describe('nombrePorDefecto', () => {
  it('es «Noche del 11 de nov» el 11 de noviembre', () => {
    expect(nombrePorDefecto(new Date(2026, 10, 11))).toBe('Noche del 11 de nov')
  })

  it('el día no lleva cero a la izquierda', () => {
    expect(nombrePorDefecto(new Date(2026, 0, 1))).toBe('Noche del 1 de ene')
  })

  it('usa el mes abreviado correcto para cada mes', () => {
    const meses = Array.from({ length: 12 }, (_, mes) => nombrePorDefecto(new Date(2026, mes, 15)))
    expect(meses.map((nombre) => nombre.split(' ').at(-1))).toEqual([
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ])
  })
})

describe('normalizarNombre', () => {
  const hoy = new Date(2026, 10, 11)

  it('un nombre vacío usa el de por defecto', () => {
    expect(normalizarNombre('', hoy)).toEqual({ ok: true, nombre: 'Noche del 11 de nov' })
  })

  it('un nombre con solo espacios también usa el de por defecto', () => {
    expect(normalizarNombre('     ', hoy)).toEqual({ ok: true, nombre: 'Noche del 11 de nov' })
  })

  it('recorta los espacios alrededor', () => {
    expect(normalizarNombre('  Maratón de domingo  ', hoy)).toEqual({
      ok: true,
      nombre: 'Maratón de domingo',
    })
  })

  it('acepta 60 caracteres y rechaza 61', () => {
    expect(normalizarNombre('x'.repeat(60), hoy)).toEqual({ ok: true, nombre: 'x'.repeat(60) })
    expect(normalizarNombre('x'.repeat(61), hoy)).toEqual({ ok: false, motivo: 'demasiado_largo' })
  })

  it('un emoji cuenta como un carácter: 60 emojis caben y 61 no', () => {
    expect(normalizarNombre('🎬'.repeat(60), hoy).ok).toBe(true)
    expect(normalizarNombre('🎬'.repeat(61), hoy).ok).toBe(false)
  })

  it('conserva tal cual los símbolos y el texto con forma de código', () => {
    expect(normalizarNombre('<b>hola</b> 🎬', hoy)).toEqual({ ok: true, nombre: '<b>hola</b> 🎬' })
  })
})

describe('nombreDemasiadoLargo', () => {
  it('los espacios de los bordes no cuentan', () => {
    expect(nombreDemasiadoLargo(`  ${'x'.repeat(60)}  `)).toBe(false)
  })

  it('61 caracteres es demasiado largo', () => {
    expect(nombreDemasiadoLargo('x'.repeat(61))).toBe(true)
  })
})
