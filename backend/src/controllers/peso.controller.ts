import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Registrar peso
export const registrarPeso = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { peso } = req.body;

    // Criar registro de peso
    const registroPeso = await prisma.historicoPeso.create({
      data: {
        userId,
        peso: parseFloat(peso)
      }
    });

    // Atualizar peso atual no perfil
    await prisma.perfil.update({
      where: { userId },
      data: { pesoAtual: parseFloat(peso) }
    });

    res.status(201).json({
      message: 'Peso registrado com sucesso',
      registroPeso
    });
  } catch (error: any) {
    console.error('Erro ao registrar peso:', error);
    res.status(500).json({
      error: 'Erro ao registrar peso',
      message: error.message
    });
  }
};

// Buscar histórico de peso
export const buscarHistoricoPeso = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limite } = req.query;

    const limiteNum = limite ? parseInt(limite as string) : 30;

    const historico = await prisma.historicoPeso.findMany({
      where: { userId },
      orderBy: {
        data: 'desc'
      },
      take: limiteNum
    });

    res.json(historico);
  } catch (error: any) {
    console.error('Erro ao buscar histórico de peso:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico de peso',
      message: error.message
    });
  }
};

