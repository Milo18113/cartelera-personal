// Errores de conexión (E1-D06). Funciones puras: deciden por el texto del error, que es lo que
// guardan los hooks y los repositorios (`error: string`). supabase-js entrega la falla de red como
// un mensaje y no como un tipo, y cambiar los repositorios a un error propio sería un refactor
// ajeno a este ticket.

export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor.'

// «Failed to fetch» es Chrome (supabase-js lo entrega como «TypeError: Failed to fetch»),
// «NetworkError…» es Firefox y «Load failed» es Safari.
const SENALES_SIN_CONEXION = ['failed to fetch', 'networkerror', 'load failed']

// Un error del servidor (por ejemplo, «TMDB respondió con estado 500») no cuenta: ahí sí hubo
// conexión, y decir lo contrario sería falso.
export function esErrorDeConexion(mensaje: string): boolean {
  const texto = mensaje.toLowerCase()
  return SENALES_SIN_CONEXION.some((senal) => texto.includes(senal))
}

// El mensaje que se le muestra a la persona: el amable si fue de conexión; si no, el mismo.
export function mensajeDeError(mensaje: string): string {
  return esErrorDeConexion(mensaje) ? MENSAJE_SIN_CONEXION : mensaje
}
