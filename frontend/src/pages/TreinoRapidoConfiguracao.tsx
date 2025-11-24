import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { treinoRapidoService } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'

const DURACOES = [20, 30, 40, 50, 60]
const DIFICULDADES = ['Iniciante', 'Intermediário', 'Avançado'] as const
const LOCAIS_TREINO = ['Academia comercial', 'Academia Pequena', 'Sem equipamento', 'Customizado']
const FOCOS_MUSCULARES = [
  { id: 'Peito', nome: 'Peito', icon: '💪' },
  { id: 'Costas', nome: 'Costas', icon: '💪' },
  { id: 'Ombros', nome: 'Ombros', icon: '💪' }
]

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

  const toggleFocoMuscular = (focoId: string) => {
    setFocoMuscular(prev => {
      if (prev.includes(focoId)) {
        return prev.filter(id => id !== focoId)
      } else {
        return [...prev, focoId]
      }
    })
  }

  const handleCriarTreino = async () => {
    if (!corpoTodo && gruposMusculares.length === 0 && focoMuscular.length === 0) {
      showToast('Selecione grupos musculares ou ative "Corpo todo"', 'error')
      return
    }

    setLoading(true)
    try {
      const treino = await treinoRapidoService.criarTreinoRapido({
        gruposMusculares: corpoTodo ? undefined : gruposMusculares,
        duracao,
        dificuldade,
        localTreino,
        focoMuscular: corpoTodo ? undefined : focoMuscular,
        corpoTodo
      })

      showToast('Treino criado com sucesso!', 'success')
      navigate(`/treino/${treino.id}`)
    } catch (error: any) {
      console.error('Erro ao criar treino:', error)
      showToast(
        error.response?.data?.message || 'Erro ao criar treino rápido',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Treino Rápido</h1>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center hover:bg-teal-700 transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* DURAÇÃO DO TREINO */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">DURAÇÃO DO TREINO</h2>
          <div className="grid grid-cols-3 gap-3">
            {DURACOES.map((dur) => (
              <button
                key={dur}
                onClick={() => setDuracao(dur)}
                className={`
                  py-3 px-4 rounded-lg font-medium transition-all
                  ${duracao === dur
                    ? 'bg-white text-teal-900'
                    : 'bg-teal-800 text-white hover:bg-teal-700'
                  }
                `}
              >
                {dur} min
              </button>
            ))}
            <button
              onClick={() => setDuracao(0)}
              className={`
                py-3 px-4 rounded-lg font-medium transition-all
                ${duracao === 0
                  ? 'bg-white text-teal-900'
                  : 'bg-teal-800 text-white hover:bg-teal-700'
                }
              `}
            >
              Customizado
            </button>
          </div>
        </div>

        {/* DIFICULDADE */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">DIFICULDADE</h2>
          <div className="flex gap-3">
            {DIFICULDADES.map((diff) => (
              <button
                key={diff}
                onClick={() => setDificuldade(diff)}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  ${dificuldade === diff
                    ? 'bg-white text-teal-900'
                    : 'bg-teal-800 text-white hover:bg-teal-700'
                  }
                `}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* LOCAL DO TREINO */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">LOCAL DO TREINO</h2>
          <div className="grid grid-cols-2 gap-3">
            {LOCAIS_TREINO.map((local) => (
              <button
                key={local}
                onClick={() => setLocalTreino(local)}
                className={`
                  py-3 px-4 rounded-lg font-medium transition-all text-sm
                  ${localTreino === local
                    ? 'bg-white text-teal-900'
                    : 'bg-teal-800 text-white hover:bg-teal-700'
                  }
                `}
              >
                {local}
              </button>
            ))}
          </div>
        </div>

        {/* FOCO MUSCULAR */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">FOCO MUSCULAR</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm">Corpo todo</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={corpoTodo}
                  onChange={(e) => {
                    setCorpoTodo(e.target.checked)
                    if (e.target.checked) {
                      setFocoMuscular([])
                    }
                  }}
                  className="sr-only"
                />
                <div className={`
                  w-12 h-6 rounded-full transition-colors duration-200
                  ${corpoTodo ? 'bg-green-400' : 'bg-gray-600'}
                `}>
                  <div className={`
                    w-5 h-5 bg-white rounded-full mt-0.5 transition-transform duration-200
                    ${corpoTodo ? 'translate-x-6' : 'translate-x-0.5'}
                  `} />
                </div>
              </div>
            </label>
          </div>

          {!corpoTodo && (
            <div className="grid grid-cols-3 gap-4">
              {FOCOS_MUSCULARES.map((foco) => {
                const selecionado = focoMuscular.includes(foco.id)
                return (
                  <button
                    key={foco.id}
                    onClick={() => toggleFocoMuscular(foco.id)}
                    className={`
                      bg-teal-800 rounded-xl p-4 aspect-square
                      flex flex-col items-center justify-center
                      transition-all duration-200
                      ${selecionado
                        ? 'ring-4 ring-green-400 shadow-lg scale-105'
                        : 'hover:scale-105 hover:bg-teal-700'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2">{foco.icon}</div>
                    <span className="text-sm font-medium">{foco.nome}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Botão de ação */}
        <button
          onClick={handleCriarTreino}
          disabled={loading}
          className={`
            w-full py-4 rounded-full font-semibold text-lg
            transition-all duration-200
            ${loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-400 text-white hover:bg-green-500 active:scale-95'
            }
          `}
        >
          {loading ? 'Criando treino...' : 'CRIAR UM NOVO TREINO RÁPIDO'}
        </button>

        <ToastContainer />
      </div>
    </div>
  )
}

