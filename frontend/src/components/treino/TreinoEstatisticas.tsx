import { TreinoCompleto } from '../../types/treino.types'
import {
  calcularVolumeTreino,
  calcularRPEMedio,
  obterGruposMusculares,
  contarExerciciosPorGrupo
} from '../../utils/treino.utils'

interface TreinoEstatisticasProps {
  treino: TreinoCompleto
  variante?: 'completo' | 'compacto'
  className?: string
}

export default function TreinoEstatisticas({
  treino,
  variante = 'completo',
  className = ''
}: TreinoEstatisticasProps) {
  const volume = calcularVolumeTreino(treino)
  const rpeMedio = calcularRPEMedio(treino)
  const gruposMusculares = obterGruposMusculares(treino)
  const exerciciosPorGrupo = contarExerciciosPorGrupo(treino)
  const totalExercicios = treino.exercicios?.length || 0
  const exerciciosConcluidos = treino.exercicios?.filter(ex => ex.concluido).length || 0

  if (variante === 'compacto') {
    return (
      <div className={`flex gap-4 ${className}`}>
        <div className="text-center">
          <div className="text-xs text-light-muted mb-1">Exercícios</div>
          <div className="text-lg font-bold text-light">
            {exerciciosConcluidos}/{totalExercicios}
          </div>
        </div>
        {volume > 0 && (
          <div className="text-center">
            <div className="text-xs text-light-muted mb-1">Volume</div>
            <div className="text-lg font-bold text-primary">
              {Math.round(volume).toLocaleString('pt-BR')} kg
            </div>
          </div>
        )}
        {rpeMedio && (
          <div className="text-center">
            <div className="text-xs text-light-muted mb-1">RPE Médio</div>
            <div className="text-lg font-bold text-light">{rpeMedio}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-display font-bold text-light mb-4">Estatísticas do Treino</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
          <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Exercícios</div>
          <div className="text-2xl font-bold text-light">{totalExercicios}</div>
          <div className="text-xs text-success mt-1">
            {exerciciosConcluidos} concluídos
          </div>
        </div>
        {volume > 0 && (
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Volume</div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(volume).toLocaleString('pt-BR')} kg
            </div>
            <div className="text-xs text-light-muted mt-1">Total acumulado</div>
          </div>
        )}
        {rpeMedio && (
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">RPE Médio</div>
            <div className="text-2xl font-bold text-light">{rpeMedio}</div>
            <div className="text-xs text-light-muted mt-1">Escala 1-10</div>
          </div>
        )}
        {treino.tempoEstimado && (
          <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-1">Tempo</div>
            <div className="text-2xl font-bold text-light">{treino.tempoEstimado} min</div>
            <div className="text-xs text-light-muted mt-1">Estimado</div>
          </div>
        )}
      </div>

      {/* Distribuição por Grupo Muscular */}
      {gruposMusculares.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-light-muted uppercase tracking-wider mb-3">
            Distribuição por Grupo Muscular
          </h4>
          <div className="space-y-2">
            {Object.entries(exerciciosPorGrupo)
              .sort((a, b) => b[1] - a[1])
              .map(([grupo, quantidade]) => (
                <div key={grupo} className="flex items-center justify-between">
                  <span className="text-sm text-light">{grupo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-dark-lighter rounded-full h-2">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(quantidade / totalExercicios) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary w-8 text-right">
                      {quantidade}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

