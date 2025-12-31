import { Router } from 'express';
import { serveMedia, uploadMedia, removeMedia } from '../controllers/exercicio-media.controller';
import { uploadMediaMiddleware, validateUploadedFile } from '../middleware/upload-media.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Rota pública para servir mídia
// IMPORTANTE: Estas rotas devem vir ANTES de outras rotas em /api/exercicios
// para evitar conflito com rotas como /:id que capturam qualquer coisa
// Suporta /api/exercicios/:id/media.gif, /api/exercicios/:id/media.webp, etc.

// Middleware de log para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  router.use((req, res, next) => {
    if (req.path.includes('/media')) {
      console.log(`[exercicio-media.routes] Rota capturada: ${req.method} ${req.path}`);
    }
    next();
  });
}

// Rota específica para extensões conhecidas (mais específica = maior prioridade)
router.get('/:exercicioId/media.:extension(gif|jpg|jpeg|png|webp|mp4|webm)', serveMedia);

// Fallback para qualquer outra extensão (captura qualquer coisa após /media.)
// O parâmetro :extension captura tudo até o final da URL
router.get('/:exercicioId/media.:extension', serveMedia);

// Rotas protegidas para upload e remoção
// SEGURANÇA: Adicionar validação de magic bytes após upload
router.post('/:exercicioId/media', authenticate, requireAdmin, uploadMediaMiddleware.single('media'), validateUploadedFile, uploadMedia);
router.delete('/:exercicioId/media', authenticate, requireAdmin, removeMedia);

export default router;

