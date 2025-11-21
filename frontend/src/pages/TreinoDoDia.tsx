import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { useVibration } from '../hooks/useVibration'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import ExercicioAtual from '../components/ExercicioAtual'
import BarraProgressoTreino from '../components/BarraProgressoTreino'
import NavegacaoExercicios from '../components/NavegacaoExercicios'
import ModalInstrucoes from '../components/ModalInstrucoes'
import TelaConclusaoTreino from '../components/TelaConclusaoTreino'

interface ExercicioTreino {
  id: string
  ordem: number
  series: number
  repeticoes: string
  carga: number | null
  rpe: number | null
  descanso: number | null
  concluido: boolean
  exercicio: {
    id: string
    nome: string
    grupoMuscularPrincipal: string
    descricao: string | null
    execucaoTecnica: string | null
    errosComuns: string[]
    gifUrl: string | null
    imagemUrl: string | null
    equipamentoNecessario: string[]
  }
}

interface Treino {
  id: string
  data: string
  tipo: string
  nome: string | null
  concluido: boolean
  tempoEstimado: number | null
  criadoPor?: string
  letraTreino?: string | null
  exercicios: ExercicioTreino[]
}

export default function TreinoDoDia() {
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()
  const { vibrarSucesso } = useVibration()
  const { autoAdvanceEnabled } = useAutoAdvance()
  
  const [treino, setTreino] = useState<Treino | null>(null)
  const [exercicioAtualIndex, setExercicioAtualIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [concluindoExercicio, setConcluindoExercicio] = useState<string | null>(null)
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false)
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [treinoConcluido, setTreinoConcluido] = useState(false)

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

  // Função para formatar carga
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

    return `${cargaArredondada} kg`
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
          // Todos concluídos, mostrar último
          setExercicioAtualIndex(treinoData.exercicios.length - 1)
          setTreinoConcluido(true)
        }
      } else {
        setTreino(null)
      }
    } catch (err: any) {
      console.error('Erro ao carregar treino:', err)
      if (err.response?.status === 404) {
        setError('Nenhum treino encontrado')
      } else {
        setError(err.response?.data?.error || 'Erro ao carregar treino')
      }
      setTreino(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTreino()
  }, [])

  // Atualizar status do exercício
  const atualizarStatusExercicio = async (exercicioId: string, concluido: boolean) => {
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

  // Pular exercício
  const pularExercicio = () => {
    if (!treino) return
    if (exercicioAtualIndex < treino.exercicios.length - 1) {
      avancarExercicio()
      showToast('Exercício pulado', 'info')
    }
  }

  // Trocar por similar
  const trocarPorSimilar = async () => {
    if (!treino) return
    
    const exercicioAtual = treino.exercicios[exercicioAtualIndex]
    try {
      const response = await api.get(`/treino/exercicio/${exercicioAtual.id}/alternativas`)
      const resultado = response.data
      
      if (resultado && resultado.alternativas && resultado.alternativas.length > 0) {
        // Por enquanto, apenas mostrar toast com alternativas
        // TODO: Implementar modal de seleção de alternativas
        showToast(`${resultado.alternativas.length} alternativa(s) encontrada(s)`, 'info')
      } else {
        showToast('Nenhuma alternativa encontrada', 'warning')
      }
    } catch (error: any) {
      console.error('Erro ao buscar alternativas:', error)
      showToast('Erro ao buscar alternativas', 'error')
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
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-light mb-2">
            Você ainda não tem um treino gerado
          </h2>
          <p className="text-light-muted mb-6">
            Gere seu treino personalizado agora e comece a treinar!
          </p>
          <button
            onClick={() => {
              api.post('/treino/gerar')
                .then(() => {
                  showToast('Treino gerado com sucesso!', 'success')
                  carregarTreino()
                })
                .catch((err: any) => {
                  showToast(err.response?.data?.error || 'Erro ao gerar treino', 'error')
                })
            }}
            className="btn-primary px-8 py-4 text-lg font-semibold"
          >
            Gerar Treino Agora
          </button>
        </div>
      </div>
    )
  }

  // Estado: Treino Concluído
  if (treinoConcluido) {
    return (
      <>
        <TelaConclusaoTreino
          treino={treino}
          onVoltarHome={() => navigate('/dashboard')}
        />
        <ToastContainer />
      </>
    )
  }

  // Estado: Treino Carregado - Mostrar Exercício Atual
  const exercicioAtual = treino.exercicios[exercicioAtualIndex]
  const exerciciosForca = treino.exercicios.filter(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || ''
    return grupo !== 'Cardio' && grupo !== 'Flexibilidade'
  })
  const exerciciosConcluidos = exerciciosForca.filter(ex => ex.concluido).length
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
                {treino.nome || treino.letraTreino || 'Treino do Dia'}
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
                  navigate('/meus-treinos')
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

      {/* Conteúdo Principal */}
      <div className="container-custom py-6">
        {/* Exercício Atual */}
        <ExercicioAtual
          exercicio={exercicioAtual}
          onConcluir={() => atualizarStatusExercicio(exercicioAtual.id, !exercicioAtual.concluido)}
          onVerInstrucoes={() => setMostrarInstrucoes(true)}
          concluindo={concluindoExercicio === exercicioAtual.id}
          formatarCarga={formatarCarga}
        />

        {/* Barra de Progresso */}
        <div className="mt-8">
          <BarraProgressoTreino
            exercicioAtual={exercicioAtualIndex + 1}
            totalExercicios={treino.exercicios.length}
            exerciciosConcluidos={exerciciosConcluidos}
          />
        </div>

        {/* Botões de Emergência */}
        <div className="mt-4 flex gap-3 px-4">
          <button
            onClick={pularExercicio}
            disabled={exercicioAtualIndex >= treino.exercicios.length - 1}
            className="flex-1 h-12 bg-dark-lighter text-light-muted rounded-lg font-semibold hover:bg-dark-lighter/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pular
          </button>
          <button
            onClick={trocarPorSimilar}
            className="flex-1 h-12 bg-dark-lighter text-light-muted rounded-lg font-semibold hover:bg-dark-lighter/80 transition-colors"
          >
            Trocar
          </button>
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
          exercicio={exercicioAtual.exercicio}
          onClose={() => setMostrarInstrucoes(false)}
          formatarEquipamentos={formatarEquipamentos}
        />
      )}

      <ToastContainer />
    </div>
  )
}
