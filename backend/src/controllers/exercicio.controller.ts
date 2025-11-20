import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar exercícios disponíveis para usuários
export const listarExercicios = async (req: AuthRequest, res: Response) => {
  try {
    const { grupoMuscular, nivelDificuldade, busca } = req.query;

    const where: any = {
      ativo: true
    };

    if (grupoMuscular) {
      where.grupoMuscularPrincipal = grupoMuscular as string;
    }

    if (nivelDificuldade) {
      where.nivelDificuldade = nivelDificuldade as string;
    }

    if (busca) {
      where.nome = {
        contains: busca as string,
        mode: 'insensitive'
      };
    }

    const exercicios = await prisma.exercicio.findMany({
      where,
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true,
        nivelDificuldade: true,
        descricao: true,
        execucaoTecnica: true,
        errosComuns: true,
        imagemUrl: true,
        gifUrl: true,
        cargaInicialSugerida: true,
        rpeSugerido: true,
        equipamentoNecessario: true,
        alternativas: true,
        ativo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    // Buscar grupos musculares únicos para filtros
    const gruposMusculares = await prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        grupoMuscularPrincipal: true
      },
      distinct: ['grupoMuscularPrincipal']
    });

    // Buscar níveis de dificuldade únicos
    const niveisDificuldade = await prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        nivelDificuldade: true
      },
      distinct: ['nivelDificuldade']
    });

    res.json({
      exercicios,
      gruposMusculares: gruposMusculares.map(g => g.grupoMuscularPrincipal).sort(),
      niveisDificuldade: niveisDificuldade.map(n => n.nivelDificuldade).sort(),
      total: exercicios.length
    });
  } catch (error: any) {
    console.error('Erro ao listar exercícios:', error);
    res.status(500).json({
      error: 'Erro ao listar exercícios',
      message: error.message
    });
  }
};

// Buscar exercício específico
export const buscarExercicio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const exercicio = await prisma.exercicio.findFirst({
      where: {
        id,
        ativo: true
      }
    });

    if (!exercicio) {
      return res.status(404).json({
        error: 'Exercício não encontrado'
      });
    }

    res.json(exercicio);
  } catch (error: any) {
    console.error('Erro ao buscar exercício:', error);
    res.status(500).json({
      error: 'Erro ao buscar exercício',
      message: error.message
    });
  }
};

