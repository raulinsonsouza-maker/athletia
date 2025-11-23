/**
 * CONTROLLER SIMPLES DE TREINOS
 * 
 * Versão simplificada e funcional
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as treinoSimples from '../services/treino-simples.service';
import { prisma } from '../lib/prisma';

/**
 * Gerar treino do dia - SIMPLES
 */
export const gerarTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data, gerarSemana } = req.body;

    console.log('[CONTROLLER SIMPLES] Gerando treino...', { userId, data, gerarSemana });

    if (gerarSemana === true) {
      // Gerar semana completa (por enquanto só gera dia, mas mantém compatibilidade)
      const hoje = new Date();
      const treinos = [];
      
      for (let i = 0; i < 7; i++) {
        const dataAtual = new Date(hoje);
        dataAtual.setDate(hoje.getDate() + i);
        
        try {
          const treino = await treinoSimples.gerarTreinoSimples(userId, dataAtual);
          if (treino) treinos.push(treino);
        } catch (error: any) {
          console.error(`[CONTROLLER SIMPLES] Erro ao gerar treino para dia ${i}:`, error.message);
        }
      }

      return res.status(201).json({
        message: `${treinos.length} treino(s) gerado(s) com sucesso`,
        treinos,
        quantidadeGerados: treinos.length
      });
    } else {
      // Gerar treino do dia
      const treino = await treinoSimples.gerarTreinoSimples(userId, data);

      return res.status(201).json({
        message: 'Treino gerado com sucesso',
        treino
      });
    }
  } catch (error: any) {
    console.error('[CONTROLLER SIMPLES] Erro:', error);
    
    let statusCode = 500;
    let errorMessage = error.message || 'Erro ao gerar treino';

    if (error.message?.includes('Perfil não encontrado')) {
      statusCode = 404;
    } else if (error.message?.includes('incompleto')) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      error: 'Erro ao gerar treino',
      message: errorMessage
    });
  }
};

/**
 * Buscar treino do dia - SIMPLES
 */
export const buscarTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { data } = req.query;

    console.log('[CONTROLLER SIMPLES] Buscando treino...', { userId, data });

    const treino = await treinoSimples.buscarTreinoDoDiaSimples(userId, data as string);

    if (!treino) {
      return res.status(200).json({
        treino: null,
        message: 'Nenhum treino encontrado para esta data'
      });
    }

    return res.json(treino);
  } catch (error: any) {
    console.error('[CONTROLLER SIMPLES] Erro ao buscar treino:', error);
    return res.status(500).json({
      error: 'Erro ao buscar treino',
      message: error.message
    });
  }
};

/**
 * Concluir exercício - SIMPLES
 */
export const concluirExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { rpeRealizado, concluido } = req.body;

    console.log('[CONTROLLER SIMPLES] Concluindo exercício...', { id, rpeRealizado, concluido });

    // Verificar se o exercício pertence ao usuário
    const exercicioTreino = await prisma.exercicioTreino.findUnique({
      where: { id },
      include: {
        treino: true
      }
    });

    if (!exercicioTreino || exercicioTreino.treino.userId !== userId) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    // Atualizar exercício
    const atualizado = await prisma.exercicioTreino.update({
      where: { id },
      data: {
        concluido: concluido !== undefined ? concluido : true,
        rpe: rpeRealizado || exercicioTreino.rpe
      },
      include: {
        exercicio: true
      }
    });

    return res.json({
      message: 'Exercício atualizado com sucesso',
      exercicioTreino: atualizado
    });
  } catch (error: any) {
    console.error('[CONTROLLER SIMPLES] Erro ao concluir exercício:', error);
    return res.status(500).json({
      error: 'Erro ao concluir exercício',
      message: error.message
    });
  }
};

