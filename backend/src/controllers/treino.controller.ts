import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as treinoService from '../services/treino.service';
import * as progressaoService from '../services/progressao.service';

// Gerar treino do dia
export const gerarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data, gerarSemana } = req.body;

    // Se gerarSemana for true, gerar treinos para toda a semana
    if (gerarSemana) {
      const treinos = await treinoService.gerarTreinosSemana(userId);
      return res.status(201).json({
        message: 'Treinos da semana gerados com sucesso',
        treinos
      });
    }

    const dataTreino = data ? new Date(data) : new Date();
    const treino = await treinoService.gerarTreinoDoDia(userId, dataTreino);

    res.status(201).json({
      message: 'Treino gerado com sucesso',
      treino
    });
  } catch (error: any) {
    console.error('Erro ao gerar treino:', error);
    res.status(500).json({
      error: 'Erro ao gerar treino',
      message: error.message
    });
  }
};

// Buscar treino do dia
export const buscarTreinoDoDia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data } = req.query;

    let dataTreino: Date | undefined;
    if (data) {
      dataTreino = new Date(data as string);
    }
    
    const resultado = await treinoService.buscarTreinoDoDia(userId, dataTreino);

    if (!resultado) {
      return res.status(404).json({
        error: 'Treino não encontrado',
        message: 'Gere um treino para esta data primeiro'
      });
    }

    // Se for array, significa que há múltiplos treinos
    if (Array.isArray(resultado)) {
      return res.json({
        treinos: resultado,
        total: resultado.length,
        multiplos: true
      });
    }

    // Se for um único treino, retornar diretamente (compatibilidade)
    res.json(resultado);
  } catch (error: any) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({
      error: 'Erro ao buscar treino',
      message: error.message
    });
  }
};

// Concluir ou desmarcar exercício
export const concluirExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rpeRealizado, concluido } = req.body || {};

    // Se concluido não for especificado, assume true (comportamento padrão)
    const estaConcluido = concluido !== undefined ? concluido : true;

    const exercicioTreino = await treinoService.concluirExercicio(
      id, 
      rpeRealizado || undefined, 
      estaConcluido
    );

    res.json({
      message: estaConcluido ? 'Exercício concluído com sucesso' : 'Exercício desmarcado com sucesso',
      exercicioTreino
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status do exercício:', error);
    res.status(500).json({
      error: 'Erro ao atualizar status do exercício',
      message: error.message
    });
  }
};

// Buscar alternativas de exercício
export const obterAlternativas = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { equipamentos } = req.query;

    const equipamentosArray = equipamentos
      ? (equipamentos as string).split(',')
      : undefined;

    const resultado = await treinoService.obterAlternativas(id, equipamentosArray);

    res.json(resultado);
  } catch (error: any) {
    console.error('Erro ao buscar alternativas:', error);
    res.status(500).json({
      error: 'Erro ao buscar alternativas',
      message: error.message
    });
  }
};

// Substituir exercício por alternativa
export const substituirExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { exercicioAlternativoId } = req.body;

    if (!exercicioAlternativoId) {
      return res.status(400).json({
        error: 'ID do exercício alternativo é obrigatório'
      });
    }

    const exercicioAtualizado = await treinoService.substituirExercicio(
      id,
      exercicioAlternativoId
    );

    res.json({
      message: 'Exercício substituído com sucesso',
      exercicioTreino: exercicioAtualizado
    });
  } catch (error: any) {
    console.error('Erro ao substituir exercício:', error);
    res.status(500).json({
      error: 'Erro ao substituir exercício',
      message: error.message
    });
  }
};

// Buscar histórico de treinos
export const buscarHistorico = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limite } = req.query;

    const limiteNum = limite ? parseInt(limite as string) : 30;
    const historico = await progressaoService.buscarHistoricoTreinos(userId, limiteNum);

    res.json(historico);
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error.message
    });
  }
};

// Buscar estatísticas de progresso
export const buscarEstatisticas = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { dias } = req.query;

    const diasNum = dias ? parseInt(dias as string) : 30;
    const estatisticas = await progressaoService.calcularEstatisticasProgresso(
      userId,
      diasNum
    );

    res.json(estatisticas);
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message
    });
  }
};

// Buscar treinos semanais
export const buscarTreinosSemanais = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    let treinos = await treinoService.buscarTreinosSemanais(userId);

    // Filtrar apenas treinos com exercícios
    treinos = treinos.filter(t => t.exercicios && t.exercicios.length > 0);

    // Se não houver treinos com exercícios, gerar automaticamente
    if (treinos.length === 0) {
      console.log('📋 Nenhum treino com exercícios encontrado. Gerando treinos semanais automaticamente...');
      try {
        // Deletar treinos sem exercícios primeiro
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fimSemana = new Date(hoje);
        fimSemana.setDate(hoje.getDate() + 7);
        fimSemana.setHours(23, 59, 59, 999);

        await prisma.treino.deleteMany({
          where: {
            userId,
            data: { gte: hoje, lte: fimSemana }
          }
        });

        // Gerar novos treinos
        await treinoService.gerarTreinos30Dias(userId);
        treinos = await treinoService.buscarTreinosSemanais(userId);
        
        // Filtrar novamente apenas treinos com exercícios
        treinos = treinos.filter(t => t.exercicios && t.exercicios.length > 0);
        
        console.log(`✅ ${treinos.length} treinos gerados e carregados`);
      } catch (error: any) {
        console.error('⚠️ Erro ao gerar treinos automaticamente:', error);
        console.error('Stack:', error.stack);
      }
    }

    res.json({
      treinos,
      total: treinos.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar treinos semanais:', error);
    res.status(500).json({
      error: 'Erro ao buscar treinos semanais',
      message: error.message
    });
  }
};

