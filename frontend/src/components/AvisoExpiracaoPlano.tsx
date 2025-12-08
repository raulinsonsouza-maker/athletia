import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const IconeAlerta = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

export default function AvisoExpiracaoPlano() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Verificar se deve exibir o aviso
  if (!user?.planoAtivo || !user?.dataExpiracao) {
    return null
  }

  const dataExpiracao = new Date(user.dataExpiracao)
  const agora = new Date()
  const diferencaDias = Math.ceil((dataExpiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))

  // Exibir aviso apenas se faltam 3 dias ou menos e ainda não expirou
  if (diferencaDias > 3 || diferencaDias < 0) {
    return null
  }

  const getMensagem = () => {
    if (diferencaDias === 0) {
      return 'Seu plano expira hoje!'
    } else if (diferencaDias === 1) {
      return 'Seu plano expira amanhã!'
    } else {
      return `Seu plano expira em ${diferencaDias} dias`
    }
  }

  const getPlanoLabel = () => {
    switch (user.plano) {
      case 'MENSAL':
        return 'Mensal'
      case 'TRIMESTRAL':
        return 'Trimestral'
      case 'SEMESTRAL':
        return 'Semestral'
      default:
        return user.plano || 'Premium'
    }
  }

  return (
    <div className="bg-warning/20 border-2 border-warning/50 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-warning/30 flex items-center justify-center">
            <IconeAlerta className="w-6 h-6 text-warning" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-light mb-1 flex items-center gap-2">
            <span>Atenção: {getMensagem()}</span>
          </h3>
          <p className="text-sm text-light-muted mb-3">
            Renove seu plano <span className="font-semibold">{getPlanoLabel()}</span> para continuar aproveitando todos os recursos da plataforma.
          </p>
          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary text-sm px-6 py-2 font-semibold inline-flex items-center gap-2"
          >
            <span>Renovar Plano</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

