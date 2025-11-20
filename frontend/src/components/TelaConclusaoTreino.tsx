import { useNavigate } from 'react-router-dom'

interface TelaConclusaoTreinoProps {
  treino: {
    nome: string | null
    tempoEstimado: number | null
    exercicios: Array<{ concluido: boolean }>
  }
  onVoltarHome: () => void
}

export default function TelaConclusaoTreino({ treino, onVoltarHome }: TelaConclusaoTreinoProps) {
  const navigate = useNavigate()
  const totalExercicios = treino.exercicios.length
  const exerciciosConcluidos = treino.exercicios.filter(ex => ex.concluido).length

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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

        {/* Estatísticas Básicas */}
        <div className="card bg-primary/10 border-primary/30 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-light-muted uppercase tracking-wider mb-1">Exercícios</div>
              <div className="text-2xl font-bold text-primary">{exerciciosConcluidos}/{totalExercicios}</div>
            </div>
            {treino.tempoEstimado && (
              <div>
                <div className="text-sm text-light-muted uppercase tracking-wider mb-1">Tempo</div>
                <div className="text-2xl font-bold text-primary">{treino.tempoEstimado} min</div>
              </div>
            )}
          </div>
        </div>

        {/* Mensagem Motivacional */}
        <p className="text-lg text-light-muted mb-8">
          Parabéns! Você completou mais um treino. Continue assim!
        </p>

        {/* Botão Grande - Voltar para Home */}
        <button
          onClick={onVoltarHome}
          className="w-full h-16 bg-primary text-white rounded-xl font-bold text-xl hover:bg-primary/90 transition-all duration-200 shadow-lg active:scale-95"
        >
          Voltar para a Home
        </button>
      </div>
    </div>
  )
}

