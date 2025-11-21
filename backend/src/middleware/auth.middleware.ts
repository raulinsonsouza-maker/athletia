import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Validar variável de ambiente crítica para segurança
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente. Configure no arquivo .env antes de iniciar o servidor.');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'access') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    return res.status(401).json({
      error: 'Token inválido'
    });
  }
};

