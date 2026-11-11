import { useMemo, useState } from 'react'
import { GuardarSesionForm } from '../components/noche/GuardarSesionForm'
import { ListaCandidatas } from '../components/noche/ListaCandidatas'
import { ListaNoDisponibles } from '../components/noche/ListaNoDisponibles'
import {
  MENSAJE_AGREGA_UNA,
  MENSAJE_GUARDADA,
  MENSAJE_SIN_TIEMPO_GUARDAR,
  mensajeAgregar,
  mensajeNombreLargo,
  mensajeTiempo,
  mensajeVacio,
} from '../components/noche/mensajes'
import { SesionArmada } from '../components/noche/SesionArmada'
import { TiempoDisponibleForm } from '../components/noche/TiempoDisponibleForm'
import { clasificarCandidatas, peliculasPorVer, type Candidata } from '../domain/candidatas'
import { validarTiempoDisponible } from '../domain/nochePelicula'
import { nombreDemasiadoLargo, normalizarNombre, puedeGuardar } from '../domain/sesion'
import { useDuraciones } from '../hooks/useDuraciones'
import { useGuardarSesion } from '../hooks/useGuardarSesion'
import { useSesionEnArmado } from '../hooks/useSesionEnArmado'
import { useMiLista } from '../lista/useMiLista'

const ESQUELETOS = 4
// El campo arranca con un valor razonable: así no se muestra un error antes de que la persona
// escriba nada, y ya se ve qué cabe en una noche típica.
const TIEMPO_INICIAL = '120'

export function NochePage() {
  const lista = useMiLista()
  const [tiempoTexto, setTiempoTexto] = useState(TIEMPO_INICIAL)
  const [aviso, setAviso] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [guardada, setGuardada] = useState(false)
  const tiempo = validarTiempoDisponible(tiempoTexto)
  const minutos = tiempo.ok ? tiempo.minutos : null

  // La lista de E1 ya está en memoria: no se vuelve a pedir, solo se filtra con la regla pura.
  const porVer = useMemo(() => peliculasPorVer(lista.items), [lista.items])
  const tmdbIds = useMemo(() => porVer.map((item) => item.tmdb_id), [porVer])
  const {
    duraciones,
    loading: cargandoDuraciones,
    error: errorDuraciones,
    reintentar,
  } = useDuraciones(tmdbIds)
  const sesion = useSesionEnArmado(minutos)
  const { guardando, error: errorGuardado, guardar } = useGuardarSesion()

  // Sin useMemo a propósito: son decenas de películas y el compilador de React ya memoriza lo
  // necesario; hacerlo a mano solo le impedía optimizar este componente.
  const clasificacion = minutos === null ? null : clasificarCandidatas(porVer, duraciones, minutos)

  const evaluacionGuardar = minutos === null ? null : puedeGuardar(sesion.peliculas, minutos)
  const errorNombre = nombreDemasiadoLargo(nombre) ? mensajeNombreLargo() : null
  // Si la sesión se pasa no hace falta una ayuda más: ya lo explica el resumen de tiempo.
  const ayudaGuardar =
    evaluacionGuardar === null
      ? MENSAJE_SIN_TIEMPO_GUARDAR
      : !evaluacionGuardar.ok && evaluacionGuardar.motivo === 'vacia'
        ? MENSAJE_AGREGA_UNA
        : null

  const agregar = (candidata: Candidata) => {
    // La pausa solo cuenta si la sesión ya tiene películas: se mide antes de agregar.
    const hayPausa = sesion.peliculas.length > 0
    const resultado = sesion.agregar(candidata)
    setAviso(resultado.ok ? null : mensajeAgregar(resultado, candidata.titulo, hayPausa))
    setGuardada(false)
  }

  const quitar = (tmdbId: number) => {
    sesion.quitar(tmdbId)
    setAviso(null)
    setGuardada(false)
  }

  const alGuardar = async () => {
    const nombreFinal = normalizarNombre(nombre, new Date())
    if (!nombreFinal.ok || minutos === null) return

    const id = await guardar({
      nombre: nombreFinal.nombre,
      tiempoDisponible: minutos,
      peliculas: [...sesion.peliculas],
    })
    // Sin id no se guardó: la sesión armada se conserva para reintentar (HU-03-C9).
    if (id === null) return

    sesion.vaciar()
    setNombre('')
    setAviso(null)
    setGuardada(true)
  }

  return (
    <main className="noche">
      <h1 className="noche__title">Noche de película</h1>

      <TiempoDisponibleForm
        valor={tiempoTexto}
        error={tiempo.ok ? null : mensajeTiempo(tiempo.motivo)}
        onCambiar={setTiempoTexto}
      />

      {lista.loading ? (
        <p className="status-message">Cargando tu lista…</p>
      ) : lista.error ? (
        <p role="alert" className="alert alert--error">
          No se pudo cargar tu lista: {lista.error}
        </p>
      ) : (
        <div className="noche__layout">
          {/* Columna izquierda: lo que cabe y, debajo, lo que no está disponible. */}
          <div className="noche__columna">
            <section className="noche__seccion">
              <h2 className="noche__subtitulo">Caben en tu tiempo</h2>

              {errorDuraciones ? (
                <p role="alert" className="alert alert--error">
                  No se pudieron consultar las duraciones: {errorDuraciones}
                </p>
              ) : cargandoDuraciones ? (
                <div className="noche__lista" aria-busy="true">
                  {Array.from({ length: ESQUELETOS }, (_, i) => (
                    <div key={i} className="skeleton noche__esqueleto" />
                  ))}
                </div>
              ) : clasificacion === null || minutos === null ? (
                <p className="status-message">Indica un tiempo válido para ver qué cabe.</p>
              ) : clasificacion.vacio !== null ? (
                <p className="status-message">{mensajeVacio(clasificacion.vacio, minutos)}</p>
              ) : (
                <ListaCandidatas
                  candidatas={clasificacion.candidatas}
                  accionPara={(candidata) => (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      aria-label={`Agregar ${candidata.titulo}`}
                      onClick={() => agregar(candidata)}
                    >
                      Agregar
                    </button>
                  )}
                />
              )}
            </section>

            {!cargandoDuraciones &&
              clasificacion !== null &&
              clasificacion.noDisponibles.length > 0 && (
                <ListaNoDisponibles items={clasificacion.noDisponibles} onReintentar={reintentar} />
              )}
          </div>

          {/* Columna derecha: la sesión que se está armando y cómo guardarla. */}
          <div className="noche__columna">
            {guardada && (
              <p role="status" className="alert alert--ok">
                {MENSAJE_GUARDADA}
              </p>
            )}
            <SesionArmada
              peliculas={sesion.peliculas}
              total={sesion.total}
              restante={sesion.restante}
              aviso={aviso}
              onQuitar={quitar}
            >
              <GuardarSesionForm
                nombre={nombre}
                errorNombre={errorNombre}
                ayuda={ayudaGuardar}
                error={errorGuardado}
                guardando={guardando}
                deshabilitado={evaluacionGuardar?.ok !== true || errorNombre !== null}
                onCambiarNombre={setNombre}
                onGuardar={() => void alGuardar()}
              />
            </SesionArmada>
          </div>
        </div>
      )}
    </main>
  )
}
