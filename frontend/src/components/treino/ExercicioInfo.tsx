import { memo } from 'react'
import { PlanoAtualExercicio } from '../../types/treino.types'
import { IconeAlvo, IconeInstrucoes, IconeEquipamento, IconePonto } from '../icons/TreinoIcons'
import { useAbas, AbaTreino } from '../../hooks/useAbas'

interface ExercicioInfoProps {
  exercicio: PlanoAtualExercicio
}

const tabs: Array<{ id: AbaTreino; label: string; icon: React.ComponentType }> = [
  { id: 'alvo', label: 'ALVO', icon: IconeAlvo },
  { id: 'instrucoes', label: 'INSTRUÇÕES', icon: IconeInstrucoes },
  { id: 'equipamento', label: 'EQUIPAMENTO', icon: IconeEquipamento }
]

export const ExercicioInfo = memo(({ exercicio }: ExercicioInfoProps) => {
  const { abaAtiva, trocarAba } = useAbas()

  return (
    <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = abaAtiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => trocarAba(tab.id)}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-semibold transition ${
                isActive 
                  ? 'bg-white/5 text-white border-b-2 border-primary' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <Icon />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="p-4 min-h-[120px]">
        {abaAtiva === 'alvo' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm">Músculo principal: <strong className="text-white">{exercicio.grupo}</strong></span>
            </div>
          </div>
        )}

        {abaAtiva === 'instrucoes' && (
          <div className="space-y-3 text-sm text-white/80">
            {exercicio.execucao ? (
              <p>{exercicio.execucao}</p>
            ) : exercicio.descricao ? (
              <p>{exercicio.descricao}</p>
            ) : (
              <p className="text-white/50">Execute o movimento de forma controlada, mantendo a postura correta durante todo o exercício.</p>
            )}
            {exercicio.errosComuns && exercicio.errosComuns.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Erros comuns:</p>
                <ul className="space-y-1">
                  {exercicio.errosComuns.map((erro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <IconePonto className="w-4 h-4 text-red-400 flex-shrink-0 translate-y-[7px]" />
                      <span>{erro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'equipamento' && (
          <div className="space-y-2">
            {exercicio.equipamentos && exercicio.equipamentos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {exercicio.equipamentos.map((equip, idx) => (
                  <span key={idx} className="px-3 py-2 rounded-lg bg-white/5 text-sm flex items-center gap-2">
                    <IconeEquipamento />
                    {equip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-sm">Este exercício pode ser executado sem equipamentos específicos.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
ExercicioInfo.displayName = 'ExercicioInfo'

