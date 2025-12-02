import { useMemo } from 'react'
import { getImagemGrupoBanco, getImagemPadraoBanco } from '../utils/imagensBanco'
import { resolveApiPath } from '../utils/api-url'
import { useExercicioMedia } from './useExercicioMedia'
import { PlanoAtualExercicio } from '../types/treino.types'

/**
 * Normaliza nome de grupo para slug
 */
function normalizarGrupo(grupo?: string | null): string {
  if (!grupo) return ''
  return grupo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')
}

/**
 * Constrói cadeia de fallback para mídia do exercício
 */
function construirFallbackChain(exercicio: PlanoAtualExercicio | null): string[] {
  const chain: string[] = []

  if (exercicio?.id) {
    const urlFromId = resolveApiPath(`/api/uploads/exercicios/${exercicio.id}/exercicio.jpg`)
    if (urlFromId) chain.push(urlFromId)
  }

  const slug = normalizarGrupo(exercicio?.grupo)
  const imagemGrupo = slug ? getImagemGrupoBanco(slug) : ''
  if (imagemGrupo) chain.push(imagemGrupo)

  const imagemPadrao = getImagemPadraoBanco('treino')
  if (imagemPadrao) chain.push(imagemPadrao)

  return chain
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
    imagemUrl: exercicio?.gifUrl || undefined,
    fallbackChain,
    onError: () => {
      // Silenciosamente falhar - não mostrar erro no console
    }
  })

  return media
}

