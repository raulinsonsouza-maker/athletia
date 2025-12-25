import { Router } from 'express';
import { body } from 'express-validator';
import {
  setupMFA,
  enableMFA,
  disableMFAController,
  getMFAStatus
} from '../controllers/mfa.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Todas as rotas requerem autenticação e ser admin
router.use(authenticate);
router.use(requireAdmin);

// Validações
const enableMFAValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
    .isLength({ min: 6, max: 6 })
    .withMessage('Token deve ter 6 dígitos')
    .matches(/^\d+$/)
    .withMessage('Token deve conter apenas números')
];

// Rotas
router.get('/status', getMFAStatus);
router.post('/setup', setupMFA);
router.post('/enable', enableMFAValidation, validateRequest, enableMFA);
router.post('/disable', disableMFAController);

export default router;

