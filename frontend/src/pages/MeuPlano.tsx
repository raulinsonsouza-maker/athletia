import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, TreinoHomeResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import DiaSemanaIcon from '../components/icons/DiaSemanaIcon'
import AvisoExpiracaoPlano from '../components/AvisoExpiracaoPlano'

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
  const progressoSemana = insights?.progressoSemana
  const semanaStats = (homeData?.semana || []).reduce(
    (acc, dia) => {
      if (!dia) return acc
      if (dia.hasTreino) acc.planejados += 1
      if (dia.concluido) acc.realizados += 1
      if (dia.status === 'passado' && !dia.concluido) acc.diasSemTreino += 1
      return acc
    },
    { planejados: 0, realizados: 0, diasSemTreino: 0 }
  )

  const resumoSemana = [
    {
      label: 'Treinos concluídos',
      value: progressoSemana
        ? `${progressoSemana.realizados}`
        : `${semanaStats.realizados}`
    },
    {
      label: 'Volume total',
      value: insights ? `${(insights.volumeTotal ?? 0).toLocaleString('pt-BR')} kg` : '—'
    },
    {
      label: 'Séries totais',
      value: `${insights?.seriesTotais ?? 0}`
    },
    {
      label: 'Dias sem treino',
      value: `${insights?.diasSemTreino ?? semanaStats.diasSemTreino}`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark-lighter text-white pb-32">
      <AppHeader title="Meu Plano" subtitle="Resumo semanal e próximos passos" />
      <div className="px-5 space-y-6">
        <AvisoExpiracaoPlano />
        <section className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Ações rápidas</p>
              <h2 className="text-xl font-bold text-white">Continue sua jornada</h2>
              <p className="text-sm text-white/60 mt-1">
                Acesse seus treinos ou configure seu plano personalizado
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/treino/atual')}
                className="flex-1 py-3 rounded-full bg-primary text-dark font-semibold text-sm shadow-glow hover:bg-primary/90 transition"
              >
                Iniciar treino
              </button>
              <button
                onClick={() => navigate('/treinos')}
                className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition"
              >
                Configurar treino
              </button>
            </div>
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
              </div>
            ))}
          </div>
        </section>
      </div>
      <BottomTabs active="meu-plano" />
      <ToastContainer />
    </div>
  )
}

