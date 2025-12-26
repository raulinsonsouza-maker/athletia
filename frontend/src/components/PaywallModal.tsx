import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  blockedAction?: string
}

export default function PaywallModal({ isOpen, onClose, blockedAction }: PaywallModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!isOpen) return null

  const handleDesbloquear = () => {
    navigate('/checkout')
    onClose()
  }

  const perdas = [
    'Treinos personalizados',
    'Histórico completo',
    'Ajustes automáticos',
    'Progresso detalhado'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-dark via-dark-light to-dark-lighter border-2 border-primary/50 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Seu plano está pausado
          </h2>
          <p className="text-white/70">
            {blockedAction
              ? `Para ${blockedAction}, você precisa desbloquear seu plano.`
              : 'Escolha um plano para continuar usando o AthletIA.'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">
            O que será desbloqueado:
          </h3>
          <ul className="space-y-2">
            {perdas.map((perda, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                <svg
                  className="w-4 h-4 text-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {perda}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDesbloquear}
            className="w-full py-3 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 transition shadow-lg"
          >
            Desbloquear Meu Plano
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-white/60 hover:text-white transition text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

