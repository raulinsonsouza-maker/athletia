#!/usr/bin/env node
/**
 * Script executável para migrar URLs de mídia
 * Versão JavaScript compilada para execução direta
 * 
 * Uso no servidor:
 *   cd /opt/athletia/backend
 *   node scripts/migrate-media-urls-exec.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function migrateMediaUrl(oldUrl, exercicioId) {
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
    const ext = match[2];
    return `/api/exercicios/${exercicioId}/media.${ext}`;
  }

  // Outros padrões antigos possíveis
  // /api/uploads/exercicios/{id}/media.{ext} -> /api/exercicios/{uuid}/media.{ext}
  const oldPattern2 = /^\/api\/uploads\/exercicios\/([^\/]+)\/media\.([a-z0-9]+)$/i;
  const match2 = oldUrl.match(oldPattern2);
  
  if (match2) {
    const ext = match2[2];
    return `/api/exercicios/${exercicioId}/media.${ext}`;
  }

  // Se não corresponde a nenhum padrão conhecido, retornar null (não migrar)
  return null;
}

async function migrateAllMediaUrls() {
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
          console.error(`[Migrate] ❌ Erro ao atualizar ${exercicio.id}:`, error.message);
        }
      }
    }

    return { updated, errors };
  } catch (error) {
    console.error('[Migrate] ❌ Erro geral:', error);
    return { updated, errors: errors + 1 };
  }
}

async function main() {
  console.log('========================================');
  console.log('MIGRAÇÃO DE URLs DE MÍDIA');
  console.log('========================================\n');

  try {
    const result = await migrateAllMediaUrls();
    
    console.log('\n========================================');
    console.log('RESULTADO DA MIGRAÇÃO');
    console.log('========================================');
    console.log(`✅ Exercícios atualizados: ${result.updated}`);
    console.log(`❌ Erros: ${result.errors}`);
    console.log('========================================\n');

    if (result.errors > 0) {
      console.warn('⚠️  Houve erros na migração. Verifique os logs acima.');
      await prisma.$disconnect();
      process.exit(1);
    } else if (result.updated === 0) {
      console.log('ℹ️  Nenhuma URL precisou ser migrada (já estão no formato novo).');
      await prisma.$disconnect();
      process.exit(0);
    } else {
      console.log('✅ Migração concluída com sucesso!');
      await prisma.$disconnect();
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ ERRO FATAL na migração:', error);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

