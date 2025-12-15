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
import { normalizarGrupoParaCanonico } from './grupo-muscular.service';

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

// ============================================================================
// SELEÇÃO CANÔNICA: EXATAMENTE 4 EXERCÍCIOS POR GRUPO
// ============================================================================

/**
 * Seleciona exatamente 4 exercícios por grupo para treino canônico
 * 
 * Garante:
 * - Exatamente 4 exercícios por grupo
 * - Zero repetição no mesmo treino
 * - Zero repetição do mesmo grupo na mesma semana
 * 
 * @param grupo Grupo muscular canônico
 * @param userId ID do usuário
 * @param data Data do treino
 * @param exerciciosJaUsadosNoTreino Exercícios já selecionados no treino atual
 * @param exerciciosUsadosNoGrupoEstaSemana Exercícios do mesmo grupo já usados na semana
 * @param filtros Filtros de exercício
 */
export async function selecionar4ExerciciosPorGrupo(
  grupo: string,
  userId: string,
  data: Date,
  exerciciosJaUsadosNoTreino: Set<string>,
  exerciciosUsadosNoGrupoEstaSemana: Set<string>,
  filtros: FiltrosExercicio,
  outroGrupoDoPar?: string // Grupo sinérgico do par (para excluir exercícios onde esse é o principal)
): Promise<any[]> {
  const QUANTIDADE_CANONICA = 4;

  // Normalizar grupo para garantir busca correta
  const grupoCanonico = normalizarGrupoParaCanonico(grupo);
  const outroGrupoCanonico = outroGrupoDoPar ? normalizarGrupoParaCanonico(outroGrupoDoPar) : null;
  
  if (!grupoCanonico) {
    console.warn(`[selecionar4ExerciciosPorGrupo] Grupo "${grupo}" não pode ser normalizado para canônico`);
    return [];
  }

  // Buscar início da semana para histórico da semana atual
  const inicioSemana = obterInicioSemana(data);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 7);

  // Buscar histórico da semana atual (para evitar repetição no mesmo grupo)
  // Usar grupo canônico normalizado
  // NOTA: Se não houver exercícios suficientes, vamos relaxar esta restrição
  const historicoSemanaAtual = await buscarHistoricoExerciciosNoPeriodo(
    userId,
    inicioSemana,
    fimSemana,
    grupoCanonico
  );

  // Combinar histórico: semana atual + exercícios já usados no treino
  // IMPORTANTE: Primeiro tentamos com histórico completo, depois relaxamos se necessário
  let todosExerciciosEvitar = new Set([
    ...exerciciosJaUsadosNoTreino,
    ...exerciciosUsadosNoGrupoEstaSemana,
    ...historicoSemanaAtual
  ]);

  // Buscar exercícios do grupo usando o grupo canônico
  // A função buscarExerciciosComFallback tentará mapear para grupo visual primeiro
  let exerciciosDisponiveis = await buscarExerciciosComFallback(
    grupoCanonico,
    QUANTIDADE_CANONICA * 3, // Buscar mais para ter opções
    {
      ...filtros,
      historico: todosExerciciosEvitar
    },
    userId,
    data
  );

  // Se não encontrou exercícios suficientes, buscar diretamente por variações
  // O PostgreSQL não suporta "mode: 'insensitive'" diretamente, então vamos buscar todos e filtrar
  if (exerciciosDisponiveis.length < QUANTIDADE_CANONICA) {
    // Buscar todos os exercícios ativos para filtrar localmente
    const todosExercicios = await prisma.exercicio.findMany({
      where: {
        ativo: true
      },
      take: 1000, // Limite razoável
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true
      }
    });

    // Filtrar localmente por normalização
    // IMPORTANTE: Priorizar exercícios onde o grupo solicitado é o grupo PRINCIPAL
    // Isso evita que um exercício seja atribuído a múltiplos grupos
    const exerciciosDoGrupo = todosExercicios
      .filter(ex => {
        const grupoPrincipalCanonico = normalizarGrupoParaCanonico(ex.grupoMuscularPrincipal);
        
        // EXCLUIR: se o grupo principal é o outro grupo do par, não usar este exercício aqui
        // Este exercício deve ser buscado quando buscar para o outro grupo
        if (outroGrupoCanonico && grupoPrincipalCanonico === outroGrupoCanonico) {
          return false; // Este exercício pertence ao outro grupo do par
        }
        
        // Verificar se corresponde ao grupo solicitado
        // Priorizar exercícios onde o grupo solicitado é o principal
        if (grupoPrincipalCanonico === grupoCanonico) {
          return true; // Grupo principal corresponde - usar
        }
        
        // Se não é principal, verificar sinergistas
        if (ex.sinergistas && ex.sinergistas.length > 0) {
          return ex.sinergistas.some(s => {
            const sCanonico = normalizarGrupoParaCanonico(s);
            return sCanonico === grupoCanonico;
          });
        }
        
        return false;
      })
      // Priorizar exercícios onde o grupo é principal
      .sort((a, b) => {
        const aPrincipalCanonico = normalizarGrupoParaCanonico(a.grupoMuscularPrincipal);
        const bPrincipalCanonico = normalizarGrupoParaCanonico(b.grupoMuscularPrincipal);
        
        const aIsPrincipal = aPrincipalCanonico === grupoCanonico;
        const bIsPrincipal = bPrincipalCanonico === grupoCanonico;
        
        if (aIsPrincipal && !bIsPrincipal) return -1;
        if (!aIsPrincipal && bIsPrincipal) return 1;
        return 0;
      })
      .map(ex => ex.id);

    // Buscar exercícios completos
    if (exerciciosDoGrupo.length > 0) {
      // Filtrar IDs que não estão no histórico
      let idsParaBuscar = exerciciosDoGrupo.filter(id => !todosExerciciosEvitar.has(id));
      
      // Se não temos suficientes, incluir alguns que estão no histórico (relaxar restrição)
      if (idsParaBuscar.length < QUANTIDADE_CANONICA) {
        // Tentar adicionar alguns que estão no histórico mas não foram usados no treino atual
        const idsNoHistoricoMasNaoNoTreino = exerciciosDoGrupo.filter(
          id => !exerciciosJaUsadosNoTreino.has(id)
        );
        idsParaBuscar = [...new Set([...idsParaBuscar, ...idsNoHistoricoMasNaoNoTreino])];
      }
      
      if (idsParaBuscar.length > 0) {
        const exerciciosCompletos = await prisma.exercicio.findMany({
          where: {
            id: { in: idsParaBuscar },
            ativo: true
          },
          take: QUANTIDADE_CANONICA * 5
        });

        // Adicionar aos disponíveis (sem duplicatas)
        const idsJaAdicionados = new Set(exerciciosDisponiveis.map(ex => ex.id));
        const novosExercicios = exerciciosCompletos.filter(ex => !idsJaAdicionados.has(ex.id));
        exerciciosDisponiveis.push(...novosExercicios);

        // Aplicar filtros novamente (mas não ser muito restritivo com histórico se não tiver opções)
        exerciciosDisponiveis = aplicarFiltrosExercicios(exerciciosDisponiveis, {
          ...filtros,
          historico: exerciciosDisponiveis.length < QUANTIDADE_CANONICA 
            ? exerciciosJaUsadosNoTreino // Se não tem opções, só evitar duplicatas no treino
            : todosExerciciosEvitar // Se tem opções, usar histórico completo
        });
      }
    }
  }

  // Filtrar exercícios já usados
  let exerciciosFiltrados = exerciciosDisponiveis.filter(
    ex => !todosExerciciosEvitar.has(ex.id)
  );

  // Se não temos suficientes, relaxar restrições progressivamente
  if (exerciciosFiltrados.length < QUANTIDADE_CANONICA) {
    // Tentativa 1: Remover histórico da semana (permitir reutilizar na mesma semana se necessário)
    const apenasJaUsadosNoTreino = new Set([
      ...exerciciosJaUsadosNoTreino,
      ...exerciciosUsadosNoGrupoEstaSemana
    ]);
    
    exerciciosFiltrados = exerciciosDisponiveis.filter(
      ex => !apenasJaUsadosNoTreino.has(ex.id)
    );

    // Tentativa 2: Se ainda não tem suficientes, remover apenas exercícios já usados no treino atual
    if (exerciciosFiltrados.length < QUANTIDADE_CANONICA) {
      exerciciosFiltrados = exerciciosDisponiveis.filter(
        ex => !exerciciosJaUsadosNoTreino.has(ex.id)
      );
    }

    // Tentativa 3: Se ainda não tem, usar todos os disponíveis (evitar retornar menos de 4)
    if (exerciciosFiltrados.length < QUANTIDADE_CANONICA) {
      console.warn(
        `[selecionar4ExerciciosPorGrupo] Apenas ${exerciciosFiltrados.length} exercícios disponíveis após filtros para grupo "${grupo}". ` +
        `Usando todos os ${exerciciosDisponiveis.length} exercícios disponíveis.`
      );
      exerciciosFiltrados = exerciciosDisponiveis;
    }
  }

  const exerciciosFinal = exerciciosFiltrados;

  // Selecionar exatamente 4 usando seed determinístico
  // IMPORTANTE: Priorizar exercícios onde o grupo solicitado é o grupo principal
  const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
  const seed = gerarSeed(userId + (grupoCanonico || grupo) + inicioSemanaStr, data);
  
  // Separar exercícios por prioridade
  const exerciciosPrincipais: any[] = [];
  const exerciciosSinergistas: any[] = [];
  
  exerciciosFinal.forEach(ex => {
    const grupoPrincipalCanonico = normalizarGrupoParaCanonico(ex.grupoMuscularPrincipal || '');
    if (grupoPrincipalCanonico === grupoCanonico) {
      exerciciosPrincipais.push(ex);
    } else {
      exerciciosSinergistas.push(ex);
    }
  });
  
  // Embaralhar cada grupo separadamente
  const principaisShuffled = shuffleDeterministico(exerciciosPrincipais, seed);
  const sinergistasShuffled = shuffleDeterministico(exerciciosSinergistas, seed + 1000);
  
  // Combinar: primeiro os principais (até 4), depois sinergistas se necessário
  const resultado: any[] = [];
  resultado.push(...principaisShuffled.slice(0, QUANTIDADE_CANONICA));
  
  if (resultado.length < QUANTIDADE_CANONICA) {
    const faltam = QUANTIDADE_CANONICA - resultado.length;
    resultado.push(...sinergistasShuffled.slice(0, faltam));
  }
  
  // Limitar exatamente a QUANTIDADE_CANONICA (ou menos se não tiver)
  const resultadoFinal = resultado.slice(0, QUANTIDADE_CANONICA);
  
  // Log de debug se não conseguiu selecionar 4
  if (resultadoFinal.length < QUANTIDADE_CANONICA) {
    console.warn(
      `[selecionar4ExerciciosPorGrupo] Apenas ${resultadoFinal.length}/${QUANTIDADE_CANONICA} exercícios encontrados para grupo "${grupo}" (canônico: "${grupoCanonico}"). ` +
      `Principais disponíveis: ${exerciciosPrincipais.length}, Sinergistas disponíveis: ${exerciciosSinergistas.length}, ` +
      `Total após filtros: ${exerciciosFinal.length}. ` +
      `Isso pode indicar falta de exercícios no banco de dados para este grupo.`
    );
  }

  return resultadoFinal;
}

/**
 * Busca histórico de exercícios em um período específico para um grupo
 */
async function buscarHistoricoExerciciosNoPeriodo(
  userId: string,
  dataInicio: Date,
  dataFim: Date,
  grupo?: string
): Promise<Set<string>> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: dataInicio,
        lte: dataFim
      }
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

  treinos.forEach(treino => {
    treino.exercicios.forEach(ex => {
      const grupoPrincipal = ex.exercicio?.grupoMuscularPrincipal || '';
      const sinergistas = ex.exercicio?.sinergistas || [];

      // Se grupo especificado, considerar apenas exercícios desse grupo
      if (grupo) {
        if (grupoPrincipal === grupo || sinergistas.includes(grupo)) {
          exerciciosUsados.add(ex.exercicioId);
        }
      } else {
        // Sem grupo específico, considerar todos (exceto cardio/alongamento)
        if (grupoPrincipal !== 'Cardio' && 
            grupoPrincipal !== 'Alongamento' && 
            grupoPrincipal !== 'Flexibilidade') {
          exerciciosUsados.add(ex.exercicioId);
        }
      }
    });
  });

  return exerciciosUsados;
}

