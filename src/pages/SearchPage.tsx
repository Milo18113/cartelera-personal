import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MovieCardWithActions } from '../components/MovieCardWithActions'
import { tarjetaDeTitulo } from '../components/tarjetas'
import { claveTitulo } from '../domain/miLista'
import { useAccionesTarjeta } from '../hooks/useAccionesTarjeta'
import { useBusqueda } from '../hooks/useBusqueda'
import { useMiLista } from '../lista/useMiLista'

const SKELETONS = 12

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const busqueda = useBusqueda(q)
  const lista = useMiLista()
  const acciones = useAccionesTarjeta()

  // Cada resultado se cruza con mi lista para mostrar su estado actual en el botón.
  const peliculas = useMemo(() => {
    const itemsPorClave = new Map(
      lista.items.map((i) => [claveTitulo(i.tipo_contenido, i.tmdb_id), i]),
    )
    return busqueda.items.map((t) =>
      tarjetaDeTitulo(t, itemsPorClave.get(claveTitulo(t.tipo, t.tmdbId))),
    )
  }, [busqueda.items, lista.items])

  return (
    <main className="search">
      <h1 className="search__title">Resultados para “{q}”</h1>

      {acciones.actionError && (
        <p role="alert" className="alert alert--error">
          {acciones.actionError}
        </p>
      )}

      {!busqueda.consultaValida ? (
        <p className="status-message">Escribe al menos 2 caracteres para buscar.</p>
      ) : busqueda.loading ? (
        <div className="grid" aria-busy="true">
          {Array.from({ length: SKELETONS }, (_, i) => (
            <div key={i} className="card card--skeleton" />
          ))}
        </div>
      ) : busqueda.error ? (
        <p role="alert" className="alert alert--error">
          No se pudo completar la búsqueda: {busqueda.error}
        </p>
      ) : peliculas.length === 0 ? (
        <p className="status-message">No encontramos resultados para “{q}”.</p>
      ) : (
        <>
          <div className="grid">
            {peliculas.map((pelicula) => (
              <MovieCardWithActions
                key={pelicula.clave}
                pelicula={pelicula}
                busy={acciones.busy}
                onAvanzar={acciones.onAvanzar}
                onEliminar={acciones.onEliminar}
              />
            ))}
          </div>

          {busqueda.errorMas && (
            <p role="alert" className="alert alert--error">
              {busqueda.errorMas}
            </p>
          )}
          {busqueda.hayMas && (
            <button
              type="button"
              className="btn btn--ghost search__more"
              disabled={busqueda.cargandoMas}
              onClick={() => void busqueda.verMas()}
            >
              {busqueda.cargandoMas ? 'Cargando…' : 'Ver más'}
            </button>
          )}
        </>
      )}
    </main>
  )
}
