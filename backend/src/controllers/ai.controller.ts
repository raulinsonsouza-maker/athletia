import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  refinarTreinoComIA,
  explicarExercicio as explicarExercicioService,
  sugerirAjusteCarga as sugerirAjusteCargaService
} from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Refinar treino com IA
export const refinarTreino = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { treino } = req.body;

    // Buscar perfil
    const perfil = await prisma.perfil.findUnique({
      where: { userId }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil não encontrado'
      });
    }

    // Buscar histórico
    const historico = await prisma.treino.findMany({
      where: { userId },
      orderBy: { data: 'desc' },
      take: 10,
      include: {
        exercicios: {
          include: {
            exercicio: true
          }
        }
      }
    });

    // Buscar exercícios disponíveis
    const exerciciosDisponiveis = await prisma.exercicio.findMany({
      where: { ativo: true }
    });

    const resultado = await refinarTreinoComIA(treino, {
      perfil,
      historico,
      exerciciosDisponiveis,
      objetivo: perfil.objetivo || '',
      experiencia: perfil.experiencia || ''
    });

    res.json(resultado);
  } catch (error: any) {
    console.error('Erro ao refinar treino:', error);
    res.status(500).json({
      error: 'Erro ao refinar treino',
      message: error.message
    });
  }
};

// Explicar exercício
export const explicarExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Buscar perfil
    const perfil = await prisma.perfil.findUnique({
      where: { userId }
    });

    const explicacao = await explicarExercicioService(id, perfil || {});

    res.json({ explicacao });
  } catch (error: any) {
    console.error('Erro ao explicar exercício:', error);
    res.status(500).json({
      error: 'Erro ao explicar exercício',
      message: error.message
    });
  }
};

// Sugerir ajuste de carga
export const sugerirAjusteCarga = async (req: AuthRequest, res: Response) => {
  try {
    const { cargaAtual, rpe, objetivo } = req.body;

    if (!cargaAtual || !rpe || !objetivo) {
      return res.status(400).json({
        error: 'cargaAtual, rpe e objetivo são obrigatórios'
      });
    }

    const sugestao = sugerirAjusteCargaService(
      parseFloat(cargaAtual),
      parseInt(rpe),
      objetivo
    );

    res.json(sugestao);
  } catch (error: any) {
    console.error('Erro ao sugerir ajuste:', error);
    res.status(500).json({
      error: 'Erro ao sugerir ajuste',
      message: error.message
    });
  }
};

