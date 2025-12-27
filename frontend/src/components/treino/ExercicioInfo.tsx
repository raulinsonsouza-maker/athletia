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
    <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden">
      {/* SEÇÃO SUPERIOR: INFORMAÇÕES ESSENCIAIS (Sempre visível) */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Séries x Repetições */}
          <div className="flex items-center gap-2.5">
            <div className="text-center">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Séries</div>
              <div className="text-lg font-bold">{exercicio.series}</div>
            </div>
            <div className="text-white/30 text-lg">×</div>
            <div className="text-center">
              <div className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Reps</div>
              <div className="text-lg font-bold">{exercicio.repeticoes}</div>
            </div>
          </div>
          
          {/* Separador */}
          <div className="h-6 w-px bg-white/10" />
          
          {/* Grupo */}
          <div className="flex-1 min-w-[100px]">
            <div className="text-[10px] text-primary/80 uppercase tracking-wider mb-0.5">Grupo</div>
            <div className="text-base font-bold text-primary">{exercicio.grupo}</div>
          </div>
          
          {/* Carga (se houver) */}
          {exercicio.carga && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Carga</div>
                <div className="text-base font-bold">
                  {exercicio.carga}
                  <span className="text-xs text-white/60 ml-0.5">kg</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR: TABS COM DETALHES */}
      <div>
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = abaAtiva === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => trocarAba(tab.id)}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  isActive 
                    ? 'bg-white/5 text-white border-b-2 border-primary' 
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                <Icon />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-3 min-h-[90px]">
        {abaAtiva === 'alvo' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs text-white/80">Músculo principal: <strong className="text-white">{exercicio.grupo}</strong></span>
            </div>
            {/* Informações adicionais do alvo podem ser adicionadas aqui */}
          </div>
        )}

        {abaAtiva === 'instrucoes' && (
          <div className="space-y-2 text-xs text-white/80">
            {exercicio.execucao ? (
              <p className="leading-relaxed">{exercicio.execucao}</p>
            ) : exercicio.descricao ? (
              <p className="leading-relaxed">{exercicio.descricao}</p>
            ) : (
              <p className="text-white/50 text-xs leading-relaxed">Execute o movimento de forma controlada, mantendo a postura correta durante todo o exercício.</p>
            )}
            {exercicio.errosComuns && exercicio.errosComuns.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1.5">Erros comuns:</p>
                <ul className="space-y-1">
                  {exercicio.errosComuns.map((erro, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <IconePonto className="w-3 h-3 text-red-400 flex-shrink-0 translate-y-[5px]" />
                      <span className="text-xs">{erro}</span>
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
              <div className="flex flex-wrap gap-1.5">
                {exercicio.equipamentos.map((equip, idx) => (
                  <span key={idx} className="px-2 py-1.5 rounded-lg bg-white/5 text-xs flex items-center gap-1.5">
                    <IconeEquipamento />
                    {equip}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-xs">Este exercício pode ser executado sem equipamentos específicos.</p>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
})
ExercicioInfo.displayName = 'ExercicioInfo'

