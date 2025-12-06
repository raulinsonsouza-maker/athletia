import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || '';

/**
 * Middleware de autenticação opcional
 * Se token JWT estiver presente e válido, define req.userId
 * Se não estiver presente, continua sem erro (para permitir chamadas internas)
 */
export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
        
        if (decoded.type === 'access') {
          req.userId = decoded.userId;
        }
      } catch (error) {
        // Token inválido, mas não bloqueia a requisição
        // Permite que seja processada sem autenticação (para webhooks internos)
      }
    }
    
    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

