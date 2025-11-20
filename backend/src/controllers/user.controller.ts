import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { definirTreinoAtivo } from '../services/treino.service';

const prisma = new PrismaClient();

/**
 * Obter modo de treino do usuário
 */
export const obterModoTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { modoTreino: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Se modoTreino for null, retornar "IA" como padrão
    const modoTreino = user.modoTreino || 'IA';

    res.json({ modoTreino });
  } catch (error: any) {
    console.error('Erro ao obter modo de treino:', error);
    res.status(500).json({
      error: 'Erro ao obter modo de treino',
      message: error.message
    });
  }
};

/**
 * Atualizar modo de treino do usuário
 */
export const atualizarModoTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { modoTreino } = req.body;

    // Validar modo
    if (modoTreino !== 'IA' && modoTreino !== 'MANUAL') {
      return res.status(400).json({
        error: 'Modo inválido',
        message: 'O modo deve ser "IA" ou "MANUAL"'
      });
    }

    // Buscar usuário atual para verificar modo anterior
    const userAtual = await prisma.user.findUnique({
      where: { id: userId },
      select: { modoTreino: true, currentTrainingId: true }
    });

    // Atualizar modo
    const user = await prisma.user.update({
      where: { id: userId },
      data: { modoTreino },
      select: { modoTreino: true }
    });

    // Se o modo mudou, buscar treino no novo modo
    if (userAtual?.modoTreino !== modoTreino) {
      const sourceEsperado = modoTreino === 'IA' ? 'IA' : 'USUARIO';
      
      // Buscar último treino no novo modo
      const ultimoTreino = await prisma.treino.findFirst({
        where: {
          userId,
          ...(modoTreino === 'IA' 
            ? { criadoPor: 'IA' }
            : {
                OR: [
                  { criadoPor: 'USUARIO' },
                  { templatePersonalizado: { isNot: null } }
                ]
              }
          )
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (ultimoTreino) {
        // Definir como treino ativo
        try {
          await definirTreinoAtivo(userId, ultimoTreino.id);
        } catch (error) {
          console.error('Erro ao definir treino ativo após mudança de modo:', error);
        }
      } else {
        // Se não houver treino no novo modo, limpar currentTrainingId mas manter source
        await prisma.user.update({
          where: { id: userId },
          data: {
            currentTrainingId: null,
            currentTrainingSource: modoTreino
          }
        });
      }
    }

    res.json({
      message: 'Modo de treino atualizado com sucesso',
      modoTreino: user.modoTreino
    });
  } catch (error: any) {
    console.error('Erro ao atualizar modo de treino:', error);
    res.status(500).json({
      error: 'Erro ao atualizar modo de treino',
      message: error.message
    });
  }
};

/**
 * Definir treino ativo para o usuário
 */
export const definirTreinoAtivoController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { treinoId } = req.body;

    if (!treinoId) {
      return res.status(400).json({
        error: 'ID do treino é obrigatório'
      });
    }

    await definirTreinoAtivo(userId, treinoId);

    res.json({
      message: 'Treino ativo definido com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao definir treino ativo:', error);
    res.status(500).json({
      error: 'Erro ao definir treino ativo',
      message: error.message
    });
  }
};

