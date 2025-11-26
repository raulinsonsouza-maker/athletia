import api from './auth.service'

export interface ExercicioTreino {
  exercicioId: string
  ordem: number
  series: number
  repeticoes: string
  carga?: number
  descanso?: number
  observacoes?: string
}

export interface CriarTreinoData {
  data: string
  nome: string
  exercicios: ExercicioTreino[]
  diaSemana?: number
  recorrente?: boolean
  letraTreino?: string
}

export interface EditarTreinoData {
  nome?: string
  data?: string
  exercicios?: ExercicioTreino[]
}

export interface CriarTemplateData {
  nome: string
  descricao?: string
  exercicios: ExercicioTreino[]
}

export interface EditarTemplateData {
  nome?: string
  descricao?: string
  exercicios?: ExercicioTreino[]
}

// Treinos Personalizados
export const criarTreinoPersonalizado = async (data: CriarTreinoData) => {
  const response = await api.post('/treino/personalizado', data)
  return response.data
}

export const listarTreinosPersonalizados = async (filtros?: {
  dataInicio?: string
  dataFim?: string
  concluido?: boolean
}) => {
  const params = new URLSearchParams()
  if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
  if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
  if (filtros?.concluido !== undefined) params.append('concluido', filtros.concluido.toString())
  
  const response = await api.get(`/treino/personalizado?${params.toString()}`)
  return response.data
}

export const buscarTreinoPersonalizado = async (id: string) => {
  const response = await api.get(`/treino/personalizado/${id}`)
  return response.data
}

export const editarTreinoPersonalizado = async (id: string, data: EditarTreinoData) => {
  const response = await api.put(`/treino/personalizado/${id}`, data)
  return response.data
}

export const deletarTreinoPersonalizado = async (id: string) => {
  const response = await api.delete(`/treino/personalizado/${id}`)
  return response.data
}

export const duplicarTreinoPersonalizado = async (id: string, data: string) => {
  const response = await api.post(`/treino/personalizado/${id}/duplicar`, { data })
  return response.data
}

// Templates Personalizados
export const criarTemplatePersonalizado = async (data: CriarTemplateData) => {
  const response = await api.post('/treino/template', data)
  return response.data
}

export const listarTemplatesPersonalizados = async () => {
  const response = await api.get('/treino/template')
  return response.data
}

export const buscarTemplatePersonalizado = async (id: string) => {
  const response = await api.get(`/treino/template/${id}`)
  return response.data
}

export const editarTemplatePersonalizado = async (id: string, data: EditarTemplateData) => {
  const response = await api.put(`/treino/template/${id}`, data)
  return response.data
}

export const deletarTemplatePersonalizado = async (id: string) => {
  const response = await api.delete(`/treino/template/${id}`)
  return response.data
}

export const aplicarTemplatePersonalizado = async (id: string, data: string) => {
  const response = await api.post(`/treino/template/${id}/aplicar`, { data })
  return response.data
}


