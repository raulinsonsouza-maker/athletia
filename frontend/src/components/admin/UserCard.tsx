interface User {
  id: string
  email: string
  nome: string | null
  telefone?: string | null
  role: string
  plano?: string | null
  planoAtivo?: boolean
  dataPagamento?: string | null
  dataExpiracao?: string | null
  ativo?: boolean
  createdAt: string
  estagioTrial?: 'D1' | 'D2' | 'D3' | 'EXPIrado' | 'PLANO_ATIVO' | 'SEM_ACESSO'
  vencimentoTexto?: string
  diasRestantes?: number
  perfilCompleto?: boolean
  ultimoAcesso?: string | null
  perfil?: {
    objetivo: string | null
    experiencia: string | null
    pesoAtual: number | null
  }
}

interface UserCardProps {
  user: User
  onClick: () => void
  isSelected?: boolean
}

export default function UserCard({ user, onClick, isSelected }: UserCardProps) {
  const estagio = user.estagioTrial || (user.planoAtivo ? 'PLANO_ATIVO' : 'SEM_ACESSO')
  const vencimentoTexto = user.vencimentoTexto || '-'
  const perfilCompleto = user.perfilCompleto !== undefined ? user.perfilCompleto : !!user.perfil
  const ultimoAcesso = user.ultimoAcesso ? new Date(user.ultimoAcesso) : null

  let engajamentoTexto = 'Nunca acessou'
  if (ultimoAcesso) {
    const agora = new Date()
    const diffMs = agora.getTime() - ultimoAcesso.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) engajamentoTexto = 'Hoje'
    else if (diffDays === 1) engajamentoTexto = 'Ontem'
    else if (diffDays < 7) engajamentoTexto = `Há ${diffDays} dias`
    else engajamentoTexto = ultimoAcesso.toLocaleDateString('pt-BR')
  }

  const getBadgeColor = (estagio: string) => {
    if (estagio === 'D3') return 'bg-warning/20 text-warning border-warning/30'
    if (estagio === 'D1' || estagio === 'D2') return 'bg-primary/20 text-primary border-primary/30'
    if (estagio === 'EXPIrado') return 'bg-error/20 text-error border-error/30'
    if (estagio === 'PLANO_ATIVO') return 'bg-success/20 text-success border-success/30'
    return 'bg-grey/20 text-light-muted border-grey/30'
  }

  const getEstagioLabel = (estagio: string) => {
    if (estagio === 'D1') return 'Trial D1'
    if (estagio === 'D2') return 'Trial D2'
    if (estagio === 'D3') return 'Trial D3'
    if (estagio === 'EXPIrado') return 'Trial Expirado'
    if (estagio === 'PLANO_ATIVO') return 'Plano Ativo'
    return 'Sem Acesso'
  }

  return (
    <div
      onClick={onClick}
      className={`card-hover cursor-pointer transition-all p-4 rounded-lg border ${
        isSelected
          ? 'border-primary bg-primary/10'
          : estagio === 'D3'
          ? 'border-l-4 border-warning bg-warning/5 border-l-warning'
          : 'border-grey/30 hover:border-primary/50'
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-light mb-1 truncate">
              {user.nome || 'Sem nome'}
            </h3>
            <p className="text-light-muted text-sm truncate">{user.email}</p>
          </div>
          {user.telefone && (
            <div className="ml-2 flex-shrink-0">
              <svg
                className="w-4 h-4 text-light-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium border ${getBadgeColor(
              estagio
            )}`}
          >
            {getEstagioLabel(estagio)}
          </span>
          {perfilCompleto ? (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-success/20 text-success border border-success/30">
              Perfil Completo
            </span>
          ) : (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-warning/20 text-warning border border-warning/30">
              Perfil Incompleto
            </span>
          )}
          {user.ativo === false && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-error/20 text-error border border-error/30">
              Desabilitado
            </span>
          )}
        </div>

        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-light-muted">Vencimento:</span>
            <span className="font-medium text-light">{vencimentoTexto}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-light-muted">Último acesso:</span>
            <span
              className={`font-medium ${
                ultimoAcesso ? 'text-light' : 'text-error'
              }`}
            >
              {engajamentoTexto}
            </span>
          </div>
          {user.diasRestantes !== undefined && estagio !== 'PLANO_ATIVO' && (
            <div className="flex items-center justify-between">
              <span className="text-light-muted">
                {user.diasRestantes < 1 ? 'Horas restantes:' : 'Dias restantes:'}
              </span>
              <span
                className={`font-medium ${
                  user.diasRestantes <= 1 ? 'text-error' : 'text-light'
                }`}
              >
                {user.diasRestantes < 1 
                  ? `${Math.floor(user.diasRestantes * 24)}h`
                  : `${Math.ceil(user.diasRestantes)}d`
                }
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-grey/30">
          <p className="text-light-muted text-xs">
            Cadastrado em {new Date(user.createdAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

