import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { verificarPlanoAtivo } from '../middleware/plano.middleware';
import { concluir, desmarcar, detalhar, listar } from '../controllers/desafio.controller';

const router = Router();

router.use(authenticate);
router.use(verificarPlanoAtivo);

router.get('/', listar);
router.get('/:slug', detalhar);
router.post('/:slug/dias/:dia/concluir', concluir);
router.delete('/:slug/dias/:dia', desmarcar);

export default router;
