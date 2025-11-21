/**
 * Tipos centralizados para Treinos no Backend
 * Compatíveis com Prisma e usados em serviços e controllers
 */

// Filtros para busca de treinos
export interface FiltrosTreino {
  dataInicio?: Date
  dataFim?: Date
  concluido?: boolean
  tipo?: string
  limite?: number
  modoTreino?: 'IA' | 'MANUAL'
  userId?: string
}

// Opções de include para queries Prisma
export interface IncludeOptions {
  exercicios?: boolean
  exercicioDetalhes?: boolean // Inclui dados completos do exercício
  apenasConcluidos?: boolean // Apenas exercícios concluídos
}

// Resposta de busca de treinos
export interface BuscarTreinosResponse {
  treinos: any[] // Prisma Treino com includes
  total: number
}

// Estatísticas de um treino
export interface EstatisticasTreino {
  totalExercicios: number
  exerciciosConcluidos: number
  volumeTotal: number
  rpeMedio: number | null
  tempoEstimado: number | null
  gruposMusculares: string[]
}

// Dados para criação de treino
export interface CriarTreinoData {
  userId: string
  data: Date
  tipo: string
  nome?: string | null
  letraTreino?: string | null
  tempoEstimado?: number | null
  criadoPor?: string
  exercicios: Array<{
    exercicioId: string
    ordem: number
    series: number
    repeticoes: string
    carga?: number | null
    rpe?: number | null
    descanso?: number | null
  }>
}

// Dados para atualização de treino
export interface AtualizarTreinoData {
  nome?: string | null
  tipo?: string
  concluido?: boolean
  tempoEstimado?: number | null
}

// Status do treino
export type StatusTreino = 'pendente' | 'em-andamento' | 'concluido' | 'perdido' | 'futuro'

