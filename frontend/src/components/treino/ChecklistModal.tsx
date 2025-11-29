import { memo } from 'react'
import { PlanoAtualBloco } from '../../types/treino.types'
import { IconeFechar, IconeCheck, IconePonto } from '../icons/TreinoIcons'

interface ChecklistModalProps {
  bloco: PlanoAtualBloco
  exercicioAtivoIndex: number
  progresso: { concluidos: number; total: number }
  isExercicioConcluido: (id: string) => boolean
  onFechar: () => void
  onSelecionarExercicio: (index: number) => void
  onFinalizarTreino: () => void
  onAbandonar: () => void
  concluindoTreino: boolean
}

export const ChecklistModal = memo(({
  bloco,
  exercicioAtivoIndex,
  progresso,
  isExercicioConcluido,
  onFechar,
  onSelecionarExercicio,
  onFinalizarTreino,
  onAbandonar,
  concluindoTreino
}: ChecklistModalProps) => (
  <div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end"
    onClick={onFechar}
  >
    <div 
      className="w-full max-h-[70vh] bg-[#111] rounded-t-3xl p-5 overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{bloco.titulo}</h2>
          <p className="text-sm text-white/50">{progresso.concluidos}/{progresso.total} exercícios</p>
        </div>
        <button 
          onClick={onFechar}
          className="text-white/50 hover:text-white"
        >
          <IconeFechar />
        </button>
      </div>
      
      <div className="space-y-2">
        {bloco.exercicios.map((ex, idx) => {
          const concluido = isExercicioConcluido(ex.id)
          const ativo = idx === exercicioAtivoIndex
          
          return (
            <button
              key={ex.id}
              onClick={() => onSelecionarExercicio(idx)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                concluido
                  ? 'bg-primary/10 border border-primary/30'
                  : ativo
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                concluido ? 'bg-primary text-black' : 'bg-white/10 text-white/50'
              }`}>
                {concluido ? <IconeCheck /> : idx + 1}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${concluido ? 'text-primary' : 'text-white'}`}>
                  {ex.nome}
                </p>
                <p className="text-xs text-white/50 flex items-center gap-2">
                  <span>{ex.grupo}</span>
                  <IconePonto className="w-1.5 h-1.5 text-white/40" />
                  <span>{ex.series}x{ex.repeticoes}</span>
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-2">
        <button
          onClick={onFinalizarTreino}
          disabled={concluindoTreino || progresso.concluidos < progresso.total}
          className="w-full py-4 rounded-xl bg-primary text-black font-bold disabled:opacity-40"
        >
          Finalizar Treino
        </button>
        <button
          onClick={onAbandonar}
          className="w-full py-3 rounded-xl text-red-400 font-medium"
        >
          Abandonar treino
        </button>
      </div>
    </div>
  </div>
))
ChecklistModal.displayName = 'ChecklistModal'

