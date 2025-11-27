import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, TreinoHomeResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import { normalizarGenero, obterImagemPorGenero } from '../utils/imagemGenero'

const IconeSeparador = ({ className = 'w-1.5 h-1.5 text-white/40' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="4" />
  </svg>
)

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
        ? `${progressoSemana.realizados}/${progressoSemana.planejados}`
        : `${semanaStats.realizados}/${semanaStats.planejados || planoAtual?.plano.totalTreinos || 0}`
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

  const generoNormalizado = normalizarGenero(planoAtual?.genero)

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark-lighter text-white pb-32">
      <AppHeader title="Meu Plano" subtitle="Resumo semanal e próximos passos" />
      <div className="px-5 space-y-6">
        {homeData?.destaquePlanoAtual && (
          <section className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
            <div className="h-40 relative">
              <img
                src={
                  homeData.destaquePlanoAtual.imagem || obterImagemPorGenero(generoNormalizado, 'plano')
                }
                alt={homeData.destaquePlanoAtual.titulo}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Próximo treino
                </p>
                <h2 className="text-2xl font-bold">{homeData.destaquePlanoAtual.titulo}</h2>
                <div className="text-sm text-white/70 flex items-center gap-2">
                  <span>{homeData.destaquePlanoAtual.duracao} min</span>
                  <IconeSeparador />
                  <span>{homeData.destaquePlanoAtual.local}</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <button
                onClick={() => navigate('/treino/atual')}
                className="flex-1 py-3 rounded-full bg-primary text-dark font-semibold text-sm shadow-glow"
              >
                Iniciar agora
              </button>
              <button
                onClick={() => navigate('/treinos')}
                className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold text-sm"
              >
                Configurar
              </button>
            </div>
          </section>
        )}

        <section className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Semana</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(homeData?.semana || Array.from({ length: 7 })).map((dia, index) => {
              if (!dia) {
                return <div key={index} className="w-14 h-14 rounded-full bg-white/5 animate-pulse" />
              }
              const fezTreino = dia.concluido
              const diaPassadoSemTreino = dia.status === 'passado' && !dia.concluido
              const dataObj = new Date(dia.data)
              const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short' })
              const diaNumero = dataObj.getDate()
              return (
                <div key={dia.label} className="flex flex-col items-center gap-1 min-w-[3.5rem]">
                  <span
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-base font-semibold ${
                      fezTreino
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                        : diaPassadoSemTreino
                          ? 'border-rose-400 bg-rose-500/10 text-rose-200'
                          : 'border-amber-300 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    {diaNumero}
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

