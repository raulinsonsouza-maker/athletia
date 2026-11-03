import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Landing from './Landing'

/**
 * Onboarding após pagamento (LP /oferta).
 * Reusa os mesmos steps da Landing; o finish grava o perfil e gera treinos.
 */
export default function MontarTreino() {
  const { user, loading, refreshUser, isAuthenticated } = useAuth()
  const [checking, setChecking] = useState(true)
  const [destino, setDestino] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    const verificar = async () => {
      if (loading) return
      if (!isAuthenticated || !user) {
        if (ativo) {
          setDestino('/oferta')
          setChecking(false)
        }
        return
      }
      try {
        await refreshUser()
      } catch {
        // segue com user em memória
      }
      if (!ativo) return
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
      const dados = raw ? JSON.parse(raw) : user
      if (!dados.planoAtivo) {
        setDestino('/oferta')
      } else if (dados.precisaOnboarding === false) {
        setDestino('/meu-plano')
      } else {
        setDestino(null)
      }
      setChecking(false)
    }
    void verificar()
    return () => {
      ativo = false
    }
  }, [loading, isAuthenticated, user?.id])

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark text-light">
        Carregando...
      </div>
    )
  }

  if (destino) {
    return <Navigate to={destino} replace />
  }

  return <Landing posPagamento />
}
