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

// ============================================================================
// SINCRONIZAÇÃO DE EXERCÍCIOS COM GRUPOS VISUAIS
// ============================================================================

/**
 * Sincroniza os registros de ExercicioGrupoMuscular para um exercício específico
 * com base no grupoMuscularPrincipal e nos sinergistas do exercício.
 */
export async function sincronizarGruposDoExercicio(
  exercicioId: string,
  grupoMuscularPrincipal: string,
  sinergistas: string[] = []
): Promise<void> {
  // Limpar vínculos atuais
  await prisma.exercicioGrupoMuscular.deleteMany({
    where: { exercicioId }
  });

  const nomesGrupos = [
    grupoMuscularPrincipal,
    ...(Array.isArray(sinergistas) ? sinergistas : [])
  ].filter((g) => typeof g === 'string' && g.trim() !== '');

  if (nomesGrupos.length === 0) {
    return;
  }

  const gruposVisuais = await obterGruposVisuaisAtivos();

  const normalizar = (valor: string) => valor.trim().toLowerCase();

  const encontrarGrupoVisual = (nome: string) => {
    const alvo = normalizar(nome);

    // 1) match exato
    let encontrado = gruposVisuais.find((g) => normalizar(g.nome) === alvo);
    if (encontrado) return encontrado;

    // 2) nome do grupo visual contido no nome do exercício
    encontrado = gruposVisuais.find((g) => alvo.includes(normalizar(g.nome)));
    if (encontrado) return encontrado;

    // 3) nome do exercício contido no nome do grupo visual
    encontrado = gruposVisuais.find((g) => normalizar(g.nome).includes(alvo));
    if (encontrado) return encontrado;

    return null;
  };

  const registros: {
    exercicioId: string;
    grupoVisualId: string;
    papel: 'PRINCIPAL' | 'SINERGISTA';
    ordem?: number;
  }[] = [];

  const usados = new Set<string>();
  let ordem = 0;

  // Grupo principal
  const grupoPrincipalVisual = encontrarGrupoVisual(grupoMuscularPrincipal);
  if (grupoPrincipalVisual) {
    registros.push({
      exercicioId,
      grupoVisualId: grupoPrincipalVisual.id,
      papel: 'PRINCIPAL',
      ordem
    });
    usados.add(grupoPrincipalVisual.id);
  }

  // Sinergistas
  for (const nome of Array.isArray(sinergistas) ? sinergistas : []) {
    const grupoVisual = encontrarGrupoVisual(nome);
    if (!grupoVisual || usados.has(grupoVisual.id)) continue;

    ordem += 1;
    registros.push({
      exercicioId,
      grupoVisualId: grupoVisual.id,
      papel: 'SINERGISTA',
      ordem
    });
    usados.add(grupoVisual.id);
  }

  if (registros.length === 0) {
    return;
  }

  await prisma.exercicioGrupoMuscular.createMany({
    data: registros,
    skipDuplicates: true
  });
}

/**
 * Sincroniza TODOS os exercícios do banco com a tabela de grupos visuais
 * Deve ser chamado no startup para garantir consistência.
 */
export async function sincronizarTodosExerciciosComGrupos(): Promise<void> {
  console.log('[GruposMusculares] Iniciando sincronização de todos os exercícios com grupos visuais...');

  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });

  for (const exercicio of exercicios) {
    await sincronizarGruposDoExercicio(
      exercicio.id,
      exercicio.grupoMuscularPrincipal,
      exercicio.sinergistas || []
    );
  }

  console.log(`[GruposMusculares] Sincronização concluída para ${exercicios.length} exercícios.`);
}
