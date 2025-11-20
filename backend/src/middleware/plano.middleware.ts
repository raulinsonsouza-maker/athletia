import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware para verificar se usuário tem plano ativo
export const verificarPlanoAtivo = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planoAtivo: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se não tem plano ativo, retornar erro 402 (Payment Required)
    if (!user.planoAtivo) {
      return res.status(402).json({
        error: 'Plano não ativo',
        message: 'É necessário ativar um plano para acessar esta funcionalidade',
        redirectTo: '/checkout'
      });
    }

    // Se tem plano ativo, continuar
    next();
  } catch (error: any) {
    console.error('Erro ao verificar plano:', error);
    res.status(500).json({ error: 'Erro ao verificar plano' });
  }
};

// Middleware para permitir acesso apenas a rotas específicas quando plano não está ativo
export const permitirAcessoSemPlano = (allowedPaths: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const path = req.path;

      // Se a rota está na lista de permitidas, deixar passar
      if (allowedPaths.some(allowed => path.startsWith(allowed))) {
        return next();
      }

      if (!userId) {
        return next();
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planoAtivo: true }
      });

      if (!user) {
        return next();
      }

      // Se não tem plano ativo e a rota não está permitida, bloquear
      if (!user.planoAtivo && !allowedPaths.some(allowed => path.startsWith(allowed))) {
        return res.status(402).json({
          error: 'Plano não ativo',
          message: 'É necessário ativar um plano para acessar esta funcionalidade',
          redirectTo: '/checkout'
        });
      }

      next();
    } catch (error: any) {
      console.error('Erro ao verificar acesso:', error);
      next();
    }
  };
};

