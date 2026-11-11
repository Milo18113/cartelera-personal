// Esqueleto de una tarjeta mientras llegan los datos: el recuadro del póster y las líneas de la
// información. Reserva el mismo espacio que la tarjeta real para que la página no salte al cargar.
export function MovieCardSkeleton() {
  return (
    <div className="card" aria-hidden="true">
      <div className="card__media skeleton" />
      <div className="card__info">
        <div className="skeleton card__esqueleto" />
        <div className="skeleton card__esqueleto card__esqueleto--corta" />
      </div>
    </div>
  )
}
