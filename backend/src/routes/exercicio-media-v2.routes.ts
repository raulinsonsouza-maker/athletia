import { Router } from 'express';
import { serveMedia, uploadMedia, removeMedia } from '../controllers/exercicio-media-v2.controller';
import { uploadMediaMiddleware } from '../middleware/upload-v2.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

/**
 * Rotas de mídia de exercícios - Versão 2 (Nova implementação limpa)
 * 
 * Estrutura:
 * GET  /api/exercicios/:exercicioId/media.* - Servir mídia (público)
 * POST /api/exercicios/:exercicioId/media - Upload de mídia (admin)
 * DELETE /api/exercicios/:exercicioId/media - Remover mídia (admin)
 */

// Servir mídia (público - não precisa autenticação)
router.get('/:exercicioId/media.*', serveMedia);

// Upload de mídia (admin)
router.post('/:exercicioId/media', authenticate, requireAdmin, uploadMediaMiddleware.single('media'), uploadMedia);

// Remover mídia (admin)
router.delete('/:exercicioId/media', authenticate, requireAdmin, removeMedia);

export default router;

