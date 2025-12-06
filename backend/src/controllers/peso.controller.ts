import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

// Registrar peso
export const registrarPeso = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { peso } = req.body;

    // SEGURANÇA: Validar que peso é um número válido
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 1000) {
      return res.status(400).json({
        error: 'Peso inválido. Deve ser um número entre 0 e 1000 kg'
      });
    }

    // Criar registro de peso
    const registroPeso = await prisma.historicoPeso.create({
      data: {
        userId,
        peso: pesoNum
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

    // SEGURANÇA: Validar e limitar máximo de registros retornados
    let limiteNum = limite ? parseInt(limite as string) : 30;
    if (isNaN(limiteNum) || limiteNum <= 0) {
      limiteNum = 30;
    }
    // Limitar máximo a 100 registros para prevenir DoS
    limiteNum = Math.min(limiteNum, 100);

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

