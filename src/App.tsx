import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { DetailPage } from './pages/DetailPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NochePage } from './pages/NochePage'
import { RegisterPage } from './pages/RegisterPage'
import { SearchPage } from './pages/SearchPage'
import { SesionDetailPage } from './pages/SesionDetailPage'
import { SesionesPage } from './pages/SesionesPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          {/* Todo lo que cuelga de este layout exige sesión activa. */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/noche" element={<NochePage />} />
            <Route path="/noche/sesiones" element={<SesionesPage />} />
            <Route path="/noche/sesiones/:id" element={<SesionDetailPage />} />
            <Route path="/titulo/:tipo/:id" element={<DetailPage />} />
          </Route>
          {/* URL desconocida → "/", que sin sesión rebota a /login. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
