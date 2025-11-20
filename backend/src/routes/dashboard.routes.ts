import { Router } from 'express';
import { obterResumoDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Obter resumo do dashboard
router.get('/resumo', obterResumoDashboard);

export default router;

