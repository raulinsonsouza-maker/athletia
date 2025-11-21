import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { buscarTreinoDoDia, buscarTreinosSemanais } from '../services/treino.service';
import { calcularEvolucaoPeso, calcularSequenciaAtual, calcularMelhorSequencia, calcularProgressaoForca, calcularEstatisticasProgresso } from '../services/progressao.service';
import { calcularNivelUsuario, obterConquistas } from '../services/conquistas.service';
import { gerarMensagemMotivacional } from '../services/mensagens.service';
import { prisma } from '../lib/prisma';

/**
 * Obter resumo completo do dashboard
 */
export const obterResumoDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Buscar dados em paralelo
    const [
      user,
      perfil,
      treinoHoje,
      evolucaoPeso,
      sequenciaAtual,
      melhorSequencia,
      progressaoForca,
      estatisticas,
      nivel,
      conquistas,
      mensagemMotivacional
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { nome: true, modoTreino: true }
      }),
      prisma.perfil.findUnique({
        where: { userId },
        select: { objetivo: true, frequenciaSemanal: true, pesoAtual: true }
      }),
      buscarTreinoDoDia(userId).catch(() => null).then(treino => {
        // Se for array, pegar o primeiro (ou o personalizado se houver)
        if (Array.isArray(treino)) {
          const personalizado = treino.find(t => t.criadoPor === 'USUARIO');
          return personalizado || treino[0] || null;
        }
        return treino;
      }),
      calcularEvolucaoPeso(userId),
      calcularSequenciaAtual(userId),
      calcularMelhorSequencia(userId),
      calcularProgressaoForca(userId, 30),
      calcularEstatisticasProgresso(userId, 30),
      calcularNivelUsuario(userId),
      obterConquistas(userId),
      gerarMensagemMotivacional(userId)
    ]);

    // Calcular progresso semanal
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaSemana);
    inicioSemana.setHours(0, 0, 0, 0);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const treinosSemana = await buscarTreinosSemanais(userId);
    const treinosEstaSemana = treinosSemana.filter(t => {
      const dataTreino = new Date(t.data);
      dataTreino.setHours(0, 0, 0, 0);
      return dataTreino >= inicioSemana && dataTreino <= fimSemana;
    });

    const treinosConcluidosSemana = treinosEstaSemana.filter(t => t.concluido).length;
    const metaSemanal = perfil?.frequenciaSemanal || 3;

    // Buscar treinos recentes (últimos 3 concluídos)
    const treinosRecent = await prisma.treino.findMany({
      where: {
        userId,
        concluido: true
      },
      orderBy: {
        data: 'desc'
      },
      take: 3,
      include: {
        exercicios: {
          include: {
            exercicio: {
              select: {
                id: true,
                nome: true,
                grupoMuscularPrincipal: true
              }
            }
          },
          orderBy: {
            ordem: 'asc'
          }
        }
      }
    });

    // Calcular total de treinos no mês
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const totalTreinosMes = await prisma.treino.count({
      where: {
        userId,
        concluido: true,
        data: { gte: inicioMes }
      }
    });

    // Calcular semanas seguidas (aproximado)
    const semanasSeguidas = Math.floor(sequenciaAtual / 7);

    res.json({
      usuario: {
        nome: user?.nome || 'Atleta',
        modoTreino: user?.modoTreino || 'IA'
      },
      treinoHoje,
      treinosSemanais: treinosEstaSemana, // Treinos da semana completa (7 dias)
      treinosRecent: treinosRecent, // Últimos 3 treinos concluídos
      progressoSemanal: {
        concluidos: treinosConcluidosSemana,
        meta: metaSemanal,
        porcentagem: metaSemanal > 0 ? Math.round((treinosConcluidosSemana / metaSemanal) * 100) : 0,
        faltam: Math.max(0, metaSemanal - treinosConcluidosSemana)
      },
      sequencia: {
        atual: sequenciaAtual,
        melhor: melhorSequencia,
        ehRecorde: sequenciaAtual === melhorSequencia && sequenciaAtual > 0
      },
      evolucao: {
        peso: evolucaoPeso,
        progressaoForca,
        totalTreinosMes,
        semanasSeguidas
      },
      nivel,
      conquistas,
      mensagemMotivacional,
      estatisticas: {
        ...estatisticas,
        totalTreinosMes
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter resumo do dashboard:', error);
    res.status(500).json({
      error: 'Erro ao obter resumo do dashboard',
      message: error.message
    });
  }
};

