/**
 * Script para verificar se todos os modelos Prisma estão disponíveis
 * Execute: tsx src/scripts/check-prisma-models.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPrismaModels() {
  console.log('🔍 Verificando modelos Prisma disponíveis...\n');

  const models = [
    'blogArticle',
    'blogCategory',
    'blogAuthor',
    'blogCTA',
    'blogSettings'
  ];

  const results: { model: string; exists: boolean; error?: string }[] = [];

  for (const model of models) {
    try {
      // Tentar acessar o modelo
      const modelInstance = (prisma as any)[model];
      
      if (modelInstance) {
        console.log(`✅ ${model} - Disponível`);
        results.push({ model, exists: true });
      } else {
        console.log(`❌ ${model} - NÃO encontrado`);
        results.push({ model, exists: false, error: 'Modelo não encontrado no Prisma Client' });
      }
    } catch (error: any) {
      console.log(`❌ ${model} - ERRO: ${error.message}`);
      results.push({ model, exists: false, error: error.message });
    }
  }

  console.log('\n📊 Resumo:');
  const available = results.filter(r => r.exists).length;
  const unavailable = results.filter(r => !r.exists).length;
  
  console.log(`✅ Disponíveis: ${available}`);
  console.log(`❌ Indisponíveis: ${unavailable}`);

  if (unavailable > 0) {
    console.log('\n⚠️  AÇÃO NECESSÁRIA:');
    console.log('Execute: npx prisma generate');
    console.log('Depois reinicie o servidor.');
  }

  // Testar uma query simples
  console.log('\n🧪 Testando query simples...');
  try {
    const count = await prisma.blogArticle.count();
    console.log(`✅ Query funcionou! Total de artigos: ${count}`);
  } catch (error: any) {
    console.log(`❌ Erro na query: ${error.message}`);
    console.log('\n⚠️  O Prisma Client precisa ser regenerado!');
    console.log('Execute: npx prisma generate');
  }

  await prisma.$disconnect();
}

checkPrismaModels()
  .catch((error) => {
    console.error('Erro ao verificar modelos:', error);
    process.exit(1);
  });
