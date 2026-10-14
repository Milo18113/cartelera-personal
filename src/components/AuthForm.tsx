import { useState, type FormEvent, type ReactNode } from 'react'

interface AuthFormProps {
  title: string
  submitLabel: string
  onSubmit: (email: string, password: string) => Promise<void>
  footer: ReactNode
  // Mensaje informativo tras un submit exitoso que no redirige (ej. confirmar email).
  notice?: string | null
}

export function AuthForm({ title, submitLabel, onSubmit, footer, notice }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-center text-3xl font-semibold">🎬 {title}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete={submitLabel === 'Entrar' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-indigo-400"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-md bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? 'Procesando…' : submitLabel}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400">{footer}</p>
    </main>
  )
}
