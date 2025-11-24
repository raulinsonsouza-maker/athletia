import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { concluirTreino, marcarExercicioTreino, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, PlanoAtualBloco } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'

const formatarTempo = (tempo: number) => `${tempo} minutos`

export default function TreinoAtual() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [plano, setPlano] = useState<PlanoAtualResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState<string | null>(null)
  const [statusExercicios, setStatusExercicios] = useState<Record<string, boolean>>({})
  const [concluindoTreino, setConcluindoTreino] = useState(false)

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

  const toggleBloco = (id: string) => {
    setAberto((prev) => (prev === id ? null : id))
  }

  const handleToggleExercicio = async (treinoId: string, exercicioId: string, marcado: boolean) => {
    setStatusExercicios((prev) => ({ ...prev, [exercicioId]: marcado }))
    try {
      await marcarExercicioTreino(treinoId, exercicioId, marcado)
    } catch (error) {
      console.error(error)
      setStatusExercicios((prev) => ({ ...prev, [exercicioId]: !marcado }))
      showToast('Não conseguimos atualizar o exercício. Tente novamente.', 'error')
    }
  }

  const handleConcluirTreino = async () => {
    if (!blocoAtivo) return
    setConcluindoTreino(true)
    try {
      await concluirTreino(blocoAtivo.id)
      showToast('Treino concluído com sucesso!', 'success')
      carregarPlanoAtual()
    } catch (error) {
      console.error(error)
      showToast('Não foi possível concluir o treino agora.', 'error')
    } finally {
      setConcluindoTreino(false)
    }
  }

  const header = plano?.plano
  const blocoAtivo = useMemo(() => {
    if (!plano) return null
    return plano.blocos.find((b) => b.id === aberto) || plano.blocos[0] || null
  }, [aberto, plano])

  const progressoAtual = blocoAtivo
    ? Math.round(
        (blocoAtivo.exercicios.filter((ex) => statusExercicios[ex.id]).length / blocoAtivo.totalExercicios) * 100
      )
    : 0

  return (
    <div className="min-h-screen bg-dark text-white pb-24">
      <AppHeader title="Treino Atual" backTo="/meu-plano" />
      <div className="relative h-64">
        <img
          src={header?.imagemCapa || 'https://images.unsplash.com/photo-1600180758890-6b94519a8c51?auto=format&fit=crop&w=1000&q=80'}
          alt="Plano atual"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Treino Atual</p>
          <h1 className="text-3xl font-bold">Seu plano</h1>
          {header && (
            <div className="flex gap-4 text-sm text-white/80">
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

      <div className="p-5 space-y-4 pb-24">
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
            <p className="text-light-muted text-sm mb-3">
              Crie um treino rápido ou solicite um plano para começar agora mesmo.
            </p>
            <button
              onClick={() => navigate('/treino-rapido')}
              className="bg-primary text-dark font-semibold px-4 py-2 rounded-full"
            >
              Criar treino rápido
            </button>
          </div>
        )}

        {!loading &&
          plano &&
          plano.blocos.map((bloco, index) => (
            <BlocoTreino
              key={bloco.id}
              bloco={bloco}
              aberto={aberto === bloco.id}
              onToggle={() => toggleBloco(bloco.id)}
              indice={index + 1}
              statusExercicios={statusExercicios}
              onToggleExercicio={handleToggleExercicio}
            />
          ))}

        {blocoAtivo && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>
                {blocoAtivo.exercicios.filter((ex) => statusExercicios[ex.id]).length}/{blocoAtivo.totalExercicios}{' '}
                exercícios concluídos
              </span>
              <span>{isNaN(progressoAtual) ? 0 : progressoAtual}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${isNaN(progressoAtual) ? 0 : progressoAtual}%` }}
              />
            </div>
            <button
              onClick={handleConcluirTreino}
              disabled={concluindoTreino}
              className="w-full py-3 rounded-full bg-primary text-dark font-semibold mt-2 disabled:opacity-60"
            >
              {concluindoTreino ? 'Concluindo...' : 'Concluir treino'}
            </button>
          </div>
        )}
      </div>
      <BottomTabs active="meu-plano" />
      <ToastContainer />
    </div>
  )
}

const BlocoTreino = ({
  bloco,
  aberto,
  onToggle,
  indice,
  statusExercicios,
  onToggleExercicio
}: {
  bloco: PlanoAtualBloco
  aberto: boolean
  onToggle: () => void
  indice: number
  statusExercicios: Record<string, boolean>
  onToggleExercicio: (treinoId: string, exercicioId: string, marcado: boolean) => void
}) => (
  <div className="bg-dark-lighter rounded-3xl overflow-hidden">
    <button className="w-full flex items-center justify-between px-5 py-4" onClick={onToggle}>
      <div>
        <p className="text-xs uppercase text-light-muted">Treino {indice}</p>
        <p className="text-light font-semibold text-lg">{bloco.totalExercicios} exercícios</p>
      </div>
      <span className="text-light-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          {aberto ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          )}
        </svg>
      </span>
    </button>
    {aberto && (
      <div className="px-5 pb-4 space-y-3">
        {bloco.exercicios.map((exercicio) => (
          <div
            key={exercicio.id}
            className={`flex items-center gap-4 p-3 rounded-2xl border ${
              statusExercicios[exercicio.id]
                ? 'border-primary/40 bg-primary/10'
                : 'border-white/5 bg-dark'
            }`}
          >
            <button
              onClick={(event) => {
                event.stopPropagation()
                onToggleExercicio(bloco.id, exercicio.id, !statusExercicios[exercicio.id])
              }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                statusExercicios[exercicio.id]
                  ? 'bg-primary border-primary'
                  : 'border-white/30 text-white/40'
              }`}
            >
              {statusExercicios[exercicio.id] && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 text-dark"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="w-12 h-12 rounded-2xl bg-dark-lighter flex items-center justify-center text-sm font-semibold text-light">
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
    )}
  </div>
)

