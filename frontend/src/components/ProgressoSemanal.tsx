import React from 'react'
import { TreinoSemanaDia } from '../types/treino.types'

interface ProgressoSemanalProps {
  semana: TreinoSemanaDia[]
  realizados: number
  planejados: number
}

// Componente SVG para ícone de check
const IconeCheck: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Componente SVG para ícone de calendário
const IconeCalendario: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export default function ProgressoSemanal({ semana, realizados, planejados }: ProgressoSemanalProps) {
  const porcentagem = planejados > 0 ? Math.round((realizados / planejados) * 100) : 0
  
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconeCalendario className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-white">Progresso da Semana</h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{realizados}/{planejados}</div>
          <div className="text-xs text-white/50">treinos</div>
        </div>
      </div>
      
      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ width: `${porcentagem}%` }}
          />
        </div>
        <div className="text-xs text-white/50 mt-1 text-right">{porcentagem}% concluído</div>
      </div>
      
      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2">
        {semana.map((dia) => {
          const hoje = new Date()
          hoje.setHours(0, 0, 0, 0)
          const dataDia = new Date(dia.data)
          dataDia.setHours(0, 0, 0, 0)
          const isHoje = dataDia.getTime() === hoje.getTime()
          
          return (
            <div
              key={dia.data}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
                ${isHoje ? 'bg-primary/20 border border-primary/40' : 'bg-white/5'}
                ${dia.status === 'passado' && !dia.concluido && dia.hasTreino ? 'opacity-60' : ''}
              `}
            >
              <div className="text-xs text-white/50 font-medium">{dia.label}</div>
              {dia.hasTreino ? (
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${dia.concluido 
                    ? 'bg-success text-white' 
                    : isHoje 
                      ? 'bg-primary text-dark' 
                      : 'bg-white/10 text-white/50'
                  }
                `}>
                  {dia.concluido ? (
                    <IconeCheck className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs font-bold">•</span>
                  )}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-xs text-white/20">-</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

