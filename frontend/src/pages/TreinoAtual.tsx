import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { concluirTreino, marcarExercicioTreino, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'
import { resolveApiPath } from '../utils/api-url'

// ============================================================================
// ÍCONES SVG
// ============================================================================

const IconeVoltar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const IconeCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const IconeSeta = ({ direcao }: { direcao: 'esquerda' | 'direita' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={`w-5 h-5 ${direcao === 'esquerda' ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const IconeMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const IconeAlvo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 12a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" clipRule="evenodd" />
  </svg>
)

const IconeInstrucoes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clipRule="evenodd" />
    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
  </svg>
)

const IconeEquipamento = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
  </svg>
)

const IconeTrofeu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
  </svg>
)

const IconeFechar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconeDumbbell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white/20">
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-3V3.5C14 2.12 12.88 1 11.5 1S9 2.12 9 3.5V5H6c-1.1 0-2 .9-2 2v4H2.5C1.12 11 0 12.12 0 13.5S1.12 16 2.5 16H4v4c0 1.1.9 2 2 2h3v1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V22h3c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
  </svg>
)

const IconePonto = ({ className = 'w-1.5 h-1.5 text-white/40' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="4" />
  </svg>
)

// ============================================================================
// FORMATADORES
// ============================================================================

const formatarCronometro = (totalSegundos: number) => {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function TreinoAtual() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast, ToastContainer } = useToast()
  
  // Estados
  const [plano, setPlano] = useState<PlanoAtualResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [blocoAtivoId, setBlocoAtivoId] = useState<string | null>(null)
  const [exercicioAtivoIndex, setExercicioAtivoIndex] = useState(0)
  const [statusExercicios, setStatusExercicios] = useState<Record<string, boolean>>({})
  const [cronometro, setCronometro] = useState(0)
  const [timerAtivo, setTimerAtivo] = useState(false)
  const [concluindoTreino, setConcluindoTreino] = useState(false)
  const [mostrarChecklist, setMostrarChecklist] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'alvo' | 'instrucoes' | 'equipamento'>('alvo')
  const [mostrarImagemExpandida, setMostrarImagemExpandida] = useState(false)
  const [ultimoExercicioConcluido, setUltimoExercicioConcluido] = useState<{ id: string; timestamp: number } | null>(null)
  const [gifErroAtual, setGifErroAtual] = useState(false)
  const [gifErroProximo, setGifErroProximo] = useState(false)

  // Timer
  useEffect(() => {
    if (!timerAtivo) return
    const intervalo = setInterval(() => setCronometro((prev) => prev + 1), 1000)
    return () => clearInterval(intervalo)
  }, [timerAtivo])

  // Iniciar timer automaticamente
  useEffect(() => {
    setTimerAtivo(true)
    return () => setTimerAtivo(false)
  }, [])

  // Carregar plano
  const carregarPlano = useCallback(async () => {
    try {
      setLoading(true)
      const response = await obterPlanoAtualResumo()
      
      // Filtrar blocos que têm exercícios válidos
      const blocosValidos = response.blocos.filter(bloco => 
        bloco && bloco.exercicios && bloco.exercicios.length > 0
      )
      
      // Se não houver blocos válidos, não definir plano
      if (blocosValidos.length === 0) {
        setPlano({ ...response, blocos: [] })
        setBlocoAtivoId(null)
        setStatusExercicios({})
        setExercicioAtivoIndex(0)
        return
      }
      
      setPlano({ ...response, blocos: blocosValidos })
      
      // Definir bloco ativo (do param ou primeiro válido)
      const treinoIdParam = searchParams.get('treino')
      const blocoParam = treinoIdParam ? blocosValidos.find(b => b.id === treinoIdParam) : null
      
      if (blocoParam && blocoParam.exercicios.length > 0) {
        setBlocoAtivoId(treinoIdParam!)
      } else {
        // Encontrar primeiro bloco com exercícios
        const primeiroBlocoValido = blocosValidos.find(b => b.exercicios && b.exercicios.length > 0)
        setBlocoAtivoId(primeiroBlocoValido?.id ?? null)
      }
      
      // Mapear status dos exercícios apenas dos blocos válidos
      const mapa = blocosValidos.reduce<Record<string, boolean>>((acc, bloco) => {
        if (bloco.exercicios) {
          bloco.exercicios.forEach((ex) => {
            acc[ex.id] = Boolean(ex.concluido)
          })
        }
        return acc
      }, {})
      setStatusExercicios(mapa)
      
      // Encontrar primeiro exercício não concluído do bloco ativo
      const blocoAtivoIdFinal = blocoParam?.id || blocosValidos[0]?.id
      const blocoInicial = blocosValidos.find(b => b.id === blocoAtivoIdFinal)
      
      if (blocoInicial && blocoInicial.exercicios && blocoInicial.exercicios.length > 0) {
        const indexNaoConcluido = blocoInicial.exercicios.findIndex(ex => !mapa[ex.id])
        setExercicioAtivoIndex(indexNaoConcluido >= 0 ? indexNaoConcluido : 0)
      } else {
        setExercicioAtivoIndex(0)
      }
    } catch (error) {
      console.error(error)
      showToast('Não foi possível carregar seu treino.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, searchParams])

  useEffect(() => {
    carregarPlano()
  }, [carregarPlano])

  // Bloco ativo
  const blocoAtivo = useMemo(() => {
    if (!plano || !blocoAtivoId) return null
    
    // Buscar bloco pelo ID
    const blocoEncontrado = plano.blocos.find((b) => b.id === blocoAtivoId)
    
    // Validar se o bloco tem exercícios válidos
    if (blocoEncontrado && blocoEncontrado.exercicios && blocoEncontrado.exercicios.length > 0) {
      return blocoEncontrado
    }
    
    // Se não encontrou ou não tem exercícios, buscar primeiro bloco válido
    const primeiroBlocoValido = plano.blocos.find(b => 
      b && b.exercicios && b.exercicios.length > 0
    )
    
    return primeiroBlocoValido || null
  }, [blocoAtivoId, plano])

  // Exercício em foco
  const exercicioEmFoco = useMemo(() => {
    if (!blocoAtivo || !blocoAtivo.exercicios.length) return null
    return blocoAtivo.exercicios[exercicioAtivoIndex] || blocoAtivo.exercicios[0]
  }, [blocoAtivo, exercicioAtivoIndex])

  // Próximo exercício
  const proximoExercicio = useMemo(() => {
    if (!blocoAtivo) return null
    return blocoAtivo.exercicios[exercicioAtivoIndex + 1] || null
  }, [blocoAtivo, exercicioAtivoIndex])

  useEffect(() => {
    setGifErroAtual(false)
  }, [exercicioEmFoco?.id])

  useEffect(() => {
    setGifErroProximo(false)
  }, [proximoExercicio?.id])

  const exercicioGifUrl = useMemo(() => {
    if (gifErroAtual) return null
    return resolveApiPath(exercicioEmFoco?.gifUrl)
  }, [exercicioEmFoco?.gifUrl, gifErroAtual])

  const proximoGifUrl = useMemo(() => {
    if (gifErroProximo) return null
    return resolveApiPath(proximoExercicio?.gifUrl)
  }, [proximoExercicio?.gifUrl, gifErroProximo])

  // Progresso
  const progresso = useMemo(() => {
    if (!blocoAtivo) return { concluidos: 0, total: 0, percentual: 0 }
    const concluidos = blocoAtivo.exercicios.filter(ex => statusExercicios[ex.id]).length
    const total = blocoAtivo.exercicios.length
    return { concluidos, total, percentual: Math.round((concluidos / total) * 100) }
  }, [blocoAtivo, statusExercicios])

  // Handlers
  const handleVoltar = () => navigate('/treinos')

  const handleNavegar = (direcao: 'anterior' | 'proximo') => {
    if (!blocoAtivo) return
    const novoIndex = direcao === 'proximo' 
      ? Math.min(exercicioAtivoIndex + 1, blocoAtivo.exercicios.length - 1)
      : Math.max(exercicioAtivoIndex - 1, 0)
    setExercicioAtivoIndex(novoIndex)
  }

  const handleMarcarConcluido = async () => {
    if (!exercicioEmFoco || !blocoAtivo) return
    
    const novoStatus = !statusExercicios[exercicioEmFoco.id]
    setStatusExercicios(prev => ({ ...prev, [exercicioEmFoco.id]: novoStatus }))
    
    try {
      await marcarExercicioTreino(exercicioEmFoco.id, novoStatus)
      
      if (novoStatus) {
        // Salvar informação para permitir desfazer
        setUltimoExercicioConcluido({ id: exercicioEmFoco.id, timestamp: Date.now() })
        
        // Ir para próximo automaticamente após delay
        if (exercicioAtivoIndex < blocoAtivo.exercicios.length - 1) {
          setTimeout(() => setExercicioAtivoIndex(prev => prev + 1), 500)
        }
      }
    } catch (error) {
      console.error(error)
      setStatusExercicios(prev => ({ ...prev, [exercicioEmFoco.id]: !novoStatus }))
      showToast('Erro ao atualizar exercício', 'error')
    }
  }

  // Permitir desfazer nos primeiros 3 segundos
  const podeDesfazer = useMemo(() => {
    if (!ultimoExercicioConcluido) return false
    const tempoDecorrido = Date.now() - ultimoExercicioConcluido.timestamp
    return tempoDecorrido < 3000 && ultimoExercicioConcluido.id === exercicioEmFoco?.id
  }, [ultimoExercicioConcluido, exercicioEmFoco])

  const handleDesfazer = async () => {
    if (!exercicioEmFoco || !podeDesfazer) return
    
    const novoStatus = false
    setStatusExercicios(prev => ({ ...prev, [exercicioEmFoco.id]: novoStatus }))
    setUltimoExercicioConcluido(null)
    
    try {
      await marcarExercicioTreino(exercicioEmFoco.id, novoStatus)
      showToast('Exercício desmarcado', 'info')
    } catch (error) {
      console.error(error)
      setStatusExercicios(prev => ({ ...prev, [exercicioEmFoco.id]: !novoStatus }))
      showToast('Erro ao desmarcar exercício', 'error')
    }
  }

  const handleConcluirTreino = async () => {
    if (!blocoAtivo) return
    setConcluindoTreino(true)
    try {
      await concluirTreino(blocoAtivo.id)
      showToast('Treino concluído com sucesso!', 'success')
      setTimerAtivo(false)
      setTimeout(() => navigate('/meu-plano'), 1000)
    } catch (error) {
      console.error(error)
      showToast('Erro ao finalizar treino', 'error')
    } finally {
      setConcluindoTreino(false)
    }
  }

  const handleAbandonar = () => {
    if (window.confirm('Deseja abandonar este treino?')) {
      setTimerAtivo(false)
      navigate('/treinos')
    }
  }

  const handleSelecionarExercicio = (index: number) => {
    setExercicioAtivoIndex(index)
    setMostrarChecklist(false)
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Sem treino
  if (!blocoAtivo || !exercicioEmFoco) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <IconeDumbbell />
        </div>
        <p className="text-xl font-semibold mb-2">Nenhum treino encontrado</p>
        <p className="text-white/60 mb-6 text-center">Crie um treino rápido ou aguarde a geração do seu plano.</p>
        <button
          onClick={() => navigate('/treinos')}
          className="bg-primary text-black font-bold px-6 py-3 rounded-full"
        >
          Ir para Treinos
        </button>
      </div>
    )
  }

  const exercicioConcluido = statusExercicios[exercicioEmFoco.id]

  // Tabs de informações do exercício
  const tabs = [
    { id: 'alvo' as const, label: 'ALVO', icon: IconeAlvo },
    { id: 'instrucoes' as const, label: 'INSTRUÇÕES', icon: IconeInstrucoes },
    { id: 'equipamento' as const, label: 'EQUIPAMENTO', icon: IconeEquipamento }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* TIMER EM FAIXA (FIXO NO TOPO) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={handleVoltar} className="p-2 -ml-2 text-white/80 hover:text-white">
            <IconeVoltar />
          </button>
          
          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className="text-sm font-mono font-bold text-primary">{formatarCronometro(cronometro)}</span>
            <button 
              onClick={() => setTimerAtivo(!timerAtivo)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${timerAtivo ? 'bg-white/10 text-white/70' : 'bg-primary text-black'}`}
            >
              {timerAtivo ? 'Pausar' : 'Iniciar'}
            </button>
          </div>
          
          <button 
            onClick={() => setMostrarChecklist(!mostrarChecklist)}
            className="p-2 -mr-2 text-white/80 hover:text-white relative"
          >
            <IconeMenu />
            {progresso.concluidos > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs rounded-full flex items-center justify-center font-bold">
                {progresso.concluidos}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pt-14 pb-52 px-4 flex flex-col">
        {/* NOME DO EXERCÍCIO (PRIMEIRO - HIERARQUIA VISUAL) */}
        <h1 className="text-3xl font-bold text-center mb-3 mt-2">{exercicioEmFoco.nome}</h1>

        {/* BLOCO DE DADOS (SÉRIES/REP/DESCANSO/CARGA) */}
        <div className="bg-[#111] rounded-xl border border-white/10 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Séries</span>
              <span className="text-lg font-bold">{exercicioEmFoco.series}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Repetições</span>
              <span className="text-lg font-bold">{exercicioEmFoco.repeticoes}</span>
            </div>
            {exercicioEmFoco.carga && (
              <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Carga</span>
                <span className="text-lg font-bold">{exercicioEmFoco.carga}kg</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Grupo</span>
              <span className="text-lg font-bold text-primary">{exercicioEmFoco.grupo}</span>
            </div>
          </div>
        </div>

        {/* PRÓXIMO EXERCÍCIO (MINI-CARD) */}
        {proximoExercicio && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Próximo</p>
                <p className="text-sm font-semibold text-white/90">{proximoExercicio.nome}</p>
                <p className="text-xs text-white/50 mt-1">{proximoExercicio.series}x{proximoExercicio.repeticoes}</p>
              </div>
              {proximoGifUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#111] border border-white/10">
                  <img
                    src={proximoGifUrl}
                    alt={proximoExercicio.nome}
                    className="w-full h-full object-cover"
                    onError={() => setGifErroProximo(true)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* GIF DO EXERCÍCIO (REDUZIDO E EXPANSÍVEL) */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => setMostrarImagemExpandida(true)}
            className="w-full max-w-sm h-56 bg-[#111] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center hover:border-primary/50 transition relative group"
          >
            {exercicioGifUrl ? (
              <>
                <img
                  src={exercicioGifUrl}
                  alt={exercicioEmFoco.nome}
                  className="w-full h-full object-contain"
                  onError={() => setGifErroAtual(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <span className="text-xs text-white/70 opacity-0 group-hover:opacity-100 transition">Toque para expandir</span>
                </div>
              </>
            ) : (
              <IconeDumbbell />
            )}
          </button>
        </div>

        {/* TABS DE INFORMAÇÕES */}
        <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = abaAtiva === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setAbaAtiva(tab.id)}
                  className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-white/5 text-white border-b-2 border-primary' 
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="p-4 min-h-[120px]">
            {abaAtiva === 'alvo' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">Músculo principal: <strong className="text-white">{exercicioEmFoco.grupo}</strong></span>
                </div>
              </div>
            )}

            {abaAtiva === 'instrucoes' && (
              <div className="space-y-3 text-sm text-white/80">
                {exercicioEmFoco.execucao ? (
                  <p>{exercicioEmFoco.execucao}</p>
                ) : exercicioEmFoco.descricao ? (
                  <p>{exercicioEmFoco.descricao}</p>
                ) : (
                  <p className="text-white/50">Execute o movimento de forma controlada, mantendo a postura correta durante todo o exercício.</p>
                )}
                {exercicioEmFoco.errosComuns && exercicioEmFoco.errosComuns.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Erros comuns:</p>
                    <ul className="space-y-1">
                      {exercicioEmFoco.errosComuns.map((erro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <IconePonto className="w-2 h-2 text-red-400 flex-shrink-0 translate-y-[7px]" />
                          <span>{erro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {abaAtiva === 'equipamento' && (
              <div className="space-y-2">
                {exercicioEmFoco.equipamentos && exercicioEmFoco.equipamentos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {exercicioEmFoco.equipamentos.map((equip, idx) => (
                      <span key={idx} className="px-3 py-2 rounded-lg bg-white/5 text-sm flex items-center gap-2">
                        <IconeEquipamento />
                        {equip}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">Este exercício pode ser executado sem equipamentos específicos.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE EXERCÍCIOS (SETAS MAIORES E MAIS VISÍVEIS) */}
        <div className="flex items-center justify-center gap-8 mt-4">
          <button
            onClick={() => handleNavegar('anterior')}
            disabled={exercicioAtivoIndex === 0}
            className="p-4 rounded-full bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/20 active:bg-white/30 transition border border-white/20"
          >
            <IconeSeta direcao="esquerda" />
          </button>
          <span className="text-base font-semibold text-white/80 min-w-[60px] text-center">
            {exercicioAtivoIndex + 1} / {blocoAtivo.exercicios.length}
          </span>
          <button
            onClick={() => handleNavegar('proximo')}
            disabled={exercicioAtivoIndex === blocoAtivo.exercicios.length - 1}
            className="p-4 rounded-full bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/20 active:bg-white/30 transition border border-white/20"
          >
            <IconeSeta direcao="direita" />
          </button>
        </div>
      </main>

      {/* FOOTER FIXO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-6 px-4">
        {/* PROGRESSO VISUAL MELHORADO (CÍRCULOS) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-bold text-white">{progresso.concluidos} de {progresso.total} exercícios</span>
            <span className="text-base font-bold text-primary">{progresso.percentual}%</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: blocoAtivo.exercicios.length }).map((_, idx) => {
              const concluido = idx < progresso.concluidos
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    concluido 
                      ? 'bg-primary scale-110' 
                      : 'bg-white/20'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* BOTÃO DESFAZER (SE APLICÁVEL) */}
        {podeDesfazer && (
          <button
            onClick={handleDesfazer}
            className="w-full mb-2 py-2 rounded-xl bg-white/10 text-white/80 text-sm font-medium hover:bg-white/20 transition"
          >
            Desfazer ({(3000 - (Date.now() - (ultimoExercicioConcluido?.timestamp || 0))) / 1000}s)
          </button>
        )}

        {/* BOTÃO PRINCIPAL */}
        <button
          onClick={handleMarcarConcluido}
          className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
            exercicioConcluido 
              ? 'bg-white/10 text-white/70' 
              : 'bg-primary text-black shadow-lg shadow-primary/30'
          }`}
        >
          {exercicioConcluido ? (
            <>
              <IconeCheck />
              <span>Desmarcar exercício</span>
            </>
          ) : (
            <>
              <IconeCheck />
              <span>Concluir exercício</span>
            </>
          )}
        </button>

        {/* BOTÕES SECUNDÁRIOS */}
        {progresso.percentual === 100 && (
          <button
            onClick={handleConcluirTreino}
            disabled={concluindoTreino}
            className="w-full mt-3 py-4 rounded-2xl bg-green-600 text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <IconeTrofeu />
            {concluindoTreino ? 'Finalizando...' : 'Finalizar Treino'}
          </button>
        )}
      </footer>

      {/* MODAL CHECKLIST */}
      {mostrarChecklist && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end"
          onClick={() => setMostrarChecklist(false)}
        >
          <div 
            className="w-full max-h-[70vh] bg-[#111] rounded-t-3xl p-5 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{blocoAtivo.titulo}</h2>
                <p className="text-sm text-white/50">{progresso.concluidos}/{progresso.total} exercícios</p>
              </div>
              <button 
                onClick={() => setMostrarChecklist(false)}
                className="text-white/50 hover:text-white"
              >
                <IconeFechar />
              </button>
            </div>
            
            <div className="space-y-2">
              {blocoAtivo.exercicios.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelecionarExercicio(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                    statusExercicios[ex.id]
                      ? 'bg-primary/10 border border-primary/30'
                      : idx === exercicioAtivoIndex
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    statusExercicios[ex.id] ? 'bg-primary text-black' : 'bg-white/10 text-white/50'
                  }`}>
                    {statusExercicios[ex.id] ? <IconeCheck /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${statusExercicios[ex.id] ? 'text-primary' : 'text-white'}`}>
                      {ex.nome}
                    </p>
                    <p className="text-xs text-white/50 flex items-center gap-2">
                      <span>{ex.grupo}</span>
                      <IconePonto className="w-1.5 h-1.5 text-white/40" />
                      <span>{ex.series}x{ex.repeticoes}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handleConcluirTreino}
                disabled={concluindoTreino || progresso.percentual < 100}
                className="w-full py-4 rounded-xl bg-primary text-black font-bold disabled:opacity-40"
              >
                Finalizar Treino
              </button>
              <button
                onClick={handleAbandonar}
                className="w-full py-3 rounded-xl text-red-400 font-medium"
              >
                Abandonar treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMAGEM EXPANDIDA */}
      {mostrarImagemExpandida && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setMostrarImagemExpandida(false)}
        >
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setMostrarImagemExpandida(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-10"
            >
              <IconeFechar />
            </button>
            {exercicioGifUrl && (
              <img
                src={exercicioGifUrl}
                alt={exercicioEmFoco.nome}
                className="w-full h-auto rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
