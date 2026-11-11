// Formato de fechas para mostrar sesiones guardadas. Recibe la fecha ISO que guarda la base de
// datos y la muestra en el día local de la persona.
const FORMATO_FECHA = new Intl.DateTimeFormat('es', { dateStyle: 'medium' })

export function formatoFecha(iso: string): string {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha)
}

// «1 película» / «3 películas».
export function textoPeliculas(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'película' : 'películas'}`
}
