import { prisma } from '../lib/prisma';

/**
 * Calcula a data de fim do trial (24 horas após o início)
 */
export function calcularDataFimTrial(dataInicio: Date): Date {
  const dataFim = new Date(dataInicio);
  dataFim.setHours(dataFim.getHours() + 24);
  return dataFim;
}

/**
 * Calcula o estágio atual do trial baseado nas datas de início e fim
 * Retorna: 'D1' (0-24h), 'D2' (24-48h), 'D3' (48-72h), ou 'EXPIrado' (>72h ou já expirado)
 * Nota: Para trials de 24 horas, a maioria dos usuários estará em D1 durante todo o período
 */
export function calcularEstagioTrial(dataInicio: Date | null, dataFim: Date | null, agora?: Date): 'D1' | 'D2' | 'D3' | 'EXPIrado' {
  if (!dataInicio || !dataFim) {
    return 'EXPIrado';
  }

  const agoraDate = agora || new Date();
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  // Se já passou da data de fim, está expirado
  if (fim <= agoraDate) {
    return 'EXPIrado';
  }

  // Calcular horas desde o início
  const diffMs = agoraDate.getTime() - inicio.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // D1: 0-24h
  if (diffHours < 24) {
    return 'D1';
  }

  // D2: 24-48h
  if (diffHours < 48) {
    return 'D2';
  }

  // D3: 48-72h
  if (diffHours < 72) {
    return 'D3';
  }

  // Mais de 72h = expirado
  return 'EXPIrado';
}

/**
 * Verifica se o trial está ativo para um usuário
 */
export async function verificarTrialAtivo(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dataFimTrial: true,
      planoAtivo: true
    }
  });

  if (!user || !user.dataFimTrial) {
    return false;
  }

  // Se já tem plano ativo, não considera trial
  if (user.planoAtivo) {
    return false;
  }

  // Verifica se a data de fim do trial ainda não passou
  const agora = new Date();
  const dataFimTrial = new Date(user.dataFimTrial);
  
  return dataFimTrial > agora;
}

/**
 * Retorna o número de dias restantes do trial
 */
export async function obterDiasRestantesTrial(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dataFimTrial: true
    }
  });

  if (!user || !user.dataFimTrial) {
    return 0;
  }

  const agora = new Date();
  const dataFimTrial = new Date(user.dataFimTrial);
  
  if (dataFimTrial <= agora) {
    return 0;
  }

  const diffMs = dataFimTrial.getTime() - agora.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Verifica se o trial já foi utilizado (para um email)
 */
export async function verificarTrialUtilizado(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      trialUtilizado: true
    }
  });

  return user?.trialUtilizado ?? false;
}

/**
 * Inicia o trial para um usuário
 */
export async function iniciarTrial(userId: string): Promise<void> {
  const dataInicio = new Date();
  const dataFim = calcularDataFimTrial(dataInicio);

  await prisma.user.update({
    where: { id: userId },
    data: {
      dataInicioTrial: dataInicio,
      dataFimTrial: dataFim,
      trialUtilizado: true
    }
  });
}

/**
 * Obtém informações completas do trial de um usuário
 */
export async function obterStatusTrial(userId: string): Promise<{
  ativo: boolean;
  diasRestantes: number;
  dataInicio: Date | null;
  dataFim: Date | null;
  trialUtilizado: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dataInicioTrial: true,
      dataFimTrial: true,
      trialUtilizado: true,
      planoAtivo: true
    }
  });

  if (!user) {
    return {
      ativo: false,
      diasRestantes: 0,
      dataInicio: null,
      dataFim: null,
      trialUtilizado: false
    };
  }

  const ativo = await verificarTrialAtivo(userId);
  const diasRestantes = await obterDiasRestantesTrial(userId);

  return {
    ativo,
    diasRestantes,
    dataInicio: user.dataInicioTrial,
    dataFim: user.dataFimTrial,
    trialUtilizado: user.trialUtilizado ?? false
  };
}
