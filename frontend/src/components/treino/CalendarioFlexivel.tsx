import { TreinoSemanal } from '../../types/treino.types'
import { formatarTituloTreino } from '../../utils/treino.utils'
import { TipoPeriodo } from './NavegacaoPeriodos'

interface CalendarioFlexivelProps {
  treinos: TreinoSemanal[]
  treinoHojeId?: string | null
  periodo: TipoPeriodo
  dataInicio?: Date
  dataFim?: Date
  onTrocarTreino: (data: Date) => void
  onTreinoClick?: (treino: TreinoSemanal) => void
}

export default function CalendarioFlexivel({
  treinos,
  treinoHojeId,
  periodo,
  dataInicio,
  dataFim,
  onTrocarTreino,
  onTreinoClick
}: CalendarioFlexivelProps) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Calcular período baseado no tipo
  const calcularPeriodo = () => {
    let inicio: Date
    let fim: Date

    switch (periodo) {
      case 'semana': {
        // Semana atual (domingo a domingo)
        const diaSemana = hoje.getDay()
        const diasAteDomingo = diaSemana === 0 ? 0 : -diaSemana
        inicio = new Date(hoje)
        inicio.setDate(hoje.getDate() + diasAteDomingo)
        fim = new Date(inicio)
        fim.setDate(inicio.getDate() + 6)
        break
      }
      case '15dias': {
        inicio = new Date(hoje)
        fim = new Date(hoje)
        fim.setDate(hoje.getDate() + 14)
        break
      }
      case '4semanas': {
        inicio = new Date(hoje)
        fim = new Date(hoje)
        fim.setDate(hoje.getDate() + 27) // 4 semanas = 28 dias
        break
      }
      case 'mes': {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
        break
      }
      case 'mesSeguinte': {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0)
        break
      }
      case 'customizado': {
        inicio = dataInicio || hoje
        fim = dataFim || hoje
        break
      }
      default: {
        inicio = hoje
        fim = new Date(hoje)
        fim.setDate(hoje.getDate() + 6)
      }
    }

    inicio.setHours(0, 0, 0, 0)
    fim.setHours(23, 59, 59, 999)

    return { inicio, fim }
  }

  const { inicio, fim } = calcularPeriodo()

  // Criar array de dias
  const dias: Array<{
    data: Date
    diaSemana: string
    diaCompleto: string
    numero: number
    mes: number
    ano: number
  }> = []

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const diasCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  const dataAtual = new Date(inicio)
  while (dataAtual <= fim) {
    const diaSemana = dataAtual.getDay()
    dias.push({
      data: new Date(dataAtual),
      diaSemana: diasSemana[diaSemana],
      diaCompleto: diasCompletos[diaSemana],
      numero: dataAtual.getDate(),
      mes: dataAtual.getMonth(),
      ano: dataAtual.getFullYear()
    })
    dataAtual.setDate(dataAtual.getDate() + 1)
  }

  // Função para encontrar treino de um dia
  const encontrarTreino = (data: Date): TreinoSemanal | undefined => {
    const dataStr = data.toISOString().split('T')[0]
    return treinos.find((t) => {
      const treinoData = new Date(t.data)
      treinoData.setHours(0, 0, 0, 0)
      return treinoData.toISOString().split('T')[0] === dataStr
    })
  }

  // Função para determinar status do treino
  const getStatusTreino = (
    treino: TreinoSemanal | undefined,
    data: Date
  ): 'concluido' | 'hoje' | 'pendente' | 'futuro' | 'sem-treino' => {
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

  // Determinar grid baseado no número de dias
  const getGridCols = () => {
    const numDias = dias.length
    if (numDias <= 7) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
    if (numDias <= 15) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
    if (numDias <= 31) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7'
  }

  return (
    <div className="space-y-4">
      <div className={`grid ${getGridCols()} gap-2 sm:gap-3`}>
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
                flex flex-col min-h-[140px] sm:min-h-[160px]
                ${coresPorStatus[status]}
                ${ehHoje ? 'shadow-lg shadow-primary/20' : ''}
                ${treino && onTreinoClick ? 'cursor-pointer hover:border-primary/70 active:scale-95' : ''}
                ${ehTreinoAtual ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' : ''}
              `}
              onClick={(e) => {
                // Não navegar se clicar no botão de trocar
                if ((e.target as HTMLElement).closest('button')) {
                  return
                }
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
                {ehHoje && <div className="w-2 h-2 rounded-full bg-primary"></div>}
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
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

