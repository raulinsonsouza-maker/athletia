import api from './auth.service'

export interface GrupoMuscularVisual {
  id: string
  nome: string
  slug: string
  descricao?: string | null
  imagemUrl?: string | null
  ativo: boolean
  ordem?: number | null
}

export const grupoMuscularAdminService = {
  async listar(): Promise<GrupoMuscularVisual[]> {
    const response = await api.get('/admin/grupos-musculares')
    return response.data
  },

  async criar(payload: {
    nome: string
    descricao?: string
    imagemUrl?: string
    ativo?: boolean
    ordem?: number
  }) {
    const response = await api.post('/admin/grupos-musculares', payload)
    return response.data
  },

  async atualizar(id: string, payload: Partial<Omit<GrupoMuscularVisual, 'id' | 'slug'>>) {
    const response = await api.put(`/admin/grupos-musculares/${id}`, payload)
    return response.data
  },

  async remover(id: string) {
    const response = await api.delete(`/admin/grupos-musculares/${id}`)
    return response.data
  }
}

