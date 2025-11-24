import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  gerarTreinoRapido,
  listarGruposMuscularesDisponiveis
} from '../services/treino-rapido.service';

/**
 * Gera um treino rápido baseado em configurações do usuário
 */
export const criarTreinoRapido = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      gruposMusculares,
      duracao,
      dificuldade,
      localTreino,
      focoMuscular,
      corpoTodo,
      data
    } = req.body;

    // Validações
    if (!duracao || ![20, 30, 40, 50, 60].includes(duracao)) {
      return res.status(400).json({
        error: 'Duração deve ser 20, 30, 40, 50 ou 60 minutos'
      });
    }

    if (!dificuldade || !['Iniciante', 'Intermediário', 'Avançado'].includes(dificuldade)) {
      return res.status(400).json({
        error: 'Dificuldade deve ser Iniciante, Intermediário ou Avançado'
      });
    }

    if (!localTreino) {
      return res.status(400).json({
        error: 'Local de treino é obrigatório'
      });
    }

    if (!corpoTodo && (!gruposMusculares || gruposMusculares.length === 0) && (!focoMuscular || focoMuscular.length === 0)) {
      return res.status(400).json({
        error: 'Selecione grupos musculares ou ative "Corpo todo"'
      });
    }

    const treino = await gerarTreinoRapido(userId, {
      gruposMusculares: gruposMusculares || [],
      duracao,
      dificuldade,
      localTreino,
      focoMuscular: focoMuscular || [],
      corpoTodo: corpoTodo || false,
      data: data ? new Date(data) : undefined
    });

    res.status(201).json(treino);
  } catch (error: any) {
    console.error('Erro ao criar treino rápido:', error);
    res.status(500).json({
      error: 'Erro ao criar treino rápido',
      message: error.message
    });
  }
};

/**
 * Lista grupos musculares disponíveis
 */
export const listarGrupos = async (req: AuthRequest, res: Response) => {
  try {
    const grupos = await listarGruposMuscularesDisponiveis();
    res.json(grupos);
  } catch (error: any) {
    console.error('Erro ao listar grupos musculares:', error);
    res.status(500).json({
      error: 'Erro ao listar grupos musculares',
      message: error.message
    });
  }
};

