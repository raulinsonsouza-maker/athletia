/**
 * MUSCLE GROUP CANONICAL SERVICE
 * 
 * Define os grupos musculares canônicos do sistema
 * Este é o único ponto de verdade para os grupos válidos
 * 
 * IMPORTANTE: Apenas estes 12 grupos podem ser usados no sistema canônico.
 * Qualquer outro grupo deve ser normalizado para um destes antes de ser usado.
 */

/**
 * Grupos musculares canônicos do sistema
 * Total: 12 grupos
 */
export const GRUPOS_CANONICOS = [
  'PEITO',
  'COSTAS',
  'OMBROS',
  'TRÍCEPS',
  'BÍCEPS',
  'QUADRÍCEPS',
  'POSTERIOR_COXA',
  'GLÚTEOS',
  'PANTURRILHA',
  'CORE',
  'LOMBAR',
  'TRAPÉZIO'
] as const;

export type GrupoCanonico = typeof GRUPOS_CANONICOS[number];

/**
 * Verifica se um grupo é canônico
 */
export function isGrupoCanonico(grupo: string): grupo is GrupoCanonico {
  return GRUPOS_CANONICOS.includes(grupo as GrupoCanonico);
}

/**
 * Lista de todos os grupos canônicos como array de strings
 */
export function obterTodosGruposCanonicos(): string[] {
  return [...GRUPOS_CANONICOS];
}
