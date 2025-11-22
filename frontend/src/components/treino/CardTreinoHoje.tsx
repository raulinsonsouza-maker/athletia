import { useNavigate } from 'react-router-dom'
import { TreinoCompleto } from '../../types/treino.types'
import { formatarTituloTreino, extrairLetraTreino } from '../../utils/treino.utils'

interface CardTreinoHojeProps {
  treino: TreinoCompleto
}

export default function CardTreinoHoje({ treino }: CardTreinoHojeProps) {
  const navigate = useNavigate()

  const gruposMusculares = treino.exercicios
    ? Array.from(new Set(treino.exercicios.map(ex => ex.exercicio.grupoMuscularPrincipal)))
    : []

  return (
    <div className="card bg-gradient-to-br from-primary/20 via-primary/10 to-dark-lighter border-2 border-primary/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-light-muted mb-2">Treino de Hoje</p>
          <div className="flex items-center gap-3 mb-2">
            {extrairLetraTreino(treino) && (
              <div className="w-14 h-14 rounded-xl bg-primary text-dark flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
                {extrairLetraTreino(treino)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-light">
                {formatarTituloTreino(treino)}
              </h2>
              {gruposMusculares.length > 0 && (
                <p className="text-sm text-light-muted mt-1">
                  {gruposMusculares.join(' • ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            {treino.exercicios && treino.exercicios.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-light-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{treino.exercicios.length} exercícios</span>
              </div>
            )}
            {treino.tempoEstimado && (
              <div className="flex items-center gap-2 text-sm text-light-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{treino.tempoEstimado} min</span>
              </div>
            )}
            {treino.concluido && (
              <div className="flex items-center gap-2 text-sm text-success">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Concluído</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/treino')}
          className="btn-primary px-6 py-3 whitespace-nowrap"
        >
          {treino.concluido ? 'Ver Treino' : 'Começar Treino'}
        </button>
      </div>
    </div>
  )
}

