/**
 * Tipos centralizados para Onboarding
 * Todos os tipos relacionados ao onboarding devem ser definidos aqui
 */

export interface OnboardingData {
  nome?: string
  dataNascimento?: string
  idade?: number
  sexo?: string
  altura?: number
  pesoAtual?: number
  percentualGordura?: number
  tipoCorpo?: string
  aguaDiaria?: string
  experiencia?: string
  objetivo?: string
  frequenciaSemanal?: number
  tempoDisponivel?: number
  localTreino?: string
  problemasAnteriores?: string[]
  objetivosAdicionais?: string[]
  lesoes?: string[]
  preferencias?: string[]
  rpePreferido?: number
}

export type OnboardingStep = 
  | 0 | 1 | 2 | 3 | 4 | 4.5 | 5 | 5.5 | 6 | 7 | 7.5 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15

export interface AnaliseAgua {
  porcentagem: number
  status: 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo'
  mensagem: string
  recomendacao: string
  cor: 'success' | 'warning' | 'error'
}

export interface AnaliseCondicionamento {
  porcentagem: number
  status: 'excelente' | 'bom' | 'regular' | 'baixo'
  mensagem: string
  recomendacao: string
  cor: 'success' | 'warning' | 'error'
}

export interface GenderContent {
  tipoCorpo: {
    title: string
    subtitle: string
    desc: string
  }
  dadosCorporais: {
    title: string
    subtitle: string
    desc: string
  }
  objetivos: {
    title: string
    subtitle: string
    desc: string
  }
  experiencia: {
    title: string
    subtitle: string
    desc: string
  }
}

