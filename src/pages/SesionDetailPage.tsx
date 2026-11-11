import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ICON_PROPS } from '../components/iconos'
import { MENSAJE_SESION_INEXISTENTE } from '../components/noche/mensajes'
import { SesionDetalle } from '../components/noche/SesionDetalle'
import { useSesion } from '../hooks/useSesion'
import { rutaSesiones } from '../lib/rutas'

// Solo dígitos: «abc» o «12abc» no son un id, y se tratan igual que una sesión que no existe.
function idDeLaRuta(parametro: string | undefined): number | null {
  return parametro !== undefined && /^\d+$/.test(parametro) ? Number(parametro) : null
}

export function SesionDetailPage() {
  const { id: parametro } = useParams<{ id: string }>()
  const { sesion, loading, error, reintentar } = useSesion(idDeLaRuta(parametro))

  return (
    <main className="noche">
      <Link to={rutaSesiones()} className="noche__volver">
        <ArrowLeft {...ICON_PROPS} aria-hidden="true" />
        Mis sesiones
      </Link>

      {loading ? (
        <div className="noche__lista" aria-busy="true">
          <div className="skeleton noche__esqueleto" />
          <div className="skeleton noche__esqueleto" />
        </div>
      ) : error ? (
        <div className="noche__seccion">
          <p role="alert" className="alert alert--error">
            No se pudo cargar la sesión: {error}
          </p>
          <button type="button" className="btn btn--ghost noche__reintentar" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      ) : sesion === null ? (
        // Una sesión de otra persona se ve exactamente igual que una que no existe (HU-05-C3).
        <p className="status-message">{MENSAJE_SESION_INEXISTENTE}</p>
      ) : (
        <SesionDetalle sesion={sesion} />
      )}
    </main>
  )
}
