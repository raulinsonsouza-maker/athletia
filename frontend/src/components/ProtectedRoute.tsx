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
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Verificar se precisa de plano ativo (exceto para /checkout, /perfil e /trial-expirado)
  const rotasPermitidasSemPlano = ['/checkout', '/perfil', '/trial-expirado']
  const precisaPlanoAtivo = !rotasPermitidasSemPlano.includes(location.pathname)

  if (precisaPlanoAtivo && user) {
    // Verificar se plano está ativo e não expirado
    const agora = new Date()
    const planoValido = user.planoAtivo && (
      !user.dataExpiracao || new Date(user.dataExpiracao) > agora
    )

    // Se plano está válido, permitir acesso
    if (planoValido) {
      return <>{children}</>
    }

    // Se não tem plano válido, verificar trial
    if (user.dataFimTrial) {
      const dataFimTrial = new Date(user.dataFimTrial)
      const trialAtivo = !user.planoAtivo && dataFimTrial > agora
      
      if (trialAtivo) {
        // Trial ativo, permitir acesso
        return <>{children}</>
      }

      // Trial expirado - redirecionar para tela específica
      if (dataFimTrial <= agora && !user.planoAtivo) {
        return <Navigate to="/trial-expirado" replace />
      }
    }

    // Sem trial e sem plano válido - redirecionar para checkout
    return <Navigate to="/checkout" replace />
  }

  return <>{children}</>
}

