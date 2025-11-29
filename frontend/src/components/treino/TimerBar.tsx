import { memo } from 'react'
import { IconeVoltar, IconeMenu } from '../icons/TreinoIcons'

interface TimerBarProps {
  cronometro: string
  timerAtivo: boolean
  progressoConcluidos: number
  onVoltar: () => void
  onToggleTimer: () => void
  onToggleChecklist: () => void
}

export const TimerBar = memo(({
  cronometro,
  timerAtivo,
  progressoConcluidos,
  onVoltar,
  onToggleTimer,
  onToggleChecklist
}: TimerBarProps) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
    <div className="flex items-center justify-between px-4 py-2">
      <button onClick={onVoltar} className="p-2 -ml-2 text-white/80 hover:text-white">
        <IconeVoltar />
      </button>
      
      <div className="flex items-center gap-3 flex-1 justify-center">
        <span className="text-sm font-mono font-bold text-primary">{cronometro}</span>
        <button 
          onClick={onToggleTimer}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            timerAtivo ? 'bg-white/10 text-white/70' : 'bg-primary text-black'
          }`}
        >
          {timerAtivo ? 'Pausar' : 'Iniciar'}
        </button>
      </div>
      
      <button 
        onClick={onToggleChecklist}
        className="p-2 -mr-2 text-white/80 hover:text-white relative"
      >
        <IconeMenu />
        {progressoConcluidos > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs rounded-full flex items-center justify-center font-bold">
            {progressoConcluidos}
          </span>
        )}
      </button>
    </div>
  </div>
))
TimerBar.displayName = 'TimerBar'

