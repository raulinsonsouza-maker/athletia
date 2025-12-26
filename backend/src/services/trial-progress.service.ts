import { prisma } from '../lib/prisma';

/**
 * Objetivo do trial: completar 2 treinos
 */
const TRIAL_GOAL_TRAININGS = 2;

/**
 * Obtém o progresso do trial de um usuário
 */
export async function obterProgressoTrial(userId: string): Promise<{
  treinosConcluidos: number;
  treinosRestantes: number;
  objetivo: number;
  progressoPercentual: number;
  diaAtual: number;
  diasTotais: number;
  diasRestantes: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dataInicioTrial: true,
      dataFimTrial: true,
      planoAtivo: true
    }
  });

  if (!user || !user.dataInicioTrial || !user.dataFimTrial) {
    return {
      treinosConcluidos: 0,
      treinosRestantes: TRIAL_GOAL_TRAININGS,
      objetivo: TRIAL_GOAL_TRAININGS,
      progressoPercentual: 0,
      diaAtual: 0,
      diasTotais: 0,
      diasRestantes: 0
    };
  }

  // Se já tem plano ativo, não está mais em trial
  if (user.planoAtivo) {
    return {
      treinosConcluidos: TRIAL_GOAL_TRAININGS,
      treinosRestantes: 0,
      objetivo: TRIAL_GOAL_TRAININGS,
      progressoPercentual: 100,
      diaAtual: 0,
      diasTotais: 0,
      diasRestantes: 0
    };
  }

  const agora = new Date();
  const dataInicio = new Date(user.dataInicioTrial);
  const dataFim = new Date(user.dataFimTrial);

  // Contar treinos concluídos durante o período de trial
  const treinosConcluidos = await prisma.treino.count({
    where: {
      userId,
      concluido: true,
      data: {
        gte: dataInicio,
        lte: agora > dataFim ? dataFim : agora
      }
    }
  });

  const treinosRestantes = Math.max(0, TRIAL_GOAL_TRAININGS - treinosConcluidos);
  const progressoPercentual = Math.round((treinosConcluidos / TRIAL_GOAL_TRAININGS) * 100);

  // Obter duração do trial da variável de ambiente (padrão: 3 dias)
  const trialDurationDays = parseInt(process.env.TRIAL_DURATION_DAYS || '3', 10);
  const diasTotais = trialDurationDays;

  // Calcular dia atual (1-indexed)
  const diffMs = agora.getTime() - dataInicio.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diaAtual = Math.min(diffDays + 1, diasTotais); // Máximo = diasTotais

  // Calcular dias restantes
  const restanteMs = dataFim.getTime() - agora.getTime();
  const diasRestantes = Math.max(0, Math.ceil(restanteMs / (1000 * 60 * 60 * 24)));

  return {
    treinosConcluidos,
    treinosRestantes,
    objetivo: TRIAL_GOAL_TRAININGS,
    progressoPercentual,
    diaAtual,
    diasTotais,
    diasRestantes
  };
}

/**
 * Verifica se o usuário completou o objetivo do trial (2 treinos)
 */
export async function verificarObjetivoTrialCompleto(userId: string): Promise<boolean> {
  const progresso = await obterProgressoTrial(userId);
  return progresso.treinosConcluidos >= TRIAL_GOAL_TRAININGS;
}

