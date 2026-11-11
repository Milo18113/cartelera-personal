import { ETIQUETA_ESTADO, type Estado } from '../domain/miLista'

// Textos de confirmación de las acciones sobre la lista. Nombran el título y el destino para que
// la persona sepa qué pasó sin buscar el cambio en la pantalla. «Agregada», «movida» y «quitada»
// concuerdan con «película» y «serie», que son femeninas.
export function mensajeAgregada(titulo: string, estado: Estado): string {
  return `“${titulo}” agregada a ${ETIQUETA_ESTADO[estado]}`
}

export function mensajeMovida(titulo: string, estado: Estado): string {
  return `“${titulo}” movida a ${ETIQUETA_ESTADO[estado]}`
}

export function mensajeQuitada(titulo: string): string {
  return `“${titulo}” quitada de tu lista`
}
