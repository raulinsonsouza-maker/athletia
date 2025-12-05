import { useMemo } from 'react'
import { useExercicioMedia } from './useExercicioMedia'
import { PlanoAtualExercicio } from '../types/treino.types'

/**
 * Hook para gerenciar mídia do exercício com fallback chain
 * Usa apenas imagemUrl se disponível (sem fallbacks que geram 404)
 */
export function useExercicioMediaChain(exercicio: PlanoAtualExercicio | null) {
  // Não usar fallbacks que geram erros 404
  // Apenas usar imagemUrl se disponível
  const fallbackChain = useMemo(() => [], [])

  const media = useExercicioMedia({
    imagemUrl: exercicio?.imagemUrl || undefined,
    fallbackChain,
    onError: () => {
      // Silenciosamente falhar - não mostrar erro no console
    }
  })

  return media
}

