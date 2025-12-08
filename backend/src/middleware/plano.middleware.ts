import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Middleware para verificar se usuário tem plano ativo
export const verificarPlanoAtivo = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar usuário com informações de plano e expiração
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planoAtivo: true,
        dataExpiracao: true,
        plano: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se plano está ativo
    let planoValido = user.planoAtivo;

    // Se planoAtivo é true, verificar se não expirou
    if (planoValido && user.dataExpiracao) {
      const agora = new Date();
      const dataExpiracao = new Date(user.dataExpiracao);
      
      // Se a data de expiração já passou, desativar plano automaticamente
      if (dataExpiracao < agora) {
        console.log(`⚠️ Plano expirado para usuário ${userId}. Desativando automaticamente.`);
        
        // Atualizar plano para inativo
        await prisma.user.update({
          where: { id: userId },
          data: { planoAtivo: false }
        });
        
        planoValido = false;
      }
    }

    // Se não tem plano ativo ou expirou, retornar erro 402 (Payment Required)
    if (!planoValido) {
      return res.status(402).json({
        error: 'Plano não ativo',
        message: user.dataExpiracao && new Date(user.dataExpiracao) < new Date()
          ? 'Seu plano expirou. Renove para continuar usando a plataforma.'
          : 'É necessário ativar um plano para acessar esta funcionalidade',
        redirectTo: '/checkout'
      });
    }

    // Se tem plano ativo e válido, continuar
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

      // Buscar usuário com informações de plano e expiração
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          planoAtivo: true,
          dataExpiracao: true
        }
      });

      if (!user) {
        return next();
      }

      // Verificar se plano está válido (ativo e não expirado)
      let planoValido = user.planoAtivo;
      if (planoValido && user.dataExpiracao) {
        const agora = new Date();
        const dataExpiracao = new Date(user.dataExpiracao);
        if (dataExpiracao < agora) {
          planoValido = false;
        }
      }

      // Se não tem plano ativo/válido e a rota não está permitida, bloquear
      if (!planoValido && !allowedPaths.some(allowed => path.startsWith(allowed))) {
        return res.status(402).json({
          error: 'Plano não ativo',
          message: user.dataExpiracao && new Date(user.dataExpiracao) < new Date()
            ? 'Seu plano expirou. Renove para continuar usando a plataforma.'
            : 'É necessário ativar um plano para acessar esta funcionalidade',
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

