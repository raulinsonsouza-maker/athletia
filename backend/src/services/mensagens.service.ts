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

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nome = user?.nome || 'atleta';

  // Mensagens baseadas em sequência
  if (sequenciaAtual >= 7) {
    return `${saudacao}, ${nome}! Você está em uma sequência incrível de ${sequenciaAtual} dias seguidos. Continue assim!`;
  }

  if (sequenciaAtual >= 3) {
    return `${saudacao}, ${nome}! Você está mantendo uma boa sequência de ${sequenciaAtual} dias. Cada treino te aproxima do seu objetivo!`;
  }

  // Mensagens baseadas em evolução de peso
  if (evolucaoPeso.diferenca && evolucaoPeso.diferenca < 0 && Math.abs(evolucaoPeso.diferenca) >= 2) {
    return `${saudacao}, ${nome}! Você já perdeu ${Math.abs(evolucaoPeso.diferenca).toFixed(1)}kg desde que começou. Resultados reais!`;
  }

  if (evolucaoPeso.diferenca && evolucaoPeso.diferenca > 0 && evolucaoPeso.diferenca >= 2) {
    return `${saudacao}, ${nome}! Você ganhou ${evolucaoPeso.diferenca.toFixed(1)}kg de massa. Continue focado!`;
  }

  // Mensagens baseadas em treinos do mês
  if (treinosMes >= 20) {
    return `${saudacao}, ${nome}! Você já fez ${treinosMes} treinos este mês. Dedicação exemplar!`;
  }

  if (treinosMes >= 10) {
    return `${saudacao}, ${nome}! Você já completou ${treinosMes} treinos este mês. Continue assim!`;
  }

  // Mensagens baseadas em objetivo
  if (perfil?.objetivo) {
    const objetivo = perfil.objetivo.toLowerCase();
    if (objetivo.includes('hipertrofia') || objetivo.includes('ganho')) {
      return `${saudacao}, ${nome}! Seu objetivo é ganho de massa. Foco da semana: Intensidade e consistência.`;
    }
    if (objetivo.includes('emagrecimento') || objetivo.includes('perda')) {
      return `${saudacao}, ${nome}! Seu objetivo é emagrecimento. Cada treino te aproxima da sua melhor versão!`;
    }
    if (objetivo.includes('força')) {
      return `${saudacao}, ${nome}! Seu objetivo é força. Continue progredindo nas cargas!`;
    }
  }

  // Mensagens baseadas em nível
  if (nivel.nivel >= 4) {
    return `${saudacao}, ${nome}! Você está no nível ${nivel.nome}. Continue evoluindo!`;
  }

  // Mensagem padrão motivacional
  const mensagensPadrao = [
    `${saudacao}, ${nome}! Cada treino concluído é mais perto da sua melhor versão.`,
    `${saudacao}, ${nome}! A consistência é a chave do sucesso. Continue treinando!`,
    `${saudacao}, ${nome}! Seu progresso é resultado da sua dedicação. Parabéns!`,
    `${saudacao}, ${nome}! Hoje é um novo dia para evoluir. Vamos treinar!`
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

