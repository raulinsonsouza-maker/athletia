import { useMemo } from 'react'
import { useExercicioMedia } from './useExercicioMedia'
import { PlanoAtualExercicio } from '../types/treino.types'

/**
 * Constrói cadeia de fallback para mídia do exercício
 * Removidos fallbacks que geram erros 404 (imagens inexistentes)
 */
function construirFallbackChain(exercicio: PlanoAtualExercicio | null): string[] {
  // Não usar fallbacks que geram erros 404
  // Apenas usar imagemUrl se disponível
  return []
}

/**
 * Hook para gerenciar mídia do exercício com fallback chain
 */
export function useExercicioMediaChain(exercicio: PlanoAtualExercicio | null) {
  const fallbackChain = useMemo(
    () => construirFallbackChain(exercicio),
    [exercicio?.id, exercicio?.grupo]
  )

  const media = useExercicioMedia({
    imagemUrl: exercicio?.imagemUrl || undefined,
    fallbackChain,
    onError: () => {
      // Silenciosamente falhar - não mostrar erro no console
    }
  })

  return media
}

