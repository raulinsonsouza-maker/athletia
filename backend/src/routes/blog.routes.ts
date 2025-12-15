import { Router } from 'express';
import {
  listarArtigosPublicos,
  obterArtigoPublicoPorSlug,
  obterArtigoPublicoPorId,
  listarCategoriasPublicas,
  obterCategoriaPublicaPorSlug,
  listarArtigosDestaque,
  listarArtigosPilar,
  incrementarVisualizacoes,
  obterConfiguracoesPublicas
} from '../controllers/blog.controller';
import { blogCache } from '../middleware/blog-cache.middleware';

const router = Router();

// Rotas públicas do blog (não requerem autenticação)

// Listar artigos públicos (com cache)
router.get('/artigos', blogCache({ ttl: 5 * 60 * 1000 }), listarArtigosPublicos);

// Obter artigo por slug (com cache)
router.get('/artigos/slug/:slug', blogCache({ ttl: 5 * 60 * 1000 }), obterArtigoPublicoPorSlug);

// Obter artigo por ID
router.get('/artigos/:id', obterArtigoPublicoPorId);

// Incrementar visualizações
router.post('/artigos/:slug/view', incrementarVisualizacoes);

// Listar categorias (com cache)
router.get('/categorias', blogCache({ ttl: 10 * 60 * 1000 }), listarCategoriasPublicas);

// Obter categoria por slug (com cache)
router.get('/categorias/:slug', blogCache({ ttl: 5 * 60 * 1000 }), obterCategoriaPublicaPorSlug);

// Listar artigos em destaque (com cache)
router.get('/featured', blogCache({ ttl: 5 * 60 * 1000 }), listarArtigosDestaque);

// Listar artigos pilar (evergreen) (com cache)
router.get('/pillar', blogCache({ ttl: 5 * 60 * 1000 }), listarArtigosPilar);

// Obter configurações públicas do blog (com cache)
router.get('/configuracoes', blogCache({ ttl: 10 * 60 * 1000 }), obterConfiguracoesPublicas);

export default router;
