import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import { BarChart, DoughnutChart, LineChart } from '../components/ChartWrapper'

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

export default function Estatisticas() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [historico, setHistorico] = useState<TreinoHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState(30)
  const [usuarioNome, setUsuarioNome] = useState('')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Buscar nome do usuário
      const userResponse = await api.get('/user')
      setUsuarioNome(userResponse.data?.nome || '')
      
      // Buscar estatísticas e histórico
      const [statsResponse, historicoResponse] = await Promise.all([
        api.get(`/treino/estatisticas?dias=${periodo}`),
        api.get(`/treino/historico?limite=${periodo * 2}`)
      ])
      
      setEstatisticas(statsResponse.data)
      const historicoData = historicoResponse.data || []
      // Filtrar apenas treinos concluídos e ordenar por data
      const treinosConcluidos = Array.isArray(historicoData) 
        ? historicoData
            .filter((t: any) => t.concluido && t.data)
            .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
        : []
      setHistorico(treinosConcluidos)
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err)
      showToast('Erro ao carregar estatísticas. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Formatar volume
  const formatarVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M kg`
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k kg`
    }
    return `${Math.round(volume).toLocaleString('pt-BR')} kg`
  }

  // Calcular grupos musculares mais trabalhados
  const calcularGruposMusculares = () => {
    const gruposCount: Record<string, number> = {}
    
    historico.forEach(treino => {
      if (treino.exercicios && Array.isArray(treino.exercicios)) {
        treino.exercicios.forEach((ex: any) => {
          if (ex.concluido && ex.exercicio?.grupoMuscularPrincipal) {
            const grupo = ex.exercicio.grupoMuscularPrincipal
            if (grupo && grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
              gruposCount[grupo] = (gruposCount[grupo] || 0) + 1
            }
          }
        })
      }
    })
    
    return Object.entries(gruposCount)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }

  // Calcular volume por semana
  const calcularVolumePorSemana = () => {
    const volumePorSemana: Record<string, number> = {}
    
    historico.forEach(treino => {
      if (!treino.data) return
      const data = new Date(treino.data)
      if (isNaN(data.getTime())) return
      
      const inicioSemana = new Date(data)
      inicioSemana.setDate(data.getDate() - data.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const semanaKey = inicioSemana.toISOString().split('T')[0]
      
      let volumeSemana = 0
      if (treino.exercicios && Array.isArray(treino.exercicios)) {
        treino.exercicios.forEach((ex: any) => {
          if (ex.concluido && ex.carga && ex.series && ex.repeticoes) {
            // Calcular repetições médias
            const repsStr = String(ex.repeticoes)
            const match = repsStr.match(/(\d+)-?(\d+)?/)
            if (match) {
              const repMin = parseInt(match[1])
              const repMax = match[2] ? parseInt(match[2]) : repMin
              const repMedia = (repMin + repMax) / 2
              volumeSemana += ex.series * repMedia * ex.carga
            }
          }
        })
      }
      
      if (volumeSemana > 0) {
        volumePorSemana[semanaKey] = (volumePorSemana[semanaKey] || 0) + volumeSemana
      }
    })
    
    return Object.entries(volumePorSemana)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // Últimas 8 semanas
  }

  // Calcular frequência de treinos por semana
  const calcularFrequenciaSemanal = () => {
    const treinosPorSemana: Record<string, number> = {}
    
    historico.forEach(treino => {
      if (!treino.data) return
      const data = new Date(treino.data)
      if (isNaN(data.getTime())) return
      
      const inicioSemana = new Date(data)
      inicioSemana.setDate(data.getDate() - data.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const semanaKey = inicioSemana.toISOString().split('T')[0]
      
      treinosPorSemana[semanaKey] = (treinosPorSemana[semanaKey] || 0) + 1
    })
    
    return Object.entries(treinosPorSemana)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // Últimas 8 semanas
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar showBack backPath="/dashboard" />
        <main className="container-custom section">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="spinner h-12 w-12 mx-auto"></div>
              <p className="mt-4 text-light-muted">Carregando estatísticas...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!estatisticas || estatisticas.totalTreinos === 0) {
    return (
      <div className="min-h-screen">
        <Navbar showBack backPath="/dashboard" />
        <main className="container-custom section">
          <div className="card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-light mb-4">
              Ainda não há dados suficientes
            </h2>
            <p className="text-light-muted mb-6 max-w-md mx-auto">
              Complete alguns treinos para ver suas estatísticas e acompanhar sua evolução.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary px-6 py-3"
              aria-label="Voltar ao dashboard"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  const grupos = calcularGruposMusculares()
  const volumePorSemana = calcularVolumePorSemana()
  const frequenciaPorSemana = calcularFrequenciaSemanal()

  return (
    <div className="min-h-screen">
      <Navbar showBack backPath="/dashboard" />
      <main className="container-custom section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
            Estatísticas
          </h1>
          <p className="text-light-muted">
            Acompanhe sua evolução e progresso
          </p>
        </div>

        {/* Seletor de Período */}
        <div className="card mb-6">
          <label className="block text-sm font-medium text-light-muted mb-2">
            Período de Análise
          </label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="input-field w-full sm:w-auto"
            aria-label="Selecione o período de análise"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Treinos Completados</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {estatisticas.totalTreinos}
            </div>
            <div className="text-xs text-light-muted">
              {periodo} dias
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Exercícios Realizados</div>
            <div className="text-3xl font-bold text-success mb-1">
              {estatisticas.totalExercicios}
            </div>
            <div className="text-xs text-light-muted">
              Média: {estatisticas.totalTreinos > 0 ? (estatisticas.totalExercicios / estatisticas.totalTreinos).toFixed(1) : 0} por treino
            </div>
          </div>

          <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Volume Total</div>
            <div className="text-2xl font-bold text-warning mb-1">
              {formatarVolume(estatisticas.volumeTotal)}
            </div>
            <div className="text-xs text-light-muted">
              Série × Reps × Carga
            </div>
          </div>

          {estatisticas.rpeMedio && (
            <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <div className="text-xs text-light-muted uppercase tracking-wider mb-2">Intensidade Média</div>
              <div className="text-3xl font-bold text-primary mb-1">
                {estatisticas.rpeMedio.toFixed(1)}
              </div>
              <div className="text-xs text-light-muted">
                RPE (1-10)
              </div>
            </div>
          )}
        </div>

        {/* Gráficos */}
        <div className="space-y-6">
          {/* Frequência de Treinos */}
          {frequenciaPorSemana.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-display font-bold text-light mb-4">
                Frequência de Treinos
              </h3>
              <div className="mb-4">
                <div className="text-sm text-light-muted mb-1">
                  Média: <span className="text-primary font-semibold">{estatisticas.frequenciaSemanal.toFixed(1)} treinos/semana</span>
                </div>
              </div>
              <div className="h-64">
                <BarChart
                  data={{
                    labels: frequenciaPorSemana.map(([semana]) => {
                      const data = new Date(semana)
                      return `${data.getDate()}/${data.getMonth() + 1}`
                    }),
                    datasets: [{
                      label: 'Treinos por semana',
                      data: frequenciaPorSemana.map(([_, count]) => count),
                      backgroundColor: 'rgba(255, 152, 0, 0.6)',
                      borderColor: 'rgba(255, 152, 0, 1)',
                    }]
                  }}
                />
              </div>
            </div>
          )}

          {/* Grupos Musculares */}
          {grupos.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-display font-bold text-light mb-4">
                Grupos Musculares Mais Trabalhados
              </h3>
              <div className="h-64">
                <DoughnutChart
                  data={{
                    labels: grupos.map(g => g[0]),
                    datasets: [{
                      label: 'Exercícios',
                      data: grupos.map(g => g[1]),
                      backgroundColor: [
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                      ],
                      borderColor: [
                        'rgba(255, 152, 0, 1)',
                        'rgba(76, 175, 80, 1)',
                        'rgba(33, 150, 243, 1)',
                        'rgba(156, 39, 176, 1)',
                        'rgba(244, 67, 54, 1)',
                        'rgba(255, 193, 7, 1)',
                      ],
                    }]
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {grupos.map(([grupo, count]) => (
                  <div key={grupo} className="text-sm text-light-muted">
                    <span className="font-semibold text-light">{grupo}:</span> {count} exercícios
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progressão por Grupo */}
          {Object.keys(estatisticas.progressaoPorGrupo).length > 0 && (
            <div className="card">
              <h3 className="text-lg font-display font-bold text-light mb-2">
                Progressão de Força
              </h3>
              <p className="text-sm text-light-muted mb-4">
                Variação percentual da carga entre primeira e última execução
              </p>
              <div className="h-64">
                <BarChart
                  data={{
                    labels: Object.keys(estatisticas.progressaoPorGrupo),
                    datasets: [{
                      label: 'Progressão (%)',
                      data: Object.values(estatisticas.progressaoPorGrupo),
                      backgroundColor: Object.values(estatisticas.progressaoPorGrupo).map((v: number) => 
                        v > 0 ? 'rgba(76, 175, 80, 0.8)' : v < 0 ? 'rgba(244, 67, 54, 0.8)' : 'rgba(158, 158, 158, 0.8)'
                      ),
                      borderColor: Object.values(estatisticas.progressaoPorGrupo).map((v: number) => 
                        v > 0 ? 'rgba(76, 175, 80, 1)' : v < 0 ? 'rgba(244, 67, 54, 1)' : 'rgba(158, 158, 158, 1)'
                      ),
                    }]
                  }}
                />
              </div>
            </div>
          )}

          {/* Volume por Semana */}
          {volumePorSemana.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-display font-bold text-light mb-4">
                Volume de Treino ao Longo do Tempo
              </h3>
              <div className="h-64">
                <LineChart
                  data={{
                    labels: volumePorSemana.map(([semana]) => {
                      const data = new Date(semana)
                      return `${data.getDate()}/${data.getMonth() + 1}`
                    }),
                    datasets: [{
                      label: 'Volume (kg)',
                      data: volumePorSemana.map(([_, volume]) => Math.round(volume)),
                      borderColor: 'rgba(255, 152, 0, 1)',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      fill: true,
                    }]
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
