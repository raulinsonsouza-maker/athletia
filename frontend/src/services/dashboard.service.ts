import api from './auth.service'

import { TreinoSemanal } from '../types/treino.types'

export interface ResumoDashboard {
  usuario: {
    nome: string
    modoTreino: 'IA' | 'MANUAL'
  }
  treinoHoje: any | null
  treinosSemanais?: TreinoSemanal[] // Treinos da semana completa (7 dias)
  treinosRecent?: TreinoSemanal[] // Últimos 3 treinos concluídos
  progressoSemanal: {
    concluidos: number
    meta: number
    metaOriginal?: number
    metaAjustada?: boolean
    diasRestantes?: number
    porcentagem: number
    faltam: number
  }
  sequencia: {
    atual: number
    melhor: number
    ehRecorde: boolean
  }
  evolucao: {
    peso: {
      primeiro: number | null
      atual: number | null
      diferenca: number | null
    }
    progressaoForca: Record<string, number>
    totalTreinosMes: number
    semanasSeguidas: number
  }
  nivel: {
    nivel: number
    nome: string
    progresso: number
    proximoNivel: number
  }
  conquistas: Array<{
    id: string
    nome: string
    descricao: string
    icone: string
    desbloqueada: boolean
    progresso?: number
    progressoMaximo?: number
  }>
  mensagemMotivacional: string
  estatisticas: {
    periodo: number
    totalTreinos: number
    totalExercicios: number
    volumeTotal: number
    rpeMedio: number | null
    progressaoPorGrupo: Record<string, number>
    frequenciaSemanal: number
    totalTreinosMes: number
  }
}

/**
 * Obter resumo completo do dashboard
 */
export const obterResumoDashboard = async (): Promise<ResumoDashboard> => {
  const response = await api.get('/dashboard/resumo')
  return response.data
}

