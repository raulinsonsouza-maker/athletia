import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { useVibration } from '../hooks/useVibration'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useAuth } from '../contexts/AuthContext'
import ExercicioAtual from '../components/ExercicioAtual'
import BarraProgressoTreino from '../components/BarraProgressoTreino'
import NavegacaoExercicios from '../components/NavegacaoExercicios'
import ModalInstrucoes from '../components/ModalInstrucoes'
import FimTreino from '../components/FimTreino'
import PreTreino from '../components/PreTreino'
import VisaoSemanalTreinos from '../components/VisaoSemanalTreinos'
import { buscarTreinosSemanais } from '../services/treino.service'
import { obterResumoDashboard } from '../services/dashboard.service'
import { TreinoSemanal, TreinoCompleto } from '../types/treino.types'
import { formatarCarga as formatarCargaUtil, formatarTituloTreino } from '../utils/treino.utils'

type Treino = TreinoCompleto

export default function TreinoDoDia() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { vibrarSucesso } = useVibration()
  const { autoAdvanceEnabled } = useAutoAdvance()
  const { user } = useAuth()
  
  const [treino, setTreino] = useState<Treino | null>(null)
  const [exercicioAtualIndex, setExercicioAtualIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [concluindoExercicio, setConcluindoExercicio] = useState<string | null>(null)
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false)
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [treinoConcluido, setTreinoConcluido] = useState(false)
  const [treinoIniciado, setTreinoIniciado] = useState(false)
  const [gerandoTreino, setGerandoTreino] = useState(false)
  const [tentouGerarAutomaticamente, setTentouGerarAutomaticamente] = useState(false)
  const [treinosSemanais, setTreinosSemanais] = useState<TreinoSemanal[]>([])
  const [visaoSemanalExpandida, setVisaoSemanalExpandida] = useState(false)
  const [progressoSemanal, setProgressoSemanal] = useState<{ metaOriginal?: number; concluidos?: number } | null>(null)

  // Função para detectar se é peso corporal
  const isPesoCorporal = (equipamentos: string[]): boolean => {
    if (!equipamentos || equipamentos.length === 0) return false
    return equipamentos.some(eq => 
      eq.toLowerCase().includes('peso corporal') || 
      eq.toLowerCase().includes('corpo') ||
      eq.toLowerCase() === 'peso corporal'
    )
  }

  // Função para detectar se é halteres
  const isHalteres = (equipamentos: string[]): boolean => {
    if (!equipamentos || equipamentos.length === 0) return false
    return equipamentos.some(eq => 
      eq.toLowerCase().includes('halter') ||
      eq.toLowerCase().includes('dumbbell')
    )
  }

  // Função para formatar carga (com lógica específica para halteres)
  const formatarCarga = (
    carga: number | null, 
    equipamentos: string[] = []
  ): string | null => {
    if (isPesoCorporal(equipamentos)) {
      return 'Peso Corporal'
    }

    if (carga === null || carga === undefined || carga === 0) {
      return null
    }

    const cargaArredondada = Math.round(carga)

    if (isHalteres(equipamentos)) {
      const cargaPorHaltere = cargaArredondada / 2
      if (cargaPorHaltere === Math.round(cargaPorHaltere)) {
        return `2x ${Math.round(cargaPorHaltere)} kg`
      } else {
        return `${cargaArredondada} kg (${Math.round(cargaPorHaltere * 10) / 10} kg por haltere)`
      }
    }

    return formatarCargaUtil(carga, equipamentos) || null
  }

  // Função para formatar equipamentos
  const formatarEquipamentos = (equipamentos: string[]) => {
    if (!equipamentos || equipamentos.length === 0) {
      return (
        <div className="bg-success/20 border border-success/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-success mb-1">Sem equipamento necessário</h4>
              <p className="text-light text-sm">Este exercício pode ser realizado apenas com peso corporal.</p>
            </div>
          </div>
        </div>
      )
    }

    if (equipamentos.length === 1 && equipamentos[0] === 'Peso Corporal') {
      return (
        <div className="bg-success/20 border border-success/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <h4 className="font-semibold text-success mb-1">Peso corporal</h4>
              <p className="text-light text-sm">Este exercício utiliza apenas o peso do seu corpo.</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-primary/20 border border-primary/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h4 className="font-semibold text-primary">Equipamento necessário</h4>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {equipamentos.map((equipamento, index) => (
            <span key={index} className="badge-primary text-xs">
              {equipamento}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Carregar treino ativo
  const carregarTreino = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get('/treino/dia')
      
      let treinoData: Treino | null = null
      
      // Verificar se retornou múltiplos treinos
      if (response.data.treinos && Array.isArray(response.data.treinos)) {
        treinoData = response.data.treinos[0] // Pegar o primeiro
      } else if (response.data) {
        treinoData = response.data
      }

      if (treinoData && treinoData.exercicios && treinoData.exercicios.length > 0) {
        setTreino(treinoData)
        
        // Encontrar primeiro exercício não concluído
        const primeiroNaoConcluido = treinoData.exercicios.findIndex(ex => !ex.concluido)
        if (primeiroNaoConcluido !== -1) {
          setExercicioAtualIndex(primeiroNaoConcluido)
        } else {
          // Todos concluídos, mostrar último exercício
          // NÃO definir treinoConcluido como true aqui - isso só deve acontecer quando o usuário conclui o treino DENTRO da página
          setExercicioAtualIndex(treinoData.exercicios.length - 1)
        }
      } else {
        setTreino(null)
      }
      } catch (err: any) {
        console.error('Erro ao carregar treino:', err)
        if (err.response?.status === 404) {
          setError('Nenhum treino encontrado')
        } else if (err.response?.status === 500) {
          setError('Erro no servidor ao carregar treino')
          console.error('Detalhes do erro 500:', err.response?.data)
        } else {
          setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao carregar treino')
        }
        setTreino(null)
    } finally {
      setLoading(false)
    }
  }

  // Carregar treinos semanais e progresso
  const carregarTreinosSemanais = async () => {
    try {
      const [response, resumo] = await Promise.all([
        buscarTreinosSemanais(),
        obterResumoDashboard().catch(() => null)
      ])
      setTreinosSemanais(response.treinos || [])
      if (resumo?.progressoSemanal) {
        setProgressoSemanal({
          metaOriginal: resumo.progressoSemanal.metaOriginal,
          concluidos: resumo.progressoSemanal.concluidos
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar treinos semanais:', err)
      // Não mostrar erro ao usuário, apenas logar
    }
  }

  useEffect(() => {
    carregarTreino()
    carregarTreinosSemanais()
  }, [])

  // Tentar gerar treino automaticamente se não houver treino e usuário tiver plano ativo
  useEffect(() => {
    // Só tentar uma vez quando a página carregar e não houver treino
    if (loading) return // Aguardar carregamento inicial terminar
    if (tentouGerarAutomaticamente) return // Já tentou uma vez, não tentar novamente
    if (treino) return // Já tem treino, não precisa gerar
    if (gerandoTreino) return // Já está gerando
    
    // Só tentar se usuário tiver plano ativo e não houver erro específico
    if (!user?.planoAtivo) return
    if (error && error !== 'Nenhum treino encontrado') return

    const tentarGerarTreinoAutomaticamente = async () => {
      try {
        setTentouGerarAutomaticamente(true)
        setGerandoTreino(true)
        console.log('🔄 Tentando gerar treino automaticamente...')
        
        const response = await api.post('/treino/gerar')
        console.log('✅ Treino gerado automaticamente:', response.data)
        
        // Recarregar treino após gerar
        setTimeout(async () => {
          await carregarTreino()
        }, 1000)
      } catch (err: any) {
        console.error('❌ Erro ao gerar treino automaticamente:', err)
        console.error('📋 Detalhes do erro:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          message: err.response?.data?.message || err.message,
          error: err.response?.data?.error,
          isNetworkError: err.isNetworkError
        })
        
        // Não definir erro genérico para não mostrar mensagem de erro ao usuário
        // Apenas logar para debug. O usuário verá a mensagem informativa na tela
        // Se for erro de perfil incompleto ou similar, pode ser útil mostrar, mas não erro 500 genérico
        if (err.response?.status === 404 && err.response?.data?.message?.includes('Perfil não encontrado')) {
          setError('Perfil não encontrado. Complete o onboarding primeiro.')
        } else if (err.response?.status === 400) {
          // Erro de validação - pode ser útil mostrar
          const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Dados do perfil incompletos'
          setError(errorMsg)
        }
        // Para erro 500 ou outros erros, não definir mensagem de erro
        // O usuário verá a mensagem informativa padrão na tela
      } finally {
        setGerandoTreino(false)
      }
    }

    // Aguardar um pouco antes de tentar gerar (para garantir que carregarTreino terminou)
    const timer = setTimeout(() => {
      tentarGerarTreinoAutomaticamente()
    }, 2000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]) // Só executar quando loading mudar (quando carregamento inicial terminar)

  // Atualizar status do exercício (simplificado - sem feedback individual)
  const atualizarStatusExercicio = async (
    exercicioId: string, 
    concluido: boolean
  ) => {
    if (concluindoExercicio || !treino) return
    
    try {
      setConcluindoExercicio(exercicioId)
      
      await api.post(`/treino/exercicio/${exercicioId}/concluir`, { concluido })
      
      // Atualizar estado local
      const exerciciosAtualizados = treino.exercicios.map(ex =>
        ex.id === exercicioId 
          ? { ...ex, concluido } 
          : ex
      )
      
      const todosConcluidos = exerciciosAtualizados.every(ex => ex.concluido)
      
      const treinoAtualizado = {
        ...treino,
        exercicios: exerciciosAtualizados,
        concluido: todosConcluidos
      }
      
      setTreino(treinoAtualizado)
      
      // Atualizar treinos semanais quando treino for concluído
      if (todosConcluidos) {
        carregarTreinosSemanais()
      }

      if (concluido) {
        // Vibração de feedback
        vibrarSucesso()
        
        if (todosConcluidos) {
          setTreinoConcluido(true)
          showToast('Parabéns! Treino concluído com sucesso!', 'success')
        } else {
          const restantes = exerciciosAtualizados.filter(ex => !ex.concluido).length
          showToast(`Exercício concluído! ${restantes} restante${restantes > 1 ? 's' : ''}`, 'success')
          
          // Auto-avanço se ativado
          if (autoAdvanceEnabled) {
            setTimeout(() => {
              avancarExercicio()
            }, 500)
          }
        }
      } else {
        showToast('Exercício desmarcado', 'info')
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status do exercício:', error)
      showToast('Erro ao atualizar status do exercício', 'error')
    } finally {
      setConcluindoExercicio(null)
    }
  }

  // Navegação entre exercícios
  const avancarExercicio = () => {
    if (!treino) return
    if (exercicioAtualIndex < treino.exercicios.length - 1) {
      setExercicioAtualIndex(exercicioAtualIndex + 1)
    }
  }

  const voltarExercicio = () => {
    if (exercicioAtualIndex > 0) {
      setExercicioAtualIndex(exercicioAtualIndex - 1)
    }
  }


  // Estado: Carregando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando treino...</p>
        </div>
      </div>
    )
  }

  // Estado: Sem Treino
  if (!treino || error) {
    const temPlanoAtivo = user?.planoAtivo
    const erroEspecifico = error && error !== 'Nenhum treino encontrado'
    
    return (
      <div className="min-h-screen bg-dark">
        {/* Visão Semanal de Treinos - Expandida quando não há treino */}
        {treinosSemanais.length > 0 && (
          <div className="container-custom py-6">
            <VisaoSemanalTreinos
              treinos={treinosSemanais}
              treinoAtualId={null}
              metaOriginal={progressoSemanal?.metaOriginal}
              concluidos={progressoSemanal?.concluidos}
              onTreinoClick={() => {
                // Tentar carregar o treino selecionado
                carregarTreino()
              }}
              compacto={false}
            />
          </div>
        )}
        
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            {gerandoTreino ? (
              <div className="spinner h-12 w-12"></div>
            ) : erroEspecifico ? (
              <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>
          
          {erroEspecifico ? (
            <>
              <h2 className="text-2xl font-bold text-light mb-2">
                Erro ao carregar treino
              </h2>
              <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
              <div className="flex flex-col gap-3">
              <button
                onClick={carregarTreino}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label={loading ? 'Carregando treino...' : 'Tentar carregar treino novamente'}
                title={loading ? 'Aguarde...' : 'Clique para tentar carregar o treino novamente'}
              >
                {loading ? 'Carregando...' : 'Tentar Novamente'}
              </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary w-full"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </>
          ) : gerandoTreino ? (
            <>
              <h2 className="text-2xl font-bold text-light mb-2">
                Gerando seu treino personalizado...
              </h2>
              <p className="text-light-muted mb-6">
                Nossa IA está criando um treino especialmente para você. Isso pode levar alguns segundos. Por favor, aguarde.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="spinner h-6 w-6"></div>
                <span className="text-sm">Processando...</span>
              </div>
            </>
          ) : temPlanoAtivo ? (
            <>
              <h2 className="text-2xl font-bold text-light mb-2">
                Seu treino está sendo gerado
              </h2>
              <p className="text-light-muted mb-4">
                Os treinos são gerados automaticamente após a ativação do seu plano. 
                Se você acabou de ativar seu plano, aguarde alguns instantes.
              </p>
              <p className="text-light-muted mb-6 text-sm">
                Se o treino não aparecer em breve, você pode:
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={carregarTreino}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  aria-label={loading ? 'Carregando treino...' : 'Recarregar treino do dia'}
                  title={loading ? 'Aguarde...' : 'Tentar carregar o treino novamente'}
                >
                  {loading ? 'Carregando...' : 'Recarregar Treino'}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary w-full"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-light mb-2">
                Ative seu plano para gerar treinos
              </h2>
              <p className="text-light-muted mb-6">
                Os treinos são gerados automaticamente após a ativação do seu plano. 
                Ative seu plano para começar a treinar!
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary px-8 py-4 text-lg font-semibold w-full"
                aria-label="Ir para página de checkout para ativar plano"
                title="Ative seu plano para começar a gerar treinos personalizados"
              >
                Ativar Plano
              </button>
            </>
          )}
        </div>
        <ToastContainer />
        </div>
      </div>
    )
  }

  // Estado: Treino Concluído
  if (treinoConcluido && treino) {
    return (
      <>
        <FimTreino
          treino={treino}
          onVoltarHome={() => navigate('/dashboard')}
        />
        <ToastContainer />
      </>
    )
  }

  // Estado: Pré-treino (mostrar antes de iniciar)
  if (treino && !treinoIniciado && !treino.concluido) {
    return (
      <>
        <PreTreino
          treino={treino}
          onIniciar={() => setTreinoIniciado(true)}
          onGerarAlternativa={async () => {
            try {
              setLoading(true)
              const response = await api.post('/treino/versao-alternativa', {
                treinoId: treino.id
              })
              
              if (response.data?.treino) {
                setTreino(response.data.treino)
                showToast('Versão alternativa gerada com sucesso!', 'success')
                // Recarregar treino para mostrar mudanças
                carregarTreino()
              }
            } catch (error: any) {
              console.error('Erro ao gerar versão alternativa:', error)
              showToast(error.response?.data?.message || 'Erro ao gerar versão alternativa', 'error')
            } finally {
              setLoading(false)
            }
          }}
        />
        <ToastContainer />
      </>
    )
  }

  // Estado: Treino Carregado - Mostrar Exercício Atual
  const exercicioAtual = treino.exercicios[exercicioAtualIndex]
  // const totalExercicios = exerciciosForca.length // Não utilizado - usando treino.exercicios.length diretamente

  return (
    <div className="min-h-screen bg-dark">
      {/* Cabeçalho Minimalista */}
      <div className="sticky top-0 z-40 bg-dark border-b border-grey/20">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-light">
                {formatarTituloTreino(treino)}
              </h1>
              {treino.tempoEstimado && (
                <p className="text-sm text-light-muted">{treino.tempoEstimado} min</p>
              )}
            </div>

            {/* Menu Hambúrguer */}
            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Dropdown */}
        {mostrarMenu && (
          <div className="absolute top-full left-0 right-0 bg-dark-lighter border-b border-grey/20 shadow-lg z-50">
            <div className="container-custom py-4 space-y-2">
              <button
                onClick={() => {
                  navigate('/treinos-recorrentes')
                  setMostrarMenu(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-dark rounded-lg transition-colors text-light"
              >
                Ver Treinos Semanais
              </button>
              <button
                onClick={() => {
                  navigate('/historico')
                  setMostrarMenu(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-dark rounded-lg transition-colors text-light"
              >
                Histórico
              </button>
              <button
                onClick={() => {
                  navigate('/estatisticas')
                  setMostrarMenu(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-dark rounded-lg transition-colors text-light"
              >
                Estatísticas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visão Semanal de Treinos - Ocultar durante treino ativo */}
      {treinosSemanais.length > 0 && !treinoIniciado && (
        <div className="container-custom py-4 border-b border-grey/20">
          <VisaoSemanalTreinos
            treinos={treinosSemanais}
            treinoAtualId={treino?.id || null}
            metaOriginal={progressoSemanal?.metaOriginal}
            concluidos={progressoSemanal?.concluidos}
            onTreinoClick={(treinoSelecionado) => {
              // Se for o treino atual, não fazer nada
              if (treinoSelecionado.id === treino?.id) {
                showToast('Este é o treino atual', 'info')
                return
              }
              
              // Se for treino futuro, mostrar mensagem
              const dataTreino = new Date(treinoSelecionado.data)
              const hoje = new Date()
              hoje.setHours(0, 0, 0, 0)
              dataTreino.setHours(0, 0, 0, 0)
              
              if (dataTreino > hoje) {
                showToast('Este treino ainda não está disponível. Aguarde a data programada.', 'info')
              } else if (treinoSelecionado.concluido) {
                showToast('Treino já concluído! Veja o histórico para mais detalhes.', 'info')
                setTimeout(() => navigate('/historico'), 1500)
              } else {
                // Tentar carregar o treino selecionado
                showToast('Carregando treino...', 'info')
                // Recarregar página para atualizar treino ativo
                window.location.href = '/treino'
              }
            }}
            compacto={!visaoSemanalExpandida && !!treino}
            onToggleExpandir={() => setVisaoSemanalExpandida(!visaoSemanalExpandida)}
          />
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="container-custom py-6">
        {/* Exercício Atual */}
        <ExercicioAtual
          exercicio={exercicioAtual}
          onConcluir={() => 
            atualizarStatusExercicio(
              exercicioAtual.id, 
              !exercicioAtual.concluido
            )
          }
          onVerInstrucoes={() => setMostrarInstrucoes(true)}
          concluindo={concluindoExercicio === exercicioAtual.id}
          formatarCarga={formatarCarga}
        />

        {/* Barra de Progresso */}
        <div className="mt-8">
          <BarraProgressoTreino
            exercicioAtual={exercicioAtualIndex + 1}
            totalExercicios={treino.exercicios.length}
          />
        </div>

        {/* Navegação */}
        <div className="mt-6">
          <NavegacaoExercicios
            podeAnterior={exercicioAtualIndex > 0}
            podeProximo={exercicioAtualIndex < treino.exercicios.length - 1}
            onAnterior={voltarExercicio}
            onProximo={avancarExercicio}
          />
        </div>
      </div>

      {/* Modal de Instruções */}
      {mostrarInstrucoes && (
        <ModalInstrucoes
          exercicio={{
            id: exercicioAtual.exercicio.id,
            nome: exercicioAtual.exercicio.nome,
            descricao: exercicioAtual.exercicio.descricao ?? null,
            execucaoTecnica: exercicioAtual.exercicio.execucaoTecnica ?? null,
            errosComuns: exercicioAtual.exercicio.errosComuns ?? [],
            gifUrl: exercicioAtual.exercicio.gifUrl ?? null,
            imagemUrl: exercicioAtual.exercicio.imagemUrl ?? null,
            equipamentoNecessario: exercicioAtual.exercicio.equipamentoNecessario ?? []
          }}
          onClose={() => setMostrarInstrucoes(false)}
          formatarEquipamentos={formatarEquipamentos}
        />
      )}

      <ToastContainer />
    </div>
  )
}
