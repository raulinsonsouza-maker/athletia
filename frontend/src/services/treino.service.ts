import api from './auth.service'
import { TreinoSemanal, TreinosSemanaisResponse, FiltrosTreino, TreinoCompleto } from '../types/treino.types'

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
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Buscar treinos da semana atual (domingo a sábado)
 */
export const buscarTreinosSemanais = async (dataInicio?: Date): Promise<TreinosSemanaisResponse> => {
  const response = await api.get('/treino/semana')
  return response.data
}

/**
 * Buscar histórico de treinos
 */
export const buscarHistoricoTreinos = async (limite: number = 30, dataInicio?: Date): Promise<TreinoCompleto[]> => {
  const filtros: FiltrosTreino = {
    limite,
    concluido: true
  }
  
  if (dataInicio) {
    filtros.dataInicio = dataInicio
  }
  
  return buscarTreinos(filtros)
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

