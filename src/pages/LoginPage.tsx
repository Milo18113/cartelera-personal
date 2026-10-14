import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../auth/useAuth'

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  // Un usuario ya autenticado no tiene nada que hacer en /login.
  if (user) return <Navigate to="/" replace />

  return (
    <AuthForm
      title="Iniciar sesión"
      submitLabel="Entrar"
      onSubmit={async (email, password) => {
        await signIn(email, password)
        navigate('/', { replace: true })
      }}
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-indigo-400 hover:underline">
            Regístrate
          </Link>
        </>
      }
    />
  )
}
