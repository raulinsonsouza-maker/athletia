import api from './auth.service'

export type ModoTreino = 'IA' | 'MANUAL'

/**
 * Obter modo de treino atual do usuário
 */
export const obterModoTreino = async (): Promise<ModoTreino> => {
  const response = await api.get('/user/modo-treino')
  return response.data.modoTreino || 'IA'
}

/**
 * Atualizar modo de treino do usuário
 */
export const atualizarModoTreino = async (modo: ModoTreino): Promise<ModoTreino> => {
  const response = await api.put('/user/modo-treino', { modoTreino: modo })
  return response.data.modoTreino
}

/**
 * Definir treino ativo para o usuário
 */
export const definirTreinoAtivo = async (treinoId: string): Promise<void> => {
  await api.put('/user/treino-ativo', { treinoId })
}

