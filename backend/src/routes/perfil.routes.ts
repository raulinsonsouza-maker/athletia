import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createPerfil, 
  getPerfil, 
  updatePerfil, 
  atualizacaoPeriodica,
  verificarAtualizacaoPeriodica
} from '../controllers/perfil.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Validações para criação/atualização de perfil
const perfilValidation = [
  body('idade')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseInt(value) : value
      if (isNaN(num) || num < 13 || num > 100) {
        throw new Error('Idade deve estar entre 13 e 100 anos')
      }
      return true
    }),
  body('sexo')
    .optional()
    .isIn(['M', 'F', 'Outro'])
    .withMessage('Sexo deve ser M, F ou Outro'),
  body('altura')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num) || num < 100 || num > 250) {
        throw new Error('Altura deve estar entre 100 e 250 cm')
      }
      return true
    }),
  body('pesoAtual')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num) || num < 30 || num > 300) {
        throw new Error('Peso deve estar entre 30 e 300 kg')
      }
      return true
    }),
  body('percentualGordura')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num) || num < 5 || num > 50) {
        throw new Error('Percentual de gordura deve estar entre 5 e 50%')
      }
      return true
    }),
  body('experiencia')
    .optional()
    .isIn(['Iniciante', 'Intermediário', 'Avançado'])
    .withMessage('Experiência deve ser Iniciante, Intermediário ou Avançado'),
  body('objetivo')
    .optional()
    .isIn(['Emagrecimento', 'Hipertrofia', 'Força', 'Condicionamento'])
    .withMessage('Objetivo inválido'),
  body('frequenciaSemanal')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseInt(value) : value
      if (isNaN(num) || num < 1 || num > 7) {
        throw new Error('Frequência semanal deve estar entre 1 e 7 dias')
      }
      return true
    }),
  body('tempoDisponivel')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseInt(value) : value
      if (isNaN(num) || num < 30 || num > 120) {
        throw new Error('Tempo disponível deve estar entre 30 e 120 minutos')
      }
      return true
    }),
  body('rpePreferido')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseInt(value) : value
      if (isNaN(num) || num < 1 || num > 10) {
        throw new Error('RPE deve estar entre 1 e 10')
      }
      return true
    })
];

// Validações para atualização periódica
const atualizacaoPeriodicaValidation = [
  body('pesoAtual')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num) || num < 30 || num > 300) {
        throw new Error('Peso deve estar entre 30 e 300 kg')
      }
      return true
    }),
  body('percentualGordura')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num) || num < 5 || num > 50) {
        throw new Error('Percentual de gordura deve estar entre 5 e 50%')
      }
      return true
    }),
  body('lesoes')
    .optional()
    .isArray()
    .withMessage('Lesões deve ser um array')
];

// Rotas
router.get('/', getPerfil);
router.post('/', perfilValidation, validateRequest, createPerfil);
router.put('/', perfilValidation, validateRequest, updatePerfil);
router.get('/atualizacao-periodica', verificarAtualizacaoPeriodica);
router.post('/atualizacao-periodica', atualizacaoPeriodicaValidation, validateRequest, atualizacaoPeriodica);

export default router;

