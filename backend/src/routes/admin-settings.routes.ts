import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  obterConfiguracoes,
  uploadImagemPerfil,
  uploadImagemLogin,
  removerImagemPerfil,
  removerImagemLogin
} from '../controllers/admin-settings.controller';
import { uploadSistemaImagemPerfil, uploadSistemaImagemLogin, validateImageMagicBytes } from '../middleware/upload.middleware';

const router = Router();

// Rota pública para obter configurações (para uso nas telas de login e perfil)
router.get('/imagens', obterConfiguracoes);

// Todas as outras rotas requerem autenticação e admin
router.use(authenticate);
router.use(requireAdmin);

// Upload de imagem do perfil
router.post(
  '/imagens/perfil',
  uploadSistemaImagemPerfil.single('imagem'),
  validateImageMagicBytes,
  uploadImagemPerfil
);

// Upload de imagem do login
router.post(
  '/imagens/login',
  uploadSistemaImagemLogin.single('imagem'),
  validateImageMagicBytes,
  uploadImagemLogin
);

// Remover imagem do perfil
router.delete('/imagens/perfil', removerImagemPerfil);

// Remover imagem do login
router.delete('/imagens/login', removerImagemLogin);

export default router;

