import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { BarChart, DoughnutChart } from '../components/ChartWrapper'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { useAuth } from '../contexts/AuthContext'
// TrialProgress removido - TrialProgressHeader já cobre isso

interface Estatisticas {
  periodo: number
  totalTreinos: number
  totalExercicios: number
  volumeTotal: number
  rpeMedio: number | null
  progressaoPorGrupo: Record<string, number>
  frequenciaSemanal: number
}

interface TreinoHistorico {
  id: string
  data: string
  concluido: boolean
  exercicios?: Array<{
    exercicio?: {
      grupoMuscularPrincipal: string
    }
    carga?: number | null
    series?: number
    repeticoes?: string
    concluido?: boolean
  }>
}

const PERIOD_OPTIONS = [
  { id: 'ultimo', label: 'Último', dias: 7 },
  { id: 'semana', label: 'Semana', dias: 7 },
  { id: 'mes', label: 'Mês', dias: 30 },
  { id: 'anual', label: 'Anual', dias: 365 }
] as const

type PeriodKey = typeof PERIOD_OPTIONS[number]['id']

const getWeekStart = (date: Date) => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

const formatarVolume = (volume: number): string => {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M kg`
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}k kg`
  return `${Math.round(volume).toLocaleString('pt-BR')} kg`
}

