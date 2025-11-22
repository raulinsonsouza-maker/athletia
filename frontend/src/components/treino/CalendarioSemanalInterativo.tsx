import { TreinoSemanal } from '../../types/treino.types'
import { formatarTituloTreino } from '../../utils/treino.utils'

interface CalendarioSemanalInterativoProps {
  treinos: TreinoSemanal[]
  treinoHojeId?: string | null
  onTrocarTreino: (data: Date) => void
  onTreinoClick?: (treino: TreinoSemanal) => void
}

export default function CalendarioSemanalInterativo({
  treinos,
  treinoHojeId,
  onTrocarTreino,
  onTreinoClick
}: CalendarioSemanalInterativoProps) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Calcular domingo da semana atual
  const diaSemana = hoje.getDay()
  const diasAteDomingo = diaSemana === 0 ? 0 : -diaSemana
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() + diasAteDomingo)

  // Criar array com os 7 dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  
  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(inicioSemana)
    data.setDate(inicioSemana.getDate() + i)
    return {
      data,
      diaSemana: diasSemana[i],
      diaCompleto: diasCompletos[i],
      numero: data.getDate(),
      mes: data.getMonth(),
      ano: data.getFullYear()
    }
  })

  // Função para encontrar treino de um dia
  const encontrarTreino = (data: Date): TreinoSemanal | undefined => {
    const dataStr = data.toISOString().split('T')[0]
    return treinos.find(t => {
      const treinoData = new Date(t.data)
      treinoData.setHours(0, 0, 0, 0)
      return treinoData.toISOString().split('T')[0] === dataStr
    })
  }

  // Função para determinar status do treino
  const getStatusTreino = (treino: TreinoSemanal | undefined, data: Date): 'concluido' | 'hoje' | 'pendente' | 'futuro' | 'sem-treino' => {
    const dataStr = data.toISOString().split('T')[0]
    const hojeStr = hoje.toISOString().split('T')[0]
    
    if (!treino) return 'sem-treino'
    
    if (treino.concluido) return 'concluido'
    if (dataStr === hojeStr) return 'hoje'
    if (dataStr < hojeStr) return 'pendente'
    return 'futuro'
  }

  const coresPorStatus = {
    concluido: 'bg-success/20 border-success/50',
    hoje: 'bg-primary/20 border-primary/50 ring-2 ring-primary/30',
    pendente: 'bg-warning/20 border-warning/50',
    futuro: 'bg-dark-lighter border-grey/30',
    'sem-treino': 'bg-dark-lighter/50 border-grey/20 opacity-60'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia, index) => {
          const treino = encontrarTreino(dia.data)
          const status = getStatusTreino(treino, dia.data)
          const ehHoje = dia.data.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
          const ehTreinoAtual = treino?.id === treinoHojeId

          return (
            <div
              key={index}
              className={`
                relative rounded-lg border-2 p-3 sm:p-4 transition-all duration-300
                flex flex-col h-[140px] sm:h-[160px]
                ${coresPorStatus[status]}
                ${ehHoje ? 'shadow-lg shadow-primary/20' : ''}
                ${treino && onTreinoClick ? 'cursor-pointer hover:border-primary/70 active:scale-95' : ''}
                ${ehTreinoAtual ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' : ''}
              `}
              onClick={() => {
                if (treino && onTreinoClick) {
                  onTreinoClick(treino)
                }
              }}
            >
              {/* Header do dia */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-light-muted font-medium">{dia.diaSemana}</p>
                  <p className={`text-lg font-bold ${ehHoje ? 'text-primary' : 'text-light'}`}>
                    {dia.numero}
                  </p>
                </div>
                {ehHoje && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>

              {/* Conteúdo do treino */}
              <div className="flex-1 flex flex-col justify-between">
                {treino ? (
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-bold text-light mb-1 line-clamp-2">
                      {formatarTituloTreino(treino)}
                    </div>
                    {treino.exercicios && treino.exercicios.length > 0 && (
                      <p className="text-xs text-light-muted">
                        {treino.exercicios.length} exercícios
                      </p>
                    )}
                    {treino.concluido && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-light-muted italic flex-1 flex items-center justify-center">
                    Sem treino
                  </div>
                )}
              </div>

              {/* Botão de ação */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTrocarTreino(dia.data)
                }}
                className="mt-2 w-full text-xs btn-secondary py-1.5"
                title="Trocar treino"
              >
                {treino ? 'Trocar' : 'Adicionar'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

