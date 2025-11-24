import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, TreinoHomeResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'

const formatarDataCurta = (iso: string) => {
  const data = new Date(iso)
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[30%]">
    <span className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</span>
    <span className="text-base font-semibold text-white">{value}</span>
  </div>
)

const IconFlash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
)

const IconPlan = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 5h14v14H5z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 9h14M9 5v14" strokeLinecap="round" />
  </svg>
)

const QuickAction = ({
  title,
  description,
  icon = 'plan',
  onClick
}: {
  title: string
  description?: string
  icon?: 'zap' | 'plan'
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4 flex flex-col text-left gap-1 hover:bg-white/10 transition"
  >
    <div className="w-9 h-9 rounded-full bg-dark flex items-center justify-center text-white/80">
      {icon === 'zap' ? <IconFlash /> : <IconPlan />}
    </div>
    <p className="font-semibold">{title}</p>
    {description && <p className="text-sm text-white/60">{description}</p>}
  </button>
)

export default function MeuPlano() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [homeData, setHomeData] = useState<TreinoHomeResponse | null>(null)
  const [planoAtual, setPlanoAtual] = useState<PlanoAtualResponse | null>(null)
  const [loadingPlano, setLoadingPlano] = useState(true)

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
      } finally {
        setLoadingPlano(false)
      }
    }

    carregarHome()
    carregarPlano()
  }, [showToast])

  const primeiroBloco = planoAtual?.blocos[0]
  const musculosAlvo = useMemo(() => {
    if (!primeiroBloco) return []
    const grupos = Array.from(
      new Set(primeiroBloco.exercicios.map((ex) => ex.grupo))
    )
    return grupos.slice(0, 4)
  }, [primeiroBloco])

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark-lighter text-white pb-32">
      <AppHeader title="Meu Plano" subtitle="Resumo semanal e próximos passos" />
      <div className="px-5 space-y-6">
        {homeData?.destaquePlanoAtual && (
          <section className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
            <div className="h-40 relative">
              <img
                src={homeData.destaquePlanoAtual.imagem || 'https://images.unsplash.com/photo-1517964603305-11c0f6f66012?auto=format&fit=crop&w=800&q=80'}
                alt={homeData.destaquePlanoAtual.titulo}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Próximo treino
                </p>
                <h2 className="text-2xl font-bold">{homeData.destaquePlanoAtual.titulo}</h2>
                <p className="text-sm text-white/70">
                  {homeData.destaquePlanoAtual.duracao} min • {homeData.destaquePlanoAtual.local}
                </p>
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
                onClick={() => navigate('/treino-rapido')}
                className="flex-1 py-3 rounded-full border border-white/20 text-white font-semibold text-sm"
              >
                Ajustar plano
              </button>
            </div>
          </section>
        )}

        {homeData?.recursos && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {homeData.recursos.map((recurso) => (
              <QuickAction
                key={recurso.id}
                title={recurso.titulo}
                description={recurso.descricao}
                icon={recurso.icone === 'zap' ? 'zap' : 'plan'}
                onClick={() => navigate(recurso.destino)}
              />
            ))}
          </section>
        )}

        <section className="bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Semana</p>
            <button className="text-white/70 text-sm" onClick={() => navigate('/treino/atual')}>
              Ver detalhes
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(homeData?.semana || Array.from({ length: 7 })).map((dia, index) => {
              if (!dia) {
                return <div key={index} className="w-16 h-20 rounded-2xl bg-white/5 animate-pulse" />
              }
              const ativo = dia.status === 'hoje'
              const concluido = dia.concluido
              return (
                <button
                  key={dia.label}
                  onClick={() => dia.treinoId && navigate('/treino/atual')}
                  className={`w-16 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                    ativo
                      ? 'border-primary bg-primary/20 text-white'
                      : concluido
                        ? 'border-success/40 text-success'
                        : 'border-white/10 text-white/70'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em]">{dia.label}</span>
                  <span className="text-sm font-semibold">{formatarDataCurta(dia.data)}</span>
                  {concluido ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </button>
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

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Músculos alvo de hoje</p>
            <button className="text-white/70 text-sm" onClick={() => navigate('/treino/atual')}>
              Editar
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {musculosAlvo.length === 0 &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            {musculosAlvo.map((musculo) => (
              <div
                key={musculo}
                className="h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 flex items-center justify-center text-center text-sm font-semibold"
              >
                {musculo}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Resumo da semana</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-sm text-white/60 mb-1">Treinos concluídos</p>
              <p className="text-2xl font-bold">
                {homeData?.insights.progressoSemana.realizados || 0}/{homeData?.insights.progressoSemana.planejados || 0}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-sm text-white/60 mb-1">Volume (kg)</p>
              <p className="text-2xl font-bold">
                {Math.round((homeData?.insights.volumeTotal || 0) / 10) * 10}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-sm text-white/60 mb-1">Séries</p>
              <p className="text-2xl font-bold">{homeData?.insights.seriesTotais || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-sm text-white/60 mb-1">Dias livres</p>
              <p className="text-2xl font-bold">{homeData?.insights.diasSemTreino || 0}</p>
            </div>
          </div>
        </section>

        {homeData?.recomendacoes && (
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Recomendações</p>
            <div className="space-y-2">
              {homeData.recomendacoes.map((rec, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-3xl px-4 py-3 text-sm text-white/80">
                  {rec}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Treino de hoje</p>
            <button className="text-white/70 text-sm" onClick={() => navigate('/treino/atual')}>
              Ver completo
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-3">
            {loadingPlano && <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />}
            {!loadingPlano && primeiroBloco && (
              <>
                {primeiroBloco.exercicios.slice(0, 4).map((exercicio) => (
                  <div key={exercicio.id} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs uppercase tracking-[0.2em]">
                      {exercicio.grupo.slice(0, 3)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{exercicio.nome}</p>
                      <p className="text-sm text-white/60">
                        {exercicio.series} sets • {exercicio.repeticoes}
                      </p>
                    </div>
                  </div>
                ))}
                {primeiroBloco.exercicios.length > 4 && (
                  <button
                    className="w-full text-sm text-white/70 border border-white/10 rounded-2xl py-2"
                    onClick={() => navigate('/treino/atual')}
                  >
                    Ver todos os exercícios
                  </button>
                )}
              </>
            )}
          </div>
        </section>

        <div className="space-y-3 pb-4">
          <button
            onClick={() => navigate('/treino/atual')}
            className="w-full py-4 rounded-full font-semibold text-lg bg-primary text-dark shadow-glow"
          >
            Iniciar treino de hoje
          </button>
          <button
            onClick={() => navigate('/treino-rapido')}
            className="w-full py-4 rounded-full font-semibold text-lg border border-white/20 text-white"
          >
            Criar treino rápido
          </button>
        </div>
      </div>
      <BottomTabs active="meu-plano" />
      <ToastContainer />
    </div>
  )
}

