/**
 * Controller para MFA (Multi-Factor Authentication)
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  generateMFASecret,
  verifyAndEnableMFA,
  verifyMFAToken,
  disableMFA,
  isMFAEnabled
} from '../services/mfa.service';
import { prisma } from '../lib/prisma';

/**
 * Configurar MFA (gerar secret e QR code)
 */
export const setupMFA = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Verificar se usuário é admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, mfaEnabled: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'MFA está disponível apenas para administradores'
      });
    }

    if (user.mfaEnabled) {
      return res.status(400).json({
        error: 'MFA já está ativado',
        message: 'Desative o MFA atual antes de configurar um novo'
      });
    }

    const result = await generateMFASecret(userId, user.email);

    res.json({
      message: 'MFA configurado. Escaneie o QR code ou use a chave manual.',
      qrCodeUrl: result.qrCodeUrl,
      manualEntryKey: result.manualEntryKey
    });
  } catch (error: any) {
    console.error('Erro ao configurar MFA:', error);
    res.status(500).json({
      error: 'Erro ao configurar MFA',
      message: error.message
    });
  }
};

/**
 * Verificar código e ativar MFA
 */
export const enableMFA = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Token é obrigatório',
        message: 'Forneça o código de 6 dígitos do seu aplicativo autenticador'
      });
    }

    // Verificar se usuário é admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'MFA está disponível apenas para administradores'
      });
    }

    const verified = await verifyAndEnableMFA(userId, token);

    if (verified) {
      res.json({
        message: 'MFA ativado com sucesso!'
      });
    } else {
      res.status(400).json({
        error: 'Código inválido',
        message: 'O código fornecido está incorreto. Verifique seu aplicativo autenticador.'
      });
    }
  } catch (error: any) {
    console.error('Erro ao ativar MFA:', error);
    res.status(500).json({
      error: 'Erro ao ativar MFA',
      message: error.message
    });
  }
};

/**
 * Desativar MFA
 */
export const disableMFAController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Verificar se usuário é admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'MFA está disponível apenas para administradores'
      });
    }

    await disableMFA(userId);

    res.json({
      message: 'MFA desativado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao desativar MFA:', error);
    res.status(500).json({
      error: 'Erro ao desativar MFA',
      message: error.message
    });
  }
};

/**
 * Verificar status do MFA
 */
export const getMFAStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const enabled = await isMFAEnabled(userId);

    res.json({
      mfaEnabled: enabled
    });
  } catch (error: any) {
    console.error('Erro ao verificar status do MFA:', error);
    res.status(500).json({
      error: 'Erro ao verificar status do MFA',
      message: error.message
    });
  }
};

