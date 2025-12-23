import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getSessions,
  getMessages,
  createSession,
  sendMessage,
  closeSession
} from '../controllers/chat.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/sessions', getSessions);
router.get('/sessions/:id/messages', getMessages);
router.post('/sessions', createSession);
router.post('/sessions/:id/messages', sendMessage);
router.put('/sessions/:id/close', closeSession);

export default router;

