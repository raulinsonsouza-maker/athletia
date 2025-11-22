import { useState } from 'react'
import { TreinoCompleto } from '../types/treino.types'
import { extrairLetraTreino, formatarTituloTreino } from '../utils/treino.utils'

interface PreTreinoProps {
  treino: TreinoCompleto
  onIniciar: () => void
  onGerarAlternativa?: () => void
}

export default function PreTreino({ treino, onIniciar, onGerarAlternativa }: PreTreinoProps) {
  const [mostrarListaCompleta, setMostrarListaCompleta] = useState(false)

  const getGruposMusculares = () => {
    if (!treino?.exercicios) return []
    
    const grupos = new Set<string>()
    treino.exercicios.forEach((ex: any) => {
      if (ex.exercicio?.grupoMuscularPrincipal) {
        const grupo = ex.exercicio.grupoMuscularPrincipal
        if (grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
          grupos.add(grupo)
        }
      }
    })
    
    return Array.from(grupos)
  }

  const grupos = getGruposMusculares()

  return (
    <div className="min-h-screen bg-dark">
      <div className="container-custom section">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            {extrairLetraTreino(treino) && (
              <div className="w-20 h-20 rounded-2xl bg-primary text-dark flex items-center justify-center font-bold text-4xl shadow-lg mx-auto">
                {extrairLetraTreino(treino)}
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
            {formatarTituloTreino(treino)}
          </h1>
          {grupos.length > 0 && (
            <p className="text-lg text-light-muted">
              {grupos.join(', ')}
            </p>
          )}
        </div>

        {/* Informações do Treino */}
        <div className="card mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Duração</div>
              <div className="text-2xl font-bold text-primary">{treino.tempoEstimado || 60} min</div>
            </div>
            <div>
              <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Exercícios</div>
              <div className="text-2xl font-bold text-primary">{treino.exercicios?.length || 0}</div>
            </div>
            <div>
              <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Status</div>
              <div className="text-lg font-bold text-light">
                {treino.concluido ? 'Finalizado' : 'Pendente'}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Exercícios (Preview) */}
        {treino.exercicios && treino.exercicios.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-light mb-4">Exercícios do Treino</h3>
            <div className="space-y-3">
              {treino.exercicios.slice(0, 5).map((exercicio, index) => (
                <div key={exercicio.id} className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-light">{exercicio.exercicio.nome}</div>
                    <div className="text-sm text-light-muted">
                      {exercicio.series} séries × {exercicio.repeticoes}
                    </div>
                  </div>
                </div>
              ))}
              {treino.exercicios.length > 5 && (
                <p className="text-center text-light-muted text-sm">
                  + {treino.exercicios.length - 5} exercícios
                </p>
              )}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-4">
          {!treino.concluido && (
            <button
              onClick={onIniciar}
              className="w-full btn-primary text-xl py-6 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all font-bold"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              INICIAR TREINO
            </button>
          )}

          <button
            onClick={() => setMostrarListaCompleta(true)}
            className="w-full btn-secondary text-lg py-4"
          >
            Ver Lista Completa de Exercícios
          </button>

          {onGerarAlternativa && (
            <div className="card bg-warning/10 border-warning/30">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="font-bold text-warning">Sem equipamento?</h4>
              </div>
              <p className="text-light-muted text-sm mb-4">
                Podemos gerar uma versão alternativa do treino usando apenas peso corporal.
              </p>
              <button
                onClick={onGerarAlternativa}
                className="btn-secondary w-full text-sm"
              >
                Gerar Versão Alternativa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Lista Completa de Exercícios */}
      {mostrarListaCompleta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark-card z-10 pb-4 border-b border-grey/20">
              <h3 className="text-2xl font-display font-bold text-light">Lista Completa de Exercícios</h3>
              <button
                onClick={() => setMostrarListaCompleta(false)}
                className="text-light-muted hover:text-light transition-colors p-2"
                aria-label="Fechar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {treino.exercicios?.map((exercicio, index) => {
                const cargaFormatada = exercicio.carga 
                  ? `${Math.round(exercicio.carga)} kg`
                  : exercicio.exercicio?.equipamentoNecessario?.some((eq: string) => 
                      eq.toLowerCase().includes('peso corporal')
                    ) ? 'Peso Corporal' : null

                return (
                  <div key={exercicio.id} className="flex items-center gap-4 p-4 bg-dark-lighter rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-light mb-1">{exercicio.exercicio.nome}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-light-muted">
                        <span>{exercicio.series} séries</span>
                        <span>×</span>
                        <span>{exercicio.repeticoes} repetições</span>
                        {cargaFormatada && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">{cargaFormatada}</span>
                          </>
                        )}
                        {exercicio.descanso && exercicio.descanso > 0 && (
                          <>
                            <span>•</span>
                            <span>Descanso: {exercicio.descanso}s</span>
                          </>
                        )}
                      </div>
                      {exercicio.exercicio?.grupoMuscularPrincipal && (
                        <div className="text-xs text-light-muted mt-1">
                          {exercicio.exercicio.grupoMuscularPrincipal}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

