import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { BarChart, DoughnutChart, LineChart } from '../components/ChartWrapper'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'

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
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [historico, setHistorico] = useState<TreinoHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [periodKey, setPeriodKey] = useState<PeriodKey>('semana')
  const [periodo, setPeriodo] = useState(7)
  const [rangeStart, setRangeStart] = useState<Date>(() => getWeekStart(new Date()))

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [statsResponse, historicoResponse] = await Promise.all([
        api.get(`/treino/estatisticas?dias=${periodo}`),
        api.get(`/treino/historico?limite=${periodo * 2}`)
      ])
      setEstatisticas(statsResponse.data)
      const historicoData = historicoResponse.data || []
      const treinosConcluidos = Array.isArray(historicoData)
        ? historicoData
            .filter((t: any) => t.concluido && t.data)
            .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
        : []
      setHistorico(treinosConcluidos)
    } catch (error) {
      console.error('Erro ao carregar estatísticas', error)
      showToast('Não foi possível carregar o progresso agora.', 'error')
    } finally {
      setLoading(false)
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

  const calcularGruposMusculares = () => {
    const gruposCount: Record<string, number> = {}
    historico.forEach((treino) => {
      treino.exercicios?.forEach((ex) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal
        if (ex.concluido && grupo && grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
          gruposCount[grupo] = (gruposCount[grupo] || 0) + 1
        }
      })
    })
    return Object.entries(gruposCount)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }

  const calcularVolumePorSemana = () => {
    const volumePorSemana: Record<string, number> = {}
    historico.forEach((treino) => {
      if (!treino.data) return
      const data = new Date(treino.data)
      if (isNaN(data.getTime())) return
      const inicioSemana = getWeekStart(data)
      const semanaKey = inicioSemana.toISOString().split('T')[0]
      let volumeSemana = 0
      treino.exercicios?.forEach((ex) => {
        if (ex.concluido && ex.carga && ex.series && ex.repeticoes) {
          const match = String(ex.repeticoes).match(/(\d+)-?(\d+)?/)
          if (match) {
            const repMin = parseInt(match[1])
            const repMax = match[2] ? parseInt(match[2]) : repMin
            const repMedia = (repMin + repMax) / 2
            volumeSemana += ex.series * repMedia * ex.carga
          }
        }
      })
      if (volumeSemana > 0) {
        volumePorSemana[semanaKey] = (volumePorSemana[semanaKey] || 0) + volumeSemana
      }
    })
    return Object.entries(volumePorSemana)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
  }

  const calcularFrequenciaSemanal = () => {
    const treinosPorSemana: Record<string, number> = {}
    historico.forEach((treino) => {
      if (!treino.data) return
      const data = new Date(treino.data)
      if (isNaN(data.getTime())) return
      const semanaKey = getWeekStart(data).toISOString().split('T')[0]
      treinosPorSemana[semanaKey] = (treinosPorSemana[semanaKey] || 0) + 1
    })
    return Object.entries(treinosPorSemana)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
  }

  const grupos = calcularGruposMusculares()
  const volumePorSemana = calcularVolumePorSemana()
  const frequenciaPorSemana = calcularFrequenciaSemanal()
  const rangeEnd = new Date(rangeStart)
  rangeEnd.setDate(rangeStart.getDate() + 6)
  const rangeLabel = `${rangeStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')} - ${rangeEnd
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')}`

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
        { label: 'Volume', value: formatarVolume(estatisticas.volumeTotal), detail: 'Carga total' },
        { label: 'Média/semana', value: estatisticas.frequenciaSemanal.toFixed(1), detail: 'treinos' }
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white pb-24">
        <AppHeader title="Progresso" backTo="/meu-plano" />
        <div className="px-5 pt-6">
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
        <AppHeader title="Progresso" backTo="/meu-plano" />
        <div className="px-5 pt-6">
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
      <AppHeader title="Progresso" backTo="/meu-plano" />
      <div className="px-5 pt-2 space-y-6">
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
                      const data = new Date(semana)
                      return `${data.getDate()}/${data.getMonth() + 1}`
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

          {volumePorSemana.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Carga</p>
              <h3 className="text-lg font-semibold mb-4">Volume semanal</h3>
              <div className="h-52">
                <LineChart
                  data={{
                    labels: volumePorSemana.map(([semana]) => {
                      const data = new Date(semana)
                      return `${data.getDate()}/${data.getMonth() + 1}`
                    }),
                    datasets: [
                      {
                        label: 'Volume (kg)',
                        data: volumePorSemana.map(([_, volume]) => volume),
                        borderColor: 'rgba(249, 166, 32, 1)',
                        backgroundColor: 'rgba(249, 166, 32, 0.15)',
                        tension: 0.4,
                        fill: true
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

          {Object.keys(estatisticas.progressaoPorGrupo).length > 0 && (
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
                    labels: Object.keys(estatisticas.progressaoPorGrupo),
                    datasets: [
                      {
                        label: 'Progressão (%)',
                        data: Object.values(estatisticas.progressaoPorGrupo),
                        backgroundColor: Object.values(estatisticas.progressaoPorGrupo).map((v: number) =>
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

