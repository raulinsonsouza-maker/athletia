import { useEffect, useState } from 'react'
import { TreinoCompleto } from '../types/treino.types'

interface FimTreinoProps {
  treino: TreinoCompleto
  onVoltarHome: () => void
}

export default function FimTreino({ treino, onVoltarHome }: FimTreinoProps) {
  const [feedbackIA, setFeedbackIA] = useState<string>('')
  const [loadingFeedback, setLoadingFeedback] = useState(true)

  useEffect(() => {
    gerarFeedbackIA()
  }, [])

  const gerarFeedbackIA = async () => {
    try {
      setLoadingFeedback(true)
      // TODO: Implementar endpoint de feedback da IA
      // Por enquanto, gerar feedback básico
      const exerciciosConcluidos = treino.exercicios.filter(ex => ex.concluido).length
      const totalExercicios = treino.exercicios.length
      
      // Feedback básico baseado em dados do treino
      if (exerciciosConcluidos === totalExercicios) {
        setFeedbackIA('Parabéns! Você completou todos os exercícios do treino. Continue assim!')
      } else {
        setFeedbackIA('Bom trabalho! Continue treinando regularmente para alcançar seus objetivos.')
      }
    } catch (error) {
      console.error('Erro ao gerar feedback da IA:', error)
      setFeedbackIA('Treino concluído com sucesso! Continue assim!')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const totalExercicios = treino.exercicios.length
  const exerciciosConcluidos = treino.exercicios.filter(ex => ex.concluido).length

  // Analisar feedbacks fornecidos
  const exerciciosComFeedback = treino.exercicios.filter(ex => 
    ex.concluido && ex.feedbackSimples
  )
  
  const muitoFacil = exerciciosComFeedback.filter(ex => ex.feedbackSimples === 'MUITO_FACIL').length
  const noPonto = exerciciosComFeedback.filter(ex => ex.feedbackSimples === 'NO_PONTO').length
  const pesadoDemais = exerciciosComFeedback.filter(ex => ex.feedbackSimples === 'PESADO_DEMAIS').length
  
  // Exercícios que terão ajuste automático na próxima vez
  const ajustesAplicados = muitoFacil + pesadoDemais

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark">
      <div className="max-w-md w-full text-center">
        {/* Ícone de Sucesso */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-success/20 border-4 border-success mb-6">
            <svg className="w-16 h-16 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Mensagem Principal */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-light mb-4">
          Treino Concluído!
        </h1>

        {/* Estatísticas */}
        <div className="card bg-primary/10 border-primary/30 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-light-muted uppercase tracking-wider mb-1">Exercícios</div>
              <div className="text-3xl font-bold text-primary">{exerciciosConcluidos}/{totalExercicios}</div>
            </div>
            {treino.tempoEstimado && (
              <div>
                <div className="text-sm text-light-muted uppercase tracking-wider mb-1">Tempo</div>
                <div className="text-3xl font-bold text-primary">{treino.tempoEstimado} min</div>
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="card mb-6 text-left">
          <h3 className="text-lg font-bold text-light mb-4">Resumo do Treino</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-light-muted">Séries completadas</span>
              <span className="font-bold text-light">
                {treino.exercicios.reduce((acc, ex) => acc + ex.series, 0)}
              </span>
            </div>
            {treino.tempoEstimado && (
              <div className="flex items-center justify-between">
                <span className="text-light-muted">Tempo total</span>
                <span className="font-bold text-light">{treino.tempoEstimado} min</span>
              </div>
            )}
            {ajustesAplicados > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-light-muted">Ajustes automáticos</span>
                <span className="font-bold text-primary">{ajustesAplicados} exercícios</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback dos Exercícios */}
        {exerciciosComFeedback.length > 0 && (
          <div className="card mb-6 text-left">
            <h3 className="text-lg font-bold text-light mb-4">Seu Feedback</h3>
            <div className="space-y-2">
              {muitoFacil > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">😊</span>
                  <span className="text-light-muted">
                    <strong className="text-light">{muitoFacil}</strong> exercício{muitoFacil > 1 ? 's' : ''} muito fácil - 
                    <span className="text-primary"> aumentaremos na próxima vez</span>
                  </span>
                </div>
              )}
              {noPonto > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">👍</span>
                  <span className="text-light-muted">
                    <strong className="text-light">{noPonto}</strong> exercício{noPonto > 1 ? 's' : ''} no ponto certo - 
                    <span className="text-success"> manteremos assim</span>
                  </span>
                </div>
              )}
              {pesadoDemais > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-2xl">😓</span>
                  <span className="text-light-muted">
                    <strong className="text-light">{pesadoDemais}</strong> exercício{pesadoDemais > 1 ? 's' : ''} pesado demais - 
                    <span className="text-warning"> reduziremos na próxima vez</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback da IA */}
        {feedbackIA && (
          <div className="card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                {loadingFeedback ? (
                  <div className="text-light-muted">Analisando seu desempenho...</div>
                ) : (
                  <p className="text-light font-medium">{feedbackIA}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botão Principal */}
        <button
          onClick={onVoltarHome}
          className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all font-bold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Voltar para a Home
        </button>
      </div>
    </div>
  )
}

