import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  desativarUsuario,
  obterEstatisticas,
  obterDetalhesUsuario,
  listarExercicios,
  obterExercicio,
  criarExercicio,
  atualizarExercicio,
  uploadGifExercicio,
  deletarGifExercicio,
  verificarStatusGifs,
  bulkUploadGifs
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { uploadGif, uploadGifsBulk } from '../middleware/upload.middleware';

const router = Router();

// Todas as rotas requerem autenticação e ser admin
router.use(authenticate);
router.use(requireAdmin);

// Validações
const criarUsuarioValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email inválido'),
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('nome')
    .optional()
    .isString()
    .withMessage('Nome deve ser uma string'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role deve ser USER ou ADMIN')
];

const atualizarUsuarioValidation = [
  body('nome')
    .optional()
    .isString()
    .withMessage('Nome deve ser uma string'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role deve ser USER ou ADMIN')
];

const criarExercicioValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isString()
    .withMessage('Nome deve ser uma string'),
  body('grupoMuscularPrincipal')
    .notEmpty()
    .withMessage('Grupo muscular principal é obrigatório')
    .isString()
    .withMessage('Grupo muscular principal deve ser uma string'),
  body('nivelDificuldade')
    .notEmpty()
    .withMessage('Nível de dificuldade é obrigatório')
    .isIn(['Iniciante', 'Intermediário', 'Avançado'])
    .withMessage('Nível de dificuldade deve ser Iniciante, Intermediário ou Avançado'),
  body('sinergistas')
    .optional()
    .isArray()
    .withMessage('Sinergistas deve ser um array'),
  body('errosComuns')
    .optional()
    .isArray()
    .withMessage('Erros comuns deve ser um array'),
  body('equipamentoNecessario')
    .optional()
    .isArray()
    .withMessage('Equipamento necessário deve ser um array'),
  body('alternativas')
    .optional()
    .isArray()
    .withMessage('Alternativas deve ser um array'),
  body('cargaInicialSugerida')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carga inicial sugerida deve ser um número positivo'),
  body('rpeSugerido')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('RPE sugerido deve ser um número entre 1 e 10'),
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser um booleano')
];

const atualizarExercicioValidation = [
  body('nome')
    .optional()
    .isString()
    .withMessage('Nome deve ser uma string')
    .notEmpty()
    .withMessage('Nome não pode ser vazio'),
  body('grupoMuscularPrincipal')
    .optional()
    .isString()
    .withMessage('Grupo muscular principal deve ser uma string')
    .notEmpty()
    .withMessage('Grupo muscular principal não pode ser vazio'),
  body('nivelDificuldade')
    .optional()
    .isIn(['Iniciante', 'Intermediário', 'Avançado'])
    .withMessage('Nível de dificuldade deve ser Iniciante, Intermediário ou Avançado'),
  body('sinergistas')
    .optional()
    .isArray()
    .withMessage('Sinergistas deve ser um array'),
  body('errosComuns')
    .optional()
    .isArray()
    .withMessage('Erros comuns deve ser um array'),
  body('equipamentoNecessario')
    .optional()
    .isArray()
    .withMessage('Equipamento necessário deve ser um array'),
  body('alternativas')
    .optional()
    .isArray()
    .withMessage('Alternativas deve ser um array'),
  body('cargaInicialSugerida')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carga inicial sugerida deve ser um número positivo'),
  body('rpeSugerido')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('RPE sugerido deve ser um número entre 1 e 10'),
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser um booleano')
];

// Rotas
router.get('/usuarios', listarUsuarios);
router.get('/usuarios/:id', obterDetalhesUsuario); // Deve estar antes da rota PUT
router.post('/usuarios', criarUsuarioValidation, validateRequest, criarUsuario);
router.put('/usuarios/:id', atualizarUsuarioValidation, validateRequest, atualizarUsuario);
router.delete('/usuarios/:id', desativarUsuario);
router.get('/estatisticas', obterEstatisticas);

// Rotas de Exercícios
router.get('/exercicios', listarExercicios);
router.post('/exercicios', criarExercicioValidation, validateRequest, criarExercicio);
router.get('/exercicios/:id', obterExercicio);
router.put('/exercicios/:id', atualizarExercicioValidation, validateRequest, atualizarExercicio);
router.post('/exercicios/:id/gif', (req, res, next) => {
  uploadGif.single('gif')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Erro ao processar arquivo' });
    }
    next();
  });
}, uploadGifExercicio);
router.delete('/exercicios/:id/gif', deletarGifExercicio);

// Endpoint para verificar status de todos os GIFs
router.get('/gifs/status', verificarStatusGifs);

// Endpoint para upload em lote de GIFs
router.post('/gifs/bulk-upload', 
  (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadGifsBulk.array('gifs', 50)(req as any, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB por arquivo' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Muitos arquivos. Máximo: 50 arquivos por vez' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || 'Erro ao processar arquivos' });
      }
      next();
    });
  },
  (req: AuthRequest & { files?: Express.Multer.File[] }, res: Response) => {
    return bulkUploadGifs(req, res);
  }
);

// Endpoint para verificar se o GIF existe
router.get('/exercicios/:id/gif/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const uploadBasePath = path.join(process.cwd(), 'upload', 'exercicios');
    const filePath = path.join(uploadBasePath, id, 'exercicio.gif');
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        path: filePath,
        size: stats.size,
        url: `/api/uploads/exercicios/${id}/exercicio.gif`
      });
    } else {
      res.json({
        exists: false,
        path: filePath,
        url: `/api/uploads/exercicios/${id}/exercicio.gif`
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao verificar arquivo',
      message: error.message
    });
  }
});

export default router;

