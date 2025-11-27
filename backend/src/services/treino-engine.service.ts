/**
 * TREINO ENGINE SERVICE
 * 
 * Motor centralizado de geração de treinos inteligentes.
 * Ponto único de entrada para toda lógica de criação de planos de treino.
 */

import { prisma } from '../lib/prisma';
import { garantirPerfilParaInteligencia } from './perfil.service';
import { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } from './treino.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type PerfilTreino = Awaited<ReturnType<typeof garantirPerfilParaInteligencia>>;

interface TreinoEngineConfig {
  userId: string;
  dataReferencia?: Date;
  forcarRegeneracao?: boolean;
}

interface TreinoGerado {
  id: string;
  nome: string;
  data: Date;
  gruposPrincipais: string[];
  totalExercicios: number;
  tempoEstimado: number;
  tipo: string;
}

// ============================================================================
// CONFIGURAÇÕES DE SPLITS
// ============================================================================

// Nomes inteligentes para cada tipo de split
const NOMES_SPLITS: Record<number, Record<number, string>> = {
  1: { 0: 'Full Body' },
  2: {
    0: 'Superior (Push + Pull)',
    1: 'Inferior + Core'
  },
  3: {
    0: 'Peito, Ombros e Tríceps',
    1: 'Costas, Bíceps e Posteriores',
    2: 'Pernas e Abdômen'
  },
  4: {
    0: 'Peito e Tríceps',
    1: 'Costas e Bíceps',
    2: 'Quadríceps e Panturrilhas',
    3: 'Posteriores, Glúteos e Ombros'
  },
  5: {
    0: 'Peito e Tríceps',
    1: 'Costas e Bíceps',
    2: 'Quadríceps e Glúteos',
    3: 'Posteriores e Panturrilhas',
    4: 'Ombros e Abdômen'
  },
  6: {
    0: 'Peito',
    1: 'Costas',
    2: 'Quadríceps',
    3: 'Posteriores',
    4: 'Ombros',
    5: 'Braços e Core'
  }
};

const SPLITS_GRUPOS: Record<number, string[][]> = {
  1: [['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']],
  2: [
    ['Peito', 'Ombros', 'Tríceps', 'Costas', 'Bíceps'],
    ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']
  ],
  3: [
    ['Peito', 'Ombros', 'Tríceps'],
    ['Costas', 'Bíceps', 'Posteriores'],
    ['Quadríceps', 'Glúteos', 'Panturrilhas', 'Abdômen']
  ],
  4: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Panturrilhas'],
    ['Posteriores', 'Glúteos', 'Ombros', 'Abdômen']
  ],
  5: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Glúteos'],
    ['Posteriores', 'Panturrilhas'],
    ['Ombros', 'Abdômen']
  ],
  6: [
    ['Peito'],
    ['Costas'],
    ['Quadríceps'],
    ['Posteriores'],
    ['Ombros'],
    ['Bíceps', 'Tríceps', 'Abdômen']
  ]
};

