/**
 * Gateway desacoplado para operações de treino
 * Separa camada de UI da camada de domínio
 * Facilita testes e manutenção
 */

import { obterPlanoAtualResumo, marcarExercicioTreino, concluirTreino } from '../services/treino.service'
import { PlanoAtualResponse } from '../types/treino.types'

export interface TreinoGateway {
  carregarPlano(): Promise<PlanoAtualResponse>
  marcarExercicio(exercicioId: string, concluido: boolean): Promise<void>
  finalizarTreino(treinoId: string): Promise<void>
}

/**
 * Implementação real do gateway (usa serviços HTTP)
 */
export const treinoGateway: TreinoGateway = {
  async carregarPlano() {
    return await obterPlanoAtualResumo()
  },

  async marcarExercicio(exercicioId: string, concluido: boolean) {
    await marcarExercicioTreino(exercicioId, concluido)
  },

  async finalizarTreino(treinoId: string) {
    await concluirTreino(treinoId)
  }
}

