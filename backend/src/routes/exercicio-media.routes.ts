import { Router } from 'express';
import { serveMedia, uploadMedia, removeMedia } from '../controllers/exercicio-media.controller';
import { uploadMediaMiddleware, validateUploadedFile } from '../middleware/upload-media.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Rota pública para servir mídia
// Suporta /api/exercicios/:id/media.gif, /api/exercicios/:id/media.webp, etc.
// Usar regex para capturar qualquer extensão após /media.
router.get('/:exercicioId/media.:extension(gif|jpg|jpeg|png|webp|mp4|webm)', serveMedia);
// Fallback para qualquer outra extensão ou sem extensão
router.get('/:exercicioId/media*', serveMedia);

// Rotas protegidas para upload e remoção
// SEGURANÇA: Adicionar validação de magic bytes após upload
router.post('/:exercicioId/media', authenticate, requireAdmin, uploadMediaMiddleware.single('media'), validateUploadedFile, uploadMedia);
router.delete('/:exercicioId/media', authenticate, requireAdmin, removeMedia);

export default router;

