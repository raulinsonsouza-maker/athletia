import api from './auth.service'

export interface DesafioResumo {
  slug: string
  titulo: string
  descricao: string
  totalDias: number
  diasConcluidos: number
  disponivel: boolean
}

export interface DiaDesafio {
  dia: number
  nome: string
  duracaoSegundos: number
  youtubeId: string
  status: 'concluido' | 'atual' | 'bloqueado'
}

export interface DesafioDetalhe extends DesafioResumo {
  dias: DiaDesafio[]
}

export const listarDesafios = async (): Promise<DesafioResumo[]> => {
  const { data } = await api.get<{ desafios: DesafioResumo[] }>('/desafios')
  return data.desafios
}

export const obterDesafio = async (slug: string): Promise<DesafioDetalhe> => {
  const { data } = await api.get<DesafioDetalhe>(`/desafios/${slug}`)
  return data
}

export const concluirDiaDesafio = async (slug: string, dia: number): Promise<DesafioDetalhe> => {
  const { data } = await api.post<DesafioDetalhe>(`/desafios/${slug}/dias/${dia}/concluir`)
  return data
}

export const desmarcarDiaDesafio = async (slug: string, dia: number): Promise<DesafioDetalhe> => {
  const { data } = await api.delete<DesafioDetalhe>(`/desafios/${slug}/dias/${dia}`)
  return data
}
