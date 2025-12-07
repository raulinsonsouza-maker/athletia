/**
 * EXERCICIO SELECTOR SERVICE
 * 
 * Seleção inteligente de exercícios com fallback
 * Utiliza ExercicioGrupoMuscular e histórico para otimizar escolhas
 */

import { prisma } from '../lib/prisma';
import { mapearGrupoParaVisual } from './grupo-muscular.service';
import { aplicarFiltrosExercicios, FiltrosExercicio } from './exercicio-filters.service';
import { obterInicioSemana } from './treino-utils.service';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function gerarSeed(userId: string, data: Date): number {
  const dataString = data.toISOString().split('T')[0];
  const hash = userId + dataString;
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed) + hash.charCodeAt(i);
    seed = seed & seed;
  }
  return Math.abs(seed);
}

function shuffleDeterministico<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let random = seed;
  
  const nextRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// ============================================================================
// BUSCA DE EXERCÍCIOS
// ============================================================================

/**
 * Busca exercícios com fallback inteligente (usa ExercicioGrupoMuscular primeiro)
 */
export async function buscarExerciciosComFallback(
  grupo: string,
  quantidade: number,
  filtros: FiltrosExercicio,
  userId: string,
  data: Date,
  cacheExercicios?: Map<string, any[]>
): Promise<any[]> {
  const quantidadeMinima = Math.max(quantidade, 3);
  let exercicios: any[] = [];
  
  if (cacheExercicios && cacheExercicios.has(grupo)) {
    exercicios = cacheExercicios.get(grupo) || [];
  } else {
    // Primeiro: buscar por grupo visual (ExercicioGrupoMuscular)
    const grupoVisual = await mapearGrupoParaVisual(grupo);
    
    if (grupoVisual) {
      const grupoDb = await prisma.grupoMuscularVisual.findFirst({
        where: { nome: grupoVisual, ativo: true }
      });
      
      if (grupoDb) {
        // Buscar exercícios pela relação ExercicioGrupoMuscular
        const exerciciosComGrupo = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: {
                grupoVisualId: grupoDb.id,
                papel: 'PRINCIPAL'
              }
            }
          },
          include: {
            gruposMusculares: {
              include: { grupo: true }
            }
          },
          take: quantidadeMinima * 5,
          distinct: ['id']
        });
        
        // Também buscar sinergistas
        const exerciciosSinergistas = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: {
                grupoVisualId: grupoDb.id,
                papel: 'SINERGISTA'
              }
            },
            id: { notIn: exerciciosComGrupo.map(ex => ex.id) }
          },
          include: {
            gruposMusculares: {
              include: { grupo: true }
            }
          },
          take: quantidadeMinima * 2,
          distinct: ['id']
        });
        
        exercicios = [...exerciciosComGrupo, ...exerciciosSinergistas];
      }
    }
    
    // Fallback: usar grupoMuscularPrincipal se não encontrou por grupo visual
    if (exercicios.length === 0) {
      exercicios = await prisma.exercicio.findMany({
        where: {
          ativo: true,
          OR: [
            { grupoMuscularPrincipal: grupo },
            { sinergistas: { has: grupo } }
          ]
        },
        take: quantidadeMinima * 5,
        distinct: ['id']
      });
    }
    
    if (cacheExercicios) {
      cacheExercicios.set(grupo, exercicios);
    }
  }
  
  // Aplicar filtros
  exercicios = aplicarFiltrosExercicios(exercicios, filtros);
  
  // Se não tem suficientes, buscar qualquer exercício do grupo (fallback)
  if (exercicios.length < quantidadeMinima) {
    const idsJaFiltrados = new Set(exercicios.map(ex => ex.id));
    
    const grupoVisual = await mapearGrupoParaVisual(grupo);
    if (grupoVisual) {
      const grupoDb = await prisma.grupoMuscularVisual.findFirst({
        where: { nome: grupoVisual, ativo: true }
      });
      
      if (grupoDb) {
        const fallback = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: { grupoVisualId: grupoDb.id }
            },
            id: { notIn: Array.from(idsJaFiltrados) }
          },
          take: quantidadeMinima - exercicios.length
        });
        exercicios.push(...fallback);
      }
    }
    
    // Fallback final: grupoMuscularPrincipal
    if (exercicios.length < quantidadeMinima) {
      const idsAtuais = new Set(exercicios.map(ex => ex.id));
      const fallback = await prisma.exercicio.findMany({
        where: {
          ativo: true,
          grupoMuscularPrincipal: grupo,
          id: { notIn: Array.from(idsAtuais) }
        },
        take: quantidadeMinima - exercicios.length
      });
      exercicios.push(...fallback);
    }
  }
  
  // Remover duplicados
  const exerciciosUnicos = Array.from(
    new Map(exercicios.map(ex => [ex.id, ex])).values()
  );
  
  // Selecionar quantidade necessária com randomização determinística
  const inicioSemana = obterInicioSemana(data);
  const semana = Math.floor((inicioSemana.getTime() - new Date(inicioSemana.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const seed = gerarSeed(userId + grupo + semana.toString(), inicioSemana);
  const shuffled = shuffleDeterministico(exerciciosUnicos, seed);
  
  const selecionados: any[] = [];
  for (const ex of shuffled) {
    if (selecionados.length >= quantidade) break;
    selecionados.push(ex);
  }
  
  return selecionados;
}

/**
 * Seleciona exercícios para múltiplos grupos
 */
export async function selecionarExerciciosParaGrupos(
  grupos: string[],
  quantidadeTotal: number,
  filtros: FiltrosExercicio,
  userId: string,
  data: Date
): Promise<any[]> {
  // Criar cache de exercícios
  const cacheExercicios = new Map<string, any[]>();
  const todosExerciciosAtivos = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: {
      id: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });
  
  grupos.forEach(grupo => {
    const exerciciosGrupo = todosExerciciosAtivos.filter(ex => 
      ex.grupoMuscularPrincipal === grupo || 
      (ex.sinergistas || []).includes(grupo)
    );
    cacheExercicios.set(grupo, exerciciosGrupo);
  });
  
  // Determinar quantos exercícios por grupo
  const exerciciosPorGrupo = Math.max(1, Math.floor(quantidadeTotal / grupos.length));
  const exerciciosRestantes = quantidadeTotal - (exerciciosPorGrupo * grupos.length);
  
  const todosExercicios: any[] = [];
  
  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    const quantidade = exerciciosPorGrupo + (i < exerciciosRestantes ? 1 : 0);
    
    // Buscar histórico específico para este grupo
    const historicoGrupo = await buscarHistoricoExercicios(userId, 14, grupo);
    const historicoCombinado = new Set([
      ...(filtros.historico || []),
      ...historicoGrupo
    ]);
    
    const filtrosGrupo = {
      ...filtros,
      historico: historicoCombinado
    };
    
    const exercicios = await buscarExerciciosComFallback(
      grupo,
      quantidade,
      filtrosGrupo,
      userId,
      data,
      cacheExercicios
    );
    
    todosExercicios.push(...exercicios);
    
    // Adicionar ao histórico para próximos grupos
    exercicios.forEach(ex => {
      if (!filtros.historico) {
        filtros.historico = new Set();
      }
      filtros.historico.add(ex.id);
    });
  }
  
  return todosExercicios;
}