// Letras para identificação dos treinos (sem repetição na semana)
const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarData(data: Date): Date {
  const dt = new Date(data);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function obterInicioSemana(data: Date): Date {
  const inicio = normalizarData(data);
  const diaSemana = inicio.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana; // Segunda como início
  inicio.setDate(inicio.getDate() + diff);
  return inicio;
}

function obterFimSemana(inicioSemana: Date): Date {
  const fim = new Date(inicioSemana);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

function gerarNomeTreino(frequencia: number, indiceDia: number): string {
  const letra = LETRAS_TREINO[indiceDia];
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia % frequencia];
  if (nomeBase) {
    return `Treino ${letra} - ${nomeBase}`;
  }
  return `Treino ${letra}`;
}

function obterGruposDoDia(frequencia: number, indiceDia: number): string[] {
  const splits = SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  return splits[indiceDia % splits.length] || splits[0];
}

/**
 * Calcula tempo estimado do treino considerando:
 * - Cardio: 20-30 min (sempre primeiro)
 * - Exercícios de força: variável baseado no objetivo
 * - Alongamento: 5-10 min (sempre último)
 */
function calcularTempoEstimado(
  totalExerciciosForca: number, 
  objetivo: string, 
  series: number, 
  descanso: number
): number {
  const tempoCardio = 25; // 20-30 min de cardio
  const tempoAlongamento = 7; // 5-10 min de alongamento
  
  // Tempo por exercício de força: (séries × tempo execução) + (descanso × séries-1)
  const tempoExecucao = 0.5; // 30 segundos por série
  const tempoPorExercicio = (series * tempoExecucao) + ((series - 1) * (descanso / 60));
  
  const tempoForca = totalExerciciosForca * tempoPorExercicio;
  
  return Math.ceil(tempoCardio + tempoForca + tempoAlongamento);
}

/**
 * Calcula máximo de exercícios de força baseado no tempo disponível
 * Considera: tempo disponível - cardio (25min) - alongamento (7min) = tempo para força
 */
function calcularMaxExerciciosPorTempo(
  tempoDisponivel: number, 
  series: number, 
  descanso: number
): number {
  const tempoCardio = 25; // Cardio sempre primeiro
  const tempoAlongamento = 7; // Alongamento sempre último
  const tempoUtil = tempoDisponivel - tempoCardio - tempoAlongamento;
  
  if (tempoUtil <= 0) {
    return 2; // Mínimo 2 exercícios mesmo com pouco tempo
  }
  
  // Tempo por exercício de força
  const tempoExecucao = 0.5; // 30 segundos por série
  const tempoPorExercicio = (series * tempoExecucao) + ((series - 1) * (descanso / 60));
  
  const maxExercicios = Math.floor(tempoUtil / tempoPorExercicio);
  
  // Limites razoáveis
  if (maxExercicios < 2) return 2;
  if (maxExercicios > 10) return 10; // Máximo 10 exercícios de força
  
  return maxExercicios;
}

/**
 * Determina quantos exercícios cada grupo deve ter baseado no tipo de treino (letra)
 * Garante consistência: mesmo tipo de treino sempre tem mesmo número de exercícios
 * Retorna um Map com grupo -> quantidade de exercícios
 */
function determinarExerciciosPorGrupoMap(letraTreino: string, grupos: string[]): Map<string, number> {
  const mapa = new Map<string, number>();
  const letra = letraTreino.toUpperCase();

  // Padrões fixos baseados no tipo de treino para garantir consistência
  switch (letra) {
    case 'D': // Inferiores completos
      // Padrão: 2 quadríceps + 2 posteriores + 1 panturrilha + 1 abdômen = 6 exercícios
      grupos.forEach(grupo => {
        if (grupo === 'Quadríceps' || grupo === 'Posteriores') {
          mapa.set(grupo, 2);
        } else if (grupo === 'Panturrilhas' || grupo === 'Abdômen') {
          mapa.set(grupo, 1);
        } else {
          mapa.set(grupo, 1); // Padrão para outros grupos
        }
      });
      break;

    case 'E': // Superiores leves
      // Padrão: 1 ombro + 1 tríceps + 1 bíceps + 1 abdômen = 4 exercícios
      grupos.forEach(grupo => {
        mapa.set(grupo, 1);
      });
      break;

    case 'A': // Peito + Ombros + Tríceps
      grupos.forEach(grupo => {
        if (grupo === 'Peito' || grupo === 'Ombros') {
          mapa.set(grupo, 2);
        } else {
          mapa.set(grupo, 1);
        }
      });
      break;

    case 'B': // Costas + Bíceps
      grupos.forEach(grupo => {
        if (grupo === 'Costas') {
          mapa.set(grupo, 2);
        } else {
          mapa.set(grupo, 1);
        }
      });
      break;

    case 'C': // Pernas + Abdômen
      grupos.forEach(grupo => {
        if (grupo === 'Abdômen') {
          mapa.set(grupo, 2); // 1-2 exercícios de abdômen
        } else {
          mapa.set(grupo, 1);
        }
      });
      break;

    default:
      // Padrão inteligente baseado na quantidade de grupos
      const quantidadePadrao = grupos.length <= 2 ? 3 : 2;
      grupos.forEach(grupo => {
        mapa.set(grupo, quantidadePadrao);
      });
  }

  return mapa;
}

/**
 * Calcula parâmetros do treino baseado no objetivo e experiência
 */
function calcularParametrosTreino(objetivo: string, experiencia: string): {
  series: number;
  repeticoes: string;
  rpe: number;
  descanso: number;
} {
  // Baseado no objetivo
  if (objetivo === 'Força') {
    return { series: 5, repeticoes: '3-5', rpe: 8, descanso: 180 };
  }
  if (objetivo === 'Emagrecimento') {
    return { series: 3, repeticoes: '15-20', rpe: 7, descanso: 45 };
  }
  // Hipertrofia (padrão)
  const series = experiencia === 'Iniciante' ? 3 : experiencia === 'Avançado' ? 4 : 3;
  return { series, repeticoes: '8-12', rpe: 8, descanso: 90 };
}

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Busca histórico recente de exercícios para evitar repetição
 */
async function buscarHistoricoExercicios(userId: string, dias: number = 14): Promise<Set<string>> {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: dataLimite }
    },
    include: {
      exercicios: {
        select: { exercicioId: true }
      }
    }
  });

  const exerciciosUsados = new Set<string>();
  treinos.forEach(treino => {
    treino.exercicios.forEach(ex => {
      exerciciosUsados.add(ex.exercicioId);
    });
  });

  return exerciciosUsados;
}

