import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obterResumoDashboard } from '../services/dashboard.service'
import { buscarTreinosSemanais } from '../services/treino.service'
import { TreinoSemanal } from '../types/treino.types'
import { formatarTituloTreino } from '../utils/treino.utils'

export default function MinhaSemana() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [treinosSemanais, setTreinosSemanais] = useState<TreinoSemanal[]>([])
  const [progressoSemanal, setProgressoSemanal] = useState<any>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [resumo, treinosSemana] = await Promise.all([
        obterResumoDashboard(),
        buscarTreinosSemanais()
      ])
      
      setTreinosSemanais(treinosSemana.treinos || [])
      setProgressoSemanal(resumo.progressoSemanal)
    } catch (error: any) {
      console.error('Erro ao carregar dados da semana:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando sua semana...</p>
        </div>
      </div>
    )
  }

  // Obter data atual
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Calcular domingo da semana atual
  const diaSemana = hoje.getDay()
  const diasAteDomingo = diaSemana === 0 ? 0 : -diaSemana
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() + diasAteDomingo)

  // Criar array com os 7 dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(inicioSemana)
    data.setDate(inicioSemana.getDate() + i)
    return {
      data,
      diaSemana: diasSemana[i],
      numero: data.getDate()
    }
  })

  // Encontrar treino de um dia
  const encontrarTreino = (data: Date): TreinoSemanal | undefined => {
    const dataStr = data.toISOString().split('T')[0]
    return treinosSemanais.find(t => {
      const treinoData = new Date(t.data)
      treinoData.setHours(0, 0, 0, 0)
      return treinoData.toISOString().split('T')[0] === dataStr
    })
  }

  // Próximo treino
  const proximoTreino = treinosSemanais
    .filter(t => {
      const dataTreino = new Date(t.data)
      dataTreino.setHours(0, 0, 0, 0)
      return dataTreino > hoje && !t.concluido
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0]

  return (
    <div className="min-h-screen">
      <Navbar title="Minha Semana" />
      
      <main className="container-custom section">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-2">
            Minha Semana
          </h1>
          <p className="text-light-muted">
            Acompanhe seu planejamento e progresso semanal
          </p>
        </div>

        {/* Bloco 1 - Semana Atual */}
        {progressoSemanal && (() => {
          // Usar meta original para cálculo realista se disponível
          const metaParaCalculo = progressoSemanal.metaOriginal || progressoSemanal.meta
          const porcentagemRealista = metaParaCalculo > 0 
            ? Math.round((progressoSemanal.concluidos / metaParaCalculo) * 100) 
            : 0
          
          return (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-light mb-1">
                    {progressoSemanal.concluidos} de {metaParaCalculo} treinos concluídos
                    {progressoSemanal.metaAjustada && progressoSemanal.metaOriginal && (
                      <span className="text-sm text-light-muted font-normal ml-2">
                        (meta ajustada: {progressoSemanal.meta})
                      </span>
                    )}
                  </h2>
                  <p className="text-light-muted">
                    {progressoSemanal.metaAjustada && progressoSemanal.diasRestantes === 0
                      ? 'Semana finalizada'
                      : progressoSemanal.faltam > 0 
                        ? `Faltam ${progressoSemanal.faltam} treino${progressoSemanal.faltam > 1 ? 's' : ''}`
                        : 'Semana completa!'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">{porcentagemRealista}%</div>
                </div>
              </div>
              <div className="w-full bg-dark-lighter rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(porcentagemRealista, 100)}%` }}
                />
              </div>
            </div>
          )
        })()}

        {/* Calendário Visual Expandido */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-light mb-6">Calendário da Semana</h3>
          <div className="grid grid-cols-7 gap-2">
            {dias.map((dia, index) => {
              const treino = encontrarTreino(dia.data)
              const ehHoje = dia.data.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
              const status = treino?.concluido ? 'concluido' : ehHoje ? 'hoje' : dia.data < hoje ? 'pendente' : 'futuro'
              
              return (
                <div
                  key={index}
                  className={`
                    rounded-lg border-2 p-3 text-center transition-all
                    ${status === 'concluido' ? 'bg-success/20 border-success/50' : ''}
                    ${status === 'hoje' ? 'bg-primary/20 border-primary/50 ring-2 ring-primary/30' : ''}
                    ${status === 'pendente' ? 'bg-warning/20 border-warning/50' : ''}
                    ${status === 'futuro' ? 'bg-dark-lighter border-grey/30' : ''}
                    ${ehHoje ? 'scale-105' : ''}
                  `}
                >
                  <div className="text-xs font-semibold text-light-muted mb-1 uppercase">
                    {dia.diaSemana}
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${ehHoje ? 'text-primary' : 'text-light'}`}>
                    {dia.numero}
                  </div>
                  {treino ? (
                    <div>
                      <div className="text-sm font-bold text-light mb-1">
                        {formatarTituloTreino(treino)}
                      </div>
                      {treino.concluido && (
                        <div className="text-success text-xs">✓ Concluído</div>
                      )}
                      {status === 'hoje' && (
                        <div className="text-primary text-xs font-semibold">Hoje</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-light-muted italic">Sem treino</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bloco 2 - Planilha Semanal */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-light mb-6">Planilha Semanal</h3>
          <div className="space-y-3">
            {dias.map((dia, index) => {
              const treino = encontrarTreino(dia.data)
              const ehHoje = dia.data.toISOString().split('T')[0] === hoje.toISOString().split('T')[0]
              
              return (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 transition-all
                    ${ehHoje ? 'bg-primary/10 border-primary/50' : 'bg-dark-lighter border-grey/20'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold ${ehHoje ? 'text-primary' : 'text-light-muted'}`}>
                      {dia.diaSemana}
                    </div>
                    <div>
                      <div className="font-bold text-light">
                        {treino 
                          ? formatarTituloTreino(treino)
                          : 'Sem treino'}
                      </div>
                      {treino && (
                        <div className="text-sm text-light-muted">
                          {treino.exercicios?.length || 0} exercícios • {treino.tempoEstimado || 60} min
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      {treino?.concluido ? (
                        <span className="badge-success">Concluído</span>
                      ) : ehHoje ? (
                        <button
                          onClick={() => navigate('/treino')}
                          className="btn-primary text-sm"
                        >
                          Treinar Agora
                        </button>
                      ) : (
                        <span className="text-light-muted text-sm">
                          {dia.data < hoje ? 'Pendente' : 'Futuro'}
                        </span>
                      )}
                    </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bloco 4 - Próximos Treinos */}
        {proximoTreino && (
          <div className="card bg-primary/10 border-primary/30">
            <h3 className="text-xl font-bold text-light mb-4">Próximo Treino</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {proximoTreino.letraTreino || proximoTreino.nome || 'Treino'}
                </div>
                <div className="text-light-muted">
                  {new Date(proximoTreino.data).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="text-sm text-light-muted mt-2">
                  Duração estimada: {proximoTreino.tempoEstimado || 60} min
                </div>
              </div>
              <button
                onClick={() => navigate('/treino')}
                className="btn-primary"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

