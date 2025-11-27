import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { treinoRapidoService, GrupoMuscularCard } from '../services/treino-rapido.service'
import { getImagemGrupoBanco } from '../utils/imagensBanco'

// Imagens padrão do banco (fallback para Unsplash se não houver no banco)
const DEFAULT_IMAGENS: Record<string, string> = {
  peito: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  costas: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
  ombros: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80',
  biceps: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  triceps: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
  quadriceps: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  gluteos: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  posteriores: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  abdomen: 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?auto=format&fit=crop&w=800&q=80'
}

export default function TreinoRapidoSelecaoGrupos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [grupos, setGrupos] = useState<GrupoMuscularCard[]>([])
  const [carregando, setCarregando] = useState(true)

  const toggleGrupo = (grupo: string) => {
    setSelecionados((prev) =>
      prev.includes(grupo) ? prev.filter((item) => item !== grupo) : [...prev, grupo]
    )
  }

  const handleAvancar = () => {
    if (selecionados.length === 0) {
      showToast('Selecione ao menos um grupo muscular.', 'error')
      return
    }
    navigate('/treino-rapido/configuracao', {
      state: { gruposMusculares: selecionados }
    })
  }

  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setCarregando(true)
        const resposta = await treinoRapidoService.listarGrupos()
        setGrupos(resposta.gruposPrincipais)
      } catch (error: any) {
        console.error('Erro ao carregar grupos musculares:', error)
        showToast('Não conseguimos carregar os grupos agora. Tente novamente.', 'error')
      } finally {
        setCarregando(false)
      }
    }
    carregarGrupos()
  }, [showToast])

  const gruposExibidos = useMemo(() => {
    if (grupos.length === 0) {
      return Array.from({ length: 9 }, (_, index) => ({
        nome: `Grupo ${index + 1}`,
        slug: `placeholder-${index}`,
        imagemUrl: null
      }))
    }
    return grupos
  }, [grupos])

  const getImagemGrupo = (grupo: GrupoMuscularCard | { slug: string; imagemUrl: string | null }) => {
    // Prioridade 1: imagemUrl do grupo (se existir)
    if ('imagemUrl' in grupo && grupo.imagemUrl) {
      return grupo.imagemUrl
    }
    
    // Prioridade 2: imagem do banco para o grupo
    const imagemBanco = getImagemGrupoBanco(grupo.slug)
    if (imagemBanco) {
      return imagemBanco
    }
    
    // Prioridade 3: fallback para Unsplash
    return DEFAULT_IMAGENS[grupo.slug as keyof typeof DEFAULT_IMAGENS] || DEFAULT_IMAGENS.peito
  }

  return (
    <div className="min-h-screen bg-dark text-white pb-24">
      <AppHeader title="Treino rápido" backTo="/treinos" />
      <div className="px-5 space-y-4">
        <p className="text-sm text-white/70">
          Escolha os grupos musculares que deseja trabalhar hoje. Vamos ajustar automaticamente o volume e a
          intensidade para o seu perfil.
        </p>

        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pb-2">
          {gruposExibidos.map((grupo) => {
            const ativo = selecionados.includes(grupo.nome)
            const imagem = getImagemGrupo(grupo as GrupoMuscularCard)
            return (
              <button
                key={grupo.slug}
                onClick={() => !carregando && toggleGrupo(grupo.nome)}
                disabled={carregando}
                className={`relative aspect-square rounded-3xl border transition-all duration-200 flex flex-col items-center justify-end overflow-hidden ${
                  ativo
                    ? 'border-primary/70 bg-primary/10 shadow-[0_0_30px_rgba(249,166,32,0.25)]'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="absolute inset-0">
                  <img 
                    src={imagem} 
                    alt={grupo.nome} 
                    className="w-full h-full object-cover opacity-60" 
                    onError={(e) => {
                      // Se a imagem falhar, tentar fallback
                      const target = e.currentTarget
                      const currentSrc = target.src
                      
                      // Se estava tentando carregar do banco, tentar Unsplash
                      if (currentSrc.includes('/api/imagens-banco/')) {
                        const fallback = DEFAULT_IMAGENS[grupo.slug as keyof typeof DEFAULT_IMAGENS] || DEFAULT_IMAGENS.peito
                        if (target.src !== fallback) {
                          target.src = fallback
                          return
                        }
                      }
                      
                      // Se a fallback também falhar, ocultar imagem
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
                <div className="relative flex flex-col items-center gap-2 pb-4 px-3">
                  <span
                    className={`text-xs uppercase tracking-[0.3em] ${
                      ativo ? 'text-primary/80' : 'text-white/60'
                    }`}
                  >
                    alvo
                  </span>
                  <span className="text-sm font-semibold text-white text-center">{grupo.nome}</span>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleAvancar}
          className={`w-full py-4 rounded-full font-semibold text-lg ${
            selecionados.length === 0
              ? 'bg-white/10 text-white/50 cursor-not-allowed'
              : 'bg-primary text-dark shadow-glow hover:bg-primary/90'
          } transition`}
          disabled={selecionados.length === 0}
        >
          Criar um novo treino rápido
        </button>
        {carregando && <p className="text-center text-white/60 text-sm">Carregando grupos...</p>}
      </div>
      <BottomTabs active="treinos" />
      <ToastContainer />
    </div>
  )
}

