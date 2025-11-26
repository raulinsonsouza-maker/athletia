/**
 * TREINO ENGINE SERVICE
 * 
 * Motor centralizado de geração de treinos inteligentes.
 * Ponto único de entrada para toda lógica de criação de planos de treino.
 */

import { prisma } from '../lib/prisma';
import { garantirPerfilParaInteligencia } from './perfil.service';

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

// Letras para identificação dos treinos
const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F'];

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
  const letra = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia] || `Treino ${letra}`;
  return `Treino ${letra} - ${nomeBase}`;
}

function obterGruposDoDia(frequencia: number, indiceDia: number): string[] {
  const splits = SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  return splits[indiceDia % splits.length] || splits[0];
}

function calcularTempoEstimado(totalExercicios: number, objetivo: string): number {
  const tempoBase = objetivo === 'Força' ? 12 : objetivo === 'Emagrecimento' ? 8 : 10;
  return totalExercicios * tempoBase;
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

  // Determinar quantos exercícios por grupo
  const exerciciosPorGrupo = gruposFiltrados.length <= 2 ? 3 : 2;
  const todosExercicios: any[] = [];

  for (const grupo of gruposFiltrados) {
    const exercicios = await selecionarExerciciosParaGrupo(
      grupo,
      perfil,
      exerciciosEvitar,
      exerciciosPorGrupo
    );
    todosExercicios.push(...exercicios);
  }

  if (todosExercicios.length === 0) return null;

  // Calcular parâmetros de treino
  const parametros = calcularParametrosTreino(
    perfil.objetivo || 'Hipertrofia',
    perfil.experiencia || 'Intermediário'
  );

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
      tempoEstimado: calcularTempoEstimado(todosExercicios.length, perfil.objetivo || 'Hipertrofia')
    }
  });

  // Criar exercícios do treino
  for (let ordem = 0; ordem < todosExercicios.length; ordem++) {
    const exercicio = todosExercicios[ordem];

    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.id,
        ordem,
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      }
    });
  }

  return {
    id: treino.id,
    nome: nomeTreino,
    data: treino.data,
    gruposPrincipais: gruposFiltrados.slice(0, 2),
    totalExercicios: todosExercicios.length,
    tempoEstimado: treino.tempoEstimado || 60,
    tipo: treino.tipo
  };
}

/**
 * Garante que existe um plano semanal completo para o usuário
 */
export async function garantirPlanoSemanal(config: TreinoEngineConfig): Promise<TreinoGerado[]> {
  const { userId, dataReferencia = new Date(), forcarRegeneracao = false } = config;

  // Validar perfil
  const perfil = await garantirPerfilParaInteligencia(userId);
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);

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
    return treinosExistentes.map((t, idx) => ({
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

  // Gerar novos treinos
  const treinosGerados: TreinoGerado[] = [];

  for (let i = 0; i < frequencia; i++) {
    const dataTreino = new Date(inicioSemana);
    dataTreino.setDate(dataTreino.getDate() + i);

    const treino = await gerarTreinoDoDia(userId, perfil, dataTreino, i, exerciciosEvitar);

    if (treino) {
      treinosGerados.push(treino);
    }
  }

  return treinosGerados;
}

/**
 * Extrai os grupos musculares principais de um treino
 */
function extrairGruposPrincipais(exercicios: any[]): string[] {
  const grupos = new Set<string>();

  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    if (grupo) grupos.add(grupo);
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

