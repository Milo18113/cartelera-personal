import { useState } from 'react'
import { MENSAJE_SIN_CONEXION } from '../domain/errores'

interface ErrorPageProps {
  // Solo lo pasan las pantallas que ya tenían «Reintentar» (mis sesiones y el detalle de una
  // sesión); las demás no llevan botón.
  onReintentar?: () => void
}

// La imagen la pone Milo en public/. Mientras no esté, o si no carga, se oculta y la pantalla se
// ve igual sin ella (en el servidor de desarrollo y en Vercel un archivo que falta responde con el
// index.html, que no es una imagen: también cae en onError).
const IMAGEN_ERROR = '/error-servidor.png'

// Pantalla para cuando una página no logra cargar sus datos por falta de conexión con Supabase o
// con TMDB (E1-D06). Reemplaza el <main> de la página; el encabezado vive en AppLayout y se queda.
export function ErrorPage({ onReintentar }: ErrorPageProps) {
  const [mostrarImagen, setMostrarImagen] = useState(true)

  return (
    <main className="error-page">
      {mostrarImagen && (
        // alt vacío: la imagen es decorativa, el mensaje ya dice todo.
        <img
          className="error-page__imagen"
          src={IMAGEN_ERROR}
          alt=""
          onError={() => setMostrarImagen(false)}
        />
      )}
      <h1 className="error-page__title">Error 404</h1>
      <p role="alert" className="error-page__message">
        {MENSAJE_SIN_CONEXION}
      </p>
      {onReintentar && (
        <button type="button" className="btn btn--ghost" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </main>
  )
}
