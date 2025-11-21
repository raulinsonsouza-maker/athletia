/**
 * Tipos centralizados para Treinos
 * Todos os tipos relacionados a treinos devem ser definidos aqui
 */

// Tipo base para exercício dentro de um treino
export interface ExercicioTreino {
  id: string
  ordem: number
  series: number
  repeticoes: string
  carga: number | null
  rpe: number | null
  descanso: number | null
  concluido: boolean
  exercicio: {
    id: string
    nome: string
    grupoMuscularPrincipal: string
    descricao?: string | null
    execucaoTecnica?: string | null
    errosComuns?: string[]
    gifUrl?: string | null
    imagemUrl?: string | null
    equipamentoNecessario?: string[]
  }
}

// Tipo base com propriedades comuns a todos os treinos
export interface TreinoBase {
  id: string
  data: string
  tipo: string
  nome: string | null
  concluido: boolean
  tempoEstimado: number | null
  criadoPor?: string
  letraTreino?: string | null
}

// Treino completo com todos os exercícios detalhados
export interface TreinoCompleto extends TreinoBase {
  exercicios: ExercicioTreino[]
}

// Treino resumo - apenas dados essenciais para listagens
export interface TreinoResumo extends TreinoBase {
  exercicios: Array<{
    id: string
    ordem: number
    series: number
    repeticoes: string
    concluido: boolean
    exercicio: {
      id: string
      nome: string
      grupoMuscularPrincipal: string
    }
  }>
}

// Treino semanal - para visão semanal (pode ter menos detalhes)
export interface TreinoSemanal extends TreinoBase {
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

// Tipo genérico que pode ser qualquer variante
export type Treino = TreinoCompleto | TreinoResumo | TreinoSemanal

// Filtros para busca de treinos
export interface FiltrosTreino {
  dataInicio?: string | Date
  dataFim?: string | Date
  concluido?: boolean
  tipo?: string
  limite?: number
  modoTreino?: 'IA' | 'MANUAL'
}

// Resposta de busca de treinos semanais
export interface TreinosSemanaisResponse {
  treinos: TreinoSemanal[]
  total: number
}

// Status do treino
export type StatusTreino = 'pendente' | 'em-andamento' | 'concluido' | 'perdido' | 'futuro'

// Variante de exibição do card
export type VarianteCard = 'compacto' | 'completo' | 'resumo'

