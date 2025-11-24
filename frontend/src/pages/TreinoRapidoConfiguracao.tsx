import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { treinoRapidoService } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'

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
    <div className="min-h-screen bg-dark text-white pb-24">
      <AppHeader title="Configurar treino" backTo="/treino-rapido" />
      <div className="px-5 space-y-6">
        <p className="text-sm text-white/70">
          Ajuste duração, dificuldade e estrutura do treino rápido. Usaremos seus grupos selecionados para
          montar combinações inteligentes.
        </p>
        {gruposMusculares.length > 0 && (
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{gruposMusculares.join(' • ')}</p>
        )}

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Duração do treino</p>
          <div className="grid grid-cols-3 gap-3">
            {DURACOES.map((item) => {
              const ativo = duracao === item
              return (
                <button
                  key={item}
                  onClick={() => setDuracao(item)}
                className={`rounded-2xl py-3 font-semibold border transition ${
                  ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {item} min
                </button>
              )
            })}
            <button
              onClick={() => setDuracao(0)}
              className={`rounded-2xl py-3 font-semibold border transition ${
                duracao === 0 ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
              }`}
            >
              Customizado
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dificuldade</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFICULDADES.map((nivel) => {
              const ativo = dificuldade === nivel
              return (
                <button
                  key={nivel}
                  onClick={() => setDificuldade(nivel)}
                className={`rounded-2xl py-3 font-semibold border transition ${
                  ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {nivel}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Local do treino</p>
          <div className="grid grid-cols-2 gap-3">
            {LOCAIS_TREINO.map((local) => {
              const ativo = localTreino === local
              return (
                <button
                  key={local}
                  onClick={() => setLocalTreino(local)}
                className={`rounded-2xl py-3 px-4 text-left font-semibold border transition ${
                  ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                  }`}
                >
                  {local}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Foco muscular</p>
            <label className="flex items-center gap-2 text-sm">
              Corpo todo
                <div
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    corpoTodo ? 'bg-primary/70' : 'bg-white/20'
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
                    ativo ? 'border-primary bg-primary/15 text-white' : 'border-white/10 text-white/70'
                    }`}
                  >
                    {foco}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <div>
          <button
            onClick={handleCriarTreino}
            disabled={loading}
            className={`w-full py-4 rounded-full font-semibold text-lg transition ${
              loading
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-primary text-dark shadow-glow hover:bg-primary/90'
            }`}
          >
            {loading ? 'Gerando treino...' : 'Criar um novo treino rápido'}
          </button>
        </div>
      </div>
      <BottomTabs active="treinos" />
      <ToastContainer />
    </div>
  )
}

