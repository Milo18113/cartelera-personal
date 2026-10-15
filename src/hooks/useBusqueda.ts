import { useEffect, useMemo, useRef, useState } from 'react'
import { interpretarBusqueda } from '../domain/busqueda'
import { claveTitulo } from '../domain/miLista'
import { buscarTitulos, type TituloTmdb } from '../infrastructure/tmdb'

interface Resultado {
  // Entrada a la que pertenece este resultado; si no coincide con la actual, es obsoleto.
  entrada: string | null
  items: TituloTmdb[]
  pagina: number
  hayMas: boolean
  error: string | null
}

interface UseBusqueda {
  // false cuando el texto es demasiado corto para buscar.
  consultaValida: boolean
  loading: boolean
  error: string | null
  items: TituloTmdb[]
  hayMas: boolean
  cargandoMas: boolean
  errorMas: string | null
  verMas: () => Promise<void>
}

const SIN_RESULTADO: Resultado = { entrada: null, items: [], pagina: 0, hayMas: false, error: null }

function mensajeDe(err: unknown): string {
  return err instanceof Error ? err.message : 'No se pudo completar la búsqueda'
}

function sinDuplicados(titulos: TituloTmdb[]): TituloTmdb[] {
  const vistos = new Set<string>()
  return titulos.filter((t) => {
    const clave = claveTitulo(t.tipo, t.tmdbId)
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

export function useBusqueda(entrada: string): UseBusqueda {
  const consulta = useMemo(() => interpretarBusqueda(entrada), [entrada])
  const [resultado, setResultado] = useState<Resultado>(SIN_RESULTADO)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [errorMas, setErrorMas] = useState<string | null>(null)
  // Permite que verMas descarte su respuesta si la búsqueda cambió mientras esperaba.
  const entradaActual = useRef(entrada)

  useEffect(() => {
    entradaActual.current = entrada
    if (!consulta) return

    // El AbortController cancela la petición anterior al lanzar otra búsqueda.
    const controller = new AbortController()

    const cargar = async () => {
      try {
        const pagina = await buscarTitulos(consulta, 1, controller.signal)
        if (controller.signal.aborted) return
        setResultado({ entrada, items: pagina.items, pagina: 1, hayMas: pagina.hayMas, error: null })
        setErrorMas(null)
      } catch (err) {
        if (controller.signal.aborted) return
        setResultado({ entrada, items: [], pagina: 1, hayMas: false, error: mensajeDe(err) })
      }
    }
    void cargar()

    return () => controller.abort()
  }, [consulta, entrada])

  const verMas = async () => {
    if (!consulta || resultado.entrada !== entrada || cargandoMas) return

    setCargandoMas(true)
    setErrorMas(null)
    try {
      const siguiente = resultado.pagina + 1
      const pagina = await buscarTitulos(consulta, siguiente)
      if (entradaActual.current !== entrada) return
      setResultado((prev) =>
        prev.entrada !== entrada
          ? prev
          : {
              ...prev,
              items: sinDuplicados([...prev.items, ...pagina.items]),
              pagina: siguiente,
              hayMas: pagina.hayMas,
            },
      )
    } catch (err) {
      if (entradaActual.current === entrada) setErrorMas(mensajeDe(err))
    } finally {
      setCargandoMas(false)
    }
  }

  const vigente = resultado.entrada === entrada
  return {
    consultaValida: consulta !== null,
    // Derivado en vez de guardado: evita un setState síncrono dentro del effect.
    loading: consulta !== null && !vigente,
    error: vigente ? resultado.error : null,
    items: vigente ? resultado.items : [],
    hayMas: vigente && resultado.hayMas,
    cargandoMas,
    errorMas,
    verMas,
  }
}
