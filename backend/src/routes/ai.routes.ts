import { Router } from 'express';
import { refinarTreino, explicarExercicio, sugerirAjusteCarga } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas
router.post('/refinar-treino', refinarTreino);
router.get('/explicar-exercicio/:id', explicarExercicio);
router.post('/ajustar-carga', sugerirAjusteCarga);

export default router;

