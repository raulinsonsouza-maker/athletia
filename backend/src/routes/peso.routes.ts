import { Router } from 'express';
import { body } from 'express-validator';
import { registrarPeso, buscarHistoricoPeso } from '../controllers/peso.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Validações
const registrarPesoValidation = [
  body('peso')
    .notEmpty()
    .withMessage('Peso é obrigatório')
    .isFloat({ min: 30, max: 300 })
    .withMessage('Peso deve estar entre 30 e 300 kg')
];

// Rotas
router.post('/', registrarPesoValidation, validateRequest, registrarPeso);
router.get('/historico', buscarHistoricoPeso);

export default router;

