interface GuardarSesionFormProps {
  nombre: string
  // Mensaje si el nombre es demasiado largo; null si está bien.
  errorNombre: string | null
  // Por qué no se puede guardar todavía (por ejemplo, sesión vacía); null si no hace falta decir.
  ayuda: string | null
  // Mensaje del último intento de guardado fallido.
  error: string | null
  guardando: boolean
  deshabilitado: boolean
  onCambiarNombre: (nombre: string) => void
  onGuardar: () => void
}

const ID_ERROR_NOMBRE = 'noche-nombre-error'

export function GuardarSesionForm({
  nombre,
  errorNombre,
  ayuda,
  error,
  guardando,
  deshabilitado,
  onCambiarNombre,
  onGuardar,
}: GuardarSesionFormProps) {
  return (
    <form
      className="guardar"
      onSubmit={(e) => {
        e.preventDefault()
        onGuardar()
      }}
    >
      <label className="field">
        Nombre de la sesión (opcional)
        {/* Sin maxLength a propósito: el navegador cortaría el texto sin avisar, y la regla es
            explicar el límite (HU-03-C4). Además cuenta unidades UTF-16, no caracteres. */}
        <input
          type="text"
          autoComplete="off"
          placeholder="Si lo dejas vacío usa la fecha de hoy"
          value={nombre}
          aria-invalid={errorNombre !== null}
          aria-describedby={errorNombre ? ID_ERROR_NOMBRE : undefined}
          onChange={(e) => onCambiarNombre(e.target.value)}
        />
      </label>

      {errorNombre && (
        <p id={ID_ERROR_NOMBRE} role="alert" className="alert alert--error">
          {errorNombre}
        </p>
      )}
      {ayuda && <p>{ayuda}</p>}
      {error && (
        <p role="alert" className="alert alert--error">
          No se pudo guardar la sesión: {error}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={deshabilitado || guardando}>
        {guardando ? 'Guardando…' : 'Guardar sesión'}
      </button>
    </form>
  )
}
