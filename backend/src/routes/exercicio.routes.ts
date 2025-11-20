import { Router } from 'express';
import {
  listarExercicios,
  buscarExercicio
} from '../controllers/exercicio.controller';
import { authenticate } from '../middleware/auth.middleware';
import { verificarPlanoAtivo } from '../middleware/plano.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Todas as rotas requerem plano ativo
router.use(verificarPlanoAtivo);

// Rotas
router.get('/', listarExercicios);
router.get('/:id', buscarExercicio);

export default router;

