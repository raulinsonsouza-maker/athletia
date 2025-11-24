import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse, PlanoAtualBloco } from '../types/treino.types'
import { useToast } from '../hooks/useToast'

const formatarTempo = (tempo: number) => `${tempo} minutos`

export default function TreinoAtual() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [plano, setPlano] = useState<PlanoAtualResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [aberto, setAberto] = useState<string | null>(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await obterPlanoAtualResumo()
        setPlano(response)
      } catch (error) {
        console.error(error)
        showToast('Não foi possível carregar seu plano atual.', 'error')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [showToast])

  const toggleBloco = (id: string) => {
    setAberto((prev) => (prev === id ? null : id))
  }

  const header = plano?.plano

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="relative h-64">
        <img
          src={header?.imagemCapa || 'https://images.unsplash.com/photo-1600180758890-6b94519a8c51?auto=format&fit=crop&w=1000&q=80'}
          alt="Plano atual"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />
        <button
          className="absolute top-10 left-5 w-10 h-10 rounded-full bg-dark/80 flex items-center justify-center"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <div className="absolute bottom-6 left-5 right-5 space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Treino Atual</p>
          <h1 className="text-3xl font-bold">Seu plano</h1>
          {header && (
            <div className="flex gap-4 text-sm text-white/80">
              <span>⚡ {header.nivel}</span>
              <span>⏱ {formatarTempo(header.tempoMedio)}</span>
              <span>📍 {header.local}</span>
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

        {!loading && plano && plano.blocos.map((bloco, index) => (
          <BlocoTreino
            key={bloco.id}
            bloco={bloco}
            aberto={aberto === bloco.id}
            onToggle={() => toggleBloco(bloco.id)}
            indice={index + 1}
          />
        ))}
      </div>
      <ToastContainer />
    </div>
  )
}

const BlocoTreino = ({
  bloco,
  aberto,
  onToggle,
  indice
}: {
  bloco: PlanoAtualBloco
  aberto: boolean
  onToggle: () => void
  indice: number
}) => (
  <div className="bg-dark-lighter rounded-3xl overflow-hidden">
    <button className="w-full flex items-center justify-between px-5 py-4" onClick={onToggle}>
      <div>
        <p className="text-xs uppercase text-light-muted">Treino {indice}</p>
        <p className="text-light font-semibold text-lg">{bloco.totalExercicios} exercícios</p>
      </div>
      <span className="text-light-muted">{aberto ? '▲' : '▼'}</span>
    </button>
    {aberto && (
      <div className="px-5 pb-4 space-y-3">
        {bloco.exercicios.map((exercicio) => (
          <div
            key={exercicio.id}
            className="flex items-center gap-4 p-3 rounded-2xl bg-dark text-left"
          >
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

