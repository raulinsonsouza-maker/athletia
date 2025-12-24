import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AvisoTrialAcabando() {
  const { user, isTrialAtivo, diasRestantesTrial } = useAuth()
  const navigate = useNavigate()

  if (!isTrialAtivo() || !user) {
    return null
  }

  const diasRestantes = diasRestantesTrial()
  const horasRestantes = (() => {
    if (!user.dataFimTrial) return 0
    const agora = new Date()
    const dataFimTrial = new Date(user.dataFimTrial)
    const diffMs = dataFimTrial.getTime() - agora.getTime()
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)))
  })()

  // Só mostrar se faltam 12 horas ou menos (quando realmente está acabando)
  if (horasRestantes > 12) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-2">
            Seu teste vai acabar em breve!
          </h3>
          <p className="text-white/90 mb-4">
            {horasRestantes <= 1
              ? 'Falta menos de 1 hora para seu período de teste expirar.'
              : diasRestantes === 0
              ? `Faltam apenas ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}!`
              : `Faltam apenas ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'} para seu período de teste expirar.`}
          </p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 transition shadow-glow"
          >
            Escolher Plano Agora
          </button>
        </div>
      </div>
    </div>
  )
}
