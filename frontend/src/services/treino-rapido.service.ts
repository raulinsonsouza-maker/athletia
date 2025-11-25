import api from './auth.service'

export interface GrupoMuscularCard {
  nome: string
  slug: string
  imagemUrl: string | null
  descricao?: string | null
}

export interface GruposMuscularesResponse {
  gruposPrincipais: GrupoMuscularCard[]
  gruposEspecificos: string[]
}

export interface CriarTreinoRapidoRequest {
  gruposMusculares?: string[]
  duracao: number
  dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado'
  localTreino: string
  focoMuscular?: string[]
  corpoTodo?: boolean
  data?: string
}

export const treinoRapidoService = {
  async listarGrupos(): Promise<GruposMuscularesResponse> {
    const response = await api.get('/treino/rapido/grupos')
    return response.data
  },

  async criarTreinoRapido(data: CriarTreinoRapidoRequest) {
    const response = await api.post('/treino/rapido', data)
    return response.data
  }
}

