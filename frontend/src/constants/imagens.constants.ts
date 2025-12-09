/**
 * Constantes de imagens padrão para fallback
 * Usadas quando imagens do banco não estão disponíveis
 */

/**
 * Imagens padrão do Unsplash para grupos musculares
 * Usadas como fallback em TreinoRapidoSelecaoGrupos
 */
export const DEFAULT_IMAGENS_GRUPOS: Record<string, string> = {
  peito: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  costas: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
  ombros: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=800&q=80',
  biceps: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  triceps: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80',
  quadriceps: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  gluteos: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  posteriores: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  abdomen: 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?auto=format&fit=crop&w=800&q=80'
}

/**
 * Obtém imagem padrão para um grupo muscular
 * @param grupoSlug Slug do grupo muscular
 * @returns URL da imagem ou imagem padrão (peito)
 */
export function getImagemPadraoGrupo(grupoSlug: string): string {
  return DEFAULT_IMAGENS_GRUPOS[grupoSlug.toLowerCase()] || DEFAULT_IMAGENS_GRUPOS.peito
}

