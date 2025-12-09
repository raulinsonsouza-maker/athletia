import { Request, Response, NextFunction } from 'express';
import { isValidUUID } from '../utils/dto';

/**
 * Middleware para validar UUID em parâmetros de rota
 * Previne ataques de injeção e uso de IDs inválidos
 */
export const validateUUIDParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        error: 'ID obrigatório',
        message: `O parâmetro '${paramName}' é obrigatório`
      });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: `O parâmetro '${paramName}' deve ser um UUID válido`,
        received: id
      });
    }

    next();
  };
};

/**
 * Middleware para validar múltiplos UUIDs em parâmetros
 */
export const validateMultipleUUIDParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { param: string; message: string }[] = [];

    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (!id) {
        errors.push({
          param: paramName,
          message: `O parâmetro '${paramName}' é obrigatório`
        });
        continue;
      }

      if (!isValidUUID(id)) {
        errors.push({
          param: paramName,
          message: `O parâmetro '${paramName}' deve ser um UUID válido`
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: errors
      });
    }

    next();
  };
};

