import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, TreinoHomeResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import DiaSemanaIcon from '../components/icons/DiaSemanaIcon'
import AvisoExpiracaoPlano from '../components/AvisoExpiracaoPlano'
import TrialBanner from '../components/TrialBanner'
import AvisoTrialAcabando from '../components/AvisoTrialAcabando'
import { usePushNotification } from '../hooks/usePushNotification'

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[30%]">
    <span className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</span>
    <span className="text-base font-semibold text-white">{value}</span>
  </div>
)

export default function MeuPlano() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [homeData, setHomeData] = useState<TreinoHomeResponse | null>(null)
  const [planoAtual, setPlanoAtual] = useState<PlanoAtualResponse | null>(null)
  const { isSupported, isSubscribed, isLoading, solicitarPermissao, removerSubscription } = usePushNotification()

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
        <AvisoTrialAcabando />
        <TrialBanner />
        <AvisoExpiracaoPlano />
        <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl">
          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative p-6 space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">Ações rápidas</p>
              <h2 className="text-2xl font-bold text-white leading-tight">Continue sua jornada</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Acesse seus treinos e mantenha sua consistência
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

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Configurações do treino</p>
          <div className="flex gap-3 flex-wrap">
            <InfoChip label="Duração média" value={`${planoAtual?.plano.tempoMedio || 0} min`} />
            <InfoChip label="Treinos semana" value={`${planoAtual?.plano.totalTreinos || 0} dias`} />
            <InfoChip label="Local" value={planoAtual?.plano.local || 'Customizado'} />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Resumo da semana</p>
          <div className="grid grid-cols-2 gap-3">
            {resumoSemana.map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-1">
                <p className="text-sm text-white/60">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
                {item.detail && (
                  <p className="text-xs text-white/40 mt-1">{item.detail}</p>
                )}
              </div>
            ))}
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

