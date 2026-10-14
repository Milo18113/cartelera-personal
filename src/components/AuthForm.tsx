import { useState, type FormEvent, type ReactNode } from 'react'

interface AuthFormProps {
  title: string
  submitLabel: string
  // Solo el registro pide nombre; el login ignora el tercer argumento.
  showName?: boolean
  onSubmit: (email: string, password: string, name: string) => Promise<void>
  footer: ReactNode
  // Mensaje informativo tras un submit exitoso que no redirige (ej. confirmar email).
  notice?: string | null
}

export function AuthForm({ title, submitLabel, showName, onSubmit, footer, notice }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(email, password, name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth">
      <h1 className="auth__title">🎬 {title}</h1>

      <form onSubmit={handleSubmit} className="auth__form">
        {showName && (
          <label className="field">
            Nombre
            <input
              type="text"
              required
              maxLength={40}
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}

        <label className="field">
          Correo
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete={showName ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="alert alert--error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="alert alert--ok">
            {notice}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn--primary">
          {submitting ? 'Procesando…' : submitLabel}
        </button>
      </form>

      <p className="auth__footer">{footer}</p>
    </main>
  )
}
