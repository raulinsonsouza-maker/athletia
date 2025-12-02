import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utilitário para migrar URLs antigas de mídia para o novo formato
 * 
 * Converte:
 * /api/uploads/exercicios/{slug}/exercicio.{ext} -> /api/exercicios/{uuid}/media.{ext}
 * /api/uploads/exercicios/{uuid}/exercicio.{ext} -> /api/exercicios/{uuid}/media.{ext}
 */

/**
 * Migra URL antiga para o novo formato
 * 
 * Padrão antigo: /api/uploads/exercicios/{slug|uuid}/exercicio.{ext}
 * Padrão novo: /api/exercicios/{uuid}/media.{ext}
 */
export function migrateMediaUrl(oldUrl: string, exercicioId: string): string | null {
  if (!oldUrl) return null;

  // Se já está no formato novo, retornar como está
  if (oldUrl.startsWith('/api/exercicios/')) {
    return oldUrl;
  }

  // Se é URL antiga, converter
  // Padrão: /api/uploads/exercicios/{id}/exercicio.{ext}
  const oldPattern = /^\/api\/uploads\/exercicios\/([^\/]+)\/exercicio\.([a-z0-9]+)$/i;
  const match = oldUrl.match(oldPattern);

  if (match) {
    const [, , ext] = match;
    // Usar o exercicioId fornecido (que deve ser o UUID real)
    return `/api/exercicios/${exercicioId}/media.${ext}`;
  }

  // Outros padrões antigos possíveis
  // /api/uploads/exercicios/{id}/media.{ext} -> /api/exercicios/{uuid}/media.{ext}
  const oldPattern2 = /^\/api\/uploads\/exercicios\/([^\/]+)\/media\.([a-z0-9]+)$/i;
  const match2 = oldUrl.match(oldPattern2);
  
  if (match2) {
    const [, , ext] = match2;
    return `/api/exercicios/${exercicioId}/media.${ext}`;
  }

  // Se não corresponde a nenhum padrão conhecido, retornar null (não migrar)
  return null;
}

/**
 * Migra todas as URLs antigas no banco de dados
 */
export async function migrateAllMediaUrls(): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    const exercicios = await prisma.exercicio.findMany({
      where: {
        imagemUrl: {
          not: null
        }
      },
      select: {
        id: true,
        imagemUrl: true
      }
    });

    for (const exercicio of exercicios) {
      if (!exercicio.imagemUrl) continue;

      const newUrl = migrateMediaUrl(exercicio.imagemUrl, exercicio.id);

      if (newUrl && newUrl !== exercicio.imagemUrl) {
        try {
          await prisma.exercicio.update({
            where: { id: exercicio.id },
            data: { imagemUrl: newUrl }
          });
          updated++;
          console.log(`[Migrate] ✅ ${exercicio.id}: ${exercicio.imagemUrl} -> ${newUrl}`);
        } catch (error) {
          errors++;
          console.error(`[Migrate] Erro ao atualizar ${exercicio.id}:`, error);
        }
      }
    }

    return { updated, errors };
  } catch (error) {
    console.error('[Migrate] Erro geral:', error);
    return { updated, errors: errors + 1 };
  }
}