/**
 * Seleciona exercícios inteligentemente para um grupo muscular
 */
async function selecionarExerciciosParaGrupo(
  grupo: string,
  perfil: PerfilTreino,
  exerciciosEvitar: Set<string>,
  quantidade: number = 2
): Promise<any[]> {
  // Buscar exercícios do grupo, priorizando compostos
  const exerciciosDisponiveis = await prisma.exercicio.findMany({
    where: {
      ativo: true,
      grupoMuscularPrincipal: grupo,
      id: { notIn: Array.from(exerciciosEvitar) }
    },
    orderBy: [
      { createdAt: 'asc' } // Variar exercícios
    ],
    take: quantidade * 3 // Buscar mais para ter opções
  });

  if (exerciciosDisponiveis.length === 0) {
    // Fallback: buscar por sinergistas
    const fallback = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        sinergistas: { has: grupo },
        id: { notIn: Array.from(exerciciosEvitar) }
      },
      take: quantidade
    });
    return fallback;
  }

  // Selecionar quantidade necessária com alguma aleatoriedade
  const selecionados: any[] = [];
  const shuffled = exerciciosDisponiveis.sort(() => Math.random() - 0.5);
  
  for (const ex of shuffled) {
    if (selecionados.length >= quantidade) break;
    selecionados.push(ex);
    exerciciosEvitar.add(ex.id);
  }

  return selecionados;
}

/**
 * Gera um treino completo para um dia específico
 */
