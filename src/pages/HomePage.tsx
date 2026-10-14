import { useMemo, useState } from 'react'
import { nombreDeUsuario } from '../auth/nombreDeUsuario'
import { useAuth } from '../auth/useAuth'
import { FilterBar } from '../components/FilterBar'
import type { TarjetaPelicula } from '../components/MovieCard'
import { MovieRow } from '../components/MovieRow'
import { StatPills } from '../components/StatPills'
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  claveTitulo,
  contarPorEstado,
  ordenarLista,
  type CriterioOrden,
  type FiltroEstado,
  type ItemLista,
} from '../domain/miLista'
import { useMiLista } from '../hooks/useMiLista'
import { useRecomendaciones } from '../hooks/useRecomendaciones'
import type { TituloRecomendado } from '../infrastructure/tmdb'

const MAX_RECIENTES = 15

function tarjetaDeItem(item: ItemLista): TarjetaPelicula {
  return {
    clave: String(item.id),
    titulo: item.titulo,
    posterUrl: item.poster_url,
    calificacion: item.calificacion_personal,
  }
}

function tarjetaDeRecomendacion(titulo: TituloRecomendado): TarjetaPelicula {
  return {
    clave: claveTitulo(titulo.tipo, titulo.tmdbId),
    titulo: titulo.titulo,
    anio: titulo.anio,
    posterUrl: titulo.posterUrl,
  }
}

export function HomePage() {
  const { user } = useAuth()
  const lista = useMiLista()
  const recomendaciones = useRecomendaciones()
  const [filtro, setFiltro] = useState<FiltroEstado>('todas')
  const [orden, setOrden] = useState<CriterioOrden>('fecha')

  const conteo = useMemo(() => contarPorEstado(lista.items), [lista.items])

  // No recomendar lo que el usuario ya tiene guardado.
  const recomendadas = useMemo(() => {
    const guardadas = new Set(lista.items.map((i) => claveTitulo(i.tipo_contenido, i.tmdb_id)))
    return recomendaciones.items
      .filter((t) => !guardadas.has(claveTitulo(t.tipo, t.tmdbId)))
      .map(tarjetaDeRecomendacion)
  }, [lista.items, recomendaciones.items])

  // fetchMiLista ya llega ordenada por fecha_agregado desc.
  const recientes = useMemo(
    () => lista.items.slice(0, MAX_RECIENTES).map(tarjetaDeItem),
    [lista.items],
  )

  const estadosVisibles = ESTADOS.filter((estado) => filtro === 'todas' || filtro === estado)

  return (
    <main className="home">
      <h1 className="home__title">¿Qué vamos a ver hoy, {nombreDeUsuario(user)}?</h1>

      <StatPills conteo={conteo} />

      <FilterBar
        filtro={filtro}
        orden={orden}
        onFiltroChange={setFiltro}
        onOrdenChange={setOrden}
      />

      <MovieRow
        titulo="Recomendadas para ti"
        peliculas={recomendadas}
        loading={recomendaciones.loading}
        error={recomendaciones.error}
        vacio="No hay recomendaciones por ahora."
      />

      {/* Con un filtro activo se muestra solo la fila de ese estado. */}
      {filtro === 'todas' && (
        <MovieRow
          titulo="Agregadas recientemente"
          peliculas={recientes}
          loading={lista.loading}
          error={lista.error}
          vacio="Aún no has agregado nada."
        />
      )}

      {estadosVisibles.map((estado) => (
        <MovieRow
          key={estado}
          titulo={ETIQUETA_ESTADO[estado]}
          peliculas={ordenarLista(
            lista.items.filter((i) => i.estado === estado),
            orden,
          ).map(tarjetaDeItem)}
          loading={lista.loading}
          error={lista.error}
          vacio="No tienes títulos en esta lista."
        />
      ))}
    </main>
  )
}
