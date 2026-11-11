import { Link } from 'react-router-dom'
import { MENSAJE_SIN_SESIONES } from '../components/noche/mensajes'
import { SesionResumenCard } from '../components/noche/SesionResumenCard'
import { useSesionesGuardadas } from '../hooks/useSesionesGuardadas'
import { rutaNoche } from '../lib/rutas'

const ESQUELETOS = 3

// Lista de mis sesiones guardadas, de la más reciente a la más antigua. Solo lectura: no hay
// acciones de editar ni de eliminar (DEC-03).
export function SesionesPage() {
  const { sesiones, loading, error, reintentar } = useSesionesGuardadas()

  return (
    <main className="noche">
      <div className="noche__cabecera">
        <h1 className="noche__title">Mis sesiones</h1>
        <Link to={rutaNoche()} className="btn btn--ghost">
          Armar una sesión
        </Link>
      </div>

      {loading ? (
        <div className="noche__lista" aria-busy="true">
          {Array.from({ length: ESQUELETOS }, (_, i) => (
            <div key={i} className="skeleton noche__esqueleto" />
          ))}
        </div>
      ) : error ? (
        <div className="noche__seccion">
          <p role="alert" className="alert alert--error">
            No se pudieron cargar tus sesiones: {error}
          </p>
          <button type="button" className="btn btn--ghost noche__reintentar" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      ) : sesiones.length === 0 ? (
        <p className="status-message">{MENSAJE_SIN_SESIONES}</p>
      ) : (
        <ul className="noche__lista">
          {sesiones.map((sesion) => (
            <SesionResumenCard key={sesion.id} sesion={sesion} />
          ))}
        </ul>
      )}
    </main>
  )
}
