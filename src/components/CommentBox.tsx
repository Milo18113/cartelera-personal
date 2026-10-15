import { useState, type FormEvent } from 'react'

interface CommentBoxProps {
  // Comentario guardado en mi_lista (null si no hay).
  comentario: string | null
  disabled: boolean
  // Devuelve true si se guardó. Un texto vacío se envía como null.
  onGuardar: (comentario: string | null) => Promise<boolean>
}

const MAX_CARACTERES = 1000

export function CommentBox({ comentario, disabled, onGuardar }: CommentBoxProps) {
  const guardado = comentario ?? ''
  const [borrador, setBorrador] = useState(guardado)
  const [recienGuardado, setRecienGuardado] = useState(false)
  const sinCambios = borrador.trim() === guardado.trim()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const texto = borrador.trim()
    const ok = await onGuardar(texto === '' ? null : texto)
    if (ok) {
      setBorrador(texto)
      setRecienGuardado(true)
    }
  }

  return (
    <form className="comment" onSubmit={handleSubmit}>
      <textarea
        className="comment__input"
        aria-label="Mi comentario"
        placeholder="¿Qué te pareció? Escribe tu comentario…"
        rows={4}
        maxLength={MAX_CARACTERES}
        value={borrador}
        disabled={disabled}
        onChange={(e) => {
          setBorrador(e.target.value)
          setRecienGuardado(false)
        }}
      />
      <div className="comment__footer">
        <button type="submit" className="btn btn--primary" disabled={disabled || sinCambios}>
          Guardar
        </button>
        {recienGuardado && sinCambios && (
          <span role="status" className="comment__status">
            Guardado
          </span>
        )}
      </div>
    </form>
  )
}
