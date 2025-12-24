/**
 * Controller para notificações push
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as pushNotificationService from '../services/push-notification.service';

/**
 * Salvar subscription do usuário
 * POST /api/push/subscribe
 */
export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        error: 'Subscription inválida',
        message: 'Endpoint e keys são obrigatórios'
      });
    }

    await pushNotificationService.salvarSubscription(userId, subscription);

    res.json({
      success: true,
      message: 'Subscription salva com sucesso'
    });
  } catch (error: any) {
    console.error('[PUSH CONTROLLER] Erro ao salvar subscription:', error);
    res.status(500).json({
      error: 'Erro ao salvar subscription',
      message: error.message
    });
  }
};

/**
 * Remover subscription do usuário
 * POST /api/push/unsubscribe
 */
export const unsubscribe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'Endpoint é obrigatório'
      });
    }

    await pushNotificationService.removerSubscription(userId, endpoint);

    res.json({
      success: true,
      message: 'Subscription removida com sucesso'
    });
  } catch (error: any) {
    console.error('[PUSH CONTROLLER] Erro ao remover subscription:', error);
    res.status(500).json({
      error: 'Erro ao remover subscription',
      message: error.message
    });
  }
};

/**
 * Enviar notificação manual (admin apenas)
 * POST /api/push/send
 */
export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, url } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        error: 'Campos obrigatórios: userId, title, message'
      });
    }

    const resultado = await pushNotificationService.enviarNotificacao(
      userId,
      title,
      message,
      url
    );

    res.json({
      success: resultado.enviado,
      ...resultado
    });
  } catch (error: any) {
    console.error('[PUSH CONTROLLER] Erro ao enviar notificação:', error);
    res.status(500).json({
      error: 'Erro ao enviar notificação',
      message: error.message
    });
  }
};

/**
 * Obter chave pública VAPID
 * GET /api/push/public-key
 */
export const getPublicKey = async (_req: AuthRequest, res: Response) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({
        error: 'VAPID public key não configurada'
      });
    }

    res.json({
      publicKey
    });
  } catch (error: any) {
    console.error('[PUSH CONTROLLER] Erro ao obter public key:', error);
    res.status(500).json({
      error: 'Erro ao obter public key',
      message: error.message
    });
  }
};

