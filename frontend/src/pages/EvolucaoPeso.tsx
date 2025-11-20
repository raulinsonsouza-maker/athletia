import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { LineChart } from '../components/ChartWrapper'
import Navbar from '../components/Navbar'

interface RegistroPeso {
  id: string
  peso: number
  data: string
}

export default function EvolucaoPeso() {
  const navigate = useNavigate()
  const [historico, setHistorico] = useState<RegistroPeso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      const response = await api.get('/peso/historico?limite=30')
      setHistorico(response.data || [])
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
      year: 'numeric'
    })
  }

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    if (historico.length === 0) return null

    const pesos = historico.map(h => h.peso)
    const primeiro = pesos[pesos.length - 1]
    const ultimo = pesos[0]
    const diferenca = ultimo - primeiro
    const percentual = ((diferenca / primeiro) * 100).toFixed(1)

    return {
      primeiro,
      ultimo,
      diferenca: diferenca.toFixed(1),
      percentual,
      media: (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(1),
      maximo: Math.max(...pesos).toFixed(1),
      minimo: Math.min(...pesos).toFixed(1)
    }
  }

  const stats = calcularEstatisticas()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando evolução...</p>
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

        {historico.length === 0 ? (
          <div className="card text-center">
            <p className="text-light-muted text-lg mb-4">
              Nenhum registro de peso encontrado.
            </p>
            <button
              onClick={() => navigate('/perfil')}
              className="btn-primary"
            >
              Registrar Primeiro Peso
            </button>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card">
                  <p className="text-sm text-light-muted">Peso Inicial</p>
                  <p className="text-2xl font-display font-bold text-light mt-1">{stats.primeiro} kg</p>
                </div>
                <div className="card">
                  <p className="text-sm text-light-muted">Peso Atual</p>
                  <p className="text-2xl font-display font-bold text-light mt-1">{stats.ultimo} kg</p>
                </div>
                <div className={`card ${parseFloat(stats.diferenca) >= 0 ? 'border-l-4 border-success' : 'border-l-4 border-error'}`}>
                  <p className="text-sm text-light-muted">Variação</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${parseFloat(stats.diferenca) >= 0 ? 'text-success' : 'text-error'}`}>
                    {parseFloat(stats.diferenca) >= 0 ? '+' : ''}{stats.diferenca} kg
                  </p>
                  <p className="text-xs text-light-muted">{stats.percentual}%</p>
                </div>
                <div className="card">
                  <p className="text-sm text-light-muted">Média</p>
                  <p className="text-2xl font-display font-bold text-light mt-1">{stats.media} kg</p>
                </div>
              </div>
            )}

            {/* Gráfico com Chart.js */}
            {historico.length > 1 && (
              <div className="card mb-6">
                <h3 className="text-lg font-display font-bold text-light mb-4">Evolução do Peso</h3>
                <div className="h-80">
                  <LineChart
                    data={{
                      labels: historico.slice().reverse().map(r => formatarData(r.data)),
                      datasets: [
                        {
                          label: 'Peso (kg)',
                          data: historico.slice().reverse().map(r => r.peso),
                          borderColor: '#F9A620',
                          backgroundColor: 'rgba(249, 166, 32, 0.1)',
                        }
                      ]
                    }}
                  />
                </div>
                <div className="flex justify-between mt-4 text-xs text-light-muted">
                  <span>Peso mínimo: {stats?.minimo} kg</span>
                  <span>Peso máximo: {stats?.maximo} kg</span>
                </div>
              </div>
            )}

            {/* Lista de Registros */}
            <div className="card">
              <h3 className="text-lg font-display font-bold text-light mb-4">Histórico Completo</h3>
              <div className="space-y-2">
                {historico.map((registro, index) => {
                  const anterior = historico[index + 1]
                  const diferenca = anterior ? (registro.peso - anterior.peso).toFixed(1) : null

                  return (
                    <div
                      key={registro.id}
                      className="flex items-center justify-between p-4 border border-grey rounded-lg hover:border-primary/50 transition-colors bg-dark-lighter"
                    >
                      <div>
                        <p className="font-semibold text-light">{registro.peso} kg</p>
                        <p className="text-sm text-light-muted">{formatarData(registro.data)}</p>
                      </div>
                      {diferenca && (
                        <div className={`text-right ${parseFloat(diferenca) >= 0 ? 'text-success' : 'text-error'}`}>
                          <p className="font-semibold">
                            {parseFloat(diferenca) >= 0 ? '+' : ''}{diferenca} kg
                          </p>
                          <p className="text-xs text-light-muted">vs. anterior</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

