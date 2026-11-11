import type { TarjetaPelicula } from '../components/MovieCard'
import { decidirCambioEstado, type Estado } from '../domain/miLista'
import { mensajeAgregada, mensajeMovida, mensajeQuitada } from '../lista/mensajes'
import { useMiLista } from '../lista/useMiLista'
import { useNotificaciones } from '../notificaciones/useNotificaciones'

// Conecta los controles de una tarjeta con la lista. Lo comparten inicio, búsqueda y detalle.
export function useAccionesTarjeta() {
  const lista = useMiLista()
  const { notificar } = useNotificaciones()

  // Cada acción devuelve si salió bien. Si sí, se confirma con un aviso; si no, el error ya lo
  // avisó la lista (MiListaProvider), así no se muestra dos veces.
  const confirmar = async (accion: Promise<boolean>, mensaje: string) => {
    if (await accion) notificar({ tipo: 'exito', mensaje })
  }

  // Elegir un estado en el selector: agrega el título si aún no está en la lista y, si ya está,
  // lo cambia. Elegir el estado que ya tiene no hace ninguna petición.
  const onCambiarEstado = (pelicula: TarjetaPelicula, estado: Estado) => {
    const { item } = pelicula

    switch (decidirCambioEstado(item?.estado ?? null, estado)) {
      case 'ninguno':
        return
      case 'cambiar':
        if (item) {
          void confirmar(lista.cambiarEstado(item, estado), mensajeMovida(pelicula.titulo, estado))
        }
        return
      case 'agregar':
        void confirmar(
          lista.agregar({
            tmdbId: pelicula.tmdbId,
            titulo: pelicula.titulo,
            posterUrl: pelicula.posterUrl,
            tipo: pelicula.tipo,
            estado,
          }),
          mensajeAgregada(pelicula.titulo, estado),
        )
        return
    }
  }

  const onEliminar = (pelicula: TarjetaPelicula) => {
    if (pelicula.item) {
      void confirmar(lista.eliminar(pelicula.item), mensajeQuitada(pelicula.titulo))
    }
  }

  return { busy: lista.busy, onCambiarEstado, onEliminar }
}
