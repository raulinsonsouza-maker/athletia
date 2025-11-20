import { Router } from 'express';
import { obterModoTreino, atualizarModoTreino, definirTreinoAtivoController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Obter modo de treino
router.get('/modo-treino', obterModoTreino);

// Atualizar modo de treino
router.put('/modo-treino', atualizarModoTreino);

// Definir treino ativo
router.put('/treino-ativo', definirTreinoAtivoController);

export default router;

