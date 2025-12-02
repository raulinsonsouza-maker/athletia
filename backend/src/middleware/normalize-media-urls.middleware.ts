import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { migrateMediaUrl } from '../utils/migrate-media-urls';

/**
 * Middleware para normalizar URLs de mídia em respostas JSON
 * Converte URLs antigas para o novo formato automaticamente
 */
export function normalizeMediaUrls(req: AuthRequest, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      // Normalizar em exercícios
      if (Array.isArray(data.exercicios)) {
        data.exercicios = data.exercicios.map((ex: any) => {
          if (ex.imagemUrl && ex.id) {
            const newUrl = migrateMediaUrl(ex.imagemUrl, ex.id);
            if (newUrl && newUrl !== ex.imagemUrl) {
              ex.imagemUrl = newUrl;
            }
          }
          return ex;
        });
      }
      
      // Normalizar em exercício único
      if (data.imagemUrl && data.id) {
        const newUrl = migrateMediaUrl(data.imagemUrl, data.id);
        if (newUrl && newUrl !== data.imagemUrl) {
          // Atualizar no banco em background
          const { prisma } = require('../lib/prisma');
          prisma.exercicio.update({
            where: { id: data.id },
            data: { imagemUrl: newUrl }
          }).catch((err: any) => {
            console.warn(`[NormalizeMediaUrls] Erro ao migrar URL para ${data.id}:`, err);
          });
          data.imagemUrl = newUrl;
        }
      }
      
      // Normalizar em exercicio dentro de outros objetos
      if (data.exercicio && data.exercicio.imagemUrl && data.exercicio.id) {
        const newUrl = migrateMediaUrl(data.exercicio.imagemUrl, data.exercicio.id);
        if (newUrl && newUrl !== data.exercicio.imagemUrl) {
          data.exercicio.imagemUrl = newUrl;
        }
      }
    }
    
    return originalJson(data);
  };
  
  next();
}

