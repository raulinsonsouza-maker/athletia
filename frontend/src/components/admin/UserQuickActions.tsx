interface UserQuickActionsProps {
  userId: string
  userStatus?: {
    planoAtivo?: boolean
    estagioTrial?: string
    ativo?: boolean
  }
  onExtendTrial?: () => void
  onResetPassword?: () => void
  onSendEmail?: () => void
  onMarkFollowUp?: () => void
  onActivate?: () => void
  onDeactivate?: () => void
  onSimulatePayment?: () => void
  onTestEmail?: () => void
  processing?: string | null
}

export default function UserQuickActions({
  userId: _userId,
  userStatus,
  onExtendTrial,
  onResetPassword,
  onSendEmail,
  onMarkFollowUp,
  onActivate,
  onDeactivate,
  onSimulatePayment,
  onTestEmail,
  processing,
}: UserQuickActionsProps) {
  const actions = [
    {
      id: 'extend_trial',
      label: 'Estender Trial (24h)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: onExtendTrial,
      visible: !userStatus?.planoAtivo && userStatus?.estagioTrial !== 'EXPIrado',
      color: 'text-primary hover:bg-primary/10',
    },
    {
      id: 'reset_password',
      label: 'Redefinir Senha',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      onClick: onResetPassword,
      visible: true,
      color: 'text-light hover:bg-white/10',
    },
    {
      id: 'send_email',
      label: 'Enviar Email',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      onClick: onSendEmail,
      visible: true,
      color: 'text-primary hover:bg-primary/10',
    },
    {
      id: 'test_email',
      label: 'Testar Email Remarketing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: onTestEmail,
      visible: true,
      color: 'text-warning hover:bg-warning/10',
    },
    {
      id: 'simulate_payment',
      label: 'Simular Pagamento',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      onClick: onSimulatePayment,
      visible: !userStatus?.planoAtivo,
      color: 'text-success hover:bg-success/10',
    },
    {
      id: 'mark_followup',
      label: 'Marcar para Follow-up',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      onClick: onMarkFollowUp,
      visible: true,
      color: 'text-warning hover:bg-warning/10',
    },
    {
      id: 'activate',
      label: 'Ativar Usuário',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: onActivate,
      visible: userStatus?.ativo === false,
      color: 'text-success hover:bg-success/10',
    },
    {
      id: 'deactivate',
      label: 'Desativar Usuário',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: onDeactivate,
      visible: userStatus?.ativo !== false,
      color: 'text-error hover:bg-error/10',
    },
  ].filter((action) => action.visible)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-light">Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const isProcessing = processing === action.id
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={isProcessing}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-grey/30 bg-dark-lighter transition-all ${
                action.color
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}`}
            >
              {isProcessing ? (
                <div className="spinner w-5 h-5"></div>
              ) : (
                <div className={action.color.split(' ')[0]}>{action.icon}</div>
              )}
              <span className="text-xs font-medium text-center">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

