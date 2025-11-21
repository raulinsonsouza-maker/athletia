/**
 * Funções utilitárias centralizadas para treinos
 * Todas as funções de cálculo, formatação e lógica de treinos devem estar aqui
 */

import { Treino, TreinoCompleto, StatusTreino, ExercicioTreino } from '../types/treino.types'

/**
 * Calcula o número médio de repetições de uma string de repetições
 * Ex: "8-12" retorna 10, "10" retorna 10, "15-20" retorna 17.5
 */
export function calcularRepeticoesMedias(repeticoes: string | null): number {
  if (!repeticoes) return 10 // default
  
  const parts = repeticoes.split('-').map(s => s.trim())
  
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10)
    return isNaN(num) ? 10 : num
  }
  
  const lower = parseInt(parts[0], 10)
  const upper = parseInt(parts[1], 10)
  
  if (isNaN(lower) || isNaN(upper)) {
    return 10 // default
  }
  
  // Retorna a média do range
  return (lower + upper) / 2
}

/**
 * Calcula o volume total de um treino
 * Volume = séries × repetições × carga (para cada exercício concluído)
 */
export function calcularVolumeTreino(treino: Treino): number {
  if (!treino.exercicios || treino.exercicios.length === 0) {
    return 0
  }

  return treino.exercicios
    .filter(ex => ex.concluido && ex.carga)
    .reduce((acc, ex) => {
      const repeticoesMedias = calcularRepeticoesMedias(ex.repeticoes)
      // Volume = séries × repetições × carga
      return acc + (ex.series * repeticoesMedias * Math.round(ex.carga || 0))
    }, 0)
}

/**
 * Formata data de treino para exibição
 */
export function formatarDataTreino(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data
  
  if (isNaN(dataObj.getTime())) {
    return 'Data inválida'
  }

  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short'
  })
}

/**
 * Formata data de treino de forma compacta (apenas dia/mês)
 */
export function formatarDataTreinoCompacta(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data
  
  if (isNaN(dataObj.getTime())) {
    return 'Data inválida'
  }

  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

/**
 * Obtém o status de um treino baseado na data e conclusão
 */
export function obterStatusTreino(treino: Treino): StatusTreino {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataTreino = new Date(treino.data)
  dataTreino.setHours(0, 0, 0, 0)
  
  if (treino.concluido) {
    return 'concluido'
  }
  
  if (dataTreino < hoje) {
    return 'perdido'
  }
  
  if (dataTreino.getTime() === hoje.getTime()) {
    // Verifica se há exercícios concluídos
    const exerciciosConcluidos = treino.exercicios?.filter(ex => ex.concluido).length || 0
    if (exerciciosConcluidos > 0 && exerciciosConcluidos < (treino.exercicios?.length || 0)) {
      return 'em-andamento'
    }
    return 'pendente'
  }
  
  return 'futuro'
}

/**
 * Calcula porcentagem de conclusão de um treino
 */
export function calcularPorcentagemConclusao(treino: Treino): number {
  if (!treino.exercicios || treino.exercicios.length === 0) {
    return 0
  }
  
  const exerciciosConcluidos = treino.exercicios.filter(ex => ex.concluido).length
  return Math.round((exerciciosConcluidos / treino.exercicios.length) * 100)
}

/**
 * Obtém o nome de exibição de um treino
 */
export function obterNomeTreino(treino: Treino): string {
  return treino.nome || treino.letraTreino || treino.tipo || 'Treino'
}

/**
 * Formata carga de exercício considerando equipamentos
 */
export function formatarCarga(carga: number | null, equipamentos?: string[]): string {
  if (carga === null || carga === undefined) return ''
  
  // Se for peso corporal, não mostrar carga
  if (equipamentos?.some(eq => eq.toLowerCase().includes('peso corporal'))) {
    return 'Peso Corporal'
  }
  
  return `${Math.round(carga)}kg`
}

/**
 * Calcula RPE médio de um treino
 */
export function calcularRPEMedio(treino: TreinoCompleto): number | null {
  if (!treino.exercicios || treino.exercicios.length === 0) {
    return null
  }
  
  const rpes = treino.exercicios
    .map(ex => ex.rpe)
    .filter((rpe): rpe is number => rpe !== null && rpe !== undefined)
  
  if (rpes.length === 0) {
    return null
  }
  
  const soma = rpes.reduce((acc, rpe) => acc + rpe, 0)
  return Math.round((soma / rpes.length) * 10) / 10
}

/**
 * Verifica se um treino está no passado
 */
export function isTreinoPassado(treino: Treino): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataTreino = new Date(treino.data)
  dataTreino.setHours(0, 0, 0, 0)
  
  return dataTreino < hoje
}

/**
 * Verifica se um treino é de hoje
 */
export function isTreinoHoje(treino: Treino): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataTreino = new Date(treino.data)
  dataTreino.setHours(0, 0, 0, 0)
  
  return dataTreino.getTime() === hoje.getTime()
}

/**
 * Verifica se um treino é futuro
 */
export function isTreinoFuturo(treino: Treino): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataTreino = new Date(treino.data)
  dataTreino.setHours(0, 0, 0, 0)
  
  return dataTreino > hoje
}

/**
 * Obtém grupos musculares únicos de um treino
 */
export function obterGruposMusculares(treino: Treino): string[] {
  if (!treino.exercicios || treino.exercicios.length === 0) {
    return []
  }
  
  const grupos = new Set<string>()
  treino.exercicios.forEach(ex => {
    if (ex.exercicio?.grupoMuscularPrincipal) {
      grupos.add(ex.exercicio.grupoMuscularPrincipal)
    }
  })
  
  return Array.from(grupos)
}

/**
 * Conta exercícios por grupo muscular
 */
export function contarExerciciosPorGrupo(treino: Treino): Record<string, number> {
  if (!treino.exercicios || treino.exercicios.length === 0) {
    return {}
  }
  
  const contagem: Record<string, number> = {}
  
  treino.exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal
    if (grupo) {
      contagem[grupo] = (contagem[grupo] || 0) + 1
    }
  })
  
  return contagem
}

