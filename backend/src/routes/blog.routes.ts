import { Router } from 'express';
import {
  listarArtigosPublicos,
  obterArtigoPublicoPorSlug,
  obterArtigoPublicoPorId
} from '../controllers/blog.controller';

const router = Router();

// Rotas públicas do blog (não requerem autenticação)

// Listar artigos públicos
router.get('/artigos', listarArtigosPublicos);

// Obter artigo por slug
router.get('/artigos/slug/:slug', obterArtigoPublicoPorSlug);

// Obter artigo por ID
router.get('/artigos/:id', obterArtigoPublicoPorId);

export default router;
