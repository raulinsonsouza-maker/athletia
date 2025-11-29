import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para limpar todas as URLs de mídia (gifUrl e imagemUrl) de todos os exercícios
 * 
 * Uso: npx ts-node backend/scripts/limpar-todas-midias.ts
 */
async function limparTodasMidias() {
  try {
    console.log('🧹 Iniciando limpeza de todas as URLs de mídia...');
    console.log('');

    // Contar exercícios antes da limpeza
    const totalExercicios = await prisma.exercicio.count();
    const exerciciosComGifUrl = await prisma.exercicio.count({
      where: { gifUrl: { not: null } }
    });
    const exerciciosComImagemUrl = await prisma.exercicio.count({
      where: { imagemUrl: { not: null } }
    });

    console.log('📊 Estatísticas antes da limpeza:');
    console.log(`   Total de exercícios: ${totalExercicios}`);
    console.log(`   Exercícios com gifUrl: ${exerciciosComGifUrl}`);
    console.log(`   Exercícios com imagemUrl: ${exerciciosComImagemUrl}`);
    console.log('');

    // Atualizar todos os exercícios
    const resultado = await prisma.exercicio.updateMany({
      data: {
        gifUrl: null,
        imagemUrl: null
      }
    });

    console.log('✅ Limpeza concluída!');
    console.log(`   Exercícios atualizados: ${resultado.count}`);
    console.log('');
    console.log('📝 Todas as referências de gifUrl e imagemUrl foram removidas do banco de dados.');
    console.log('   O banco está pronto para novos uploads.');
  } catch (error: any) {
    console.error('❌ Erro ao limpar URLs de mídia:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
limparTodasMidias();

