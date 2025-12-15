/**
 * MUSCLE SYNERGY MATRIX SERVICE
 * 
 * Define a matriz de sinergia muscular (pares válidos)
 * 
 * REGRAS:
 * - Sinergia é bidirecional: se A → B, então B → A
 * - Apenas pares nesta matriz são válidos
 * - Não existe exceção contextual
 * - Se um par não existir aqui, ele é INVÁLIDO
 * 
 * Esta é a única fonte de verdade para pares sinérgicos válidos.
 */

import { GRUPOS_CANONICOS, GrupoCanonico, isGrupoCanonico } from './muscle-group-canonical.service';

/**
 * Matriz de sinergia muscular
 * Define quais grupos podem ser treinados juntos
 * 
 * Regra: Se A tem B na lista, então B também deve ter A (bidirecional)
 */
export const MATRIZ_SINERGIA: Record<GrupoCanonico, GrupoCanonico[]> = {
  PEITO: ['TRÍCEPS'],
  TRÍCEPS: ['PEITO', 'OMBROS'],
  COSTAS: ['BÍCEPS'],
  BÍCEPS: ['COSTAS'],
  OMBROS: ['TRÍCEPS', 'TRAPÉZIO'],
  TRAPÉZIO: ['OMBROS'],
  QUADRÍCEPS: ['GLÚTEOS', 'PANTURRILHA'],
  GLÚTEOS: ['QUADRÍCEPS', 'POSTERIOR_COXA'],
  POSTERIOR_COXA: ['GLÚTEOS'],
  PANTURRILHA: ['QUADRÍCEPS'],
  CORE: ['LOMBAR'],
  LOMBAR: ['CORE']
};

/**
 * Lista todos os pares sinérgicos válidos
 * Cada par aparece uma única vez (normalizado: grupo menor primeiro)
 */
export function obterParesSinergicos(): Array<[GrupoCanonico, GrupoCanonico]> {
  const pares: Array<[GrupoCanonico, GrupoCanonico]> = [];
  const paresUnicos = new Set<string>();

  for (const grupo1 of GRUPOS_CANONICOS) {
    const sinergicos = MATRIZ_SINERGIA[grupo1] || [];
    
    for (const grupo2 of sinergicos) {
      // Normalizar: sempre colocar o grupo "menor" (alfabeticamente) primeiro
      const parNormalizado = [grupo1, grupo2].sort().join('|') as string;
      
      if (!paresUnicos.has(parNormalizado)) {
        paresUnicos.add(parNormalizado);
        // Garantir ordem: primeiro grupo alfabeticamente menor
        if (grupo1 < grupo2) {
          pares.push([grupo1, grupo2]);
        } else {
          pares.push([grupo2, grupo1]);
        }
      }
    }
  }

  return pares.sort((a, b) => {
    if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
    return a[1].localeCompare(b[1]);
  });
}

/**
 * Verifica se dois grupos formam um par sinérgico válido
 */
export function saoGruposSinergicos(
  grupo1: string,
  grupo2: string
): boolean {
  if (!isGrupoCanonico(grupo1) || !isGrupoCanonico(grupo2)) {
    return false;
  }

  // Verificar bidirecionalidade
  const sinergicos1 = MATRIZ_SINERGIA[grupo1] || [];
  const sinergicos2 = MATRIZ_SINERGIA[grupo2] || [];

  return sinergicos1.includes(grupo2) || sinergicos2.includes(grupo1);
}

/**
 * Obtém todos os grupos sinérgicos de um grupo
 */
export function obterGruposSinergicos(grupo: string): GrupoCanonico[] {
  if (!isGrupoCanonico(grupo)) {
    return [];
  }

  return [...(MATRIZ_SINERGIA[grupo] || [])];
}
