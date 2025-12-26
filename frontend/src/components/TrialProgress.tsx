import { useEffect, useState } from 'react'
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

export default function TrialProgress() {
  const { user, isTrialAtivo } = useAuth()
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
    <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
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
          <span className="text-sm font-semibold text-white">
            Dia {progresso.diaAtual} de {progresso.diasTotais}
          </span>
        </div>
        <span className="text-xs text-white/70">
          {progresso.treinosConcluidos} de {progresso.objetivo} treinos
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progresso.progressoPercentual}%` }}
        />
      </div>
      {progresso.treinosRestantes > 0 && (
        <p className="text-xs text-white/60">
          Falta {progresso.treinosRestantes} treino{progresso.treinosRestantes > 1 ? 's' : ''} para completar seu trial
        </p>
      )}
    </div>
  )
}

