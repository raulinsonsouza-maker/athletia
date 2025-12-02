#!/usr/bin/env ts-node
/**
 * Script para validar URLs de mídia no banco de dados
 * 
 * Uso:
 *   npx ts-node backend/scripts/validate-media-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  total: number;
  valid: number;
  invalid: number;
  missing: number;
  oldFormat: number;
  details: {
    invalid: Array<{ id: string; nome: string; imagemUrl: string | null }>;
    missing: Array<{ id: string; nome: string }>;
    oldFormat: Array<{ id: string; nome: string; imagemUrl: string }>;
  };
}

async function validateMediaUrls(): Promise<ValidationResult> {
  const result: ValidationResult = {
    total: 0,
    valid: 0,
    invalid: 0,
    missing: 0,
    oldFormat: 0,
    details: {
      invalid: [],
      missing: [],
      oldFormat: []
    }
  };

  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      nome: true,
      imagemUrl: true
    },
    orderBy: {
      nome: 'asc'
    }
  });

  result.total = exercicios.length;

  const newFormatPattern = /^\/api\/exercicios\/[a-f0-9-]{36}\/media\.(gif|jpg|jpeg|png|webp|mp4|webm)$/i;
  const oldFormatPattern = /^\/api\/uploads\/exercicios\//;

  for (const exercicio of exercicios) {
    if (!exercicio.imagemUrl) {
      result.missing++;
      result.details.missing.push({
        id: exercicio.id,
        nome: exercicio.nome
      });
      continue;
    }

    // Verificar formato antigo
    if (oldFormatPattern.test(exercicio.imagemUrl)) {
      result.oldFormat++;
      result.details.oldFormat.push({
        id: exercicio.id,
        nome: exercicio.nome,
        imagemUrl: exercicio.imagemUrl
      });
      continue;
    }

    // Verificar formato novo
    if (newFormatPattern.test(exercicio.imagemUrl)) {
      // Extrair UUID da URL e verificar se bate com o ID do exercício
      const match = exercicio.imagemUrl.match(/\/api\/exercicios\/([a-f0-9-]{36})\//i);
      if (match && match[1] === exercicio.id) {
        result.valid++;
      } else {
        result.invalid++;
        result.details.invalid.push({
          id: exercicio.id,
          nome: exercicio.nome,
          imagemUrl: exercicio.imagemUrl
        });
      }
    } else {
      result.invalid++;
      result.details.invalid.push({
        id: exercicio.id,
        nome: exercicio.nome,
        imagemUrl: exercicio.imagemUrl
      });
    }
  }

  return result;
}

async function main() {
  console.log('========================================');
  console.log('VALIDAÇÃO DE URLs DE MÍDIA NO BANCO');
  console.log('========================================\n');

  try {
    const result = await validateMediaUrls();

    console.log('\n========================================');
    console.log('RESULTADO DA VALIDAÇÃO');
    console.log('========================================');
    console.log(`Total de exercícios: ${result.total}`);
    console.log(`✅ URLs válidas: ${result.valid}`);
    console.log(`❌ URLs inválidas: ${result.invalid}`);
    console.log(`⚠️  URLs no formato antigo: ${result.oldFormat}`);
    console.log(`⚠️  Sem mídia: ${result.missing}`);
    console.log('========================================\n');

    if (result.oldFormat > 0) {
      console.log('\n⚠️  EXERCÍCIOS COM FORMATO ANTIGO:');
      console.log('Execute a migração: npx ts-node backend/scripts/run-migration.ts\n');
      result.details.oldFormat.forEach(ex => {
        console.log(`  - ${ex.nome} (${ex.id}): ${ex.imagemUrl}`);
      });
    }

    if (result.invalid > 0) {
      console.log('\n❌ EXERCÍCIOS COM URLs INVÁLIDAS:');
      result.details.invalid.forEach(ex => {
        console.log(`  - ${ex.nome} (${ex.id}): ${ex.imagemUrl}`);
      });
    }

    if (result.missing > 0 && result.missing <= 10) {
      console.log('\n⚠️  EXERCÍCIOS SEM MÍDIA (mostrando até 10):');
      result.details.missing.slice(0, 10).forEach(ex => {
        console.log(`  - ${ex.nome} (${ex.id})`);
      });
      if (result.missing > 10) {
        console.log(`  ... e mais ${result.missing - 10} exercícios`);
      }
    }

    await prisma.$disconnect();

    if (result.oldFormat > 0 || result.invalid > 0) {
      console.log('\n⚠️  Correções necessárias encontradas!');
      process.exit(1);
    } else {
      console.log('\n✅ Validação concluída - tudo OK!');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\n❌ ERRO na validação:', error);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

