import { useReducer, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlanoAtualResponse } from '../types/treino.types'
import { treinoGateway } from '../gateways/treino.gateway'
import { useToast } from './useToast'

/**
 * Estado do treino
 */
interface TreinoState {
  plano: PlanoAtualResponse | null
  blocoAtivoId: string | null
  exercicioAtivoIndex: number
  statusExercicios: Map<string, boolean> // Usa Map para performance
  loading: boolean
  ultimoExercicioConcluido: { id: string; timestamp: number } | null
}

/**
 * Ações do reducer
 */
type TreinoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PLANO'; payload: PlanoAtualResponse }
  | { type: 'SET_BLOCO_ATIVO'; payload: string | null }
  | { type: 'SET_EXERCICIO_ATIVO'; payload: number }
  | { type: 'TOGGLE_EXERCICIO'; payload: { id: string; concluido: boolean } }
  | { type: 'SET_ULTIMO_CONCLUIDO'; payload: { id: string; timestamp: number } | null }
  | { type: 'RESET' }

/**
 * Reducer para estado do treino
 * Atualizações atômicas, sem re-renderizações em cascata
 */
function treinoReducer(state: TreinoState, action: TreinoAction): TreinoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_PLANO': {
      const blocosValidos = action.payload.blocos.filter(
        bloco => bloco && bloco.exercicios && bloco.exercicios.length > 0
      )

      if (blocosValidos.length === 0) {
        return {
          ...state,
          plano: { ...action.payload, blocos: [] },
          blocoAtivoId: null,
          statusExercicios: new Map(),
          exercicioAtivoIndex: 0,
          loading: false
        }
      }

      // Mapear status usando Map (mais performático)
      const statusMap = new Map<string, boolean>()
      blocosValidos.forEach(bloco => {
        bloco.exercicios.forEach(ex => {
          statusMap.set(ex.id, Boolean(ex.concluido))
        })
      })

      // Determinar bloco ativo inicial
      const primeiroBlocoValido = blocosValidos[0]
      let blocoAtivoId = primeiroBlocoValido?.id ?? null
      let exercicioIndex = 0

      // Encontrar primeiro exercício não concluído
      if (primeiroBlocoValido) {
        const indexNaoConcluido = primeiroBlocoValido.exercicios.findIndex(
          ex => !statusMap.get(ex.id)
        )
        exercicioIndex = indexNaoConcluido >= 0 ? indexNaoConcluido : 0
      }

      return {
        ...state,
        plano: { ...action.payload, blocos: blocosValidos },
        blocoAtivoId,
        statusExercicios: statusMap,
        exercicioAtivoIndex: exercicioIndex,
        loading: false
      }
    }

    case 'SET_BLOCO_ATIVO': {
      const novoBloco = state.plano?.blocos.find(b => b.id === action.payload)
      if (!novoBloco) return state

      // Encontrar primeiro exercício não concluído do novo bloco
      const indexNaoConcluido = novoBloco.exercicios.findIndex(
        ex => !state.statusExercicios.get(ex.id)
      )

      return {
        ...state,
        blocoAtivoId: action.payload,
        exercicioAtivoIndex: indexNaoConcluido >= 0 ? indexNaoConcluido : 0
      }
    }

    case 'SET_EXERCICIO_ATIVO':
      return { ...state, exercicioAtivoIndex: action.payload }

    case 'TOGGLE_EXERCICIO': {
      // Atualização otimizada: cria novo Map apenas com mudança necessária
      const novoStatus = new Map(state.statusExercicios)
      novoStatus.set(action.payload.id, action.payload.concluido)

      return { ...state, statusExercicios: novoStatus }
    }

    case 'SET_ULTIMO_CONCLUIDO':
      return { ...state, ultimoExercicioConcluido: action.payload }

    case 'RESET':
      return {
        plano: null,
        blocoAtivoId: null,
        exercicioAtivoIndex: 0,
        statusExercicios: new Map(),
        loading: true,
        ultimoExercicioConcluido: null
      }

    default:
      return state
  }
}

/**
 * Hook principal para gerenciar treino atual
 * Encapsula toda lógica de estado e operações
 */
