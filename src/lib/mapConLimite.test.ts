import { describe, expect, it } from 'vitest'
import { mapConLimite } from './mapConLimite'

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

describe('mapConLimite', () => {
  it('con 12 tareas y límite 5 nunca hay más de 5 en curso, y sí llega a 5', async () => {
    let enCurso = 0
    let maximo = 0

    await mapConLimite(
      Array.from({ length: 12 }, (_, i) => i),
      5,
      async () => {
        enCurso += 1
        maximo = Math.max(maximo, enCurso)
        await esperar(2)
        enCurso -= 1
      },
    )

    expect(maximo).toBe(5)
  })

  it('devuelve los resultados en el orden de entrada aunque terminen desordenados', async () => {
    // Las primeras tardan más: con el límite en 3 terminan después que las últimas.
    const duraciones = [30, 20, 10, 1, 1, 1]

    const resultados = await mapConLimite(duraciones, 3, async (ms, indice) => {
      await esperar(ms)
      return `tarea-${indice}`
    })

    expect(resultados).toEqual(['tarea-0', 'tarea-1', 'tarea-2', 'tarea-3', 'tarea-4', 'tarea-5'])
  })

  it('con una lista vacía devuelve vacío y no ejecuta nada', async () => {
    let llamadas = 0
    const resultados = await mapConLimite([], 5, async () => {
      llamadas += 1
    })
    expect(resultados).toEqual([])
    expect(llamadas).toBe(0)
  })

  it('un límite mayor que la cantidad de elementos funciona', async () => {
    expect(await mapConLimite([1, 2], 50, async (n) => n * 2)).toEqual([2, 4])
  })

  it('un límite menor que 1 se trata como 1', async () => {
    let enCurso = 0
    let maximo = 0
    await mapConLimite([1, 2, 3], 0, async () => {
      enCurso += 1
      maximo = Math.max(maximo, enCurso)
      await esperar(1)
      enCurso -= 1
    })
    expect(maximo).toBe(1)
  })

  it('si una tarea falla, el error se propaga y no se arrancan tareas nuevas', async () => {
    let arrancadas = 0

    await expect(
      mapConLimite([1, 2, 3, 4, 5], 1, async (n) => {
        arrancadas += 1
        if (n === 2) throw new Error('falló la segunda')
        return n
      }),
    ).rejects.toThrow('falló la segunda')

    expect(arrancadas).toBe(2)
  })

  it('una señal ya abortada no arranca ninguna tarea', async () => {
    const control = new AbortController()
    control.abort()
    let arrancadas = 0

    await expect(
      mapConLimite(
        [1, 2, 3],
        2,
        async () => {
          arrancadas += 1
        },
        control.signal,
      ),
    ).rejects.toThrow()

    expect(arrancadas).toBe(0)
  })

  it('abortar a mitad detiene el arranque de tareas nuevas', async () => {
    const control = new AbortController()
    let arrancadas = 0

    await expect(
      mapConLimite(
        Array.from({ length: 10 }, (_, i) => i),
        1,
        async (n) => {
          arrancadas += 1
          if (n === 2) control.abort()
        },
        control.signal,
      ),
    ).rejects.toThrow()

    expect(arrancadas).toBe(3)
  })
})
