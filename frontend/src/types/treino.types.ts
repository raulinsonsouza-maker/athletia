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
  feedbackSimples?: 'MUITO_FACIL' | 'NO_PONTO' | 'PESADO_DEMAIS' | null
  aceitouAjuste?: boolean | null
  descanso: number | null
  concluido: boolean
  exercicio: {
    id: string
    nome: string
    grupoMuscularPrincipal: string
    descricao?: string | null
    execucaoTecnica?: string | null
    errosComuns?: string[]
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
  primeiraSemana?: boolean
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

// --- NOVOS TIPOS PARA HOME DE TREINOS ---

export interface RecursoPersonalizado {
  id: string
  titulo: string
  descricao?: string
  icone: string
  destino: string
}

export interface TreinoCardResumo {
  id: string
  titulo: string
  nivel: string
  duracao: number
  local: string
  imagem?: string | null
  destaque?: string | null
  data?: string | Date
  totalExercicios?: number
}

export interface TreinoHomeSection {
  id: string
  titulo: string
  subtitulo?: string
  itens: TreinoCardResumo[]
}

export interface TreinoHomeResponse {
  recursos: RecursoPersonalizado[]
  secoes: TreinoHomeSection[]
  planosAtivos: TreinoCardResumo[]
  destaquePlanoAtual?: TreinoCardResumo | null
  semana: TreinoSemanaDia[]
  insights: TreinoHomeInsights
  recomendacoes: string[]
}

export interface PlanoAtualExercicio {
  id: string
  nome: string
  grupo: string
  series: number
  repeticoes: string
  carga?: number | null
  ordem: number
  concluido?: boolean
  descricao?: string | null
  execucao?: string | null
  errosComuns?: string[]
  imagemUrl?: string | null
  equipamentos?: string[]
}

export interface CardioInfo {
  ativo: boolean
  tipo?: string // 'esteira', 'bicicleta', 'eliptico', 'remada', etc
  tempoMinutos?: number
  intensidade?: 'leve' | 'moderada' | 'alta'
  momento?: 'inicio' | 'final' | 'intercalado'
}

export interface PlanoAtualBloco {
  id: string
  titulo: string
  data: string | Date
  totalExercicios: number
  cardio?: CardioInfo
  exercicios: PlanoAtualExercicio[]
}

export interface PlanoAtualResponse {
  plano: {
    nivel: string
    tempoMedio: number
    local: string
    imagemCapa: string
    totalTreinos: number
  }
  blocos: PlanoAtualBloco[]
  genero?: string | null
}

export interface TreinoSemanaDia {
  label: string
  data: string
  status: 'passado' | 'hoje' | 'futuro'
  hasTreino: boolean
  concluido: boolean
  treinoId?: string | null
}

export interface TreinoHomeInsights {
  progressoSemana: {
    realizados: number
    planejados: number
  }
  volumeTotal: number
  seriesTotais: number
  diasSemTreino: number
}