async function gerarTreinoDoDia(
  userId: string,
  perfil: PerfilTreino,
  data: Date,
  indiceDia: number,
  exerciciosEvitar: Set<string>
): Promise<TreinoGerado | null> {
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);
  const grupos = obterGruposDoDia(frequencia, indiceDia);
  const nomeTreino = gerarNomeTreino(frequencia, indiceDia);

  // Filtrar grupos por lesões do usuário
  const gruposFiltrados = grupos.filter(grupo => {
    if (!perfil.lesoes || perfil.lesoes.length === 0) return true;
    // Lógica simplificada - pode ser expandida
    return true;
  });

  if (gruposFiltrados.length === 0) return null;

  // Determinar quantos exercícios por grupo baseado no tipo de treino (letra)
  // Isso garante consistência: mesmo tipo de treino sempre tem mesmo número de exercícios
  const letraTreino = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
  
  const todosExercicios: any[] = [];

  // Mapear quantos exercícios cada grupo deve ter baseado no tipo de treino
  const exerciciosPorGrupoMap = determinarExerciciosPorGrupoMap(letraTreino, gruposFiltrados);

  for (const grupo of gruposFiltrados) {
    const quantidade = exerciciosPorGrupoMap.get(grupo) || 2; // Padrão: 2 exercícios
    const exercicios = await selecionarExerciciosParaGrupo(
      grupo,
      perfil,
      exerciciosEvitar,
      quantidade
    );
    todosExercicios.push(...exercicios);
  }

  if (todosExercicios.length === 0) return null;

  // Calcular parâmetros de treino baseado no objetivo e experiência
  const parametros = calcularParametrosTreino(
    perfil.objetivo || 'Hipertrofia',
    perfil.experiencia || 'Intermediário'
  );

  // Limitar exercícios baseado no tempo disponível do usuário
  const tempoDisponivel = Math.min(perfil.tempoDisponivel || 60, 120);
  const maxExercicios = calcularMaxExerciciosPorTempo(tempoDisponivel, parametros.series, parametros.descanso);
  
  // Limitar exercícios de força ao máximo permitido pelo tempo
  const exerciciosForcaLimitados = todosExercicios.slice(0, maxExercicios);
  
  console.log(`[INFO] Tempo disponível: ${tempoDisponivel}min -> Máximo de ${maxExercicios} exercícios de força`);
  console.log(`[INFO] Exercícios selecionados: ${exerciciosForcaLimitados.length} de ${todosExercicios.length} disponíveis`);

  // Criar treino no banco
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: normalizarData(data),
      nome: nomeTreino,
      tipo: 'Treino IA',
      criadoPor: 'IA',
      concluido: false,
      letraTreino: LETRAS_TREINO[indiceDia % LETRAS_TREINO.length],
      tempoEstimado: 0 // Será recalculado depois
    }
  });

  // 1. ADICIONAR CARDIO PRIMEIRO (ordem 0) - SEMPRE
  const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioCardio.id,
      ordem: 0, // PRIMEIRO - sempre
      series: 1,
      repeticoes: '20-30 min',
      carga: null,
      rpe: 5,
      descanso: 0,
      concluido: false,
      observacoes: 'Aquecimento cardiovascular'
    }
  });

  // 2. ADICIONAR EXERCÍCIOS DE FORÇA (ordem 1, 2, 3...)
  let ordem = 1;
  for (const exercicio of exerciciosForcaLimitados) {
    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.id,
        ordem: ordem++,
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      }
    });
  }

  // 3. ADICIONAR ALONGAMENTO POR ÚLTIMO (ordem final) - SEMPRE
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioAlongamento.id,
      ordem: ordem, // ÚLTIMO - sempre
      series: 1,
      repeticoes: '5-10 min',
      carga: null,
      rpe: 3,
      descanso: 0,
      concluido: false,
      observacoes: 'Alongamento geral de todos os grupos musculares'
    }
  });

  // Calcular tempo estimado total (cardio + força + alongamento)
  const tempoEstimado = calcularTempoEstimado(
    exerciciosForcaLimitados.length,
    perfil.objetivo || 'Hipertrofia',
    parametros.series,
    parametros.descanso
  );

  // Atualizar tempo estimado do treino
  await prisma.treino.update({
    where: { id: treino.id },
    data: { tempoEstimado }
  });

  // Total de exercícios = cardio (1) + força (N) + alongamento (1)
  const totalExercicios = 1 + exerciciosForcaLimitados.length + 1;

  return {
    id: treino.id,
    nome: nomeTreino,
    data: treino.data,
    gruposPrincipais: gruposFiltrados.slice(0, 2),
    totalExercicios,
    tempoEstimado,
    tipo: treino.tipo
  };
}

/**
 * Garante que existe um plano semanal completo para o usuário
 * Gera treinos baseados na frequência semanal do onboarding:
 * - 3 dias = A-B-C
 * - 4 dias = A-B-C-D
 * - 5 dias = A-B-C-D-E
 * - 6 dias = A-B-C-D-E-F
 * 
 * Cada treino sempre inclui:
 * - Cardio primeiro (ordem 0)
 * - Exercícios de força no meio (limitados pelo tempo disponível)
 * - Alongamento por último
 */
