import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Verificar se precisa de plano ativo (exceto para /checkout e /perfil)
  const rotasPermitidasSemPlano = ['/checkout', '/perfil']
  const precisaPlanoAtivo = !rotasPermitidasSemPlano.includes(location.pathname)

  if (precisaPlanoAtivo && user && !user.planoAtivo) {
    return <Navigate to="/checkout" replace />
  }

  return <>{children}</>
}

