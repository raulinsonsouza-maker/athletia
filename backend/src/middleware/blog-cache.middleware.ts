import { Request, Response, NextFunction } from 'express';

// Cache simples em memória
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CacheOptions {
  ttl?: number; // Time to live em milissegundos
  keyGenerator?: (req: Request) => string;
}

/**
 * Middleware de cache para rotas do blog
 */
export function blogCache(options: CacheOptions = {}) {
  const ttl = options.ttl || CACHE_TTL;

  return (req: Request, res: Response, next: NextFunction) => {
    // Apenas cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Gerar chave do cache
    const cacheKey = options.keyGenerator
      ? options.keyGenerator(req)
      : `${req.path}?${new URLSearchParams(req.query as any).toString()}`;

    // Verificar se existe no cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    // Interceptar resposta para cachear
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidar cache relacionado a um post
 */
export function invalidatePostCache(slug?: string) {
  if (slug) {
    // Invalidar cache específico do post
    const keysToDelete: string[] = [];
    cache.forEach((value, key) => {
      if (key.includes(`/blog/artigos/slug/${slug}`) || key.includes(`/blog/artigos/${slug}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
  }

  // Invalidar cache geral do blog
  const keysToDelete: string[] = [];
  cache.forEach((value, key) => {
    if (key.includes('/blog/')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
}

/**
 * Limpar todo o cache do blog
 */
export function clearBlogCache() {
  const keysToDelete: string[] = [];
  cache.forEach((value, key) => {
    if (key.includes('/blog/')) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
}
