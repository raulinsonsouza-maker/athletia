/**
 * Rotas para notificações push
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import * as pushNotificationController from '../controllers/push-notification.controller';

const router = Router();

// Rotas públicas
router.get('/public-key', pushNotificationController.getPublicKey);

// Rotas autenticadas (usuários)
router.post('/subscribe', authenticate, pushNotificationController.subscribe);
router.post('/unsubscribe', authenticate, pushNotificationController.unsubscribe);

// Rotas admin
router.post('/send', authenticate, requireAdmin, pushNotificationController.sendNotification);

export default router;

