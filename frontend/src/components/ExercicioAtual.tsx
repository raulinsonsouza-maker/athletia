import { useState } from 'react'

interface ExercicioTreino {
  id: string
  ordem: number
  series: number
  repeticoes: string
  carga: number | null
  descanso: number | null
  concluido: boolean
  exercicio: {
    id: string
    nome: string
    grupoMuscularPrincipal: string
    gifUrl: string | null
    imagemUrl: string | null
    equipamentoNecessario: string[]
  }
}

interface ExercicioAtualProps {
  exercicio: ExercicioTreino
  onConcluir: () => void
  onVerInstrucoes: () => void
  concluindo?: boolean
  formatarCarga?: (carga: number | null, equipamentos: string[]) => string | null
}

export default function ExercicioAtual({
  exercicio,
  onConcluir,
  onVerInstrucoes,
  concluindo = false,
  formatarCarga
}: ExercicioAtualProps) {
  const [imagemErro, setImagemErro] = useState(false)

  const formatarCargaLocal = (carga: number | null, equipamentos: string[]): string | null => {
    if (formatarCarga) {
      return formatarCarga(carga, equipamentos)
    }

    // Fallback simples
    if (!carga || carga === 0) return null
    return `${Math.round(carga)} kg`
  }

  const cargaFormatada = formatarCargaLocal(exercicio.carga, exercicio.exercicio.equipamentoNecessario || [])

  return (
    <div className="flex flex-col items-center w-full">
      {/* Imagem/GIF do Exercício */}
      <div className="w-full max-w-md mb-6 rounded-2xl overflow-hidden bg-dark-lighter border-2 border-primary/20">
        {exercicio.exercicio.gifUrl && !imagemErro ? (
          <img
            src={exercicio.exercicio.gifUrl}
            alt={exercicio.exercicio.nome}
            className="w-full h-64 object-cover"
            onError={() => setImagemErro(true)}
          />
        ) : exercicio.exercicio.imagemUrl && !imagemErro ? (
          <img
            src={exercicio.exercicio.imagemUrl}
            alt={exercicio.exercicio.nome}
            className="w-full h-64 object-cover"
            onError={() => setImagemErro(true)}
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-dark-lighter">
            <svg className="w-24 h-24 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Nome do Exercício - 22pt */}
      <h2 className="text-2xl md:text-3xl font-bold text-light text-center mb-6 px-4">
        {exercicio.exercicio.nome}
      </h2>

      {/* Informações do Exercício - 18pt */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <div className="card bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-light-muted">Séries</span>
            <span className="text-2xl font-bold text-primary">{exercicio.series}</span>
          </div>
        </div>

        <div className="card bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-light-muted">Repetições</span>
            <span className="text-2xl font-bold text-primary">{exercicio.repeticoes}</span>
          </div>
        </div>

        {cargaFormatada && (
          <div className="card bg-primary/10 border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-light-muted">Carga</span>
              <span className="text-2xl font-bold text-primary">{cargaFormatada}</span>
            </div>
          </div>
        )}

        {exercicio.descanso && exercicio.descanso > 0 && (
          <div className="card bg-primary/10 border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-light-muted">Descanso</span>
              <span className="text-2xl font-bold text-primary">{exercicio.descanso}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Botão Principal - Marcar Concluído - Mínimo 48px */}
      <button
        onClick={onConcluir}
        disabled={concluindo || exercicio.concluido}
        className={`
          w-full max-w-md h-14 md:h-16 rounded-xl font-bold text-lg md:text-xl
          transition-all duration-200 shadow-lg
          ${exercicio.concluido
            ? 'bg-success text-white cursor-default'
            : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
          }
          ${concluindo ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {exercicio.concluido ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Concluído
          </div>
        ) : concluindo ? (
          'Processando...'
        ) : (
          'MARCAR CONCLUÍDO'
        )}
      </button>

      {/* Botão Secundário - Ver Instruções */}
      <button
        onClick={onVerInstrucoes}
        className="mt-4 text-primary hover:text-primary/80 font-semibold text-base flex items-center gap-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ver como fazer
      </button>
    </div>
  )
}