/**
 * Busca histórico de exercícios para evitar repetição
 */
export async function buscarHistoricoExercicios(
  userId: string,
  dias: number = 14,
  grupoAtual?: string
): Promise<Set<string>> {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: dataLimite }
    },
    include: {
      exercicios: {
        include: {
          exercicio: {
            select: {
              id: true,
              grupoMuscularPrincipal: true,
              sinergistas: true
            }
          }
        }
      }
    },
    orderBy: { data: 'desc' }
  });

  const exerciciosUsados = new Set<string>();
  
  // Se grupo atual especificado, considerar apenas últimos 2 treinos desse grupo
  let treinosRelevantes = treinos;
  if (grupoAtual) {
    treinosRelevantes = treinos.filter(treino => {
      return treino.exercicios.some(ex => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        const sinergistas = ex.exercicio?.sinergistas || [];
        return grupo === grupoAtual || sinergistas.includes(grupoAtual);
      });
    }).slice(0, 2);
  }
  
  treinosRelevantes.forEach(treino => {
    treino.exercicios.forEach(ex => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      if (grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade') {
        exerciciosUsados.add(ex.exercicioId);
      }
    });
  });

  return exerciciosUsados;
}

/**
 * Balanceia exercícios por grupo após corte
 */
export function balancearExerciciosPorGrupo(
  exercicios: any[],
  grupos: string[],
  maxExercicios: number
): any[] {
  if (exercicios.length <= maxExercicios) {
    return exercicios;
  }

  const mapaGrupos = new Map<string, any[]>();
  grupos.forEach(grupo => mapaGrupos.set(grupo, []));

  exercicios.forEach(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    if (grupos.includes(grupoPrincipal)) {
      mapaGrupos.get(grupoPrincipal)?.push(ex);
    } else {
      const sinergistas = ex.sinergistas || [];
      for (const grupo of grupos) {
        if (sinergistas.includes(grupo)) {
          mapaGrupos.get(grupo)?.push(ex);
          break;
        }
      }
    }
  });

  const resultado: any[] = [];
  
  // Passo 1: Garantir mínimo de 1 exercício por grupo
  grupos.forEach(grupo => {
    const exerciciosGrupo = mapaGrupos.get(grupo) || [];
    if (exerciciosGrupo.length > 0 && resultado.length < maxExercicios) {
      resultado.push(exerciciosGrupo[0]);
    }
  });

  // Passo 2: Distribuir restante proporcionalmente
  const quantidadeRestante = maxExercicios - resultado.length;
  if (quantidadeRestante > 0) {
    const quantidadePorGrupo = Math.floor(quantidadeRestante / grupos.length);
    const resto = quantidadeRestante % grupos.length;

    grupos.forEach((grupo, index) => {
      if (resultado.length >= maxExercicios) return;
      
      const exerciciosGrupo = mapaGrupos.get(grupo) || [];
      const jaAdicionados = resultado.filter(ex => {
        const gp = ex.grupoMuscularPrincipal || '';
        const sin = ex.sinergistas || [];
        return gp === grupo || sin.includes(grupo);
      }).length;

      const quantidade = quantidadePorGrupo + (index < resto ? 1 : 0);
      const faltam = Math.max(0, quantidade - jaAdicionados);
      
      if (faltam > 0) {
        const disponiveis = exerciciosGrupo.filter(ex => !resultado.includes(ex));
        const adicionar = disponiveis.slice(0, faltam);
        resultado.push(...adicionar);
      }
    });
  }

  // Passo 3: Preencher com qualquer exercício restante
  const aindaFaltam = maxExercicios - resultado.length;
  if (aindaFaltam > 0) {
    const restantes = exercicios.filter(ex => !resultado.includes(ex));
    resultado.push(...restantes.slice(0, aindaFaltam));
  }

  return resultado.slice(0, maxExercicios);
}

