import { Router } from 'express';
import {
  startOnboarding,
  handleOAuthCallback,
  sendTestMessage
} from '../controllers/whatsapp.controller';

const router = Router();

// Onboarding
router.get('/onboarding/start', startOnboarding);
router.get('/onboarding/callback', handleOAuthCallback);
router.post('/onboarding/callback', handleOAuthCallback);

// Teste
router.post('/test', sendTestMessage);

export default router;

