import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../lib/prisma';

/**
 * RBAC (Role-Based Access Control) Middleware
 * Proteção contra acesso não autorizado
 */

/**
 * Requer que o usuário seja ADMIN
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  // Buscar role do usuário se não estiver no request
  if (!req.userRole) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    req.userRole = user.role;
  }

  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Esta operação requer permissões de administrador'
    });
  }

  next();
}

/**
 * Requer que o usuário tenha uma das roles especificadas
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar role do usuário se não estiver no request
    if (!req.userRole) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      req.userRole = user.role;
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: `Esta operação requer uma das seguintes permissões: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Verifica se o usuário está acessando seus próprios dados ou é admin
 */
export function requireSelfOrAdmin(userIdParam: string = 'id') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar role do usuário se não estiver no request
    if (!req.userRole) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      req.userRole = user.role;
    }

    const requestedUserId = req.params[userIdParam] || req.body[userIdParam];
    const currentUserId = req.userId;

    // Admin pode acessar qualquer coisa
    if (req.userRole === 'ADMIN') {
      return next();
    }

    // Usuário comum só pode acessar seus próprios dados
    if (requestedUserId === currentUserId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Você só pode acessar seus próprios dados'
    });
  };
}