export function useTreinoAtual() {
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const [state, dispatch] = useReducer(treinoReducer, {
    plano: null,
    blocoAtivoId: null,
    exercicioAtivoIndex: 0,
    statusExercicios: new Map(),
    loading: true,
    ultimoExercicioConcluido: null
  })

  // Carregar plano inicial
  const carregarPlano = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await treinoGateway.carregarPlano()

      // Debug: verificar estrutura dos exercícios
      if (response?.blocos) {
        response.blocos.forEach((bloco: any, idx: number) => {
          console.log(`[useTreinoAtual] Bloco ${idx + 1}:`, {
            id: bloco.id,
            titulo: bloco.titulo,
            totalExercicios: bloco.exercicios?.length || 0,
            primeiroExercicio: bloco.exercicios?.[0] ? {
              nome: bloco.exercicios[0].nome,
              imagemUrl: bloco.exercicios[0].imagemUrl
            } : null
          })
        })
      }

      // Processar bloco da URL se existir
      const treinoIdParam = searchParams.get('treino')
      if (treinoIdParam) {
        const blocoParam = response.blocos.find(b => b.id === treinoIdParam)
        if (blocoParam && blocoParam.exercicios.length > 0) {
          // Ajustar plano para começar com este bloco
          const outrosBlocos = response.blocos.filter(b => b.id !== treinoIdParam)
          const planoAjustado = {
            ...response,
            blocos: [blocoParam, ...outrosBlocos]
          }
          dispatch({ type: 'SET_PLANO', payload: planoAjustado })
          return
        }
      }

      dispatch({ type: 'SET_PLANO', payload: response })
    } catch (error: any) {
      console.error('[useTreinoAtual] Erro ao carregar plano:', error)
      if (error.response?.status === 401) {
        console.error('[useTreinoAtual] Erro 401 - Token pode estar expirado ou inválido')
      }
      showToast('Não foi possível carregar seu treino.', 'error')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [searchParams, showToast])

  useEffect(() => {
    carregarPlano()
  }, [carregarPlano])

  // Computed values (memoizados)
  const blocoAtivo = useMemo(() => {
    if (!state.plano || !state.blocoAtivoId) return null
    return state.plano.blocos.find(b => b.id === state.blocoAtivoId) || null
  }, [state.plano, state.blocoAtivoId])

  const exercicioAtivo = useMemo(() => {
    if (!blocoAtivo || !blocoAtivo.exercicios.length) return null
    return blocoAtivo.exercicios[state.exercicioAtivoIndex] || blocoAtivo.exercicios[0]
  }, [blocoAtivo, state.exercicioAtivoIndex])

  const proximoExercicio = useMemo(() => {
    if (!blocoAtivo) return null
    return blocoAtivo.exercicios[state.exercicioAtivoIndex + 1] || null
  }, [blocoAtivo, state.exercicioAtivoIndex])

  const progresso = useMemo(() => {
    if (!blocoAtivo) return { concluidos: 0, total: 0, percentual: 0 }
    const concluidos = blocoAtivo.exercicios.filter(
      ex => state.statusExercicios.get(ex.id)
    ).length
    const total = blocoAtivo.exercicios.length
    return {
      concluidos,
      total,
      percentual: Math.round((concluidos / total) * 100)
    }
  }, [blocoAtivo, state.statusExercicios])

  // Handlers otimizados
  const trocarBloco = useCallback((blocoId: string) => {
    dispatch({ type: 'SET_BLOCO_ATIVO', payload: blocoId })
  }, [])

  const irParaProximoExercicio = useCallback(() => {
    if (!blocoAtivo) return
    const novoIndex = Math.min(
      state.exercicioAtivoIndex + 1,
      blocoAtivo.exercicios.length - 1
    )
    dispatch({ type: 'SET_EXERCICIO_ATIVO', payload: novoIndex })
  }, [blocoAtivo, state.exercicioAtivoIndex])

  const exercicioAnterior = useCallback(() => {
    const novoIndex = Math.max(state.exercicioAtivoIndex - 1, 0)
    dispatch({ type: 'SET_EXERCICIO_ATIVO', payload: novoIndex })
  }, [state.exercicioAtivoIndex])

  const selecionarExercicio = useCallback((index: number) => {
    if (!blocoAtivo || index < 0 || index >= blocoAtivo.exercicios.length) return
    dispatch({ type: 'SET_EXERCICIO_ATIVO', payload: index })
  }, [blocoAtivo])

  // Marcar exercício com atualização otimizada
  const marcarConcluido = useCallback(async (exercicioId: string, concluido: boolean) => {
    if (!exercicioAtivo || exercicioId !== exercicioAtivo.id) return

    // Otimização: atualizar localmente primeiro (UI instantânea)
    dispatch({ type: 'TOGGLE_EXERCICIO', payload: { id: exercicioId, concluido } })

    try {
      // Atualizar servidor em background (fire-and-forget)
      await treinoGateway.marcarExercicio(exercicioId, concluido)

      if (concluido) {
        dispatch({
          type: 'SET_ULTIMO_CONCLUIDO',
          payload: { id: exercicioId, timestamp: Date.now() }
        })

        // Ir para próximo automaticamente
        if (state.exercicioAtivoIndex < (blocoAtivo?.exercicios.length || 0) - 1) {
          setTimeout(() => {
            irParaProximoExercicio()
          }, 500)
        }
      }
    } catch (error) {
      console.error(error)
      // Reverter em caso de erro
      dispatch({
        type: 'TOGGLE_EXERCICIO',
        payload: { id: exercicioId, concluido: !concluido }
      })
      showToast('Erro ao atualizar exercício', 'error')
    }
  }, [exercicioAtivo, blocoAtivo, state.exercicioAtivoIndex, irParaProximoExercicio, showToast])

  const podeDesfazer = useMemo(() => {
    if (!state.ultimoExercicioConcluido || !exercicioAtivo) return false
    const tempoDecorrido = Date.now() - state.ultimoExercicioConcluido.timestamp
    return (
      tempoDecorrido < 3000 &&
      state.ultimoExercicioConcluido.id === exercicioAtivo.id
    )
  }, [state.ultimoExercicioConcluido, exercicioAtivo])

  const desfazer = useCallback(async () => {
    if (!exercicioAtivo || !podeDesfazer) return

    dispatch({ type: 'TOGGLE_EXERCICIO', payload: { id: exercicioAtivo.id, concluido: false } })
    dispatch({ type: 'SET_ULTIMO_CONCLUIDO', payload: null })

    try {
      await treinoGateway.marcarExercicio(exercicioAtivo.id, false)
      showToast('Exercício desmarcado', 'info')
    } catch (error) {
      console.error(error)
      dispatch({
        type: 'TOGGLE_EXERCICIO',
        payload: { id: exercicioAtivo.id, concluido: true }
      })
      showToast('Erro ao desmarcar exercício', 'error')
    }
  }, [exercicioAtivo, podeDesfazer, showToast])

  const finalizarTreino = useCallback(async () => {
    if (!blocoAtivo) {
      console.error('[finalizarTreino] Bloco ativo não encontrado')
      showToast('Erro: Treino não encontrado', 'error')
      return false
    }

    try {
      console.log('[finalizarTreino] Iniciando finalização do treino:', blocoAtivo.id)
      await treinoGateway.finalizarTreino(blocoAtivo.id)
      console.log('[finalizarTreino] Treino finalizado com sucesso')
      showToast('Treino concluído com sucesso!', 'success')
      return true
    } catch (error: any) {
      console.error('[finalizarTreino] Erro ao finalizar treino:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao finalizar treino'
      showToast(errorMessage, 'error')
      return false
    }
  }, [blocoAtivo, showToast])

  // Helper para verificar se exercício está concluído
  const isExercicioConcluido = useCallback(
    (exercicioId: string) => {
      return state.statusExercicios.get(exercicioId) || false
    },
    [state.statusExercicios]
  )

  return {
    // Estado
    plano: state.plano,
    blocoAtivo,
    exercicioAtivo,
    proximoExercicio,
    progresso,
    exercicioAtivoIndex: state.exercicioAtivoIndex,
    loading: state.loading,
    podeDesfazer,
    tempoDesfazer: state.ultimoExercicioConcluido
      ? Math.max(0, 3000 - (Date.now() - state.ultimoExercicioConcluido.timestamp))
      : 0,

    // Ações
    trocarBloco,
    irParaProximoExercicio,
    exercicioAnterior,
    selecionarExercicio,
    marcarConcluido,
    desfazer,
    finalizarTreino,
    recarregar: carregarPlano,
    isExercicioConcluido
  }
}

