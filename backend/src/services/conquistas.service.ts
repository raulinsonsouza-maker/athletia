import { prisma } from '../lib/prisma';

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  progresso?: number;
  progressoMaximo?: number;
  dataDesbloqueio?: Date;
}

/**
 * Calcula nível do usuário baseado em treinos concluídos
 */
export async function calcularNivelUsuario(userId: string): Promise<{ nivel: number; nome: string; progresso: number; proximoNivel: number }> {
  const treinosConcluidos = await prisma.treino.count({
    where: {
      userId,
      concluido: true
    }
  });

  // Sistema de níveis baseado em treinos concluídos
  // Nível 1: 0-4 treinos (Iniciante)
  // Nível 2: 5-14 treinos (Iniciante Dedicado)
  // Nível 3: 15-29 treinos (Intermediário)
  // Nível 4: 30-49 treinos (Intermediário Avançado)
  // Nível 5: 50-99 treinos (Avançado)
  // Nível 6: 100+ treinos (Expert)

  let nivel = 1;
  let nome = 'Iniciante';
  let proximoNivel = 5;

  if (treinosConcluidos >= 100) {
    nivel = 6;
    nome = 'Expert';
    proximoNivel = 100;
  } else if (treinosConcluidos >= 50) {
    nivel = 5;
    nome = 'Avançado';
    proximoNivel = 100;
  } else if (treinosConcluidos >= 30) {
    nivel = 4;
    nome = 'Intermediário Avançado';
    proximoNivel = 50;
  } else if (treinosConcluidos >= 15) {
    nivel = 3;
    nome = 'Intermediário';
    proximoNivel = 30;
  } else if (treinosConcluidos >= 5) {
    nivel = 2;
    nome = 'Iniciante Dedicado';
    proximoNivel = 15;
  }

  // Calcular progresso para próximo nível
  const treinosNoNivel = treinosConcluidos - (nivel === 1 ? 0 : nivel === 2 ? 5 : nivel === 3 ? 15 : nivel === 4 ? 30 : nivel === 5 ? 50 : 100);
  const treinosNecessarios = proximoNivel - (nivel === 1 ? 0 : nivel === 2 ? 5 : nivel === 3 ? 15 : nivel === 4 ? 30 : nivel === 5 ? 50 : 100);
  const progresso = nivel === 6 ? 100 : Math.round((treinosNoNivel / treinosNecessarios) * 100);

  return { nivel, nome, progresso, proximoNivel };
}

/**
 * Obtém todas as conquistas do usuário
 */
export async function obterConquistas(userId: string): Promise<Conquista[]> {
  const [
    treinosConcluidos,
    sequenciaAtual,
    melhorSequencia,
    treinosMes,
    treinosSemana
  ] = await Promise.all([
    prisma.treino.count({ where: { userId, concluido: true } }),
    calcularSequenciaAtual(userId),
    calcularMelhorSequencia(userId),
    calcularTreinosMes(userId),
    calcularTreinosSemana(userId)
  ]);

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const treinosConcluidosMes = await prisma.treino.count({
    where: {
      userId,
      concluido: true,
      data: { gte: inicioMes }
    }
  });

  const conquistas: Conquista[] = [
    {
      id: 'primeiro-treino',
      nome: 'Primeiro Passo',
      descricao: 'Complete seu primeiro treino',
      icone: 'target',
      desbloqueada: treinosConcluidos >= 1,
      progresso: treinosConcluidos >= 1 ? 100 : 0,
      progressoMaximo: 1,
      dataDesbloqueio: treinosConcluidos >= 1 ? new Date() : undefined
    },
    {
      id: '3-dias-seguidos',
      nome: 'Consistência Inicial',
      descricao: 'Treine 3 dias seguidos',
      icone: 'fire',
      desbloqueada: sequenciaAtual >= 3,
      progresso: Math.min(sequenciaAtual, 3),
      progressoMaximo: 3
    },
    {
      id: '7-dias-seguidos',
      nome: 'Semana Perfeita',
      descricao: 'Treine 7 dias seguidos',
      icone: 'muscle',
      desbloqueada: sequenciaAtual >= 7,
      progresso: Math.min(sequenciaAtual, 7),
      progressoMaximo: 7
    },
    {
      id: '10-treinos',
      nome: 'Dez Treinos',
      descricao: 'Complete 10 treinos',
      icone: 'star',
      desbloqueada: treinosConcluidos >= 10,
      progresso: Math.min(treinosConcluidos, 10),
      progressoMaximo: 10
    },
    {
      id: '25-treinos',
      nome: 'Vinte e Cinco',
      descricao: 'Complete 25 treinos',
      icone: 'trophy',
      desbloqueada: treinosConcluidos >= 25,
      progresso: Math.min(treinosConcluidos, 25),
      progressoMaximo: 25
    },
    {
      id: '50-treinos',
      nome: 'Cinquenta',
      descricao: 'Complete 50 treinos',
      icone: 'crown',
      desbloqueada: treinosConcluidos >= 50,
      progresso: Math.min(treinosConcluidos, 50),
      progressoMaximo: 50
    },
    {
      id: '100-treinos',
      nome: 'Centenário',
      descricao: 'Complete 100 treinos',
      icone: 'diamond',
      desbloqueada: treinosConcluidos >= 100,
      progresso: Math.min(treinosConcluidos, 100),
      progressoMaximo: 100
    },
    {
      id: 'meta-semanal',
      nome: 'Meta Semanal',
      descricao: 'Complete sua meta semanal de treinos',
      icone: 'medal',
      desbloqueada: treinosSemana.concluidos >= treinosSemana.meta,
      progresso: treinosSemana.concluidos,
      progressoMaximo: treinosSemana.meta
    },
    {
      id: '1-mes-consistente',
      nome: 'Um Mês',
      descricao: 'Treine consistentemente por 1 mês',
      icone: 'calendar',
      desbloqueada: melhorSequencia >= 30,
      progresso: Math.min(melhorSequencia, 30),
      progressoMaximo: 30
    }
  ];

  return conquistas;
}

/**
 * Verifica se há novas conquistas após completar um treino
 */
export async function verificarNovasConquistas(userId: string): Promise<Conquista[]> {
  const conquistas = await obterConquistas(userId);
  return conquistas.filter(c => c.desbloqueada && (!c.dataDesbloqueio || 
    (new Date().getTime() - new Date(c.dataDesbloqueio).getTime()) < 24 * 60 * 60 * 1000));
}

// Funções auxiliares
async function calcularSequenciaAtual(userId: string): Promise<number> {
  const progressaoService = await import('./progressao.service');
  return progressaoService.calcularSequenciaAtual(userId);
}

async function calcularMelhorSequencia(userId: string): Promise<number> {
  const progressaoService = await import('./progressao.service');
  return progressaoService.calcularMelhorSequencia(userId);
}

async function calcularTreinosMes(userId: string): Promise<number> {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  return prisma.treino.count({
    where: {
      userId,
      concluido: true,
      data: { gte: inicioMes }
    }
  });
}

async function calcularTreinosSemana(userId: string): Promise<{ concluidos: number; meta: number }> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const diaSemana = hoje.getDay();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - diaSemana);
  inicioSemana.setHours(0, 0, 0, 0);
  
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const perfil = await prisma.perfil.findUnique({
    where: { userId },
    select: { frequenciaSemanal: true }
  });

  const concluidos = await prisma.treino.count({
    where: {
      userId,
      concluido: true,
      data: { gte: inicioSemana, lte: fimSemana }
    }
  });

  return {
    concluidos,
    meta: perfil?.frequenciaSemanal || 3
  };
}

