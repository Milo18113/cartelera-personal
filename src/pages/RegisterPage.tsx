import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../auth/useAuth'

export function RegisterPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  return (
    <AuthForm
      title="Crear cuenta"
      submitLabel="Registrarme"
      showName
      notice={notice}
      onSubmit={async (email, password, name) => {
        const { needsEmailConfirmation } = await signUp(email, password, name)
        if (needsEmailConfirmation) {
          setNotice('Revisa tu correo para confirmar la cuenta y luego inicia sesión.')
          return
        }
        navigate('/', { replace: true })
      }}
      footer={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    />
  )
}
