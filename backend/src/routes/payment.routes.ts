import { Router } from 'express';
import { body, query } from 'express-validator';
import { gerarCheckoutUrl, verificarStatusAssinatura, obterHistoricoPagamentos } from '../controllers/payment.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Validações
const checkoutValidation = [
  body('plano')
    .isIn(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'])
    .withMessage('Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

const statusValidation = [
  query('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

// Rotas
router.post('/checkout', checkoutValidation, validateRequest, gerarCheckoutUrl);
// Rotas autenticadas - podem usar email do usuário logado ou query param
router.get('/status', authenticate, verificarStatusAssinatura);
router.get('/historico', authenticate, obterHistoricoPagamentos);

export default router;

