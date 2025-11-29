import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * RBAC (Role-Based Access Control) Middleware
 * Proteção contra acesso não autorizado
 */

/**
 * Requer que o usuário seja ADMIN
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.role !== 'ADMIN') {
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
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
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
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const requestedUserId = req.params[userIdParam] || req.body[userIdParam];
    const currentUserId = req.user.id;

    // Admin pode acessar qualquer coisa
    if (req.user.role === 'ADMIN') {
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

