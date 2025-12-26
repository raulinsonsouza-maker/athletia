import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'

interface TrialProgressData {
  treinosConcluidos: number
  treinosRestantes: number
  objetivo: number
  progressoPercentual: number
  diaAtual: number
  diasTotais: number
  diasRestantes: number
}

export default function TrialProgressHeader() {
  const { user, isTrialAtivo } = useAuth()
  const navigate = useNavigate()
  const [progresso, setProgresso] = useState<TrialProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarProgresso = async () => {
      if (!user || !isTrialAtivo()) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/trial-progress')
        setProgresso(response.data)
      } catch (error) {
        console.error('Erro ao carregar progresso do trial:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarProgresso()
    const interval = setInterval(carregarProgresso, 60000) // Atualizar a cada minuto
    return () => clearInterval(interval)
  }, [user, isTrialAtivo])

  if (!isTrialAtivo() || !progresso || loading) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-b border-primary/40 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white">
                  Dia {progresso.diaAtual} de {progresso.diasTotais}
                </span>
                <span className="text-xs text-white/70">
                  • {progresso.treinosConcluidos}/{progresso.objetivo} treinos
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progresso.progressoPercentual}%` }}
                />
              </div>
            </div>
          </div>
          {progresso.treinosRestantes > 0 && (
            <button
              onClick={() => navigate('/checkout')}
              className="px-3 py-1.5 bg-primary text-dark text-xs font-bold rounded-full hover:bg-primary/90 transition whitespace-nowrap flex-shrink-0"
            >
              Manter Meu Progresso
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

