import { useMemo, useState } from 'react'
import { nombreDeUsuario } from '../auth/nombreDeUsuario'
import { useAuth } from '../auth/useAuth'
import { FilterBar } from '../components/FilterBar'
import { MovieRow } from '../components/MovieRow'
import { StatPills } from '../components/StatPills'
import { tarjetaDeItem, tarjetaDeTitulo } from '../components/tarjetas'
import {
  ESTADOS,
  ETIQUETA_ESTADO,
  claveTitulo,
  contarPorEstado,
  ordenarLista,
  type CriterioOrden,
  type FiltroEstado,
} from '../domain/miLista'
import { useAccionesTarjeta } from '../hooks/useAccionesTarjeta'
import { useRecomendaciones } from '../hooks/useRecomendaciones'
import { useMiLista } from '../lista/useMiLista'

const MAX_RECIENTES = 15

export function HomePage() {
  const { user } = useAuth()
  const lista = useMiLista()
  const acciones = useAccionesTarjeta()
  const recomendaciones = useRecomendaciones()
  const [filtro, setFiltro] = useState<FiltroEstado>('todas')
  const [orden, setOrden] = useState<CriterioOrden>('fecha')

  const conteo = useMemo(() => contarPorEstado(lista.items), [lista.items])

  // No recomendar lo que el usuario ya tiene guardado: así toda tarjeta recomendada
  // está "en ninguna lista" y, al agregarla, pasa sola a las filas de mi lista.
  const recomendadas = useMemo(() => {
    const guardadas = new Set(lista.items.map((i) => claveTitulo(i.tipo_contenido, i.tmdb_id)))
    return recomendaciones.items
      .filter((t) => !guardadas.has(claveTitulo(t.tipo, t.tmdbId)))
      .map((t) => tarjetaDeTitulo(t))
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

      {acciones.actionError && (
        <p role="alert" className="alert alert--error">
          {acciones.actionError}
        </p>
      )}

      {/* Con un filtro activo solo se muestra la fila de ese estado: ni recomendadas ni recientes. */}
      {filtro === 'todas' && (
        <>
          <MovieRow
            titulo="Recomendadas para ti"
            peliculas={recomendadas}
            loading={recomendaciones.loading}
            error={recomendaciones.error}
            vacio="No hay recomendaciones por ahora."
            busy={acciones.busy}
            onAvanzar={acciones.onAvanzar}
            onEliminar={acciones.onEliminar}
          />
          <MovieRow
            titulo="Agregadas recientemente"
            peliculas={recientes}
            loading={lista.loading}
            error={lista.error}
            vacio="Aún no has agregado nada."
            busy={acciones.busy}
            onAvanzar={acciones.onAvanzar}
            onEliminar={acciones.onEliminar}
          />
        </>
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
          busy={acciones.busy}
          onAvanzar={acciones.onAvanzar}
          onEliminar={acciones.onEliminar}
        />
      ))}
    </main>
  )
}
