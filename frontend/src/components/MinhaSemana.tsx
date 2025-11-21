import { useNavigate } from 'react-router-dom'
import { TreinoSemanal } from '../types/treino.types'

interface MinhaSemanaProps {
  treinos: TreinoSemanal[]
  treinoHojeId?: string | null
  progressoSemanal: {
    concluidos: number
    meta: number
    porcentagem: number
    faltam: number
  }
}

export default function MinhaSemana({
  treinos,
  treinoHojeId,
  progressoSemanal
}: MinhaSemanaProps) {
  const navigate = useNavigate()

  // Obter data atual
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Calcular domingo da semana atual (semana começa no domingo)
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

  // Renderizar card de dia
  const renderCardDia = (dia: typeof dias[0], index: number) => {
    const treino = encontrarTreino(dia.data)
    const status = getStatusTreino(treino, dia.data)
    const ehHoje = dia.data.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
    const ehTreinoAtual = treino?.id === treinoHojeId

    const coresPorStatus = {
      concluido: 'bg-success/20 border-success/50',
      hoje: 'bg-primary/20 border-primary/50 ring-2 ring-primary/30',
      pendente: 'bg-warning/20 border-warning/50',
      futuro: 'bg-dark-lighter border-grey/30',
      'sem-treino': 'bg-dark-lighter/50 border-grey/20 opacity-60'
    }

    const textoPorStatus = {
      concluido: 'text-success',
      hoje: 'text-primary',
      pendente: 'text-warning',
      futuro: 'text-light-muted',
      'sem-treino': 'text-light-muted'
    }

    return (
      <div
        key={index}
        className={`
          relative rounded-lg border-2 p-2 sm:p-3 transition-all duration-300
          ${coresPorStatus[status]}
          ${ehHoje ? 'scale-105 shadow-lg shadow-primary/20' : 'hover:scale-102'}
          ${treino ? 'cursor-pointer hover:border-primary/70 active:scale-95' : ''}
          ${ehTreinoAtual ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' : ''}
        `}
        onClick={() => {
          if (treino) {
            // Se for o treino de hoje, ir para /treino, senão para histórico
            if (status === 'hoje' && !treino.concluido) {
              navigate('/treino')
            } else {
              navigate('/historico')
            }
          }
        }}
      >
        {/* Indicador de hoje */}
        {ehHoje && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-dark">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        {/* Dia da semana */}
        <div className="text-[10px] sm:text-xs font-semibold text-light-muted mb-1 uppercase tracking-wider">
          {dia.diaSemana}
        </div>

        {/* Número do dia */}
        <div className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${ehHoje ? 'text-primary' : 'text-light'}`}>
          {dia.numero}
        </div>

        {/* Conteúdo do treino */}
        {treino ? (
          <div className="space-y-1">
            {/* Tipo/Nome do treino */}
            <div className={`text-xs sm:text-sm font-bold ${textoPorStatus[status]} truncate`}>
              {treino.letraTreino || treino.nome || treino.tipo || 'Treino'}
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-2 text-xs text-light-muted">
              {treino.exercicios && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {treino.exercicios.length}
                </span>
              )}
              {treino.tempoEstimado && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {treino.tempoEstimado}min
                </span>
              )}
            </div>

            {/* Status visual */}
            {status === 'concluido' && (
              <div className="flex items-center gap-1 text-success text-xs mt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Concluído
              </div>
            )}
            {status === 'hoje' && (
              <div className="flex items-center gap-1 text-primary text-xs mt-1 font-semibold">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Hoje</span>
              </div>
            )}
            {status === 'pendente' && (
              <div className="flex items-center gap-1 text-warning text-xs mt-1">
                Pendente
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-light-muted italic">
            Sem treino
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <h3 className="text-xl font-display font-bold text-light">Minha Semana</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      {/* Indicador de progresso */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-light-muted">Progresso Semanal</p>
            <p className="text-lg font-bold text-light">
              {progressoSemanal.concluidos} de {progressoSemanal.meta} treinos feitos
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progressoSemanal.porcentagem}%</div>
            {progressoSemanal.faltam > 0 && (
              <p className="text-xs text-light-muted mt-1">Faltam {progressoSemanal.faltam} treino{progressoSemanal.faltam > 1 ? 's' : ''}</p>
            )}
            {progressoSemanal.porcentagem >= 100 && (
              <p className="text-xs text-success mt-1 font-semibold">Meta alcançada!</p>
            )}
          </div>
        </div>
        <div className="w-full bg-dark-lighter rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressoSemanal.porcentagem, 100)}%` }}
          />
        </div>
      </div>

      {/* Grid de dias - Responsivo */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dias.map((dia, index) => (
          <div
            key={index}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {renderCardDia(dia, index)}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-light-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-success/50 bg-success/20"></div>
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary/50 bg-primary/20"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-warning/50 bg-warning/20"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-grey/30 bg-dark-lighter"></div>
          <span>Futuro</span>
        </div>
      </div>
    </div>
  )
}

