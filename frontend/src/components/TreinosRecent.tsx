import { useNavigate } from 'react-router-dom'
import { TreinoSemanal } from '../types/treino.types'

interface TreinosRecentProps {
  treinos: TreinoSemanal[]
}

export default function TreinosRecent({ treinos }: TreinosRecentProps) {
  const navigate = useNavigate()

  // Filtrar apenas treinos concluídos e ordenar por data (mais recente primeiro)
  const treinosConcluidos = treinos
    .filter(t => t.concluido)
    .sort((a, b) => {
      const dataA = new Date(a.data).getTime()
      const dataB = new Date(b.data).getTime()
      return dataB - dataA // Mais recente primeiro
    })
    .slice(0, 3) // Apenas os 3 mais recentes

  if (treinosConcluidos.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <h3 className="text-xl font-display font-bold text-light">Treinos Recentes</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
        <div className="card text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-light-muted">Nenhum treino concluído ainda</p>
          <p className="text-sm text-light-muted mt-2">Complete seu primeiro treino para ver o histórico aqui!</p>
        </div>
      </div>
    )
  }

  const formatarData = (data: string) => {
    const date = new Date(data)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataTreino = new Date(date)
    dataTreino.setHours(0, 0, 0, 0)
    
    const diffTime = hoje.getTime() - dataTreino.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== hoje.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Treinos Recentes</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      <div className="space-y-3">
        {treinosConcluidos.map((treino) => (
          <div
            key={treino.id}
            className="card hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => navigate('/historico')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Ícone/Letra do treino */}
                <div className="w-12 h-12 rounded-xl bg-success/20 border-2 border-success/50 flex items-center justify-center flex-shrink-0">
                  {treino.letraTreino ? (
                    <span className="text-xl font-bold text-success">{treino.letraTreino}</span>
                  ) : (
                    <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Informações do treino */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-light truncate">
                      {treino.letraTreino ? `Treino ${treino.letraTreino}` : treino.nome || treino.tipo || 'Treino'}
                    </h4>
                    <span className="badge-success text-xs flex items-center gap-1 flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Concluído
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-light-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatarData(treino.data)}
                    </span>
                    {treino.exercicios && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {treino.exercicios.length} exercícios
                      </span>
                    )}
                    {treino.tempoEstimado && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {treino.tempoEstimado} min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão ver detalhes */}
              <button
                className="p-2 hover:bg-dark-lighter rounded-lg transition-colors text-primary group-hover:text-primary/80"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/historico')
                }}
                aria-label="Ver detalhes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão ver histórico completo */}
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/historico')}
          className="btn-secondary text-sm"
        >
          Ver Histórico Completo
        </button>
      </div>
    </div>
  )
}

