import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, cadastroCompleto, cadastroPrePagamento, ativarPlanoAposPagamento } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Validações
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres')
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Usuário ou email é obrigatório')
    .trim()
    .customSanitizer((value) => {
      // Normalizar: sempre trim e lowercase (aceita email ou username)
      return value.trim().toLowerCase();
    }),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
];

const cadastroCompletoValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('telefone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .trim(),
  body('plano')
    .isIn(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'])
    .withMessage('Plano inválido'),
  body('onboarding')
    .notEmpty()
    .withMessage('Dados do onboarding são obrigatórios')
];

const cadastroPrePagamentoValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nome deve ter no mínimo 2 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('telefone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .trim(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('onboarding')
    .notEmpty()
    .withMessage('Dados do onboarding são obrigatórios')
];

const ativarPlanoValidation = [
  body('userId')
    .notEmpty()
    .withMessage('UserId é obrigatório'),
  body('plano')
    .isIn(['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'])
    .withMessage('Plano inválido')
];

// Rotas
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/refresh', refreshTokenValidation, validateRequest, refreshToken);
router.post('/cadastro-completo', cadastroCompletoValidation, validateRequest, cadastroCompleto);
router.post('/cadastro-pre-pagamento', cadastroPrePagamentoValidation, validateRequest, cadastroPrePagamento);
router.post('/ativar-plano-pagamento', ativarPlanoValidation, validateRequest, ativarPlanoAposPagamento);

export default router;

