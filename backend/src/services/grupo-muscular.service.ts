/**
 * GRUPO MUSCULAR SERVICE
 * 
 * Gerencia cache e operações com grupos musculares visuais
 * Otimizado para performance com cache inteligente
 */

import { prisma } from '../lib/prisma';

// ============================================================================
// CACHE INTELIGENTE
// ============================================================================

interface GrupoMuscularCache {
  grupos: Array<{ id: string; nome: string; slug: string }>;
  timestamp: number;
}

let cache: GrupoMuscularCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém grupos musculares visuais ativos (com cache)
 */
export async function obterGruposVisuaisAtivos(): Promise<Array<{ id: string; nome: string; slug: string }>> {
  const agora = Date.now();
  
  if (cache && (agora - cache.timestamp) < CACHE_DURATION) {
    return cache.grupos;
  }
  
  const grupos = await prisma.grupoMuscularVisual.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, slug: true },
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }]
  });
  
  cache = { grupos, timestamp: agora };
  return grupos;
}

/**
 * Obtém todos os nomes dos grupos ativos
 */
export async function obterTodosGruposAtivos(): Promise<string[]> {
  const grupos = await obterGruposVisuaisAtivos();
  return grupos.map(g => g.nome);
}

/**
 * Mapeia nome/slug para grupo visual válido
 */
export async function mapearGrupoParaVisual(nomeOuSlug: string): Promise<string | null> {
  const grupos = await obterGruposVisuaisAtivos();
  
  // Buscar por nome exato
  const porNome = grupos.find(g => 
    g.nome.toLowerCase() === nomeOuSlug.toLowerCase()
  );
  if (porNome) return porNome.nome;
  
  // Buscar por slug
  const porSlug = grupos.find(g => 
    g.slug.toLowerCase() === nomeOuSlug.toLowerCase()
  );
  if (porSlug) return porSlug.nome;
  
  // Buscar por match parcial
  const porMatch = grupos.find(g => 
    g.nome.toLowerCase().includes(nomeOuSlug.toLowerCase()) ||
    nomeOuSlug.toLowerCase().includes(g.nome.toLowerCase())
  );
  if (porMatch) return porMatch.nome;
  
  return null;
}

/**
 * Valida e mapeia lista de grupos para grupos visuais válidos
 */
export async function validarEMapearGrupos(grupos: string[]): Promise<string[]> {
  const gruposValidos: string[] = [];
  const gruposAtivos = await obterTodosGruposAtivos();
  
  for (const grupo of grupos) {
    const grupoMapeado = await mapearGrupoParaVisual(grupo);
    if (grupoMapeado && gruposAtivos.includes(grupoMapeado)) {
      gruposValidos.push(grupoMapeado);
    }
  }
  
  return gruposValidos;
}

/**
 * Invalida cache (útil após atualizações)
 */
export function invalidarCache(): void {
  cache = null;
}
