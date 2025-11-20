import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import Navbar from '../components/Navbar'
import { LineChart, BarChart, DoughnutChart } from '../components/ChartWrapper'

interface Estatisticas {
  periodo: number
  totalTreinos: number
  totalExercicios: number
  volumeTotal: number
  rpeMedio: number | null
  progressaoPorGrupo: Record<string, number>
  frequenciaSemanal: number
}

export default function Estatisticas() {
  const navigate = useNavigate()
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [periodo, setPeriodo] = useState(30)

  useEffect(() => {
    carregarEstatisticas()
  }, [periodo])

  const carregarEstatisticas = async () => {
    try {
      setLoading(true)
      const [statsResponse, historicoResponse] = await Promise.all([
        api.get(`/treino/estatisticas?dias=${periodo}`),
        api.get(`/treino/historico?limite=${periodo}`)
      ])
      setEstatisticas(statsResponse.data)
      setHistorico(historicoResponse.data || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const getProgressaoColor = (valor: number) => {
    if (valor > 10) return 'text-success'
    if (valor > 0) return 'text-success'
    if (valor === 0) return 'text-light-muted'
    return 'text-error'
  }

  const getProgressaoIcon = (valor: number) => {
    if (valor > 0) {
      return (
        <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
    if (valor === 0) {
      return (
        <svg className="w-6 h-6 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar showBack />

      <main className="container-custom section">
        {/* Filtro de Período */}
        <div className="card mb-6">
          <label className="label-field">
            Período de Análise
          </label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="input-field"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>

        {error && (
          <div className="card border-error/50 bg-error/10 mb-6">
            <p className="text-error">{error}</p>
          </div>
        )}

        {!estatisticas ? (
          <div className="card text-center">
            <p className="text-light-muted text-lg mb-4">
              Não há dados suficientes para gerar estatísticas.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Começar a Treinar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                <div className="text-xs text-light-muted uppercase tracking-wide mb-1">Treinos</div>
                <div className="text-2xl font-bold text-primary">{estatisticas.totalTreinos}</div>
                <div className="text-xs text-light-muted mt-1">Concluídos</div>
              </div>

              <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                <div className="text-xs text-light-muted uppercase tracking-wide mb-1">Exercícios</div>
                <div className="text-2xl font-bold text-primary">{estatisticas.totalExercicios}</div>
                <div className="text-xs text-light-muted mt-1">Realizados</div>
              </div>

              <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                <div className="text-xs text-light-muted uppercase tracking-wide mb-1">Volume</div>
                <div className="text-2xl font-bold text-primary">
                  {estatisticas.volumeTotal >= 1000 
                    ? `${(estatisticas.volumeTotal / 1000).toFixed(1)}t`
                    : `${estatisticas.volumeTotal}kg`
                  }
                </div>
                <div className="text-xs text-light-muted mt-1">Total acumulado</div>
              </div>

              <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                <div className="text-xs text-light-muted uppercase tracking-wide mb-1">RPE Médio</div>
                <div className="text-2xl font-bold text-primary">
                  {estatisticas.rpeMedio ? estatisticas.rpeMedio.toFixed(1) : '-'}
                </div>
                <div className="text-xs text-light-muted mt-1">Intensidade</div>
              </div>
            </div>

            {/* Gráfico de Frequência de Treinos */}
            {historico.length > 0 && (() => {
              // Agrupar treinos por semana
              const treinosPorSemana: Record<string, number> = {}
              const treinosConcluidosPorSemana: Record<string, number> = {}
              
              historico.forEach(treino => {
                const data = new Date(treino.data)
                const inicioSemana = new Date(data)
                inicioSemana.setDate(data.getDate() - data.getDay())
                const semanaKey = inicioSemana.toISOString().split('T')[0]
                
                if (!treinosPorSemana[semanaKey]) {
                  treinosPorSemana[semanaKey] = 0
                  treinosConcluidosPorSemana[semanaKey] = 0
                }
                treinosPorSemana[semanaKey]++
                if (treino.concluido) {
                  treinosConcluidosPorSemana[semanaKey]++
                }
              })
              
              const semanas = Object.keys(treinosPorSemana).sort()
              const labels = semanas.map(s => {
                const data = new Date(s)
                return `${data.getDate()}/${data.getMonth() + 1}`
              })
              
              return (
                <div className="card">
                  <h3 className="text-lg font-display font-bold text-light mb-4">Frequência de Treinos por Semana</h3>
                  <div className="h-64">
                    <BarChart
                      data={{
                        labels,
                        datasets: [
                          {
                            label: 'Treinos Realizados',
                            data: semanas.map(s => treinosConcluidosPorSemana[s]),
                            backgroundColor: 'rgba(255, 152, 0, 0.6)',
                            borderColor: 'rgba(255, 152, 0, 1)',
                          },
                          {
                            label: 'Treinos Agendados',
                            data: semanas.map(s => treinosPorSemana[s]),
                            backgroundColor: 'rgba(255, 152, 0, 0.2)',
                            borderColor: 'rgba(255, 152, 0, 0.5)',
                          }
                        ]
                      }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-light-muted">
                      Média: <span className="text-primary font-bold">{estatisticas.frequenciaSemanal.toFixed(1)} treinos/semana</span>
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Gráfico de Distribuição de Grupos Musculares */}
            {historico.length > 0 && (() => {
              const gruposCount: Record<string, number> = {}
              
              historico.forEach(treino => {
                if (treino.concluido && treino.exercicios) {
                  treino.exercicios.forEach((ex: any) => {
                    const grupo = ex.exercicio?.grupoMuscularPrincipal
                    if (grupo && grupo !== 'Cardio' && grupo !== 'Flexibilidade') {
                      gruposCount[grupo] = (gruposCount[grupo] || 0) + 1
                    }
                  })
                }
              })
              
              const grupos = Object.entries(gruposCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
              
              if (grupos.length > 0) {
                const cores = [
                  'rgba(255, 152, 0, 0.8)',
                  'rgba(76, 175, 80, 0.8)',
                  'rgba(33, 150, 243, 0.8)',
                  'rgba(156, 39, 176, 0.8)',
                  'rgba(244, 67, 54, 0.8)',
                  'rgba(255, 193, 7, 0.8)',
                  'rgba(0, 188, 212, 0.8)',
                  'rgba(121, 85, 72, 0.8)',
                ]
                
                return (
                  <div className="card">
                    <h3 className="text-lg font-display font-bold text-light mb-4">Grupos Musculares Mais Trabalhados</h3>
                    <div className="h-64">
                      <DoughnutChart
                        data={{
                          labels: grupos.map(g => g[0]),
                          datasets: [{
                            label: 'Exercícios',
                            data: grupos.map(g => g[1]),
                            backgroundColor: cores.slice(0, grupos.length),
                            borderColor: cores.slice(0, grupos.length).map(c => c.replace('0.8', '1')),
                          }]
                        }}
                      />
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Gráfico de Progressão por Grupo Muscular */}
            {Object.keys(estatisticas.progressaoPorGrupo).length > 0 && (
              <div className="card">
                <h3 className="text-lg font-display font-bold text-light mb-4">Progressão de Carga por Grupo Muscular</h3>
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

            {/* Gráfico de Volume ao Longo do Tempo */}
            {historico.length > 0 && (() => {
              // Agrupar volume por semana
              const volumePorSemana: Record<string, number> = {}
              
              historico.forEach(treino => {
                if (treino.concluido && treino.exercicios) {
                  const data = new Date(treino.data)
                  const inicioSemana = new Date(data)
                  inicioSemana.setDate(data.getDate() - data.getDay())
                  const semanaKey = inicioSemana.toISOString().split('T')[0]
                  
                  let volumeSemana = 0
                  treino.exercicios.forEach((ex: any) => {
                    if (ex.carga && ex.series) {
                      volumeSemana += ex.carga * ex.series
                    }
                  })
                  
                  volumePorSemana[semanaKey] = (volumePorSemana[semanaKey] || 0) + volumeSemana
                }
              })
              
              const semanas = Object.keys(volumePorSemana).sort()
              const labels = semanas.map(s => {
                const data = new Date(s)
                return `${data.getDate()}/${data.getMonth() + 1}`
              })
              
              if (semanas.length > 0) {
                return (
                  <div className="card">
                    <h3 className="text-lg font-display font-bold text-light mb-4">Volume de Treino por Semana</h3>
                    <div className="h-64">
                      <LineChart
                        data={{
                          labels,
                          datasets: [{
                            label: 'Volume (kg)',
                            data: semanas.map(s => volumePorSemana[s]),
                            borderColor: 'rgba(255, 152, 0, 1)',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                          }]
                        }}
                      />
                    </div>
                  </div>
                )
              }
              return null
            })()}
          </div>
        )}
      </main>
    </div>
  )
}

