import api from './auth.service'

export interface Exercicio {
  id: string
  nome: string
  grupoMuscularPrincipal: string
  sinergistas: string[]
  nivelDificuldade: string
  descricao?: string
  execucaoTecnica?: string
  errosComuns: string[]
  imagemUrl?: string
  gifUrl?: string
  cargaInicialSugerida?: number
  rpeSugerido?: number
  equipamentoNecessario: string[]
  alternativas: string[]
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface ListarExerciciosResponse {
  exercicios: Exercicio[]
  gruposMusculares: string[]
  niveisDificuldade: string[]
  total: number
}

export const listarExercicios = async (filtros?: {
  grupoMuscular?: string
  nivelDificuldade?: string
  busca?: string
}): Promise<ListarExerciciosResponse> => {
  const params = new URLSearchParams()
  if (filtros?.grupoMuscular) params.append('grupoMuscular', filtros.grupoMuscular)
  if (filtros?.nivelDificuldade) params.append('nivelDificuldade', filtros.nivelDificuldade)
  if (filtros?.busca) params.append('busca', filtros.busca)
  
  const response = await api.get(`/exercicios?${params.toString()}`)
  return response.data
}

export const buscarExercicio = async (id: string): Promise<Exercicio> => {
  const response = await api.get(`/exercicios/${id}`)
  return response.data
}

