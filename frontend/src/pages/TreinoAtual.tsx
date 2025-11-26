import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { concluirTreino, marcarExercicioTreino, obterPlanoAtualResumo } from '../services/treino.service'
import { PlanoAtualResponse } from '../types/treino.types'
import { useToast } from '../hooks/useToast'

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const formatarCronometro = (totalSegundos: number) => {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

const IconeVoltar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
)

const IconeCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
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
      setPlano(response)
      
      // Definir bloco ativo (do param ou primeiro)
      const treinoIdParam = searchParams.get('treino')
      if (treinoIdParam && response.blocos.find(b => b.id === treinoIdParam)) {
        setBlocoAtivoId(treinoIdParam)
      } else {
        setBlocoAtivoId(response.blocos[0]?.id ?? null)
      }
      
      // Mapear status dos exercícios
      const mapa = response.blocos.reduce<Record<string, boolean>>((acc, bloco) => {
        bloco.exercicios.forEach((ex) => {
          acc[ex.id] = Boolean(ex.concluido)
        })
        return acc
      }, {})
      setStatusExercicios(mapa)
      
      // Encontrar primeiro exercício não concluído
      const blocoInicial = response.blocos.find(b => 
        b.id === (treinoIdParam || response.blocos[0]?.id)
      )
      if (blocoInicial) {
        const indexNaoConcluido = blocoInicial.exercicios.findIndex(ex => !mapa[ex.id])
        setExercicioAtivoIndex(indexNaoConcluido >= 0 ? indexNaoConcluido : 0)
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
    if (!plano) return null
    return plano.blocos.find((b) => b.id === blocoAtivoId) || plano.blocos[0] || null
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
      
      // Se marcou como concluído, ir para próximo automaticamente
      if (novoStatus && exercicioAtivoIndex < blocoAtivo.exercicios.length - 1) {
        setTimeout(() => setExercicioAtivoIndex(prev => prev + 1), 300)
      }
    } catch (error) {
      console.error(error)
      setStatusExercicios(prev => ({ ...prev, [exercicioEmFoco.id]: !novoStatus }))
      showToast('Erro ao atualizar exercício', 'error')
    }
  }

  const handleConcluirTreino = async () => {
    if (!blocoAtivo) return
    setConcluindoTreino(true)
    try {
      await concluirTreino(blocoAtivo.id)
      showToast('Treino concluído! 💪', 'success')
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* HEADER MINIMAL */}
      <header className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <button onClick={handleVoltar} className="p-2 -ml-2 text-white/80 hover:text-white">
          <IconeVoltar />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-white/50 uppercase tracking-wider">Timer</p>
            <p className="text-2xl font-mono font-bold text-primary">{formatarCronometro(cronometro)}</p>
          </div>
          <button 
            onClick={() => setTimerAtivo(!timerAtivo)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${timerAtivo ? 'bg-white/10 text-white/70' : 'bg-primary text-black'}`}
          >
            {timerAtivo ? 'Pausar' : 'Iniciar'}
          </button>
        </div>
        
        <button 
          onClick={() => setMostrarChecklist(!mostrarChecklist)}
          className="p-2 -mr-2 text-white/80 hover:text-white relative"
        >
          <span className="text-lg">☰</span>
          {progresso.concluidos > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs rounded-full flex items-center justify-center font-bold">
              {progresso.concluidos}
            </span>
          )}
        </button>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pt-20 pb-32 px-4 flex flex-col">
        {/* GIF DO EXERCÍCIO */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="w-full max-w-md aspect-square bg-black/40 rounded-3xl overflow-hidden border border-white/10">
            {exercicioEmFoco.gifUrl ? (
              <img
                src={exercicioEmFoco.gifUrl}
                alt={exercicioEmFoco.nome}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <span className="text-6xl">🏋️</span>
              </div>
            )}
          </div>
        </div>

        {/* INFO DO EXERCÍCIO */}
        <div className="text-center mb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-1">{exercicioEmFoco.grupo}</p>
          <h1 className="text-2xl font-bold mb-2">{exercicioEmFoco.nome}</h1>
          <div className="flex items-center justify-center gap-3 text-white/70">
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{exercicioEmFoco.series} séries</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{exercicioEmFoco.repeticoes} reps</span>
            {exercicioEmFoco.carga && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">{exercicioEmFoco.carga}kg</span>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE EXERCÍCIOS */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => handleNavegar('anterior')}
            disabled={exercicioAtivoIndex === 0}
            className="p-3 rounded-full bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <IconeSeta direcao="esquerda" />
          </button>
          <span className="text-sm text-white/50">
            {exercicioAtivoIndex + 1} / {blocoAtivo.exercicios.length}
          </span>
          <button
            onClick={() => handleNavegar('proximo')}
            disabled={exercicioAtivoIndex === blocoAtivo.exercicios.length - 1}
            className="p-3 rounded-full bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <IconeSeta direcao="direita" />
          </button>
        </div>

        {/* PRÓXIMO EXERCÍCIO */}
        {proximoExercicio && (
          <button
            onClick={() => handleNavegar('proximo')}
            className="mx-auto mb-2 text-center text-white/40 text-sm hover:text-white/60 transition"
          >
            Próximo: <span className="text-white/60">{proximoExercicio.nome}</span>
          </button>
        )}
      </main>

      {/* FOOTER FIXO */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8 pb-6 px-4">
        {/* BARRA DE PROGRESSO */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span>{progresso.concluidos} de {progresso.total} exercícios</span>
            <span>{progresso.percentual}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progresso.percentual}%` }}
            />
          </div>
        </div>

        {/* BOTÃO PRINCIPAL */}
        <button
          onClick={handleMarcarConcluido}
          className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            exercicioConcluido 
              ? 'bg-white/10 text-white/70' 
              : 'bg-primary text-black'
          }`}
        >
          {exercicioConcluido ? (
            <>
              <span className="text-primary">✓</span>
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
            className="w-full mt-3 py-4 rounded-2xl bg-green-600 text-white font-bold text-lg disabled:opacity-60"
          >
            {concluindoTreino ? 'Finalizando...' : '🎉 Finalizar Treino'}
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
                className="text-white/50 text-2xl"
              >
                ×
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
                    {statusExercicios[ex.id] ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${statusExercicios[ex.id] ? 'text-primary' : 'text-white'}`}>
                      {ex.nome}
                    </p>
                    <p className="text-xs text-white/50">{ex.grupo} • {ex.series}x{ex.repeticoes}</p>
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

      <ToastContainer />
    </div>
  )
}
