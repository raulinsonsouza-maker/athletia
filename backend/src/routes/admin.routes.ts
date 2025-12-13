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
  reativarUsuario,
  simularPagamentoUsuario,
  obterEstatisticas,
  obterDetalhesUsuario,
  redefinirSenhaUsuario,
  testarEmailRemarketing,
  listarExercicios,
  obterExercicio,
  criarExercicio,
  atualizarExercicio,
  listarImagensBanco,
  limparTodasUrlsMidias
} from '../controllers/admin.controller';
import {
  listarGruposAdmin,
  criarGrupoAdmin,
  atualizarGrupoAdmin,
  removerGrupoAdmin,
  uploadImagemGrupoAdmin
} from '../controllers/grupo-muscular.controller';
import {
  listarImagensPadrao,
  salvarImagemPadrao,
  uploadImagemTreinoPadrao
} from '../controllers/treino-imagem-padrao.controller';
import {
  listarArtigos,
  obterArtigo,
  criarArtigo,
  atualizarArtigo,
  deletarArtigo
} from '../controllers/blog-admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { uploadImagemGrupo, uploadTreinoImagem, uploadBlogImagem, validateImageMagicBytes } from '../middleware/upload.middleware';
import { PrismaClient } from '@prisma/client';
import { normalizeMediaUrls } from '../middleware/normalize-media-urls.middleware';

const router = Router();
const prisma = new PrismaClient();

// Todas as rotas requerem autenticação e ser admin
router.use(authenticate);
router.use(requireAdmin);
// Normalizar URLs de mídia em todas as respostas
router.use(normalizeMediaUrls);

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

const redefinirSenhaValidation = [
  body('novaSenha')
    .trim()
    .notEmpty()
    .withMessage('Nova senha é obrigatória')
    .isLength({ min: 8 })
    .withMessage('A senha deve ter no mínimo 8 caracteres')
    .matches(/[a-zA-Z]/)
    .withMessage('A senha deve conter pelo menos uma letra')
    .matches(/[0-9]/)
    .withMessage('A senha deve conter pelo menos um número')
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
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true
      const num = parseFloat(value)
      return !isNaN(num) && num >= 0
    })
    .withMessage('Carga inicial sugerida deve ser um número positivo ou null'),
  body('rpeSugerido')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true
      const num = parseInt(value)
      return !isNaN(num) && num >= 1 && num <= 10
    })
    .withMessage('RPE sugerido deve ser um número entre 1 e 10 ou null'),
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser um booleano')
];

const criarGrupoMuscularValidation = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isString()
    .withMessage('Nome deve ser uma string'),
  body('descricao')
    .optional()
    .isString()
    .withMessage('Descrição deve ser uma string'),
  body('imagemUrl')
    .optional()
    .isString()
    .withMessage('Imagem deve ser uma URL'),
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser booleano'),
  body('ordem')
    .optional()
    .isInt()
    .withMessage('Ordem deve ser um número inteiro')
];

const atualizarGrupoMuscularValidation = [
  body('nome')
    .optional()
    .isString()
    .withMessage('Nome deve ser uma string'),
  body('descricao')
    .optional()
    .isString()
    .withMessage('Descrição deve ser uma string'),
  body('imagemUrl')
    .optional()
    .isString()
    .withMessage('Imagem deve ser uma URL'),
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser booleano'),
  body('ordem')
    .optional()
    .isInt()
    .withMessage('Ordem deve ser um número inteiro')
];