export async function garantirPlanoSemanal(config: TreinoEngineConfig): Promise<TreinoGerado[]> {
  const { userId, dataReferencia = new Date(), forcarRegeneracao = false } = config;

  // Validar perfil
  const perfil = await garantirPerfilParaInteligencia(userId);
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);

  console.log(`[INFO] Gerando plano semanal para usuário ${userId}`);
  console.log(`[INFO] Frequência semanal: ${frequencia} dias`);
  console.log(`[INFO] Objetivo: ${perfil.objetivo || 'Hipertrofia'}`);
  console.log(`[INFO] Tempo disponível: ${perfil.tempoDisponivel || 60} minutos`);

  // Calcular período da semana
  const inicioSemana = obterInicioSemana(dataReferencia);
  const fimSemana = obterFimSemana(inicioSemana);

  // Verificar treinos existentes
  const treinosExistentes = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      },
      criadoPor: 'IA'
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { data: 'asc' }
  });

  // Se já tem treinos suficientes e não forçar regeneração, retornar
  if (!forcarRegeneracao && treinosExistentes.length >= frequencia) {
    console.log(`[INFO] Já existem ${treinosExistentes.length} treinos para esta semana`);
    return treinosExistentes.map((t) => ({
      id: t.id,
      nome: t.nome,
      data: t.data,
      gruposPrincipais: extrairGruposPrincipais(t.exercicios),
      totalExercicios: t.exercicios.length,
      tempoEstimado: t.tempoEstimado || 60,
      tipo: t.tipo
    }));
  }

  // Limpar treinos IA existentes da semana
  await prisma.treino.deleteMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      },
      criadoPor: 'IA'
    }
  });

  // Buscar histórico para evitar repetição
  const exerciciosEvitar = await buscarHistoricoExercicios(userId);

  // Determinar dias da semana para treinar baseado na frequência
  const diasTreino: number[] = [];
  if (frequencia === 1) diasTreino.push(1); // Segunda
  else if (frequencia === 2) diasTreino.push(1, 4); // Segunda e Quinta
  else if (frequencia === 3) diasTreino.push(1, 3, 5); // Segunda, Quarta, Sexta
  else if (frequencia === 4) diasTreino.push(1, 2, 4, 5); // Segunda, Terça, Quinta, Sexta
  else if (frequencia === 5) diasTreino.push(1, 2, 3, 4, 5); // Segunda a Sexta
  else if (frequencia === 6) diasTreino.push(1, 2, 3, 4, 5, 6); // Segunda a Sábado

  console.log(`[INFO] Dias de treino: ${diasTreino.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ')}`);

  // Gerar novos treinos (A, B, C, D, E, F conforme frequência)
  const treinosGerados: TreinoGerado[] = [];

  for (let i = 0; i < frequencia; i++) {
    const diaSemana = diasTreino[i];
    const dataTreino = new Date(inicioSemana);
    dataTreino.setDate(dataTreino.getDate() + (diaSemana - 1)); // Ajustar para o dia correto da semana

    console.log(`[INFO] Gerando Treino ${LETRAS_TREINO[i]} para ${dataTreino.toLocaleDateString('pt-BR')}`);

    const treino = await gerarTreinoDoDia(userId, perfil, dataTreino, i, exerciciosEvitar);

    if (treino) {
      treinosGerados.push(treino);
      console.log(`[OK] Treino ${LETRAS_TREINO[i]} criado: ${treino.totalExercicios} exercícios (${treino.tempoEstimado} min)`);
    }
  }

  console.log(`[OK] Plano semanal completo: ${treinosGerados.length} treinos gerados`);
  return treinosGerados;
}

/**
 * Extrai os grupos musculares principais de um treino
 * Exclui cardio e alongamento, apenas grupos de força
 */
function extrairGruposPrincipais(exercicios: any[]): string[] {
  const grupos = new Set<string>();
  const gruposIgnorar = ['Cardio', 'Alongamento'];

  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    if (grupo && !gruposIgnorar.includes(grupo)) {
      grupos.add(grupo);
    }
  });

  return Array.from(grupos).slice(0, 3);
}

/**
 * Busca um treino específico por ID com dados completos
 */
export async function buscarTreinoCompleto(userId: string, treinoId: string) {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treino) return null;

  return {
    ...treino,
    gruposPrincipais: extrairGruposPrincipais(treino.exercicios)
  };
}

/**
 * Lista treinos da semana com informações resumidas
 */
export async function listarTreinosSemana(userId: string, dataReferencia?: Date): Promise<TreinoGerado[]> {
  const data = dataReferencia || new Date();
  const inicioSemana = obterInicioSemana(data);
  const fimSemana = obterFimSemana(inicioSemana);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      }
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { data: 'asc' }
  });

  return treinos.map(t => ({
    id: t.id,
    nome: t.nome,
    data: t.data,
    gruposPrincipais: extrairGruposPrincipais(t.exercicios),
    totalExercicios: t.exercicios.length,
    tempoEstimado: t.tempoEstimado || 60,
    tipo: t.tipo
  }));
}

export default {
  garantirPlanoSemanal,
  buscarTreinoCompleto,
  listarTreinosSemana
};

