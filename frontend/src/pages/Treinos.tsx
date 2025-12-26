import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obterHomeTreinos, obterPlanoAtualResumo } from '../services/treino.service'
import { TreinoHomeResponse, TreinoCardResumo } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import BottomTabs from '../components/navigation/BottomTabs'
import TrialProgress from '../components/TrialProgress'
import { useAuth } from '../contexts/AuthContext'
import AppHeader from '../components/navigation/AppHeader'
import { Genero, normalizarGenero, obterImagemPorGenero } from '../utils/imagemGenero'
import AvisoExpiracaoPlano from '../components/AvisoExpiracaoPlano'
import { isDataPassada } from '../utils/treino.utils'

// ============================================================================
// ÍCONES SVG
// ============================================================================

const IconeRaio = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
  </svg>
)

const IconeGrafico = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
)

const IconePlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
)

const IconeSeparador = ({ className = 'w-1.5 h-1.5 text-white/40' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="4" />
  </svg>
)

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
  const gruposPrincipais = item.gruposPrincipais?.slice(0, 2) || []
  
  // Verificar se é treino passado e não concluído
  const isPassado = item.data ? isDataPassada(item.data) : false
  const isConcluido = item.concluido === true
  const isPendentePassado = isPassado && !isConcluido
  
  // Classes para estilo PB quando for treino passado pendente
  const containerClassesPB = isPendentePassado 
    ? 'opacity-70 border-dashed border-white/20' 
    : ''
  const imageClassesPB = isPendentePassado 
    ? 'grayscale opacity-65' 
    : ''
  const textClassesPB = isPendentePassado 
    ? 'opacity-70' 
    : ''

  return (
    <button
      onClick={() => onNavigate && onNavigate(item.id)}
      className={`bg-[#111] rounded-2xl overflow-hidden text-left w-full hover:bg-[#161616] transition-all border border-white/5 ${containerClassesPB}`}
    >
      <div className="flex">
        <div className="w-28 h-28 bg-black/50 flex-shrink-0 relative overflow-hidden">
          {(() => {
            const imagemFinal = item.imagem || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
            return (
              <img
                key={`${item.id}-${imagemFinal}`}
                src={imagemFinal}
                alt={item.titulo}
                className={`w-full h-full object-cover ${imageClassesPB}`}
                onError={(e) => {
                  const target = e.currentTarget
                  const currentSrc = target.src
                  
                  // Se estava tentando carregar do Unsplash ou banco, tentar fallback padrão
                  if (currentSrc.includes('unsplash.com') || currentSrc.includes('/api/imagens-banco/')) {
                    const fallback = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
                    if (target.src !== fallback) {
                      target.src = fallback
                      return
                    }
                  }
                  
                  // Se a fallback também falhar, mostrar placeholder
                  target.style.display = 'none'
                  const placeholder = target.parentElement?.querySelector('.image-placeholder')
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            )
          })()}
          <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center" style={{ display: 'none' }}>
            <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary mb-1 flex items-center gap-2 flex-wrap">
              {gruposPrincipais.length > 0 ? (
                gruposPrincipais.map((grupo, index) => (
                  <span key={`${item.id}-grupo-${grupo}`} className="flex items-center gap-2">
                    {index > 0 && <IconeSeparador className="w-1.5 h-1.5 text-primary/60" />}
                    {grupo}
                  </span>
                ))
              ) : (
                <span>{item.nivel}</span>
              )}
            </div>
            <h3 className={`text-white font-semibold text-base line-clamp-1 ${textClassesPB}`}>{item.titulo}</h3>
          </div>
          <div className={`flex items-center gap-2 text-xs text-white/50 flex-wrap ${textClassesPB}`}>
            <span>{formatarDuracao(item.duracao)}</span>
            <IconeSeparador />
            <span>{item.totalExercicios} exercícios</span>
            {item.data && (
              <>
                <IconeSeparador />
                <span className={`text-primary ${textClassesPB}`}>{formatarData(item.data)}</span>
                {isPendentePassado && (
                  <span className="text-xs bg-gray-500/20 text-gray-300 border border-gray-400/60 px-2 py-0.5 rounded">
                    Pendente
                  </span>
                )}
                {isConcluido && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 px-2 py-0.5 rounded">
                    Concluído
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function Treinos() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { isTrialAtivo } = useAuth()
  const [dados, setDados] = useState<TreinoHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [genero, setGenero] = useState<Genero>(null)

  const recarregarTreinos = async () => {
    try {
      const [response, plano] = await Promise.all([
        obterHomeTreinos(),
        obterPlanoAtualResumo()
      ])
      setDados(response)
      setGenero(normalizarGenero(plano.genero))
    } catch (error: any) {
      console.error('Erro ao recarregar treinos:', error)
      // Não mostrar toast em recarregamentos automáticos para não incomodar o usuário
    }
  }

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

  // Atualizar treinos quando a página recebe foco (usuário volta para a aba)
  useEffect(() => {
    const handleFocus = () => {
      recarregarTreinos()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Atualizar treinos quando a página fica visível (usuário volta para o app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recarregarTreinos()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Polling: atualizar a cada 30 segundos quando a página está visível
  useEffect(() => {
    if (loading) return // Não fazer polling enquanto carrega inicialmente

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        recarregarTreinos()
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [loading])

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
        <AppHeader title="Treinos" />
        <div className="px-5 pt-6 space-y-6">
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
      <AppHeader title="Treinos" />
      
      <div className="px-5 pt-6 space-y-6">
        {isTrialAtivo() && <TrialProgress />}
        <AvisoExpiracaoPlano />
        {/* CARD DESTAQUE - TREINO DE HOJE */}
        {treinoHoje && (
          <section className="relative rounded-2xl overflow-hidden">
            <div className="h-48 relative">
              {(() => {
                const imagemPadrao = obterImagemPorGenero(genero, 'treinos') || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
                const imagemFinal = treinoHoje.imagem || imagemPadrao
                return (
                  <img
                    key={`treino-hoje-${imagemFinal}`}
                    src={imagemFinal}
                    alt="Treino de hoje"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget
                      const currentSrc = target.src
                      
                      // Se estava tentando carregar do banco, tentar por gênero
                      if (currentSrc.includes('/api/imagens-banco/')) {
                        const fallback = obterImagemPorGenero(genero, 'treinos') || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
                        if (target.src !== fallback) {
                          target.src = fallback
                          return
                        }
                      }
                      
                      // Se estava tentando por gênero, tentar Unsplash padrão
                      if (currentSrc.includes('unsplash.com')) {
                        const fallback = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
                        if (target.src !== fallback) {
                          target.src = fallback
                          return
                        }
                      }
                      
                      // Se todas as tentativas falharam, mostrar placeholder
                      target.style.display = 'none'
                      const placeholder = target.parentElement?.querySelector('.image-placeholder')
                      if (placeholder) {
                        (placeholder as HTMLElement).style.display = 'flex'
                      }
                    }}
                  />
                )
              })()}
              <div className="image-placeholder absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center" style={{ display: 'none' }}>
                <svg className="w-16 h-16 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-primary mb-1 flex items-center gap-2 flex-wrap">
                      {(treinoHoje as any).gruposPrincipais && (treinoHoje as any).gruposPrincipais.length > 0 ? (
                        (treinoHoje as any).gruposPrincipais.slice(0, 2).map((grupo: string, index: number) => (
                          <span key={`grupo-${treinoHoje.id}-${grupo}`} className="flex items-center gap-2">
                            {index > 0 && <IconeSeparador className="w-1.5 h-1.5 text-primary/60" />}
                            {grupo}
                          </span>
                        ))
                      ) : (
                        <span>Treino do dia</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold">{treinoHoje.titulo}</h2>
                    <div className="text-sm text-white/60 mt-1 flex items-center gap-2">
                      <span>{formatarDuracao(treinoHoje.duracao)}</span>
                      <IconeSeparador className="w-1.5 h-1.5 text-white/40" />
                      <span>{treinoHoje.totalExercicios} exercícios</span>
                    </div>
                  </div>
                  <button
                    onClick={handleIniciarTreino}
                    className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2"
                  >
                    <IconePlay />
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
            <div className="mb-2">
              <IconeRaio />
            </div>
            <p className="font-semibold text-sm">Treino Rápido</p>
            <p className="text-xs text-white/50">Personalizado em segundos</p>
          </button>
          <button
            onClick={() => navigate('/progresso')}
            className="flex-1 bg-[#111] border border-white/10 rounded-xl py-4 px-4 text-left hover:bg-[#161616] transition"
          >
            <div className="mb-2">
              <IconeGrafico />
            </div>
            <p className="font-semibold text-sm">Meu Progresso</p>
            <p className="text-xs text-white/50">Acompanhe sua evolução</p>
          </button>
        </div>

        {/* PRÓXIMOS TREINOS */}
        {outrosTreinos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm uppercase tracking-[0.15em] text-white/50">Próximos Treinos</h2>
              <span className="text-xs text-white/30">{outrosTreinos.length} programados</span>
            </div>
            <p className="text-xs text-white/40 mb-3">
              Esta é sua agenda de treinos semanal completa
            </p>
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

        {/* ESTADO VAZIO */}
        {!treinoHoje && outrosTreinos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/30">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
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
