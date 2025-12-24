interface TimelineEvent {
  id: string
  type: 'cadastro' | 'acesso' | 'conversao' | 'trial_extendido' | 'senha_redefinida' | 'email_enviado' | 'whatsapp_enviado' | 'nota_adicionada'
  title: string
  description: string
  date: string
  metadata?: Record<string, any>
}

interface UserTimelineProps {
  userId: string
  userCreatedAt: string
  userDetails?: {
    planoAtivo?: boolean
    dataPagamento?: string | null
    ultimoAcesso?: string | null
  }
}

export default function UserTimeline({ userId: _userId, userCreatedAt, userDetails }: UserTimelineProps) {
  // Construir eventos da timeline baseado nos dados disponíveis
  const events: TimelineEvent[] = []

  // Evento de cadastro
  events.push({
    id: 'cadastro',
    type: 'cadastro',
    title: 'Usuário cadastrado',
    description: 'Conta criada no sistema',
    date: userCreatedAt,
  })

  // Evento de conversão (se houver plano ativo)
  if (userDetails?.planoAtivo && userDetails?.dataPagamento) {
    events.push({
      id: 'conversao',
      type: 'conversao',
      title: 'Conversão para plano pago',
      description: `Plano ${userDetails.planoAtivo ? 'ativado' : 'desativado'}`,
      date: userDetails.dataPagamento,
    })
  }

  // Evento de último acesso
  if (userDetails?.ultimoAcesso) {
    events.push({
      id: 'ultimo_acesso',
      type: 'acesso',
      title: 'Último acesso',
      description: 'Acesso mais recente ao sistema',
      date: userDetails.ultimoAcesso,
    })
  }

  // Ordenar eventos por data (mais recente primeiro)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'cadastro':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        )
      case 'acesso':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )
      case 'conversao':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'trial_extendido':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'senha_redefinida':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        )
      case 'email_enviado':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )
      case 'whatsapp_enviado':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )
      case 'nota_adicionada':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'cadastro':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'acesso':
        return 'bg-success/20 text-success border-success/30'
      case 'conversao':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'trial_extendido':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'senha_redefinida':
        return 'bg-grey/20 text-light-muted border-grey/30'
      case 'email_enviado':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'whatsapp_enviado':
        return 'bg-success/20 text-success border-success/30'
      case 'nota_adicionada':
        return 'bg-grey/20 text-light-muted border-grey/30'
      default:
        return 'bg-grey/20 text-light-muted border-grey/30'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `Há ${diffDays} dias`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-light-muted">
        <p>Nenhum evento registrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-light">Timeline de Atividades</h3>
        <span className="text-sm text-light-muted">{events.length} evento(s)</span>
      </div>

      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-grey/30"></div>

        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Ícone */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getEventColor(
                  event.type
                )}`}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pb-6">
                <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-light">{event.title}</h4>
                      <p className="text-xs text-light-muted mt-1">{event.description}</p>
                    </div>
                    <span className="text-xs text-light-muted whitespace-nowrap ml-4">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-grey/30">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-1 bg-grey/20 text-light-muted rounded"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

