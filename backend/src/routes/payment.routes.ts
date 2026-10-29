import { Router } from 'express';
import { body } from 'express-validator';
import {
  gerarCheckoutUrl,
  verificarStatusAssinatura,
  obterHistoricoPagamentos,
  obterConfigPagamento,
  assinarComCartao,
  criarPix,
  consultarPix,
  cancelarAssinatura
} from '../controllers/payment.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const checkoutValidation = [
  body('plano')
    .isIn(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'])
    .withMessage('Plano inválido. Deve ser MENSAL, TRIMESTRAL ou SEMESTRAL'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

router.get('/config', obterConfigPagamento);
router.post('/checkout', checkoutValidation, validateRequest, gerarCheckoutUrl);
router.post('/subscribe', authenticate, assinarComCartao);
router.post('/pix', authenticate, criarPix);
router.get('/pix/:paymentId', authenticate, consultarPix);
router.post('/cancel', authenticate, cancelarAssinatura);
router.get('/status', authenticate, verificarStatusAssinatura);
router.get('/historico', authenticate, obterHistoricoPagamentos);

export default router;
