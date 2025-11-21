import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import Navbar from '../components/Navbar'

interface ExercicioTreino {
  id: string
  ordem: number
  series: number
  repeticoes: string
  carga: number | null
  rpe: number | null
  concluido: boolean
  exercicio: {
    id: string
    nome: string
    grupoMuscularPrincipal: string
  }
}

interface Treino {
  id: string
  data: string
  tipo: string
  concluido: boolean
  tempoEstimado: number | null
  exercicios: ExercicioTreino[]
}

export default function Historico() {
  const navigate = useNavigate()
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      const response = await api.get('/treino/historico?limite=30')
      setTreinos(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      weekday: 'short'
    })
  }

  // Função para formatar carga (arredondar para inteiro)
  const formatarCarga = (carga: number | null): string => {
    if (carga === null || carga === undefined) return ''
    return `${Math.round(carga)}kg`
  }

  // Função para calcular repetições médias de uma string (ex: "8-12" = 10)
  const calcularRepeticoesMedias = (repeticoes: string | null): number => {
    if (!repeticoes) return 10 // default
    
    const parts = repeticoes.split('-').map(s => s.trim())
    
    if (parts.length === 1) {
      const num = parseInt(parts[0], 10)
      return isNaN(num) ? 10 : num
    }
    
    const lower = parseInt(parts[0], 10)
    const upper = parseInt(parts[1], 10)
    
    if (isNaN(lower) || isNaN(upper)) {
      return 10 // default
    }
    
    // Retorna a média do range
    return (lower + upper) / 2
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar showBack />

      <main className="container-custom section">
        {error && (
          <div className="card border-error/50 bg-error/10 mb-6">
            <p className="text-error">{error}</p>
          </div>
        )}

        {treinos.length === 0 ? (
          <div className="card text-center">
            <p className="text-light-muted text-lg mb-4">
              Nenhum treino encontrado no histórico.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Gerar Primeiro Treino
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {treinos.map((treino) => (
              <div
                key={treino.id}
                className="card-hover"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-light">
                      {formatarData(treino.data)}
                    </h3>
                    <p className="text-sm text-light-muted">{treino.tipo}</p>
                  </div>
                  <div className="text-right">
                    {treino.concluido ? (
                      <span className="badge-success flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Concluído
                      </span>
                    ) : (
                      <span className="badge-warning">
                        Em andamento
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-xs text-light-muted">Exercícios</p>
                    </div>
                    <p className="text-xl font-bold text-light">
                      {treino.exercicios.length}
                    </p>
                  </div>
                  <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-light-muted">Concluídos</p>
                    </div>
                    <p className="text-xl font-bold text-success">
                      {treino.exercicios.filter(ex => ex.concluido).length}
                    </p>
                  </div>
                  <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-light-muted">Tempo</p>
                    </div>
                    <p className="text-xl font-bold text-light">
                      {treino.tempoEstimado || 60} min
                    </p>
                  </div>
                  <div className="bg-dark-lighter border border-grey/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-xs text-light-muted">Volume</p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      {treino.exercicios
                        .filter(ex => ex.concluido && ex.carga)
                        .reduce((acc, ex) => {
                          const repeticoesMedias = calcularRepeticoesMedias(ex.repeticoes)
                          // Volume = séries × repetições × carga
                          return acc + (ex.series * repeticoesMedias * Math.round(ex.carga || 0))
                        }, 0)
                        .toFixed(0)} kg
                    </p>
                  </div>
                </div>

                {/* Lista de Exercícios */}
                <div className="border-t border-grey/30 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-light-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm font-semibold text-light">Exercícios Realizados</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {treino.exercicios.map((ex) => (
                      <span
                        key={ex.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          ex.concluido
                            ? 'bg-success/20 text-success border border-success/30'
                            : 'bg-dark-lighter text-light-muted border border-grey/30'
                        }`}
                        title={ex.concluido ? 'Exercício concluído' : 'Exercício não concluído'}
                      >
                        {ex.concluido && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>{ex.exercicio.nome}</span>
                        {ex.carga && (
                          <span className="opacity-75">
                            • {formatarCarga(ex.carga)}
                          </span>
                        )}
                        {ex.rpe && (
                          <span className="opacity-75">
                            • RPE {ex.rpe}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

