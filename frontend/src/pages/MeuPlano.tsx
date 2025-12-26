import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, TreinoHomeResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import DiaSemanaIcon from '../components/icons/DiaSemanaIcon'
import AvisoExpiracaoPlano from '../components/AvisoExpiracaoPlano'
// AvisoTrialAcabando removido - TrialProgressHeader já cobre isso
import { usePushNotification } from '../hooks/usePushNotification'
import { useAuth } from '../contexts/AuthContext'

const InfoChip = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-3 bg-gradient-to-br from-white/8 to-white/3 border border-white/10 rounded-2xl px-4 py-4 flex-1 min-w-[30%]">
    {icon && (
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <span className="text-xs uppercase tracking-[0.2em] text-white/50 block mb-1">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  </div>
)

export default function MeuPlano() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { user } = useAuth()
  const [homeData, setHomeData] = useState<TreinoHomeResponse | null>(null)
  const [planoAtual, setPlanoAtual] = useState<PlanoAtualResponse | null>(null)
  const { isSupported, isSubscribed, isLoading, solicitarPermissao, removerSubscription } = usePushNotification()
  
  // Obter primeiro nome do usuário
  const primeiroNome = user?.nome?.split(' ')[0] || 'usuário'

  useEffect(() => {
    const carregarHome = async () => {
      try {
        const response = await obterHomeTreinos()
        setHomeData(response)
      } catch (error) {
        console.error(error)
        showToast('Não foi possível carregar suas informações.', 'error')
      }
    }

    const carregarPlano = async () => {
      try {
        const response = await obterPlanoAtualResumo()
        setPlanoAtual(response)
      } catch (error) {
        console.error(error)
      }
    }

    carregarHome()
    carregarPlano()
  }, [showToast])

  const insights = homeData?.insights
  const semanaStats = (homeData?.semana || []).reduce(
    (acc, dia) => {
      if (!dia) return acc
      if (dia.hasTreino) acc.planejados += 1
      if (dia.concluido) acc.realizados += 1
      return acc
    },
    { planejados: 0, realizados: 0 }
  )

  // Calcular taxa de conclusão da semana
  const taxaConclusaoSemana = semanaStats.planejados > 0
    ? Math.round((semanaStats.realizados / semanaStats.planejados) * 100)
    : 0

  // Calcular sequência atual (dias consecutivos treinando)
  const calcularSequencia = () => {
    if (!homeData?.semana) return 0
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    let sequencia = 0
    const diasOrdenados = [...homeData.semana]
      .filter(dia => dia && dia.data)
      .sort((a, b) => new Date(b!.data).getTime() - new Date(a!.data).getTime())
    
    let dataEsperada = new Date(hoje)
    
    for (const dia of diasOrdenados) {
      if (!dia || !dia.concluido) continue
      
      const dataTreino = new Date(dia.data)
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
  }

  const sequenciaAtual = calcularSequencia()

  // Calcular tempo total treinado (estimado baseado em exercícios concluídos)
  const tempoTotalTreinado = insights?.seriesTotais
    ? Math.round((insights.seriesTotais * 3) / 60) // ~3min por série, converter para horas
    : 0

  // Determinar melhor dia da semana
  const melhorDiaSemana = (() => {
    if (!homeData?.semana) return null
    const diasComTreino = homeData.semana
      .filter(dia => dia && dia.concluido)
      .map(dia => {
        const data = new Date(dia!.data)
        return data.toLocaleDateString('pt-BR', { weekday: 'long' })
      })
    
    if (diasComTreino.length === 0) return null
    
    const contagem: Record<string, number> = {}
    diasComTreino.forEach(dia => {
      contagem[dia] = (contagem[dia] || 0) + 1
    })
    
    const melhor = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]
    return melhor ? melhor[0] : null
  })()

  // Construir resumo inteligente
  const resumoSemana = [
    {
      label: 'Taxa de conclusão',
      value: `${taxaConclusaoSemana}%`,
      detail: `${semanaStats.realizados} de ${semanaStats.planejados} treinos`
    },
    ...(sequenciaAtual > 0
      ? [{
          label: 'Sequência',
          value: `${sequenciaAtual}`,
          detail: sequenciaAtual === 1 ? 'dia seguido' : 'dias seguidos'
        }]
      : []
    ),
    {
      label: 'Séries totais',
      value: `${insights?.seriesTotais ?? 0}`,
      detail: tempoTotalTreinado > 0 ? `~${tempoTotalTreinado}h treinadas` : 'esta semana'
    },
    ...(melhorDiaSemana
      ? [{
          label: 'Melhor dia',
          value: melhorDiaSemana.charAt(0).toUpperCase() + melhorDiaSemana.slice(1),
          detail: 'mais consistente'
        }]
      : [{
          label: 'Treinos concluídos',
          value: `${semanaStats.realizados}`,
          detail: 'esta semana'
        }]
    )
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark-lighter text-white pb-32">
      <AppHeader title="Meu Plano" />
      <div className="px-5 pt-6 space-y-6">
        {/* AvisoTrialAcabando removido - TrialProgressHeader já cobre isso */}
        <AvisoExpiracaoPlano />
        <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl">
          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">Ações rápidas</p>
              <h2 className="text-2xl font-bold text-white leading-tight">
                Olá, {primeiroNome}!
              </h2>
              <p className="text-base text-white/80 leading-relaxed">
                Continue sua jornada acessando seus treinos e mantendo sua consistência
              </p>
            </div>
            
            <button
              onClick={() => navigate('/treino')}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 text-dark font-bold text-base py-4 px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative flex items-center justify-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>Iniciar treino</span>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Semana</p>
          <div className="grid grid-cols-7 gap-2">
            {(homeData?.semana || Array.from({ length: 7 })).map((dia, index) => {
              if (!dia) {
                return <div key={index} className="w-10 h-10 rounded-full bg-white/5 animate-pulse mx-auto" />
              }
              const fezTreino = dia.concluido
              const diaPassadoSemTreino = dia.status === 'passado' && !dia.concluido
              const dataObj = new Date(dia.data)
              const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' })
              
              // Determinar status do ícone
              let iconStatus: 'concluido' | 'nao-treinou' | 'futuro' | 'hoje' = 'futuro'
              if (fezTreino) {
                iconStatus = 'concluido'
              } else if (diaPassadoSemTreino) {
                iconStatus = 'nao-treinou'
              } else if (dia.status === 'hoje') {
                iconStatus = 'hoje'
              } else {
                iconStatus = 'futuro'
              }
              
              return (
                <div key={dia.label} className="flex flex-col items-center gap-1">
                  <span
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      fezTreino
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : diaPassadoSemTreino
                          ? 'border-rose-400 bg-rose-500/10'
                          : 'border-amber-300 bg-amber-400/10'
                    }`}
                  >
                    <DiaSemanaIcon status={iconStatus} size={20} />
                  </span>
                  <span className="text-xs text-white/60 uppercase tracking-wide">{diaSemana}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60 font-semibold">Configurações do treino</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoChip 
              label="Duração média" 
              value={`${planoAtual?.plano.tempoMedio || 0} min`}
              icon={
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <InfoChip 
              label="Treinos semana" 
              value={`${planoAtual?.plano.totalTreinos || 0} dias`}
              icon={
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <InfoChip 
              label="Local" 
              value={planoAtual?.plano.local || 'Customizado'}
              icon={
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60 font-semibold">Resumo da semana</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {resumoSemana.map((item) => {
              // Ícones específicos para cada métrica
              const getIcon = () => {
                if (item.label === 'Taxa de conclusão') {
                  return (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
                if (item.label === 'Sequência') {
                  return (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                }
                if (item.label === 'Séries totais') {
                  return (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )
                }
                if (item.label === 'Treinos concluídos') {
                  return (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
                return (
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              }

              // Cor baseada no tipo de métrica
              const getBgColor = () => {
                if (item.label === 'Taxa de conclusão') {
                  const taxa = parseInt(item.value) || 0
                  if (taxa >= 80) return 'from-success/20 to-success/10'
                  if (taxa >= 50) return 'from-warning/20 to-warning/10'
                  return 'from-error/20 to-error/10'
                }
                if (item.label === 'Sequência') return 'from-primary/20 to-primary/10'
                return 'from-primary/20 to-primary/10'
              }

              return (
                <div 
                  key={item.label} 
                  className={`bg-gradient-to-br ${getBgColor()} border border-white/10 rounded-2xl p-5 space-y-2 hover:border-primary/30 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      {getIcon()}
                    </div>
                    {item.label === 'Taxa de conclusão' && (
                      <div className="text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full">
                        {item.value}
                      </div>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium">{item.label}</p>
                  <p className="text-3xl md:text-4xl font-extrabold text-white leading-none">{item.value}</p>
                  {item.detail && (
                    <p className="text-xs text-white/50 mt-2">{item.detail}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Notificações Push */}
        {isSupported && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">Notificações</p>
                <p className="text-xs text-white/60">
                  Receba lembretes diários sobre seus treinos
                </p>
              </div>
              <button
                onClick={async () => {
                  if (isSubscribed) {
                    const removed = await removerSubscription()
                    if (removed) {
                      showToast('Notificações desativadas', 'success')
                    }
                  } else {
                    const granted = await solicitarPermissao()
                    if (granted) {
                      showToast('Notificações ativadas! Você receberá lembretes diários', 'success')
                    } else {
                      showToast('Permissão de notificações negada', 'error')
                    }
                  }
                }}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSubscribed ? 'bg-primary' : 'bg-white/20'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>
        )}
      </div>
      <BottomTabs active="meu-plano" />
      <ToastContainer />
    </div>
  )
}

