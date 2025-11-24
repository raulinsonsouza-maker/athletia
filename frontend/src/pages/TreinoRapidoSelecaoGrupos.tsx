import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { treinoRapidoService, GruposMuscularesResponse } from '../services/treino-rapido.service'
import { useToast } from '../hooks/useToast'

// Grupos musculares específicos com ícones (baseado nas imagens)
const GRUPOS_MUSCULARES_ESPECIFICOS = [
  { id: 'Glúteos', nome: 'Glúteos', icon: '🦵' },
  { id: 'Posteriores', nome: 'Posteriores', icon: '🦵' },
  { id: 'Abdômen', nome: 'Abdômen', icon: '💪' },
  { id: 'Adutores', nome: 'Adutores', icon: '🦵' },
  { id: 'Trapézio', nome: 'Trapézio', icon: '💪' },
  { id: 'Panturrilhas', nome: 'Panturrilhas', icon: '🦵' },
  { id: 'Antebraços', nome: 'Antebraços', icon: '💪' },
  { id: 'Oblíquos', nome: 'Oblíquos', icon: '💪' },
  { id: 'Lombar', nome: 'Lombar', icon: '💪' },
  { id: 'Abdutores', nome: 'Abdutores', icon: '🦵' }
]

export default function TreinoRapidoSelecaoGrupos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [gruposSelecionados, setGruposSelecionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleGrupo = (grupoId: string) => {
    setGruposSelecionados(prev => {
      if (prev.includes(grupoId)) {
        return prev.filter(id => id !== grupoId)
      } else {
        return [...prev, grupoId]
      }
    })
  }

  const handleContinuar = () => {
    if (gruposSelecionados.length === 0) {
      showToast('Selecione pelo menos um grupo muscular', 'error')
      return
    }

    // Passar para a próxima etapa com os grupos selecionados
    navigate('/treino-rapido/configuracao', {
      state: { gruposMusculares: gruposSelecionados }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Treinos</h1>
            <p className="text-teal-200">Treino Rápido</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center hover:bg-teal-700 transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Grid de Grupos Musculares */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {GRUPOS_MUSCULARES_ESPECIFICOS.map((grupo) => {
            const selecionado = gruposSelecionados.includes(grupo.id)
            return (
              <button
                key={grupo.id}
                onClick={() => toggleGrupo(grupo.id)}
                className={`
                  relative bg-white rounded-2xl p-4 aspect-square
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  ${selecionado 
                    ? 'ring-4 ring-green-400 shadow-lg scale-105' 
                    : 'hover:scale-105 hover:shadow-md'
                  }
                `}
              >
                {/* Ícone do grupo muscular */}
                <div className={`
                  text-6xl mb-2
                  ${selecionado ? 'opacity-100' : 'opacity-60'}
                `}>
                  {grupo.icon}
                </div>
                
                {/* Nome do grupo */}
                <span className={`
                  text-sm font-medium text-center
                  ${selecionado ? 'text-teal-900' : 'text-gray-600'}
                `}>
                  {grupo.nome}
                </span>

                {/* Indicador de seleção */}
                {selecionado && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Botão de ação */}
        <button
          onClick={handleContinuar}
          disabled={gruposSelecionados.length === 0 || loading}
          className={`
            w-full py-4 rounded-full font-semibold text-lg
            transition-all duration-200
            ${gruposSelecionados.length === 0 || loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-400 text-white hover:bg-green-500 active:scale-95'
            }
          `}
        >
          {loading ? 'Carregando...' : 'CRIAR UM NOVO TREINO RÁPIDO'}
        </button>

        <ToastContainer />
      </div>
    </div>
  )
}

