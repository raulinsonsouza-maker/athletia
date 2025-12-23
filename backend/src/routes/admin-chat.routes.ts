import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getSessions,
  getSession,
  sendMessage,
  assignSession,
  updateStatus,
  getStats
} from '../controllers/admin-chat.controller';

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticate);
router.use(requireAdmin);

router.get('/sessions', getSessions);
router.get('/sessions/stats', getStats);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/messages', sendMessage);
router.put('/sessions/:id/assign', assignSession);
router.put('/sessions/:id/status', updateStatus);

export default router;

