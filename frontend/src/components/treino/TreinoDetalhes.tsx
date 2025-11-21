import { TreinoCompleto } from '../../types/treino.types'
import {
  formatarDataTreino,
  calcularVolumeTreino,
  calcularPorcentagemConclusao,
  obterNomeTreino,
  obterGruposMusculares,
  formatarCarga
} from '../../utils/treino.utils'

interface TreinoDetalhesProps {
  treino: TreinoCompleto
  mostrarEstatisticas?: boolean
  mostrarExercicios?: boolean
  onExercicioClick?: (exercicioId: string) => void
  className?: string
}

export default function TreinoDetalhes({
  treino,
  mostrarEstatisticas = true,
  mostrarExercicios = true,
  onExercicioClick,
  className = ''
}: TreinoDetalhesProps) {
  const volume = calcularVolumeTreino(treino)
  const porcentagem = calcularPorcentagemConclusao(treino)
  const nomeTreino = obterNomeTreino(treino)
  const gruposMusculares = obterGruposMusculares(treino)
  const totalExercicios = treino.exercicios?.length || 0
  const exerciciosConcluidos = treino.exercicios?.filter(ex => ex.concluido).length || 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-display font-bold text-light mb-2">{nomeTreino}</h2>
        <div className="flex items-center gap-4 text-sm text-light-muted">
          <span>{formatarDataTreino(treino.data)}</span>
          {treino.tipo && <span>• {treino.tipo}</span>}
          {treino.tempoEstimado && <span>• {treino.tempoEstimado} min</span>}
        </div>
        {treino.concluido && (
          <span className="badge-success inline-flex items-center gap-1 mt-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Concluído
          </span>
        )}
      </div>

      {/* Estatísticas */}
      {mostrarEstatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Exercícios</div>
            <div className="text-2xl font-bold text-light">{totalExercicios}</div>
            <div className="text-xs text-light-muted mt-1">
              {exerciciosConcluidos} concluídos
            </div>
          </div>
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Progresso</div>
            <div className="text-2xl font-bold text-primary">{porcentagem}%</div>
            <div className="w-full bg-dark rounded-full h-2 mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${porcentagem}%` }}
              />
            </div>
          </div>
          {volume > 0 && (
            <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4">
              <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Volume</div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(volume).toLocaleString('pt-BR')} kg
              </div>
              <div className="text-xs text-light-muted mt-1">Total acumulado</div>
            </div>
          )}
          {treino.tempoEstimado && (
            <div className="bg-dark-lighter border border-grey/30 rounded-lg p-4">
              <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Tempo</div>
              <div className="text-2xl font-bold text-light">{treino.tempoEstimado} min</div>
              <div className="text-xs text-light-muted mt-1">Estimado</div>
            </div>
          )}
        </div>
      )}

      {/* Grupos Musculares */}
      {gruposMusculares.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-light-muted uppercase tracking-wider mb-2">
            Grupos Musculares
          </h3>
          <div className="flex flex-wrap gap-2">
            {gruposMusculares.map((grupo) => (
              <span
                key={grupo}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
              >
                {grupo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Exercícios */}
      {mostrarExercicios && treino.exercicios && treino.exercicios.length > 0 && (
        <div>
          <h3 className="text-lg font-display font-bold text-light mb-4">Exercícios</h3>
          <div className="space-y-3">
            {treino.exercicios
              .sort((a, b) => a.ordem - b.ordem)
              .map((exercicio) => (
                <div
                  key={exercicio.id}
                  className={`card border-2 transition-all ${
                    exercicio.concluido
                      ? 'border-success/50 bg-success/5'
                      : 'border-grey/30 hover:border-primary/50'
                  } ${onExercicioClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onExercicioClick?.(exercicio.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded">
                          #{exercicio.ordem}
                        </span>
                        <h4 className="font-semibold text-light">{exercicio.exercicio.nome}</h4>
                        {exercicio.concluido && (
                          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-light-muted space-y-1">
                        <p>
                          {exercicio.series} séries × {exercicio.repeticoes} reps
                        </p>
                        {exercicio.carga && (
                          <p>
                            Carga: {formatarCarga(exercicio.carga, exercicio.exercicio.equipamentoNecessario)}
                          </p>
                        )}
                        {exercicio.descanso && <p>Descanso: {exercicio.descanso}s</p>}
                        {exercicio.rpe && <p>RPE: {exercicio.rpe}/10</p>}
                        {exercicio.exercicio.grupoMuscularPrincipal && (
                          <p className="text-xs">
                            Grupo: {exercicio.exercicio.grupoMuscularPrincipal}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

