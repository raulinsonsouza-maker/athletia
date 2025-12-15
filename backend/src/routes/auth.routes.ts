import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, cadastroCompleto, cadastroPrePagamento, ativarPlanoAposPagamento, requestPasswordReset, resetPassword, obterStatusTrial } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { optionalAuthenticate } from '../middleware/optional-auth.middleware';
import { authenticate } from '../middleware/auth.middleware';

// Rate limiting inteligente para rotas de autenticação
// SEGURANÇA: Balanceado entre segurança e usabilidade
// Logins bem-sucedidos NÃO contam para o limite, apenas tentativas falhadas
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 tentativas por IP a cada 15 minutos (aumentado para melhor UX)
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Logins bem-sucedidos NÃO contam para o limite
  skip: (req: any) => req.method === 'OPTIONS', // Pular requisições CORS preflight
  handler: (req, res) => {
    // Logar tentativa de rate limit excedido
    const { logRateLimitExceeded } = require('../utils/security-logger');
    logRateLimitExceeded(undefined, req.path, req);
    res.status(429).json({
      error: 'Muitas tentativas de login. Por favor, tente novamente em alguns minutos.'
    });
  }
});

// Rate limiter mais permissivo para redefinição de senha (já tem rate limiting interno)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 solicitações por IP a cada 15 minutos
  message: {
    error: 'Muitas solicitações. Por favor, tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => req.method === 'OPTIONS'
});

const router = Router();

// Validações
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres'),
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
    .trim()
    .customSanitizer((value) => value.toLowerCase()),
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
    .trim()
    .customSanitizer((value) => value.toLowerCase()),
  body('telefone')
    .notEmpty()
    .withMessage('Telefone é obrigatório')
    .trim(),
  body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres'),
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

// Validações para redefinição de senha
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/[a-zA-Z]/)
    .withMessage('Senha deve conter pelo menos uma letra')
    .matches(/[0-9]/)
    .withMessage('Senha deve conter pelo menos um número'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => {
      if (value && value.trim() !== req.body.newPassword?.trim()) {
        throw new Error('As senhas não coincidem');
      }
      return true;
    })
];

// Rotas
router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/refresh', authLimiter, refreshTokenValidation, validateRequest, refreshToken);
router.get('/trial-status', authenticate, obterStatusTrial);
router.post('/cadastro-completo', cadastroCompletoValidation, validateRequest, cadastroCompleto);
router.post('/cadastro-pre-pagamento', cadastroPrePagamentoValidation, validateRequest, cadastroPrePagamento);
router.post('/ativar-plano-pagamento', optionalAuthenticate, ativarPlanoValidation, validateRequest, ativarPlanoAposPagamento);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validateRequest, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, validateRequest, resetPassword);

export default router;

