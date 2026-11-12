import { useCallback, useEffect, useRef, useState } from 'react'
import {
  extremosDeFila,
  llegoNuevaAlInicio,
  pasoDeDesplazamiento,
  type ExtremosFila,
} from '../domain/fila'

type Direccion = 'anterior' | 'siguiente'
type RefDeBoton = (elemento: HTMLButtonElement | null) => void

interface UseFilaDesplazable {
  // Se pasan como `ref` de la pista que se desplaza y de cada flecha.
  pistaRef: (elemento: HTMLDivElement | null) => void
  anteriorRef: RefDeBoton
  siguienteRef: RefDeBoton
  puedeAnterior: boolean
  puedeSiguiente: boolean
  desplazar: (direccion: Direccion) => void
}

const SIN_EXTREMOS: ExtremosFila = { anterior: false, siguiente: false }

// Cuánto se recuerda cuál fue la última flecha usada. Un desplazamiento animado dura menos que
// esto; pasado el tiempo, un cambio de extremo ya no se debe a esa flecha.
const MEMORIA_DE_FLECHA_MS = 2000

// Quien pidió menos movimiento al sistema no recibe el desplazamiento animado.
function comportamientoDeScroll(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

// Lógica de las flechas de una fila: mide si hay más tarjetas a cada lado, desplaza la pista, cuida
// el foco y devuelve la fila al inicio cuando llega una tarjeta nueva. Las decisiones salen de
// funciones puras (domain/fila.ts); aquí solo está lo que toca el DOM.
//
// `claves` son las claves de las tarjetas de la fila, en orden: así el hook sabe cuándo llega una
// nueva al principio.
export function useFilaDesplazable(claves: readonly string[]): UseFilaDesplazable {
  // La pista y las flechas se guardan como estado y no como ref: la fila pasa por cargando, vacío
  // y con datos, y las flechas aparecen y desaparecen. Con estado, los efectos se enteran.
  const [pista, setPista] = useState<HTMLDivElement | null>(null)
  const [botonAnterior, setBotonAnterior] = useState<HTMLButtonElement | null>(null)
  const [botonSiguiente, setBotonSiguiente] = useState<HTMLButtonElement | null>(null)
  const [extremos, setExtremos] = useState(SIN_EXTREMOS)
  const ultimaUsada = useRef<Direccion | null>(null)
  const clavesPrevias = useRef<readonly string[]>([])

  // `claves` es un arreglo nuevo en cada render: se compara su contenido, no su referencia.
  const huella = claves.join('\n')

  useEffect(() => {
    if (!pista) return

    const medir = () => {
      const nuevos = extremosDeFila(pista.scrollLeft, pista.clientWidth, pista.scrollWidth)
      // Si nada cambió se conserva el objeto anterior: así no se vuelve a renderizar en cada scroll.
      setExtremos((actuales) =>
        actuales.anterior === nuevos.anterior && actuales.siguiente === nuevos.siguiente
          ? actuales
          : nuevos,
      )
    }

    // Tres cosas cambian lo que hay que mostrar: la persona desplaza la fila, cambia el ancho de
    // la ventana, o llegan y se van tarjetas. El observador de tamaño también mide al engancharse.
    pista.addEventListener('scroll', medir, { passive: true })
    const alCambiarTamano = new ResizeObserver(medir)
    alCambiarTamano.observe(pista)
    const alCambiarTarjetas = new MutationObserver(medir)
    alCambiarTarjetas.observe(pista, { childList: true })

    return () => {
      pista.removeEventListener('scroll', medir)
      alCambiarTamano.disconnect()
      alCambiarTarjetas.disconnect()
    }
  }, [pista])

  // Lo nuevo entra siempre al principio de la fila (por ejemplo, un título recién agregado en
  // «Agregadas recientemente»): si la fila estaba desplazada no se vería, así que vuelve al inicio.
  useEffect(() => {
    const ahora = huella === '' ? [] : huella.split('\n')
    const antes = clavesPrevias.current
    clavesPrevias.current = ahora

    if (pista && llegoNuevaAlInicio(antes, ahora)) {
      pista.scrollTo({ left: 0, behavior: comportamientoDeScroll() })
    }
  }, [huella, pista])

  // Una flecha desaparece al llegar a su extremo. Si la persona la estaba usando con el teclado,
  // el foco se pierde (queda en el body) y no tiene dónde seguir: se le pasa a la flecha contraria,
  // que es justo la que sirve. Si el foco ya está en otro control, no se le quita.
  useEffect(() => {
    const usada = ultimaUsada.current
    if (usada === null) return

    const desaparecio = usada === 'siguiente' ? !extremos.siguiente : !extremos.anterior
    if (!desaparecio) return

    ultimaUsada.current = null
    if (document.activeElement !== document.body) return

    const contraria = usada === 'siguiente' ? botonAnterior : botonSiguiente
    contraria?.focus()
  }, [extremos, botonAnterior, botonSiguiente])

  const desplazar = useCallback(
    (direccion: Direccion) => {
      if (!pista) return

      ultimaUsada.current = direccion
      setTimeout(() => {
        if (ultimaUsada.current === direccion) ultimaUsada.current = null
      }, MEMORIA_DE_FLECHA_MS)

      const paso = pasoDeDesplazamiento(pista.clientWidth)
      pista.scrollBy({
        left: direccion === 'siguiente' ? paso : -paso,
        behavior: comportamientoDeScroll(),
      })
    },
    [pista],
  )

  return {
    pistaRef: setPista,
    anteriorRef: setBotonAnterior,
    siguienteRef: setBotonSiguiente,
    puedeAnterior: extremos.anterior,
    puedeSiguiente: extremos.siguiente,
    desplazar,
  }
}