export default function Progresso() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { isTrialAtivo } = useAuth()
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [historico, setHistorico] = useState<TreinoHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [periodKey, setPeriodKey] = useState<PeriodKey>('semana')
  const [periodo, setPeriodo] = useState(7)
  const [rangeStart, setRangeStart] = useState<Date>(() => getWeekStart(new Date()))
  const cacheRef = useRef<Record<number, { estatisticas: Estatisticas; historico: TreinoHistorico[] }>>({})
  const primeiraCarga = useRef(true)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    const cacheExistente = cacheRef.current[periodo]
    if (cacheExistente) {
      setEstatisticas(cacheExistente.estatisticas)
      setHistorico(cacheExistente.historico)
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      const limiteHistorico = Math.min(120, periodo * 2)
      const [statsResponse, historicoResponse] = await Promise.all([
        api.get(`/treino/estatisticas?dias=${periodo}`),
        api.get(`/treino/historico?limite=${limiteHistorico}`)
      ])
      const statsData: Estatisticas = statsResponse.data
      const historicoData = historicoResponse.data || []
      const treinosConcluidos = Array.isArray(historicoData)
        ? historicoData
            .filter((t: any) => t.concluido && t.data)
            .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
        : []
      setEstatisticas(statsData)
      setHistorico(treinosConcluidos)
      cacheRef.current[periodo] = { estatisticas: statsData, historico: treinosConcluidos }
    } catch (error) {
      console.error('Erro ao carregar estatísticas', error)
      showToast('Não foi possível carregar o progresso agora.', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
      primeiraCarga.current = false
    }
  }

  const completedDates = useMemo(() => {
    const set = new Set<string>()
    historico.forEach((treino) => {
      if (treino.concluido && treino.data) {
        const data = new Date(treino.data)
        if (!isNaN(data.getTime())) set.add(data.toDateString())
      }
    })
    return set
  }, [historico])

  const calendarDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(rangeStart)
      date.setDate(rangeStart.getDate() + index)
      return {
        date,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        day: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isDone: completedDates.has(date.toDateString())
      }
    })
  }, [rangeStart, completedDates])

  const handlePeriodChange = (key: PeriodKey) => {
    const option = PERIOD_OPTIONS.find((opt) => opt.id === key) ?? PERIOD_OPTIONS[0]
    setPeriodKey(key)
    setPeriodo(option.dias)
    setRangeStart(getWeekStart(new Date()))
  }

  const handleShiftRange = (direction: -1 | 1) => {
    setRangeStart((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + 7 * direction)
      return next
    })
  }

  const grupos = useMemo<[string, number][]>(() => {
    const gruposCount: Record<string, number> = {}
    historico.forEach((treino) => {
      treino.exercicios?.forEach((ex) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal
        if (ex.concluido && grupo && grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
          gruposCount[grupo] = (gruposCount[grupo] || 0) + 1
        }
      })
    })

    const entries: [string, number][] = Object.entries(gruposCount)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])

    if (entries.length <= 5) {
      return entries
    }

    const top4 = entries.slice(0, 4)
    const outrosTotal = entries.slice(4).reduce((acc, [, count]) => acc + count, 0)

    return [...top4, ['Outros', outrosTotal]]
  }, [historico])


  const frequenciaPorSemana = useMemo(() => {
    const mapa: Record<string, number> = {}
    historico.forEach((treino) => {
      if (!treino.data) return
      const data = new Date(treino.data)
      if (isNaN(data.getTime())) return
      const semanaKey = getWeekStart(data).toISOString().split('T')[0]
      mapa[semanaKey] = (mapa[semanaKey] || 0) + 1
    })
    return Object.entries(mapa)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
  }, [historico])
  const progressLabels = estatisticas ? Object.keys(estatisticas.progressaoPorGrupo) : []
  const progressValues = estatisticas ? (Object.values(estatisticas.progressaoPorGrupo) as number[]) : []
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeStart.getDate() + 6)
  const rangeLabel = `${rangeStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')} - ${rangeEnd
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')}`

  // Calcular métricas inteligentes
  const tempoMedioTreino = useMemo(() => {
    if (!historico.length) return 0
    const tempos = historico
      .filter(t => t.exercicios && t.exercicios.length > 0)
      .map(t => {
        // Estimar tempo baseado em exercícios (assumindo ~3min por exercício)
        return (t.exercicios?.length || 0) * 3
      })
    if (tempos.length === 0) return 0
    return Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
  }, [historico])

  const sequenciaAtual = useMemo(() => {
    if (!historico.length) return 0
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    let sequencia = 0
    let dataEsperada = new Date(hoje)
    
    // Ordenar por data (mais recente primeiro)
    const treinosOrdenados = [...historico]
      .filter(t => t.data)
      .sort((a, b) => new Date(b.data!).getTime() - new Date(a.data!).getTime())
    
    for (const treino of treinosOrdenados) {
      const dataTreino = new Date(treino.data!)
      dataTreino.setHours(0, 0, 0, 0)
      
      const diffDias = Math.floor((dataEsperada.getTime() - dataTreino.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDias === 0 || diffDias === 1) {
        sequencia++
        dataEsperada = new Date(dataTreino)
        dataEsperada.setDate(dataEsperada.getDate() - 1)
      } else {
        break
      }
    }
    
    return sequencia
  }, [historico])

  const taxaConclusao = useMemo(() => {
    if (!estatisticas || !estatisticas.frequenciaSemanal) return 0
    // Estimar taxa baseada em frequência semanal vs treinos realizados
    const semanas = periodo / 7
    const treinosEsperados = estatisticas.frequenciaSemanal * semanas
    if (treinosEsperados === 0) return 0
    return Math.round((estatisticas.totalTreinos / treinosEsperados) * 100)
  }, [estatisticas, periodo])

  const resumoCards = estatisticas
    ? [
        { label: 'Treinos', value: estatisticas.totalTreinos, detail: `${periodo} dias` },
        {
          label: 'Exercícios',
          value: estatisticas.totalExercicios,
          detail: estatisticas.totalTreinos
            ? `${(estatisticas.totalExercicios / estatisticas.totalTreinos).toFixed(1)} por treino`
            : '—'
        },
        // Mostrar Volume apenas se houver dados de carga
        ...(estatisticas.volumeTotal > 0
          ? [{ label: 'Volume', value: formatarVolume(estatisticas.volumeTotal), detail: 'Carga total' }]
          : sequenciaAtual > 0
          ? [{ label: 'Sequência', value: `${sequenciaAtual}`, detail: 'dias seguidos' }]
          : tempoMedioTreino > 0
          ? [{ label: 'Tempo médio', value: `${tempoMedioTreino}`, detail: 'minutos' }]
          : [{ label: 'Taxa conclusão', value: `${taxaConclusao}%`, detail: 'do esperado' }]
        ),
        { label: 'Média/semana', value: estatisticas.frequenciaSemanal.toFixed(1), detail: 'treinos' }
      ]
    : []

  if (loading && primeiraCarga.current) {
    return (
      <div className="min-h-screen bg-dark text-white pb-24">
        <AppHeader title="Progresso" />
        <div 
          className="px-5" 
          style={{ 
            paddingTop: isTrialAtivo() 
              ? 'calc(var(--trial-header-height, 60px) + 6rem)' 
              : '1.5rem' 
          }}
        >
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
        <BottomTabs active="progresso" />
      </div>
    )
  }

  if (!estatisticas || estatisticas.totalTreinos === 0) {
    return (
      <div className="min-h-screen bg-dark text-white pb-24">
        <AppHeader title="Progresso" />
        <div 
          className="px-5" 
          style={{ 
            paddingTop: isTrialAtivo() 
              ? 'calc(var(--trial-header-height, 60px) + 6rem)' 
              : '1.5rem' 
          }}
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a2 2 0 012-2h7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5h6v6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13l-7 7-4-4-5 5" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Sem dados por aqui</h2>
            <p className="text-white/70 mb-4">Finalize seus treinos para liberar gráficos e recomendações.</p>
            <button
              onClick={() => navigate('/meu-plano')}
              className="px-4 py-3 rounded-full bg-primary text-dark font-semibold"
            >
              Ir para Meu Plano
            </button>
          </div>
        </div>
        <BottomTabs active="progresso" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark text-white pb-24">
      <AppHeader title="Progresso" />
      <div 
        className="px-5 space-y-6" 
        style={{ 
          paddingTop: isTrialAtivo() 
            ? 'calc(var(--trial-header-height, 60px) + 6rem)' 
            : '1.5rem' 
        }}
      >
        {/* TrialProgress removido - TrialProgressHeader já cobre isso */}
        {refreshing && (
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Atualizando dados...
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 bg-white/5 border border-white/10 rounded-full p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handlePeriodChange(option.id)}
              className={`py-2 rounded-full text-sm font-semibold ${
                periodKey === option.id ? 'bg-primary text-dark' : 'text-white/60'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3 text-sm text-white/70">
            <button onClick={() => handleShiftRange(-1)} aria-label="Semana anterior">
              <span className="px-3 py-1 rounded-full border border-white/15">‹</span>
            </button>
            <span className="font-semibold">{rangeLabel}</span>
            <button onClick={() => handleShiftRange(1)} aria-label="Próxima semana">
              <span className="px-3 py-1 rounded-full border border-white/15">›</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((dia) => (
              <div
                key={dia.date.toISOString()}
                className={`rounded-2xl py-3 border ${
                  dia.isToday
                    ? 'border-primary bg-primary/15 text-white'
                    : dia.isDone
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'border-white/10 text-white/60'
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.3em]">{dia.label}</p>
                <p className="text-lg font-semibold">{dia.day}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {resumoCards.map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-white/60">{card.detail}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          {frequenciaPorSemana.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Frequência</p>
                  <h3 className="text-lg font-semibold">Treinos por semana</h3>
                </div>
                <p className="text-sm text-white/60">
                  Média: <span className="font-semibold">{estatisticas.frequenciaSemanal.toFixed(1)}</span>
                </p>
              </div>
              <div className="h-52">
                <BarChart
                  data={{
                    labels: frequenciaPorSemana.map(([semana]) => {
                      const inicio = new Date(semana)
                      const fim = new Date(inicio)
                      fim.setDate(inicio.getDate() + 6)
                      const format = (d: Date) =>
                        `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
                          .toString()
                          .padStart(2, '0')}`
                      return `${format(inicio)} - ${format(fim)}`
                    }),
                    datasets: [
                      {
                        label: 'Treinos',
                        data: frequenciaPorSemana.map(([_, count]) => count),
                        backgroundColor: 'rgba(249, 166, 32, 0.6)',
                        borderColor: 'rgba(249, 166, 32, 1)'
                      }
                    ]
                  }}
                />
              </div>
            </div>
          )}


          {grupos.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Regiões</p>
                <h3 className="text-lg font-semibold">Mais treinadas</h3>
              </div>
              <div className="h-52">
                <DoughnutChart
                  data={{
                    labels: grupos.map((g) => g[0]),
                    datasets: [
                      {
                        label: 'Exercícios',
                        data: grupos.map((g) => g[1]),
                        backgroundColor: [
                          'rgba(249,166,32,0.9)',
                          'rgba(16,185,129,0.8)',
                          'rgba(59,130,246,0.8)',
                          'rgba(244,114,182,0.8)',
                          'rgba(248,113,113,0.8)',
                          'rgba(250,204,21,0.8)'
                        ],
                        borderWidth: 0
                      }
                    ]
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                {grupos.map(([grupo, count]) => (
                  <span key={grupo}>
                    <strong className="text-white">{grupo}</strong>: {count} exercícios
                  </span>
                ))}
              </div>
            </div>
          )}

          {progressLabels.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Força</p>
                  <h3 className="text-lg font-semibold">Progressão por grupo</h3>
                </div>
              </div>
              <div className="h-60">
                <BarChart
                  data={{
                    labels: progressLabels,
                    datasets: [
                      {
                        label: 'Progressão (%)',
                        data: progressValues,
                        backgroundColor: progressValues.map((v) =>
                          v > 0 ? 'rgba(16, 185, 129, 0.8)' : v < 0 ? 'rgba(248, 113, 113, 0.8)' : 'rgba(148, 163, 184, 0.8)'
                        ),
                        borderWidth: 0
                      }
                    ]
                  }}
                />
              </div>
            </div>
          )}
        </section>
      </div>
      <BottomTabs active="progresso" />
      <ToastContainer />
    </div>
  )
}

