// Ejecuta `tarea` sobre cada elemento con un máximo de `limite` en curso a la vez y devuelve
// los resultados en el mismo orden que `items`. No sabe nada de redes: sirve para cualquier
// trabajo asíncrono que no conviene lanzar todo junto (por ejemplo, decenas de consultas a TMDB).
export async function mapConLimite<T, R>(
  items: readonly T[],
  limite: number,
  tarea: (item: T, indice: number) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> {
  const resultados = new Array<R>(items.length)
  let siguiente = 0
  // Si una tarea falla, los demás trabajadores dejan de arrancar tareas nuevas: seguir
  // consultando cuando el resultado ya se descartó solo gasta peticiones.
  let detenido = false

  async function trabajador(): Promise<void> {
    while (!detenido && siguiente < items.length) {
      // Una señal abortada detiene el arranque de tareas nuevas; las que ya van en curso terminan.
      signal?.throwIfAborted()
      const indice = siguiente
      siguiente += 1
      try {
        resultados[indice] = await tarea(items[indice], indice)
      } catch (error) {
        detenido = true
        throw error
      }
    }
  }

  const trabajadores = Math.min(Math.max(limite, 1), items.length)
  await Promise.all(Array.from({ length: trabajadores }, trabajador))
  return resultados
}
