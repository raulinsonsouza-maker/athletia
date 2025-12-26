import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Middleware para verificar se usuário tem plano ativo
export const verificarPlanoAtivo = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar usuário com informações de plano, expiração e trial
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        planoAtivo: true,
        dataExpiracao: true,
        plano: true,
        dataFimTrial: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Primeiro verificar se está em período de trial válido
    let trialAtivo = false;
    if (user.dataFimTrial) {
      const agora = new Date();
      const dataFimTrial = new Date(user.dataFimTrial);
      // Trial está ativo se não expirou e usuário não tem plano ativo
      trialAtivo = dataFimTrial > agora && !user.planoAtivo;
    }

    // Se trial está ativo, permitir acesso
    if (trialAtivo) {
      return next();
    }

    // Se não tem trial ativo, verificar se plano está ativo
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
      const agora = new Date();
      const trialExpirado = user.dataFimTrial && new Date(user.dataFimTrial) < agora;
      
      // Determinar ação bloqueada baseada na rota
      const path = req.path || '';
      let blockedAction: string | undefined;
      if (path.includes('/concluir') || path.includes('/gerar')) {
        blockedAction = 'iniciar treino';
      } else if (path.includes('/estatisticas') || path.includes('/progresso')) {
        blockedAction = 'ver progresso detalhado';
      } else if (path.includes('/personalizado') || path.includes('/editar')) {
        blockedAction = 'ajustar treino';
      }
      
      return res.status(402).json({
        error: 'Plano não ativo',
        message: trialExpirado
          ? 'Seu período de teste acabou. Escolha um plano para continuar usando o Athletia.'
          : user.dataExpiracao && new Date(user.dataExpiracao) < new Date()
            ? 'Seu plano expirou. Renove para continuar usando a plataforma.'
            : 'É necessário ativar um plano para acessar esta funcionalidade',
        redirectTo: '/checkout', // Sempre redirecionar para checkout quando trial expirado ou sem plano
        trialExpirado,
        blockedAction
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

      // Buscar usuário com informações de plano, expiração e trial
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          planoAtivo: true,
          dataExpiracao: true,
          dataFimTrial: true
        }
      });

      if (!user) {
        return next();
      }

      // Verificar se está em período de trial válido
      let trialAtivo = false;
      if (user.dataFimTrial) {
        const agora = new Date();
        const dataFimTrial = new Date(user.dataFimTrial);
        trialAtivo = dataFimTrial > agora && !user.planoAtivo;
      }

      // Se trial está ativo, permitir acesso
      if (trialAtivo) {
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
        const agora = new Date();
        const trialExpirado = user.dataFimTrial && new Date(user.dataFimTrial) < agora;
        
        // Determinar ação bloqueada baseada na rota
        let blockedAction: string | undefined;
        if (path.includes('/concluir') || path.includes('/gerar')) {
          blockedAction = 'iniciar treino';
        } else if (path.includes('/estatisticas') || path.includes('/progresso')) {
          blockedAction = 'ver progresso detalhado';
        } else if (path.includes('/personalizado') || path.includes('/editar')) {
          blockedAction = 'ajustar treino';
        }
        
        return res.status(402).json({
          error: 'Plano não ativo',
          message: trialExpirado
            ? 'Seu período de teste acabou. Escolha um plano para continuar usando o Athletia.'
            : user.dataExpiracao && new Date(user.dataExpiracao) < new Date()
              ? 'Seu plano expirou. Renove para continuar usando a plataforma.'
              : 'É necessário ativar um plano para acessar esta funcionalidade',
          redirectTo: '/checkout', // Sempre redirecionar para checkout quando trial expirado ou sem plano
          trialExpirado,
          blockedAction
        });
      }

      next();
    } catch (error: any) {
      console.error('Erro ao verificar acesso:', error);
      next();
    }
  };
};

