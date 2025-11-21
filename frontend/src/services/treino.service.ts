import api from './auth.service'

export interface TreinoSemanal {
  id: string
  data: string
  tipo: string
  nome: string | null
  letraTreino: string | null
  concluido: boolean
  tempoEstimado: number | null
  exercicios: Array<{
    id: string
    ordem: number
    concluido: boolean
    exercicio: {
      id: string
      nome: string
      grupoMuscularPrincipal: string
    }
  }>
}

export interface TreinosSemanaisResponse {
  treinos: TreinoSemanal[]
  total: number
}

/**
 * Buscar treinos da semana atual (domingo a sábado)
 */
export const buscarTreinosSemanais = async (): Promise<TreinosSemanaisResponse> => {
  const response = await api.get('/treino/semana')
  return response.data
}

