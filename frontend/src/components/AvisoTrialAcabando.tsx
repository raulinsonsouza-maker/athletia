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
            Seu plano personalizado será pausado em breve
          </h3>
          <p className="text-white/90 mb-4">
            {horasRestantes <= 1
              ? 'Falta menos de 1 hora. Seu progresso e consistência ficarão bloqueados.'
              : diasRestantes === 0
              ? `Faltam apenas ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}. Seu progresso e consistência ficarão bloqueados.`
              : `Faltam apenas ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}. Seu progresso e consistência ficarão bloqueados.`}
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
            <p className="text-xs text-white/70 mb-2">O que será bloqueado:</p>
            <ul className="space-y-1 text-xs text-white/80">
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Treinos personalizados
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Histórico completo
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Ajustes automáticos
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Progresso detalhado
              </li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-primary text-dark font-bold rounded-full hover:bg-primary/90 transition shadow-glow"
          >
            Manter Meu Progresso
          </button>
        </div>
      </div>
    </div>
  )
}
