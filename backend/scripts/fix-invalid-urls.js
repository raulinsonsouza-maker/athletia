#!/usr/bin/env node
/**
 * Script para corrigir URLs inválidas que usam slug em vez de UUID
 * 
 * Uso:
 *   cd /opt/athletia/backend
 *   node scripts/fix-invalid-urls.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Extrai o identificador (slug ou UUID) de uma URL
 */
function extractIdFromUrl(url) {
  // Padrão: /api/exercicios/{id}/media.{ext}
  const match = url.match(/^\/api\/exercicios\/([^\/]+)\/media\./i);
  return match ? match[1] : null;
}

/**
 * Verifica se é UUID válido
 */
function isUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Resolve um identificador (slug ou nome) para UUID do exercício
 */
async function resolveExercicioId(identifier) {
  if (!identifier || typeof identifier !== 'string') {
    return null;
  }

  const trimmedId = identifier.trim();
  if (!trimmedId) {
    return null;
  }

  // Se já é UUID, verificar se existe
  if (isUuid(trimmedId)) {
    const exercicio = await prisma.exercicio.findUnique({
      where: { id: trimmedId },
      select: { id: true }
    });
    return exercicio?.id || null;
  }

  // Buscar por nome exato (case-insensitive)
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: trimmedId, mode: 'insensitive' }
    },
    select: { id: true, nome: true }
  });

  if (exercicio) {
    return exercicio.id;
  }

  // Se tem hífen, converter slug para nome
  // Ex: "abdominal-bicicleta" -> "Abdominal Bicicleta"
  if (trimmedId.includes('-')) {
    const nomeAproximado = trimmedId
      .split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(' ');
    
    exercicio = await prisma.exercicio.findFirst({
      where: {
        nome: { equals: nomeAproximado, mode: 'insensitive' }
      },
      select: { id: true, nome: true }
    });

    if (exercicio) {
      return exercicio.id;
    }
  }

  // Busca parcial
  const palavrasBusca = trimmedId.replace(/-/g, ' ').trim();
  if (palavrasBusca) {
    exercicio = await prisma.exercicio.findFirst({
      where: {
        nome: { contains: palavrasBusca, mode: 'insensitive' }
      },
      select: { id: true, nome: true }
    });

    if (exercicio) {
      return exercicio.id;
    }
  }

  return null;
}

/**
 * Corrige URL inválida (substitui slug por UUID)
 */
async function fixInvalidUrl(exercicio) {
  const extractedId = extractIdFromUrl(exercicio.imagemUrl);
  if (!extractedId) {
    return null;
  }

  // Se já é UUID válido, não precisa corrigir
  if (isUuid(extractedId)) {
    // Verificar se o UUID bate com o ID do exercício
    if (extractedId === exercicio.id) {
      return null; // Já está correto
    }
  }

  // Resolver para UUID real do exercício
  const realUuid = await resolveExercicioId(extractedId);
  
  if (!realUuid) {
    console.warn(`⚠️  Não foi possível resolver UUID para: ${extractedId} (exercício: ${exercicio.nome})`);
    return null;
  }

  // Se o UUID resolvido não bate com o ID do exercício, há algo errado
  if (realUuid !== exercicio.id) {
    console.warn(`⚠️  UUID resolvido (${realUuid}) não bate com ID do exercício (${exercicio.id}): ${exercicio.nome}`);
    // Mas vamos corrigir mesmo assim usando o UUID real do exercício
  }

  // Extrair extensão da URL original
  const extMatch = exercicio.imagemUrl.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1] : 'jpg';

  // Construir nova URL com UUID correto
  const newUrl = `/api/exercicios/${exercicio.id}/media.${ext}`;

  if (newUrl === exercicio.imagemUrl) {
    return null; // Já está correto
  }

  return newUrl;
}

async function main() {
  console.log('========================================');
  console.log('CORREÇÃO DE URLs INVÁLIDAS');
  console.log('========================================\n');

  try {
    // Buscar exercícios com URLs inválidas
    const exercicios = await prisma.exercicio.findMany({
      where: {
        imagemUrl: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        imagemUrl: true
      }
    });

    const newFormatPattern = /^\/api\/exercicios\/[a-f0-9-]{36}\/media\.(gif|jpg|jpeg|png|webp|mp4|webm)$/i;
    const invalidExercicios = exercicios.filter(ex => {
      if (!ex.imagemUrl) return false;
      // Verificar se a URL tem formato válido E se o UUID na URL bate com o ID do exercício
      if (newFormatPattern.test(ex.imagemUrl)) {
        const match = ex.imagemUrl.match(/\/api\/exercicios\/([a-f0-9-]{36})\//i);
        return !match || match[1] !== ex.id;
      }
      // Se não tem formato válido mas começa com /api/exercicios/, pode ser que use slug
      return ex.imagemUrl.startsWith('/api/exercicios/');
    });

    if (invalidExercicios.length === 0) {
      console.log('✅ Nenhuma URL inválida encontrada!');
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`\n📋 Encontradas ${invalidExercicios.length} URLs inválidas para corrigir:\n`);

    let fixed = 0;
    let errors = 0;

    for (const exercicio of invalidExercicios) {
      console.log(`🔍 Analisando: ${exercicio.nome}`);
      console.log(`   URL atual: ${exercicio.imagemUrl}`);

      const newUrl = await fixInvalidUrl(exercicio);

      if (!newUrl) {
        console.log(`   ⏭️  Pulando (já está correto ou não pode ser corrigido)\n`);
        continue;
      }

      try {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { imagemUrl: newUrl }
        });

        console.log(`   ✅ Corrigido para: ${newUrl}\n`);
        fixed++;
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar: ${error.message}\n`);
        errors++;
      }
    }

    console.log('========================================');
    console.log('RESULTADO DA CORREÇÃO');
    console.log('========================================');
    console.log(`✅ URLs corrigidas: ${fixed}`);
    console.log(`❌ Erros: ${errors}`);
    console.log('========================================\n');

    await prisma.$disconnect();

    if (errors > 0) {
      console.log('⚠️  Houve erros na correção. Verifique os logs acima.');
      process.exit(1);
    } else if (fixed === 0) {
      console.log('ℹ️  Nenhuma URL precisou ser corrigida.');
      process.exit(0);
    } else {
      console.log('✅ Correção concluída com sucesso!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ ERRO FATAL na correção:', error);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

