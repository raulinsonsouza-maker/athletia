import { useState } from 'react'

export type FeedbackSimples = 'MUITO_FACIL' | 'NO_PONTO' | 'PESADO_DEMAIS'

interface FeedbackSimplesProps {
  onFeedback: (feedback: FeedbackSimples) => void
  onAceitarAjuste?: (aceitar: boolean) => void
  ajusteSugerido?: {
    tipo: string
    valor: string | number
    motivo: string
  } | null
  loading?: boolean
}

export default function FeedbackSimples({
  onFeedback,
  onAceitarAjuste,
  ajusteSugerido,
  loading = false
}: FeedbackSimplesProps) {
  const [feedbackSelecionado, setFeedbackSelecionado] = useState<FeedbackSimples | null>(null)
  const [mostrarAjuste, setMostrarAjuste] = useState(false)

  const handleFeedback = (feedback: FeedbackSimples) => {
    setFeedbackSelecionado(feedback)
    onFeedback(feedback)
    
    // Se o feedback indica necessidade de ajuste, mostrar modal
    if (feedback !== 'NO_PONTO' && ajusteSugerido) {
      setMostrarAjuste(true)
    }
  }

  const handleAceitarAjuste = (aceitar: boolean) => {
    if (onAceitarAjuste) {
      onAceitarAjuste(aceitar)
    }
    setMostrarAjuste(false)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-display font-bold text-light mb-2">
          Como foi esse exercício?
        </h3>
        <p className="text-light-muted text-sm">
          Seu feedback ajuda o sistema a ajustar automaticamente para a próxima vez
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Botão: Muito Fácil */}
        <button
          onClick={() => handleFeedback('MUITO_FACIL')}
          disabled={loading}
          className={`
            p-6 rounded-lg border-2 transition-all text-left
            ${feedbackSelecionado === 'MUITO_FACIL'
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-grey/30 bg-dark-lighter hover:border-primary/50 hover:bg-dark-card'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              ${feedbackSelecionado === 'MUITO_FACIL'
                ? 'bg-primary/20 text-primary'
                : 'bg-grey/20 text-grey'
              }
            `}>
              😊
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-light text-lg mb-1">
                Muito fácil
              </h4>
              <p className="text-light-muted text-sm">
                Consegui fazer sem dificuldade. Posso aumentar o desafio.
              </p>
            </div>
          </div>
        </button>

        {/* Botão: No Ponto */}
        <button
          onClick={() => handleFeedback('NO_PONTO')}
          disabled={loading}
          className={`
            p-6 rounded-lg border-2 transition-all text-left
            ${feedbackSelecionado === 'NO_PONTO'
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-grey/30 bg-dark-lighter hover:border-primary/50 hover:bg-dark-card'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              ${feedbackSelecionado === 'NO_PONTO'
                ? 'bg-primary/20 text-primary'
                : 'bg-grey/20 text-grey'
              }
            `}>
              👍
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-light text-lg mb-1">
                No ponto certo
              </h4>
              <p className="text-light-muted text-sm">
                Estava desafiador mas consegui completar. Está perfeito assim.
              </p>
            </div>
          </div>
        </button>

        {/* Botão: Pesado Demais */}
        <button
          onClick={() => handleFeedback('PESADO_DEMAIS')}
          disabled={loading}
          className={`
            p-6 rounded-lg border-2 transition-all text-left
            ${feedbackSelecionado === 'PESADO_DEMAIS'
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-grey/30 bg-dark-lighter hover:border-primary/50 hover:bg-dark-card'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-2xl
              ${feedbackSelecionado === 'PESADO_DEMAIS'
                ? 'bg-primary/20 text-primary'
                : 'bg-grey/20 text-grey'
              }
            `}>
              😓
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-light text-lg mb-1">
                Pesado demais
              </h4>
              <p className="text-light-muted text-sm">
                Foi difícil demais. Preciso reduzir para manter a forma técnica.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Modal de Ajuste Sugerido */}
      {mostrarAjuste && ajusteSugerido && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg border border-primary/30 p-6 max-w-md w-full">
            <h3 className="text-xl font-display font-bold text-light mb-4">
              Ajuste Sugerido
            </h3>
            <p className="text-light-muted mb-4">
              {ajusteSugerido.motivo}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleAceitarAjuste(true)}
                className="flex-1 btn-primary"
              >
                Aceitar Ajuste
              </button>
              <button
                onClick={() => handleAceitarAjuste(false)}
                className="flex-1 btn-secondary"
              >
                Manter Atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

