import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { concluirTreino, marcarExercicioTreino, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, PlanoAtualBloco, PlanoAtualExercicio } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import AppHeader from '../components/navigation/AppHeader'
import { obterImagemPorGenero } from '../utils/imagemGenero'

const formatarTempo = (tempo: number) => `${tempo} minutos`
const formatarCronometro = (totalSegundos: number) => {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col bg-white/5 border border-white/10 rounded-2xl px-4 py-2 min-w-[90px]">
    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</span>
    <strong className="text-white text-base">{value}</strong>
  </div>
)

export default function TreinoAtual() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [plano, setPlano] = useState<PlanoAtualResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState<string | null>(null)
  const [statusExercicios, setStatusExercicios] = useState<Record<string, boolean>>({})
  const [concluindoTreino, setConcluindoTreino] = useState(false)
  const [exercicioAtivo, setExercicioAtivo] = useState<PlanoAtualExercicio | null>(null)
  const [abaInstrucao, setAbaInstrucao] = useState<'execucao' | 'erros' | 'equipamentos'>('execucao')
  const [cronometro, setCronometro] = useState(0)
  const [timerAtivo, setTimerAtivo] = useState(false)

  useEffect(() => {
    if (!timerAtivo) return
    const intervalo = setInterval(() => setCronometro((prev) => prev + 1), 1000)
    return () => clearInterval(intervalo)
  }, [timerAtivo])

  useEffect(() => {
    setTimerAtivo(true)
    return () => setTimerAtivo(false)
  }, [])

  const localizarExercicio = (blocos: PlanoAtualBloco[], exercicioId: string) => {
    for (const bloco of blocos) {
      const encontrado = bloco.exercicios.find((ex) => ex.id === exercicioId)
      if (encontrado) return encontrado
    }
    return null
  }

  const carregarPlanoAtual = useCallback(async () => {
    try {
      setLoading(true)
      const response = await obterPlanoAtualResumo()
      setPlano(response)
      setAberto((prev) => prev ?? response.blocos[0]?.id ?? null)
      const mapa = response.blocos.reduce<Record<string, boolean>>((acc, bloco) => {
        bloco.exercicios.forEach((ex) => {
          acc[ex.id] = Boolean(ex.concluido)
        })
        return acc
      }, {})
      setStatusExercicios(mapa)
      setExercicioAtivo((prev) => {
        if (prev) {
          const existente = localizarExercicio(response.blocos, prev.id)
          if (existente) return existente
        }
        const blocoComPendencia = response.blocos.find((bloco) =>
          bloco.exercicios.some((ex) => !mapa[ex.id])
        )
        if (blocoComPendencia) {
          return blocoComPendencia.exercicios.find((ex) => !mapa[ex.id]) || null
        }
        return response.blocos[0]?.exercicios[0] || null
      })
    } catch (error) {
      console.error(error)
      showToast('Não foi possível carregar seu plano atual.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    carregarPlanoAtual()
  }, [carregarPlanoAtual])

  const blocoAtivo = useMemo(() => {
    if (!plano) return null
    return plano.blocos.find((b) => b.id === aberto) || plano.blocos[0] || null
  }, [aberto, plano])

  const encontrarProximoExercicio = useCallback(
    (treinoId: string, mapa: Record<string, boolean>, atualId?: string) => {
      const bloco = plano?.blocos.find((b) => b.id === treinoId)
      if (!bloco) return null
      const pendente = bloco.exercicios.find((ex) => !mapa[ex.id])
      if (pendente) return pendente
      if (atualId) {
        const atual = bloco.exercicios.find((ex) => ex.id === atualId)
        if (atual) return atual
      }
      return bloco.exercicios[0] || null
    },
    [plano]
  )

  const handleToggleExercicio = async (treinoId: string, exercicio: PlanoAtualExercicio, marcado: boolean) => {
    const valorAnterior = statusExercicios[exercicio.id]
    const mapaAtualizado = { ...statusExercicios, [exercicio.id]: marcado }
    setStatusExercicios(mapaAtualizado)
    try {
      await marcarExercicioTreino(exercicio.id, marcado)
      if (marcado) {
        const proximo = encontrarProximoExercicio(treinoId, mapaAtualizado, exercicio.id)
        setExercicioAtivo(proximo)
      } else {
        setExercicioAtivo(exercicio)
      }
    } catch (error) {
      console.error(error)
      setStatusExercicios((prev) => ({ ...prev, [exercicio.id]: valorAnterior }))
      showToast('Não conseguimos atualizar o exercício. Tente novamente.', 'error')
    }
  }

  const handleConcluirTreino = async () => {
    if (!blocoAtivo) return
    setConcluindoTreino(true)
    try {
      await concluirTreino(blocoAtivo.id)
      showToast('Treino concluído com sucesso!', 'success')
      setTimerAtivo(false)
      navigate('/meu-plano')
    } catch (error) {
      console.error(error)
      showToast('Não foi possível concluir o treino agora.', 'error')
    } finally {
      setConcluindoTreino(false)
    }
  }

  const handleAbandonarTreino = () => {
    const confirmar = window.confirm('Tem certeza de que deseja abandonar este treino?')
    if (!confirmar) return
    setTimerAtivo(false)
    navigate('/meu-plano')
  }

  const header = plano?.plano
  const generoUsuario = plano?.genero
  const progressoAtual = blocoAtivo
    ? Math.round(
        (blocoAtivo.exercicios.filter((ex) => statusExercicios[ex.id]).length / blocoAtivo.totalExercicios) * 100
      )
    : 0

  const exercicioEmFoco =
    exercicioAtivo && plano
      ? localizarExercicio(plano.blocos, exercicioAtivo.id) || exercicioAtivo
      : null

  const resetarTimer = () => {
    setCronometro(0)
    setTimerAtivo(false)
  }

  const abasInstrucoes: { id: 'execucao' | 'erros' | 'equipamentos'; label: string }[] = [
    { id: 'execucao', label: 'Execução' },
    { id: 'erros', label: 'Erros comuns' },
    { id: 'equipamentos', label: 'Equipamentos' }
  ]

  return (
    <div className="min-h-screen bg-dark text-white pb-28">
      <AppHeader title="Treino Atual" backTo="/meu-plano" />
      <div className="relative h-64">
        <img
          src={header?.imagemCapa || obterImagemPorGenero(generoUsuario, 'treino')}
          alt="Plano atual"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Treino Atual</p>
          <h1 className="text-3xl font-bold">Seu plano</h1>
          {header && (
            <div className="flex gap-4 text-sm text-white/80 flex-wrap">
              <span>
                <strong className="text-white/60 text-xs uppercase mr-1">Nível:</strong> {header.nivel}
              </span>
              <span>
                <strong className="text-white/60 text-xs uppercase mr-1">Duração:</strong> {formatarTempo(header.tempoMedio)}
              </span>
              <span>
                <strong className="text-white/60 text-xs uppercase mr-1">Local:</strong> {header.local}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5 pb-32">
        {exercicioEmFoco && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{exercicioEmFoco.grupo}</p>
                <h2 className="text-2xl font-semibold">{exercicioEmFoco.nome}</h2>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  statusExercicios[exercicioEmFoco.id] ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'
                }`}
              >
                {statusExercicios[exercicioEmFoco.id] ? 'Concluído' : 'Em andamento'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Timer</p>
                <p className="text-4xl font-mono">{formatarCronometro(cronometro)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setTimerAtivo((prev) => !prev)}
                  className="px-4 py-2 rounded-full border border-white/20 text-sm font-semibold"
                >
                  {timerAtivo ? 'Pausar' : 'Iniciar'}
                </button>
                <button onClick={resetarTimer} className="px-4 py-2 rounded-full border border-white/10 text-sm text-white/70">
                  Zerar
                </button>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <InfoChip label="Séries" value={`${exercicioEmFoco.series}x`} />
              <InfoChip label="Repetições" value={exercicioEmFoco.repeticoes} />
              <InfoChip
                label="Equipamentos"
                value={
                  exercicioEmFoco.equipamentos && exercicioEmFoco.equipamentos.length > 0
                    ? exercicioEmFoco.equipamentos[0]
                    : 'Livre'
                }
              />
            </div>

            <div className="rounded-3xl overflow-hidden bg-dark-lighter border border-white/5 p-3">
              {exercicioEmFoco.gifUrl ? (
                <img
                  src={exercicioEmFoco.gifUrl}
                  alt={`Execução de ${exercicioEmFoco.nome}`}
                  className="w-full h-60 object-contain"
                />
              ) : (
                <div className="h-52 flex items-center justify-center text-white/40 text-sm">
                  Vídeo demonstrativo não disponível
                </div>
              )}
            </div>

            <div className="flex gap-2 text-sm">
              {abasInstrucoes.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAbaInstrucao(tab.id)}
                  className={`flex-1 py-2 rounded-full border text-xs font-semibold ${
                    abaInstrucao === tab.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-sm leading-relaxed text-white/80">
              {abaInstrucao === 'execucao' && (
                <p>{exercicioEmFoco.execucao || exercicioEmFoco.descricao || 'Siga a orientação do seu treinador para executar este exercício.'}</p>
              )}
              {abaInstrucao === 'erros' && (
                <div className="space-y-1">
                  {exercicioEmFoco.errosComuns && exercicioEmFoco.errosComuns.length > 0 ? (
                    exercicioEmFoco.errosComuns.map((erro) => (
                      <p key={erro} className="flex gap-2">
                        <span className="text-primary">•</span> {erro}
                      </p>
                    ))
                  ) : (
                    <p>Sem erros comuns cadastrados para este exercício.</p>
                  )}
                </div>
              )}
              {abaInstrucao === 'equipamentos' && (
                <p>
                  {exercicioEmFoco.equipamentos && exercicioEmFoco.equipamentos.length > 0
                    ? exercicioEmFoco.equipamentos.join(', ')
                    : 'Este exercício pode ser executado sem equipamentos específicos.'}
                </p>
              )}
            </div>
          </section>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-20 rounded-2xl bg-dark-lighter animate-pulse" />
            ))}
          </div>
        )}

        {!loading && plano && plano.blocos.length === 0 && (
          <div className="bg-dark-lighter rounded-3xl p-6 text-center">
            <p className="text-light font-semibold mb-2">Você ainda não possui treinos programados</p>
            <p className="text-light-muted text-sm mb-3">Crie um treino rápido ou solicite um plano para começar agora mesmo.</p>
            <button onClick={() => navigate('/treinos')} className="bg-primary text-dark font-semibold px-4 py-2 rounded-full">
              Ajustar plano
            </button>
          </div>
        )}

        {blocoAtivo && (
          <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Checklist do treino</p>
                <h2 className="text-xl font-semibold">Sequência do dia</h2>
              </div>
              <span className="text-sm text-white/60">
                {blocoAtivo.exercicios.filter((ex) => statusExercicios[ex.id]).length}/{blocoAtivo.totalExercicios} concluídos
              </span>
            </div>

            <div className="space-y-3">
              {blocoAtivo.exercicios.map((exercicio) => (
                <div
                  key={exercicio.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExercicioAtivo(exercicio)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setExercicioAtivo(exercicio)
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border text-left transition ${
                    statusExercicios[exercicio.id]
                      ? 'border-primary/40 bg-primary/10'
                      : exercicioEmFoco?.id === exercicio.id
                        ? 'border-primary bg-primary/5'
                        : 'border-white/5 bg-dark'
                  }`}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleToggleExercicio(blocoAtivo.id, exercicio, !statusExercicios[exercicio.id])
                    }}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                      statusExercicios[exercicio.id] ? 'bg-primary border-primary text-dark' : 'border-white/30 text-white/40'
                    }`}
                  >
                    {statusExercicios[exercicio.id] && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-dark flex items-center justify-center text-sm font-semibold text-light">
                    {exercicio.grupo.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-light font-semibold">{exercicio.nome}</p>
                    <p className="text-light-muted text-sm">
                      {exercicio.series} sets • {exercicio.repeticoes}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${isNaN(progressoAtual) ? 0 : progressoAtual}%` }}
                />
              </div>
              <button
                onClick={handleConcluirTreino}
                disabled={concluindoTreino}
                className="w-full py-3 rounded-full bg-primary text-dark font-semibold disabled:opacity-60"
              >
                {concluindoTreino ? 'Concluindo...' : 'Finalizar treino'}
              </button>
              <button onClick={handleAbandonarTreino} className="w-full py-3 rounded-full border border-white/20 text-white/70">
                Abandonar treino
              </button>
            </div>
          </section>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}