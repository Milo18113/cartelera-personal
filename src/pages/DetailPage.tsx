import { ArrowLeft, ImageOff } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CommentBox } from '../components/CommentBox'
import { ETIQUETA_ACCION_ESTADO } from '../components/etiquetasEstado'
import { EstadoPill } from '../components/EstadoPill'
import { ICON_PROPS } from '../components/iconos'
import { RatingInput } from '../components/RatingInput'
import { RemoveFromList } from '../components/RemoveFromList'
import { StarRating } from '../components/StarRating'
import { tarjetaDeDetalle } from '../components/tarjetas'
import type { DetalleTitulo } from '../domain/detalle'
import {
  ETIQUETA_ESTADO_SINGULAR,
  claveTitulo,
  siguienteEstado,
  type TipoContenido,
} from '../domain/miLista'
import { useAccionesTarjeta } from '../hooks/useAccionesTarjeta'
import { useDetalleTitulo } from '../hooks/useDetalleTitulo'
import { useMiLista } from '../lista/useMiLista'

// Valida los params de /titulo/:tipo/:id antes de montar el contenido (los hooks no pueden ser condicionales).
export function DetailPage() {
  const { tipo, id } = useParams()
  const tmdbId = Number(id)

  if ((tipo !== 'pelicula' && tipo !== 'serie') || !Number.isInteger(tmdbId) || tmdbId <= 0) {
    return <Navigate to="/" replace />
  }
  return <DetailContent tipo={tipo} tmdbId={tmdbId} />
}

interface DetailContentProps {
  tipo: TipoContenido
  tmdbId: number
}

function DetailContent({ tipo, tmdbId }: DetailContentProps) {
  const { detalle, loading, error } = useDetalleTitulo(tipo, tmdbId)
  const acciones = useAccionesTarjeta()
  const navigate = useNavigate()

  // idx > 0 significa que hay una pantalla anterior dentro de la app (búsqueda, inicio...).
  // Si se abrió el link directo, "Volver" va al inicio en vez de salir de la app.
  const volver = () => {
    const hayHistorial = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (hayHistorial > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <main className="detail">
      <button type="button" className="detail__back" onClick={volver}>
        <ArrowLeft {...ICON_PROPS} aria-hidden="true" />
        Volver
      </button>

      {acciones.actionError && (
        <p role="alert" className="alert alert--error">
          {acciones.actionError}
        </p>
      )}

      {loading ? (
        <DetailSkeleton />
      ) : error || !detalle ? (
        <p role="alert" className="alert alert--error">
          No se pudo cargar el título: {error}
        </p>
      ) : (
        <DetailBody detalle={detalle} />
      )}
    </main>
  )
}

function DetailBody({ detalle }: { detalle: DetalleTitulo }) {
  const lista = useMiLista()
  const acciones = useAccionesTarjeta()

  const item = lista.items.find(
    (i) => i.tipo_contenido === detalle.tipo && i.tmdb_id === detalle.tmdbId,
  )
  const estado = item?.estado ?? null
  const ocupado = acciones.busy.has(claveTitulo(detalle.tipo, detalle.tmdbId))
  // Mismas acciones que las tarjetas del inicio: agregar → pendiente → en progreso → vista.
  const tarjeta = tarjetaDeDetalle(detalle, item)
  // Mientras la lista carga (o falla) no se sabe si el título ya está guardado: se bloquea la
  // pill para no insertarlo dos veces.
  const listaNoLista = lista.loading || lista.error !== null

  return (
    <div className="detail__layout">
      <aside className="detail__side">
        {detalle.posterUrl ? (
          <img
            className="detail__poster"
            src={detalle.posterUrl}
            alt={`Póster de ${detalle.titulo}`}
          />
        ) : (
          <div className="detail__poster detail__poster--empty">
            <ImageOff {...ICON_PROPS} size={32} aria-hidden="true" />
          </div>
        )}

        <div className="detail__rating">
          <span className="detail__label">Calificación general</span>
          <StarRating valor={detalle.calificacion} />
          <p className="detail__rating-text">
            {detalle.votos > 0
              ? `${formatoNota(detalle.calificacion)} / 5 · ${detalle.votos.toLocaleString('es')} votos`
              : 'Aún sin calificaciones'}
          </p>
        </div>
      </aside>

      <div className="detail__main">
        <div className="detail__head">
          <h1 className="detail__title">{detalle.titulo}</h1>
          <p className="detail__credits">{lineaCreditos(detalle.creditos, detalle.anio)}</p>
        </div>

        <div className="detail__meta">
          {detalle.generos.length > 0 && <p>{detalle.generos.join(', ')}</p>}
          <EstadoPill
            estado={estado}
            busy={ocupado}
            disabled={listaNoLista || siguienteEstado(estado) === null}
            etiquetaAccion={ETIQUETA_ACCION_ESTADO[estado ?? 'ninguna']}
            onClick={() => acciones.onAvanzar(tarjeta)}
          >
            {estado === null ? 'Agregar a mi lista' : ETIQUETA_ESTADO_SINGULAR[estado]}
          </EstadoPill>
          {item && (
            <RemoveFromList disabled={ocupado} onConfirmar={() => acciones.onEliminar(tarjeta)} />
          )}
        </div>

        <p className="detail__synopsis">{detalle.sinopsis || 'Sin sinopsis disponible.'}</p>

        <div className="detail__section">
          <h3 className="detail__heading">Reparto</h3>
          <p className="detail__cast">
            {detalle.reparto.length > 0
              ? detalle.reparto.join(', ')
              : 'Sin información de reparto.'}
          </p>
        </div>

        {/* Calificación y comentario viven en la fila de mi_lista: solo existen si el título está guardado. */}
        {item ? (
          <>
            <div className="detail__section">
              <h3 className="detail__heading">Califícala</h3>
              <RatingInput
                valor={item.calificacion_personal}
                disabled={ocupado}
                onChange={(valor) =>
                  void lista.actualizarOpinion(item, { calificacion_personal: valor })
                }
              />
            </div>

            <div className="detail__section">
              <h3 className="detail__heading">Comentario</h3>
              {/* key: si cambia la fila (otro título, o se quitó y se volvió a agregar) el borrador se reinicia. */}
              <CommentBox
                key={item.id}
                comentario={item.comentario}
                disabled={ocupado}
                onGuardar={(comentario) => lista.actualizarOpinion(item, { comentario })}
              />
            </div>
          </>
        ) : (
          <p className="detail__hint">Agrega este título a tu lista para calificarlo y comentarlo.</p>
        )}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="detail__layout" aria-busy="true">
      <aside className="detail__side">
        <div className="detail__poster skeleton" />
      </aside>
      <div className="detail__main">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--block" />
      </div>
    </div>
  )
}

// "Dirigida por Quentin Tarantino, 2026"; omite la parte que no exista.
function lineaCreditos(creditos: { etiqueta: string; nombres: string[] }, anio: string | null) {
  const partes: string[] = []
  if (creditos.nombres.length > 0) partes.push(`${creditos.etiqueta} ${creditos.nombres.join(', ')}`)
  if (anio) partes.push(anio)
  return partes.join(', ')
}

function formatoNota(nota: number): string {
  return nota.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
