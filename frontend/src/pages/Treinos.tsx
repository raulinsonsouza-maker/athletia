import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { TreinoHomeResponse, TreinoCardResumo } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import AppHeader from '../components/navigation/AppHeader'
import { Genero, normalizarGenero, obterImagemPorGenero } from '../utils/imagemGenero'

// ============================================================================
// COMPONENTES
// ============================================================================

const formatarDuracao = (minutos: number) => `${minutos} min`

const formatarData = (data: string | Date) => {
  const d = new Date(data)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataD = new Date(d)
  dataD.setHours(0, 0, 0, 0)
  
  if (dataD.getTime() === hoje.getTime()) return 'Hoje'
  
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)
  if (dataD.getTime() === amanha.getTime()) return 'Amanhã'
  
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

interface CardTreinoProps {
  item: TreinoCardResumo & { gruposPrincipais?: string[] }
  onNavigate?: (id: string) => void
}

const CardTreino = ({ item, onNavigate }: CardTreinoProps) => {
  const grupos = item.gruposPrincipais?.slice(0, 2).join(' • ') || item.nivel
  
  return (
    <button
      onClick={() => onNavigate && onNavigate(item.id)}
      className="bg-[#111] rounded-2xl overflow-hidden text-left w-full hover:bg-[#161616] transition-all border border-white/5"
    >
      <div className="flex">
        <div className="w-28 h-28 bg-black/50 flex-shrink-0">
          <img
            src={item.imagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'}
            alt={item.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary mb-1">{grupos}</p>
            <h3 className="text-white font-semibold text-base line-clamp-1">{item.titulo}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>{formatarDuracao(item.duracao)}</span>
            <span>•</span>
            <span>{item.totalExercicios} exercícios</span>
            {item.data && (
              <>
                <span>•</span>
                <span className="text-primary">{formatarData(item.data)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

const CardTreinoCompacto = ({ item, onNavigate }: CardTreinoProps) => (
  <button
    onClick={() => onNavigate && onNavigate(item.id)}
    className="bg-[#111] rounded-xl overflow-hidden text-left w-[200px] flex-shrink-0 hover:scale-[1.02] transition-all border border-white/5"
  >
    <div className="h-28 bg-black relative">
      <img
        src={item.imagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'}
        alt={item.titulo}
        className="w-full h-full object-cover opacity-80"
      />
      <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-black/60 text-white">
        {item.nivel}
      </span>
    </div>
    <div className="p-3">
      <h3 className="text-white font-medium text-sm line-clamp-1">{item.titulo}</h3>
      <p className="text-white/40 text-xs mt-1">
        {formatarDuracao(item.duracao)} • {item.totalExercicios} ex.
      </p>
    </div>
  </button>
)

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function Treinos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const [dados, setDados] = useState<TreinoHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [genero, setGenero] = useState<Genero>(null)

  useEffect(() => {
    const carregar = async () => {
      try {
        const [response, plano] = await Promise.all([
          obterHomeTreinos(),
          obterPlanoAtualResumo()
        ])
        setDados(response)
        setGenero(normalizarGenero(plano.genero))
      } catch (error: any) {
        console.error('Erro ao carregar treinos:', error)
        showToast('Não foi possível carregar seus treinos.', 'error')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [showToast])

  const handleNavegar = (treinoId: string) => {
    navigate(`/treino/atual?treino=${treinoId}`)
  }

  const handleIniciarTreino = () => {
    if (dados?.planosAtivos?.[0]) {
      navigate(`/treino/atual?treino=${dados.planosAtivos[0].id}`)
    } else {
      navigate('/treino/atual')
    }
  }

  // Skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
        <AppHeader title="Treinos" subtitle="Carregando..." />
        <div className="px-4 pt-4 space-y-4">
          <div className="h-40 bg-[#111] rounded-2xl animate-pulse" />
          <div className="h-28 bg-[#111] rounded-2xl animate-pulse" />
          <div className="h-28 bg-[#111] rounded-2xl animate-pulse" />
        </div>
        <BottomTabs active="treinos" />
      </div>
    )
  }

  const treinoHoje = dados?.planosAtivos?.[0]
  const outrosTreinos = dados?.planosAtivos?.slice(1) || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <AppHeader title="Treinos" subtitle="Seu plano de treinos" />
      
      <div className="px-4 pt-2 space-y-6">
        {/* CARD DESTAQUE - TREINO DE HOJE */}
        {treinoHoje && (
          <section className="relative rounded-2xl overflow-hidden">
            <div className="h-48 relative">
              <img
                src={treinoHoje.imagem || obterImagemPorGenero(genero, 'treinos')}
                alt="Treino de hoje"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">
                      {(treinoHoje as any).gruposPrincipais?.join(' • ') || 'Treino do dia'}
                    </p>
                    <h2 className="text-xl font-bold">{treinoHoje.titulo}</h2>
                    <p className="text-sm text-white/60 mt-1">
                      {formatarDuracao(treinoHoje.duracao)} • {treinoHoje.totalExercicios} exercícios
                    </p>
                  </div>
                  <button
                    onClick={handleIniciarTreino}
                    className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm"
                  >
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AÇÕES RÁPIDAS */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/treino-rapido')}
            className="flex-1 bg-[#111] border border-white/10 rounded-xl py-4 px-4 text-left hover:bg-[#161616] transition"
          >
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="font-semibold text-sm">Treino Rápido</p>
            <p className="text-xs text-white/50">Personalizado em segundos</p>
          </button>
          <button
            onClick={() => navigate('/meu-plano')}
            className="flex-1 bg-[#111] border border-white/10 rounded-xl py-4 px-4 text-left hover:bg-[#161616] transition"
          >
            <span className="text-2xl mb-2 block">📊</span>
            <p className="font-semibold text-sm">Meu Progresso</p>
            <p className="text-xs text-white/50">Acompanhe sua evolução</p>
          </button>
        </div>

        {/* PRÓXIMOS TREINOS */}
        {outrosTreinos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-[0.15em] text-white/50">Próximos Treinos</h2>
              <span className="text-xs text-white/30">{outrosTreinos.length} programados</span>
            </div>
            <div className="space-y-2">
              {outrosTreinos.map((treino) => (
                <CardTreino 
                  key={treino.id} 
                  item={treino as any} 
                  onNavigate={handleNavegar} 
                />
              ))}
            </div>
          </section>
        )}

        {/* TEMPLATES/SUGESTÕES */}
        {dados?.secoes?.map((secao) => (
          <section key={secao.id}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-[0.15em] text-white/50">{secao.titulo}</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {secao.itens.map((item) => (
                <CardTreinoCompacto 
                  key={item.id} 
                  item={item}
                  onNavigate={() => navigate('/treino-rapido')} 
                />
              ))}
            </div>
          </section>
        ))}

        {/* ESTADO VAZIO */}
        {!treinoHoje && outrosTreinos.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">🏋️</span>
            <h2 className="text-xl font-semibold mb-2">Nenhum treino programado</h2>
            <p className="text-white/50 mb-6">Crie um treino rápido para começar agora!</p>
            <button
              onClick={() => navigate('/treino-rapido')}
              className="bg-primary text-black font-bold px-6 py-3 rounded-full"
            >
              Criar Treino Rápido
            </button>
          </div>
        )}
      </div>

      <BottomTabs active="treinos" />
      <ToastContainer />
    </div>
  )
}
