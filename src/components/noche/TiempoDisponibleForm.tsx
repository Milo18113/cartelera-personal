interface TiempoDisponibleFormProps {
  // Lo que escribió la persona, tal cual: se valida en el dominio, no aquí.
  valor: string
  // Mensaje ya redactado, o null si el valor es válido.
  error: string | null
  onCambiar: (valor: string) => void
}

const ID_ERROR = 'noche-tiempo-error'

export function TiempoDisponibleForm({ valor, error, onCambiar }: TiempoDisponibleFormProps) {
  return (
    <div className="noche__tiempo">
      <label className="field">
        ¿Cuánto tiempo tienes? (minutos)
        {/* type="text" y no "number": un campo numérico borra lo que no es número y no
            deja mostrar «usa un número entero» cuando se escribe «90,5». */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={valor}
          aria-invalid={error !== null}
          aria-describedby={error ? ID_ERROR : undefined}
          onChange={(e) => onCambiar(e.target.value)}
        />
      </label>
      {error && (
        <p id={ID_ERROR} role="alert" className="alert alert--error">
          {error}
        </p>
      )}
    </div>
  )
}
