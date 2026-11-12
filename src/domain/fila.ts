// Recorrido de una fila de tarjetas con flechas (E1-D04). Funciones puras: reciben las medidas de
// la fila y devuelven qué hacer, así se prueban sin navegador.

// scrollLeft puede entregar decimales según la pantalla y el zoom: sin esta tolerancia, una fila
// que ya llegó al final podría seguir mostrando la flecha «siguiente» por una fracción de píxel.
const TOLERANCIA_PX = 1

// Cada click avanza casi un ancho visible, no uno completo: así la última tarjeta que se veía
// sigue a la vista y la persona no pierde el hilo.
const FRACCION_POR_CLICK = 0.9

export interface ExtremosFila {
  // ¿Hay más tarjetas a la izquierda?
  anterior: boolean
  // ¿Hay más tarjetas a la derecha?
  siguiente: boolean
}

export function extremosDeFila(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): ExtremosFila {
  return {
    anterior: scrollLeft > TOLERANCIA_PX,
    siguiente: scrollLeft + clientWidth < scrollWidth - TOLERANCIA_PX,
  }
}

export function pasoDeDesplazamiento(clientWidth: number): number {
  return clientWidth * FRACCION_POR_CLICK
}

// ¿Llegó una tarjeta nueva al principio de la fila? Es lo que pasa al agregar un título a
// «Agregadas recientemente»: entra primero, y si la fila estaba desplazada no se vería. Cuenta
// solo si la primera tarjeta de ahora no estaba antes: si la primera cambia porque se quitó la
// que estaba, o porque la fila se reordenó, no hay nada nuevo que mostrar y la fila no se mueve.
export function llegoNuevaAlInicio(
  clavesAntes: readonly string[],
  clavesAhora: readonly string[],
): boolean {
  const primera = clavesAhora[0]
  return primera !== undefined && !clavesAntes.includes(primera)
}
