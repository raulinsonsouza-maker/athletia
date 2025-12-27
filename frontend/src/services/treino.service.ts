import api from './auth.service'
import { isAxiosError } from '../types/errors'
import {
  TreinosSemanaisResponse,
  FiltrosTreino,
  TreinoCompleto,
  TreinoHomeResponse,
  PlanoAtualResponse
} from '../types/treino.types'

/**
 * Função genérica para buscar treinos com filtros
 */
export const buscarTreinos = async (filtros?: FiltrosTreino): Promise<TreinoCompleto[]> => {
  const params = new URLSearchParams()
  
  if (filtros?.dataInicio) {
    const data = typeof filtros.dataInicio === 'string' ? filtros.dataInicio : filtros.dataInicio.toISOString()
    params.append('dataInicio', data)
  }
  
  if (filtros?.dataFim) {
    const data = typeof filtros.dataFim === 'string' ? filtros.dataFim : filtros.dataFim.toISOString()
    params.append('dataFim', data)
  }
  
  if (filtros?.concluido !== undefined) {
    params.append('concluido', filtros.concluido.toString())
  }
  
  if (filtros?.tipo) {
    params.append('tipo', filtros.tipo)
  }
  
  if (filtros?.limite) {
    params.append('limite', filtros.limite.toString())
  }
  
  if (filtros?.modoTreino) {
    params.append('modoTreino', filtros.modoTreino)
  }
  
  const queryString = params.toString()
  const url = `/treino${queryString ? `?${queryString}` : ''}`
  const response = await api.get(url)
  return response.data || []
}

/**
 * Buscar treino por ID
 */
export const buscarTreinoPorId = async (id: string): Promise<TreinoCompleto | null> => {
  try {
    const response = await api.get(`/treino/${id}`)
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Buscar treinos da semana atual (domingo a sábado)
 */
export const buscarTreinosSemanais = async (): Promise<TreinosSemanaisResponse> => {
  const response = await api.get('/treino/semana')
  return response.data
}

/**
 * Buscar treinos por período (data início e fim)
 */
export const buscarTreinosPorPeriodo = async (
  dataInicio: Date,
  dataFim: Date
): Promise<TreinoCompleto[]> => {
  const params = new URLSearchParams()
  params.append('dataInicio', dataInicio.toISOString())
  params.append('dataFim', dataFim.toISOString())
  
  const response = await api.get(`/treino?${params.toString()}`)
  return response.data || []
}

/**
 * Buscar histórico de treinos
 */
export const buscarHistoricoTreinos = async (limite: number = 30, dataInicio?: Date): Promise<TreinoCompleto[]> => {
  try {
    const params = new URLSearchParams()
    params.append('limite', limite.toString())
    
    if (dataInicio) {
      const data = typeof dataInicio === 'string' ? dataInicio : dataInicio.toISOString()
      params.append('dataInicio', data)
    }
    
    const response = await api.get(`/treino/historico?${params.toString()}`)
    return response.data || []
  } catch (error: unknown) {
    console.error('Erro ao buscar histórico de treinos:', error)
    throw error
  }
}

/**
 * Buscar treino do dia atual
 */
export const buscarTreinoDoDia = async (): Promise<TreinoCompleto | null> => {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const filtros: FiltrosTreino = {
      dataInicio: hoje,
      dataFim: hoje
    }
    
    const treinos = await buscarTreinos(filtros)
    return treinos.length > 0 ? treinos[0] : null
  } catch (error) {
    console.error('Erro ao buscar treino do dia:', error)
    return null
  }
}

/**
 * Gerar treino do dia ou semana completa
 */
export const gerarTreino = async (data?: string, gerarSemana: boolean = false): Promise<any> => {
  try {
    const body: { data?: string; gerarSemana: boolean } = {
      gerarSemana
    }
    
    // Se data for fornecida, garantir formato correto
    if (data) {
      // Normalizar para YYYY-MM-DD
      const dataObj = new Date(data)
      if (isNaN(dataObj.getTime())) {
        throw new Error('Data inválida')
      }
      dataObj.setHours(12, 0, 0, 0) // Evitar problemas de timezone
      body.data = dataObj.toISOString().split('T')[0]
    }
    
    console.log('[treino.service] Enviando requisição para gerar treino:', body)
    
    const response = await api.post('/treino/gerar', body)
    
    console.log('[treino.service] Resposta do servidor:', response.data)
    
    return response.data
  } catch (error: unknown) {
    console.error('[treino.service] Erro na requisição de gerar treino:', error)
    throw error
  }
}

export const obterHomeTreinos = async (): Promise<TreinoHomeResponse> => {
  const response = await api.get('/treino/home')
  return response.data
}

export const obterPlanoAtualResumo = async (): Promise<PlanoAtualResponse> => {
  const response = await api.get('/treino/plano-atual')
  return response.data
}

export const marcarExercicioTreino = async (exercicioId: string, concluido: boolean) => {
  await api.post(`/treino/exercicio/${exercicioId}/concluir`, { concluido })
}

export const concluirTreino = async (treinoId: string) => {
  const response = await api.post(`/treino/${treinoId}/concluir`)
  return response.data as {
    message: string
    treino: any
    isFirstTraining?: boolean
    nextTrainingAvailable?: boolean
    nextTrainingId?: string | null
  }
}

