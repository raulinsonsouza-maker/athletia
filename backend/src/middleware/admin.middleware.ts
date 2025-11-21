import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../lib/prisma';

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Não autenticado'
      });
    }

    // Buscar usuário para verificar role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Apenas administradores podem acessar esta rota'
      });
    }

    // Adicionar role ao request
    req.userRole = user.role;

    next();
  } catch (error: any) {
    console.error('Erro ao verificar admin:', error);
    res.status(500).json({
      error: 'Erro ao verificar permissões',
      message: error.message
    });
  }
};