// Rotas
router.get('/usuarios', listarUsuarios);
router.get('/usuarios/:id', obterDetalhesUsuario); // Deve estar antes da rota PUT
router.post('/usuarios', criarUsuarioValidation, validateRequest, criarUsuario);
router.put('/usuarios/:id', atualizarUsuarioValidation, validateRequest, atualizarUsuario);
router.delete('/usuarios/:id', desativarUsuario);
router.post('/usuarios/:id/reativar', reativarUsuario);
router.post('/usuarios/:id/redefinir-senha', redefinirSenhaValidation, validateRequest, redefinirSenhaUsuario);
router.post('/usuarios/:id/testar-email-remarketing', [
  body('tipo')
    .notEmpty()
    .withMessage('Tipo de e-mail é obrigatório')
    .isIn(['10min', '24h', '48h'])
    .withMessage('Tipo deve ser: 10min, 24h ou 48h')
], validateRequest, testarEmailRemarketing);
router.post('/usuarios/:id/simular-pagamento', simularPagamentoUsuario);
router.get('/estatisticas', obterEstatisticas);

// Rotas de Exercícios
router.get('/exercicios', listarExercicios);
router.post('/exercicios', criarExercicioValidation, validateRequest, criarExercicio);
router.get('/exercicios/:id', obterExercicio);
router.put('/exercicios/:id', atualizarExercicioValidation, validateRequest, atualizarExercicio);
// Upload de mídia movido para /api/exercicios/:exercicioId/media (nova rota)

// Grupos musculares (visuais)
router.get('/grupos-musculares', listarGruposAdmin);
router.post('/grupos-musculares', criarGrupoMuscularValidation, validateRequest, criarGrupoAdmin);
router.put(
  '/grupos-musculares/:id',
  atualizarGrupoMuscularValidation,
  validateRequest,
  atualizarGrupoAdmin
);
router.delete('/grupos-musculares/:id', removerGrupoAdmin);

// Upload de imagem de grupo muscular
router.post(
  '/grupos-musculares/:id/imagem',
  (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadImagemGrupo.single('imagem')(req as any, res, (err: any) => {
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
  },
  validateImageMagicBytes, // SEGURANÇA: Validar magic bytes antes de processar
  uploadImagemGrupoAdmin
);


// Endpoint para limpar todas as URLs de mídia de todos os exercícios
router.delete('/exercicios/midias/limpar-todas', limparTodasUrlsMidias);

// Endpoint para listar imagens do banco
router.get('/imagens-banco/arquivos', listarImagensBanco);

// Imagens Padrão de Treino (A-G)
router.get('/treino-imagens', listarImagensPadrao);
router.post('/treino-imagens', salvarImagemPadrao);
router.post(
  '/treino-imagens/:letra/imagem',
  (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadTreinoImagem.single('imagem')(req as any, res, (err: any) => {
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
  },
  validateImageMagicBytes, // SEGURANÇA: Validar magic bytes antes de processar
  uploadImagemTreinoPadrao
);

// ============================================================================
// ROTAS DE ADMINISTRAÇÃO DO BLOG
// ============================================================================

// Listar artigos
router.get('/blog/artigos', listarArtigos);

// Obter artigo específico
router.get('/blog/artigos/:id', obterArtigo);

// Criar novo artigo
router.post('/blog/artigos', criarArtigo);

// Atualizar artigo
router.put('/blog/artigos/:id', atualizarArtigo);

// Deletar artigo
router.delete('/blog/artigos/:id', deletarArtigo);

// Upload de imagem de capa do blog
router.post(
  '/blog/artigos/:id/imagem',
  (req: AuthRequest, res: Response, next: NextFunction) => {
    uploadBlogImagem.single('imagem')(req as any, res, (err: any) => {
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
  },
  validateImageMagicBytes,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Atualizar artigo com URL da imagem
      const imageUrl = `/api/uploads/blog/${file.filename}`;
      
      const artigo = await prisma.blogArticle.update({
        where: { id },
        data: { featuredImage: imageUrl }
      });

      res.json({
        message: 'Imagem de capa atualizada com sucesso',
        imagemUrl: imageUrl,
        artigo
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      res.status(500).json({
        error: 'Erro ao fazer upload da imagem',
        message: error.message
      });
    }
  }
);

export default router;

