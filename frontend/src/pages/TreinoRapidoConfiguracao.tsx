import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { treinoRapidoService } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'

const DURACOES = [20, 30, 40, 50, 60]
const DIFICULDADES = ['Iniciante', 'Intermediário', 'Avançado'] as const
const LOCAIS_TREINO = ['Academia comercial', 'Academia Pequena', 'Sem equipamento', 'Customizado']
const FOCOS_MUSCULARES = ['Peito', 'Costas', 'Ombros']

export default function TreinoRapidoConfiguracao() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast, ToastContainer } = useToast()

  const [duracao, setDuracao] = useState<number>(60)
  const [dificuldade, setDificuldade] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário')
  const [localTreino, setLocalTreino] = useState<string>('Academia comercial')
  const [corpoTodo, setCorpoTodo] = useState<boolean>(false)
  const [focoMuscular, setFocoMuscular] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const gruposMusculares = location.state?.gruposMusculares || []

  const toggleFoco = (foco: string) => {
    setFocoMuscular((prev) =>
      prev.includes(foco) ? prev.filter((item) => item !== foco) : [...prev, foco]
    )
  }

  const handleCriarTreino = async () => {
    if (!corpoTodo && gruposMusculares.length === 0 && focoMuscular.length === 0) {
      showToast('Selecione grupos musculares ou use corpo todo.', 'error')
      return
    }

    setLoading(true)
    try {
      await treinoRapidoService.criarTreinoRapido({
        gruposMusculares: corpoTodo ? undefined : gruposMusculares,
        duracao,
        dificuldade,
        localTreino,
        focoMuscular: corpoTodo ? undefined : focoMuscular,
        corpoTodo
      })

      showToast('Treino criado com sucesso!', 'success')
      navigate('/treino/atual')
    } catch (error: any) {
      console.error('Erro ao criar treino:', error)
      showToast(error.response?.data?.message || 'Erro ao criar treino rápido', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark text-white flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-[#03121b] rounded-[32px] border border-white/5 shadow-2xl space-y-6">
        <div className="flex items-center justify-between px-6 pt-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Configuração</p>
            <h1 className="text-2xl font-semibold">Treino Rápido</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 px-6">
          <p className="text-sm text-white/70">
            Ajuste a duração, dificuldade e local dos equipamentos para gerar um treino sob medida.
          </p>
          {gruposMusculares.length > 0 && (
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">
              {gruposMusculares.join(' • ')}
            </p>
          )}
        </div>

        <section className="px-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Duração do treino</p>
          <div className="grid grid-cols-3 gap-3">
            {DURACOES.map((item) => {
              const ativo = duracao === item
              return (
                <button
                  key={item}
                  onClick={() => setDuracao(item)}
                  className={`rounded-2xl py-3 font-semibold border transition ${
                    ativo ? 'border-emerald-300 bg-emerald-300/10 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {item} min
                </button>
              )
            })}
            <button
              onClick={() => setDuracao(0)}
              className={`rounded-2xl py-3 font-semibold border transition ${
                duracao === 0 ? 'border-emerald-300 bg-emerald-300/10 text-white' : 'border-white/10 text-white/70'
              }`}
            >
              Customizado
            </button>
          </div>
        </section>

        <section className="px-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dificuldade</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFICULDADES.map((nivel) => {
              const ativo = dificuldade === nivel
              return (
                <button
                  key={nivel}
                  onClick={() => setDificuldade(nivel)}
                  className={`rounded-2xl py-3 font-semibold border transition ${
                    ativo ? 'border-emerald-300 bg-emerald-300/10 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {nivel}
                </button>
              )
            })}
          </div>
        </section>

        <section className="px-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Local do treino</p>
          <div className="grid grid-cols-2 gap-3">
            {LOCAIS_TREINO.map((local) => {
              const ativo = localTreino === local
              return (
                <button
                  key={local}
                  onClick={() => setLocalTreino(local)}
                  className={`rounded-2xl py-3 px-4 text-left font-semibold border transition ${
                    ativo ? 'border-emerald-300 bg-emerald-300/10 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {local}
                </button>
              )
            })}
          </div>
        </section>

        <section className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Foco muscular</p>
            <label className="flex items-center gap-2 text-sm">
              Corpo todo
              <div
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  corpoTodo ? 'bg-emerald-400/70' : 'bg-white/20'
                }`}
                onClick={() => {
                  const novo = !corpoTodo
                  setCorpoTodo(novo)
                  if (novo) setFocoMuscular([])
                }}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 translate-y-0.5 ${
                    corpoTodo ? 'translate-x-[22px]' : 'translate-x-1'
                  }`}
                />
              </div>
            </label>
          </div>
          {!corpoTodo && (
            <div className="grid grid-cols-3 gap-3">
              {FOCOS_MUSCULARES.map((foco) => {
                const ativo = focoMuscular.includes(foco)
                return (
                  <button
                    key={foco}
                    onClick={() => toggleFoco(foco)}
                    className={`rounded-2xl py-5 px-3 border text-sm font-semibold transition ${
                      ativo ? 'border-emerald-300 bg-emerald-300/15 text-white' : 'border-white/10 text-white/70'
                    }`}
                  >
                    {foco}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <div className="px-6 pb-6">
          <button
            onClick={handleCriarTreino}
            disabled={loading}
            className={`w-full py-4 rounded-full font-semibold text-lg transition ${
              loading
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-[#a7ff1d] text-dark shadow-[0_20px_40px_rgba(167,255,29,0.25)] hover:bg-[#c6ff5a]'
            }`}
          >
            {loading ? 'Gerando treino...' : 'Criar um novo treino rápido'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

