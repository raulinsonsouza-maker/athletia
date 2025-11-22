import { prisma } from '../lib/prisma';
import { calcularSequenciaAtual, calcularEvolucaoPeso } from './progressao.service';

/**
 * Gera mensagem motivacional personalizada baseada no contexto do usuário
 */
export async function gerarMensagemMotivacional(userId: string): Promise<string> {
  const [user, perfil, treinosMes, sequenciaAtual, evolucaoPeso] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { nome: true }
    }),
    prisma.perfil.findUnique({
      where: { userId },
      select: { objetivo: true, experiencia: true }
    }),
    calcularTreinosMes(userId),
    calcularSequenciaAtual(userId),
    calcularEvolucaoPeso(userId),
    ]);

  const conquistasService = await import('./conquistas.service');
  const nivel = await conquistasService.calcularNivelUsuario(userId);

  const nome = user?.nome || 'atleta';

  // Mensagens baseadas em sequência
  if (sequenciaAtual >= 7) {
    return `Você está em uma sequência incrível de ${sequenciaAtual} dias seguidos. Continue assim!`;
  }

  if (sequenciaAtual >= 3) {
    return `Você está mantendo uma boa sequência de ${sequenciaAtual} dias. Cada treino te aproxima do seu objetivo!`;
  }

  // Mensagens baseadas em evolução de peso
  if (evolucaoPeso.diferenca && evolucaoPeso.diferenca < 0 && Math.abs(evolucaoPeso.diferenca) >= 2) {
    return `Você já perdeu ${Math.abs(evolucaoPeso.diferenca).toFixed(1)}kg desde que começou. Resultados reais!`;
  }

  if (evolucaoPeso.diferenca && evolucaoPeso.diferenca > 0 && evolucaoPeso.diferenca >= 2) {
    return `Você ganhou ${evolucaoPeso.diferenca.toFixed(1)}kg de massa. Continue focado!`;
  }

  // Mensagens baseadas em treinos do mês
  if (treinosMes >= 20) {
    return `Você já fez ${treinosMes} treinos este mês. Dedicação exemplar!`;
  }

  if (treinosMes >= 10) {
    return `Você já completou ${treinosMes} treinos este mês. Continue assim!`;
  }

  // Mensagens baseadas em objetivo
  if (perfil?.objetivo) {
    const objetivo = perfil.objetivo.toLowerCase();
    if (objetivo.includes('hipertrofia') || objetivo.includes('ganho')) {
      return `Seu objetivo é ganho de massa. Foco da semana: Intensidade e consistência.`;
    }
    if (objetivo.includes('emagrecimento') || objetivo.includes('perda')) {
      return `Seu objetivo é emagrecimento. Cada treino te aproxima da sua melhor versão!`;
    }
    if (objetivo.includes('força')) {
      return `Seu objetivo é força. Continue progredindo nas cargas!`;
    }
  }

  // Mensagens baseadas em nível
  if (nivel.nivel >= 4) {
    return `Você está no nível ${nivel.nome}. Continue evoluindo!`;
  }

  // Mensagem padrão motivacional
  const mensagensPadrao = [
    `Cada treino concluído é mais perto da sua melhor versão.`,
    `A consistência é a chave do sucesso. Continue treinando!`,
    `Seu progresso é resultado da sua dedicação. Parabéns!`,
    `Hoje é um novo dia para evoluir. Vamos treinar!`
  ];

  return mensagensPadrao[Math.floor(Math.random() * mensagensPadrao.length)];
}

// Função auxiliar
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

