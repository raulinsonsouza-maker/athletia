import { Router } from 'express';
import { serveMedia, uploadMedia, removeMedia } from '../controllers/exercicio-media.controller';
import { uploadMediaMiddleware } from '../middleware/upload-media.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Rota pública para servir mídia
router.get('/:exercicioId/media.*', serveMedia);

// Rotas protegidas para upload e remoção
router.post('/:exercicioId/media', authenticate, requireAdmin, uploadMediaMiddleware.single('media'), uploadMedia);
router.delete('/:exercicioId/media', authenticate, requireAdmin, removeMedia);

export default router;

