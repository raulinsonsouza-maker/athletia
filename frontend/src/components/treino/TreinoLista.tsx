import { useState } from 'react'
import { Treino } from '../../types/treino.types'
import TreinoCard from './TreinoCard'
import { obterStatusTreino } from '../../utils/treino.utils'

interface TreinoListaProps {
  treinos: Treino[]
  onTreinoClick?: (treino: Treino) => void
  variante?: 'compacto' | 'completo' | 'resumo'
  mostrarFiltros?: boolean
  mostrarAcoes?: boolean
  onAcao?: (acao: string, treino: Treino) => void
  treinoAtualId?: string | null
  emptyMessage?: string
  className?: string
}

export default function TreinoLista({
  treinos,
  onTreinoClick,
  variante = 'completo',
  mostrarFiltros = false,
  mostrarAcoes = false,
  onAcao,
  treinoAtualId = null,
  emptyMessage = 'Nenhum treino encontrado',
  className = ''
}: TreinoListaProps) {
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'concluido' | 'em-andamento'>('todos')
  const [busca, setBusca] = useState('')

  // Filtrar treinos
  const treinosFiltrados = treinos.filter(treino => {
    // Filtro por status
    if (filtroStatus !== 'todos') {
      const status = obterStatusTreino(treino)
      if (filtroStatus === 'concluido' && status !== 'concluido') return false
      if (filtroStatus === 'pendente' && status !== 'pendente' && status !== 'futuro') return false
      if (filtroStatus === 'em-andamento' && status !== 'em-andamento') return false
    }

    // Busca por nome
    if (busca) {
      const nomeTreino = treino.nome || treino.letraTreino || treino.tipo || ''
      if (!nomeTreino.toLowerCase().includes(busca.toLowerCase())) {
        return false
      }
    }

    return true
  })

  if (treinos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-lighter flex items-center justify-center">
          <svg className="w-8 h-8 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-light-muted text-lg">{emptyMessage}</p>
      </div>
    )
  }

  if (treinosFiltrados.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-light-muted">Nenhum treino encontrado com os filtros aplicados</p>
        <button
          onClick={() => {
            setFiltroStatus('todos')
            setBusca('')
          }}
          className="btn-secondary mt-4"
        >
          Limpar Filtros
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filtros */}
      {mostrarFiltros && (
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar treino..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-field w-full"
              />
            </div>

            {/* Filtro de status */}
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroStatus('todos')}
                className={`btn-secondary ${filtroStatus === 'todos' ? 'bg-primary text-white' : ''}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroStatus('pendente')}
                className={`btn-secondary ${filtroStatus === 'pendente' ? 'bg-primary text-white' : ''}`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFiltroStatus('em-andamento')}
                className={`btn-secondary ${filtroStatus === 'em-andamento' ? 'bg-primary text-white' : ''}`}
              >
                Em Andamento
              </button>
              <button
                onClick={() => setFiltroStatus('concluido')}
                className={`btn-secondary ${filtroStatus === 'concluido' ? 'bg-primary text-white' : ''}`}
              >
                Concluídos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de treinos */}
      <div className="space-y-4">
        {treinosFiltrados.map((treino) => (
          <TreinoCard
            key={treino.id}
            treino={treino}
            variante={variante}
            onClick={onTreinoClick}
            mostrarAcoes={mostrarAcoes}
            onAcao={onAcao}
            destacar={treino.id === treinoAtualId}
          />
        ))}
      </div>

      {/* Contador */}
      {mostrarFiltros && (
        <div className="mt-4 text-center text-sm text-light-muted">
          Mostrando {treinosFiltrados.length} de {treinos.length} treinos
        </div>
      )}
    </div>
  )
}

