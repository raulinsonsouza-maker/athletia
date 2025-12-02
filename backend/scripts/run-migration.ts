#!/usr/bin/env ts-node
/**
 * Script para executar migração de URLs de mídia
 * 
 * Uso:
 *   npx ts-node backend/scripts/run-migration.ts
 * 
 * Ou após build:
 *   node dist/scripts/run-migration.js
 */

import { migrateAllMediaUrls } from '../src/utils/migrate-media-urls';

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
      process.exit(1);
    } else {
      console.log('✅ Migração concluída com sucesso!');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\n❌ ERRO FATAL na migração:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

