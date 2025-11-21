import { Treino, VarianteCard, StatusTreino } from '../../types/treino.types'
import {
  formatarDataTreino,
  formatarDataTreinoCompacta,
  obterStatusTreino,
  calcularVolumeTreino,
  calcularPorcentagemConclusao,
  obterNomeTreino,
  isTreinoHoje
} from '../../utils/treino.utils'

interface TreinoCardProps {
  treino: Treino
  variante?: VarianteCard
  onClick?: (treino: Treino) => void
  mostrarAcoes?: boolean
  onAcao?: (acao: string, treino: Treino) => void
  destacar?: boolean
  className?: string
}

export default function TreinoCard({
  treino,
  variante = 'completo',
  onClick,
  mostrarAcoes = false,
  onAcao,
  destacar = false,
  className = ''
}: TreinoCardProps) {
  const status = obterStatusTreino(treino)
  const volume = calcularVolumeTreino(treino)
  const porcentagem = calcularPorcentagemConclusao(treino)
  const nomeTreino = obterNomeTreino(treino)
  const ehHoje = isTreinoHoje(treino)
  const totalExercicios = treino.exercicios?.length || 0
  const exerciciosConcluidos = treino.exercicios?.filter(ex => ex.concluido).length || 0

  // Cores e estilos baseados no status
  const getStatusStyles = (status: StatusTreino) => {
    switch (status) {
      case 'concluido':
        return {
          badge: 'badge-success',
          border: 'border-success/50',
          bg: 'bg-success/10'
        }
      case 'em-andamento':
        return {
          badge: 'badge-warning',
          border: 'border-primary/50',
          bg: 'bg-primary/10'
        }
      case 'perdido':
        return {
          badge: 'badge-error',
          border: 'border-error/50',
          bg: 'bg-error/10'
        }
      case 'futuro':
        return {
          badge: 'badge-secondary',
          border: 'border-grey/30',
          bg: 'bg-dark-lighter'
        }
      default:
        return {
          badge: 'badge-secondary',
          border: 'border-grey/30',
          bg: 'bg-dark-lighter'
        }
    }
  }

  const statusStyles = getStatusStyles(status)
  const statusText = {
    concluido: 'Concluído',
    'em-andamento': 'Em andamento',
    perdido: 'Perdido',
    pendente: 'Pendente',
    futuro: 'Futuro'
  }[status]

  const handleClick = () => {
    if (onClick) {
      onClick(treino)
    }
  }

  // Variante compacta
  if (variante === 'compacto') {
    return (
      <div
        className={`card-hover ${statusStyles.border} border-2 ${destacar ? 'ring-2 ring-primary' : ''} ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-light">{nomeTreino}</h3>
              {ehHoje && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Hoje</span>
              )}
            </div>
            <p className="text-xs text-light-muted">{formatarDataTreinoCompacta(treino.data)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${statusStyles.badge} text-xs`}>{statusText}</span>
            {treino.concluido && (
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Variante resumo
  if (variante === 'resumo') {
    return (
      <div
        className={`card ${statusStyles.border} border-2 ${destacar ? 'ring-2 ring-primary' : ''} ${className}`}
        onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-light">{nomeTreino}</h3>
            <p className="text-sm text-light-muted">{formatarDataTreino(treino.data)}</p>
          </div>
          <div className="text-right">
            <span className={`${statusStyles.badge} flex items-center gap-1`}>
              {treino.concluido && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {statusText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-2">
            <div className="text-xs text-light-muted mb-1">Exercícios</div>
            <div className="text-lg font-bold text-light">{totalExercicios}</div>
          </div>
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-2">
            <div className="text-xs text-light-muted mb-1">Concluídos</div>
            <div className="text-lg font-bold text-success">{exerciciosConcluidos}</div>
          </div>
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-2">
            <div className="text-xs text-light-muted mb-1">Tempo</div>
            <div className="text-lg font-bold text-light">{treino.tempoEstimado || 60} min</div>
          </div>
          {volume > 0 && (
            <div className="bg-dark-lighter border border-grey/30 rounded-lg p-2">
              <div className="text-xs text-light-muted mb-1">Volume</div>
              <div className="text-lg font-bold text-primary">{Math.round(volume).toLocaleString('pt-BR')} kg</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Variante completa (padrão)
  return (
    <div
      className={`card-hover ${statusStyles.border} border-2 ${destacar ? 'ring-2 ring-primary' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-display font-bold text-light">{nomeTreino}</h3>
          <p className="text-sm text-light-muted">{formatarDataTreino(treino.data)}</p>
          {treino.tipo && (
            <p className="text-xs text-light-muted mt-1">Tipo: {treino.tipo}</p>
          )}
        </div>
        <div className="text-right">
          {ehHoje && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded mb-2 block">Hoje</span>
          )}
          <span className={`${statusStyles.badge} flex items-center gap-1`}>
            {treino.concluido && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {statusText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-xs text-light-muted">Exercícios</p>
          </div>
          <p className="text-xl font-bold text-light">{totalExercicios}</p>
        </div>
        <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-light-muted">Concluídos</p>
          </div>
          <p className="text-xl font-bold text-success">{exerciciosConcluidos}</p>
        </div>
        <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-light-muted">Tempo</p>
          </div>
          <p className="text-xl font-bold text-light">{treino.tempoEstimado || 60} min</p>
        </div>
        {volume > 0 && (
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs text-light-muted">Volume</p>
            </div>
            <p className="text-xl font-bold text-primary">
              {Math.round(volume).toLocaleString('pt-BR')} kg
            </p>
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      {!treino.concluido && totalExercicios > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-light-muted">Progresso</span>
            <span className="text-xs font-bold text-primary">{porcentagem}%</span>
          </div>
          <div className="w-full bg-dark-lighter rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${porcentagem}%` }}
            />
          </div>
        </div>
      )}

      {/* Ações */}
      {mostrarAcoes && onAcao && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-grey/30">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAcao('ver', treino)
            }}
            className="btn-secondary text-sm px-3 py-1"
          >
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAcao('editar', treino)
            }}
            className="btn-secondary text-sm px-3 py-1"
            title="Editar"
          >
            Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAcao('duplicar', treino)
            }}
            className="btn-secondary text-sm px-3 py-1"
            title="Duplicar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAcao('deletar', treino)
            }}
            className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
            title="Deletar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

