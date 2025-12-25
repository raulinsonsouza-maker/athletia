/**
 * Middleware para verificar MFA em rotas administrativas
 * Obrigatório para admins com MFA ativado
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { verifyMFAToken, isMFAEnabled } from '../services/mfa.service';

/**
 * Middleware para verificar MFA em requisições administrativas
 * Se o admin tiver MFA ativado, requer código TOTP
 */
export const requireMFA = async (
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

    // Verificar se MFA está ativado para este usuário
    const mfaEnabled = await isMFAEnabled(userId);

    if (!mfaEnabled) {
      // MFA não está ativado, permitir acesso (opcional por enquanto)
      return next();
    }

    // MFA está ativado, verificar token
    const mfaToken = req.body.mfaToken || req.headers['x-mfa-token'];

    if (!mfaToken) {
      return res.status(403).json({
        error: 'MFA requerido',
        message: 'Esta ação requer autenticação de dois fatores. Forneça o código MFA.',
        mfaRequired: true
      });
    }

    const verified = await verifyMFAToken(userId, mfaToken as string);

    if (!verified) {
      return res.status(403).json({
        error: 'Código MFA inválido',
        message: 'O código fornecido está incorreto ou expirado.'
      });
    }

    // MFA verificado, permitir acesso
    next();
  } catch (error: any) {
    console.error('Erro ao verificar MFA:', error);
    res.status(500).json({
      error: 'Erro ao verificar MFA',
      message: error.message
    });
  }
};

