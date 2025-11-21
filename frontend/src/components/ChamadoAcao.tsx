import { useNavigate } from 'react-router-dom'

interface ChamadoAcaoProps {
  mensagem: string
  progressoSemanal?: {
    concluidos: number
    meta: number
    faltam: number
  }
  sequencia?: {
    atual: number
    melhor: number
  }
}

export default function ChamadoAcao({ mensagem, progressoSemanal, sequencia }: ChamadoAcaoProps) {
  const navigate = useNavigate()

  // Gerar mensagem contextual baseada nos dados
  const getMensagemContextual = () => {
    if (sequencia && sequencia.atual > 0 && sequencia.atual === sequencia.melhor - 1) {
      return `Se treinar amanhã, você bate seu recorde de ${sequencia.melhor} dias!`
    }
    
    if (progressoSemanal && progressoSemanal.faltam === 1) {
      return 'Falta apenas 1 treino para completar a semana!'
    }
    
    if (progressoSemanal && progressoSemanal.porcentagem >= 80) {
      return 'Excelente ritmo! Falta pouco para completar a semana.'
    }

    return mensagem || 'Continue assim! Cada treino te aproxima dos seus objetivos.'
  }

  const mensagemFinal = getMensagemContextual()

  return (
    <div className="card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 mb-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-light mb-2">
            {mensagemFinal}
          </p>
          {progressoSemanal && progressoSemanal.faltam > 0 && (
            <button
              onClick={() => navigate('/treino')}
              className="btn-primary text-sm mt-2"
            >
              Treinar Agora
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

