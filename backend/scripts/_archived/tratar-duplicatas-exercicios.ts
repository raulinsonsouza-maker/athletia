import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normaliza nome para comparação
 */
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\w\s]/g, '');
}

/**
 * Calcula similaridade entre dois nomes
 */
function calcularSimilaridade(nome1: string, nome2: string): number {
  const n1 = normalizarNome(nome1);
  const n2 = normalizarNome(nome2);
  
  if (n1 === n2) return 1.0;
  
  if (n1.includes(n2) || n2.includes(n1)) {
    const menor = Math.min(n1.length, n2.length);
    const maior = Math.max(n1.length, n2.length);
    return menor / maior;
  }
  
  const palavras1 = n1.split(' ').filter(p => p.length > 2);
  const palavras2 = n2.split(' ').filter(p => p.length > 2);
  
  if (palavras1.length === 0 || palavras2.length === 0) return 0;
  
  const palavrasComuns = palavras1.filter(p => palavras2.includes(p));
  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  
  return palavrasComuns.length / totalPalavras;
}

/**
 * Verifica se um exercício está sendo usado em treinos
 */
async function exercicioEmUso(exercicioId: string): Promise<boolean> {
  const count = await prisma.exercicioTreino.count({
    where: { exercicioId }
  });
  return count > 0;
}

/**
 * Script para tratar duplicatas
 */
async function tratarDuplicatas() {
  console.log('🔍 Identificando e tratando exercícios duplicados...\n');

  try {
    const exercicios = await prisma.exercicio.findMany({
      orderBy: { nome: 'asc' }
    });

    console.log(`📊 Total de exercícios: ${exercicios.length}\n`);

    const duplicatas: Array<{ exercicio1: any; exercicio2: any; similaridade: number }> = [];
    
    for (let i = 0; i < exercicios.length; i++) {
      for (let j = i + 1; j < exercicios.length; j++) {
        const similaridade = calcularSimilaridade(exercicios[i].nome, exercicios[j].nome);
        if (similaridade >= 0.9) { // 90% de similaridade = duplicata real
          duplicatas.push({
            exercicio1: exercicios[i],
            exercicio2: exercicios[j],
            similaridade
          });
        }
      }
    }

    console.log(`⚠️ Encontradas ${duplicatas.length} duplicatas (similaridade >= 90%):\n`);

    let duplicatasTratadas = 0;
    let duplicatasMantidas = 0;

    for (const dup of duplicatas) {
      const ex1 = dup.exercicio1;
      const ex2 = dup.exercicio2;

      console.log(`\n🔍 Duplicata encontrada (${(dup.similaridade * 100).toFixed(0)}% similar):`);
      console.log(`   1. "${ex1.nome}" (${ex1.ativo ? 'Ativo' : 'Inativo'}) [${ex1.id}]`);
      console.log(`   2. "${ex2.nome}" (${ex2.ativo ? 'Ativo' : 'Inativo'}) [${ex2.id}]`);

      // Verificar qual está em uso
      const ex1EmUso = await exercicioEmUso(ex1.id);
      const ex2EmUso = await exercicioEmUso(ex2.id);

      console.log(`   Uso: Ex1=${ex1EmUso ? 'SIM' : 'NÃO'}, Ex2=${ex2EmUso ? 'SIM' : 'NÃO'}`);

      // Decisão: manter o ativo, ou o que está em uso, ou o mais completo
      let manter: any;
      let remover: any;

      if (ex1EmUso && !ex2EmUso) {
        manter = ex1;
        remover = ex2;
        console.log(`   ✅ Decisão: Manter "${ex1.nome}" (está em uso), remover "${ex2.nome}"`);
      } else if (ex2EmUso && !ex1EmUso) {
        manter = ex2;
        remover = ex1;
        console.log(`   ✅ Decisão: Manter "${ex2.nome}" (está em uso), remover "${ex1.nome}"`);
      } else if (ex1.ativo && !ex2.ativo) {
        manter = ex1;
        remover = ex2;
        console.log(`   ✅ Decisão: Manter "${ex1.nome}" (ativo), desativar "${ex2.nome}"`);
      } else if (ex2.ativo && !ex1.ativo) {
        manter = ex2;
        remover = ex1;
        console.log(`   ✅ Decisão: Manter "${ex2.nome}" (ativo), desativar "${ex1.nome}"`);
      } else {
        // Ambos ativos ou ambos inativos - manter o mais completo
        const ex1Completo = (ex1.descricao?.length || 0) + (ex1.execucaoTecnica?.length || 0) + (ex1.errosComuns?.length || 0);
        const ex2Completo = (ex2.descricao?.length || 0) + (ex2.execucaoTecnica?.length || 0) + (ex2.errosComuns?.length || 0);
        
        if (ex1Completo >= ex2Completo) {
          manter = ex1;
          remover = ex2;
          console.log(`   ✅ Decisão: Manter "${ex1.nome}" (mais completo), desativar "${ex2.nome}"`);
        } else {
          manter = ex2;
          remover = ex1;
          console.log(`   ✅ Decisão: Manter "${ex2.nome}" (mais completo), desativar "${ex1.nome}"`);
        }
      }

      // Se o que vamos remover está em uso, não podemos remover
      const removerEmUso = await exercicioEmUso(remover.id);
      
      if (removerEmUso) {
        console.log(`   ⚠️ ATENÇÃO: "${remover.nome}" está em uso! Apenas desativando...`);
        await prisma.exercicio.update({
          where: { id: remover.id },
          data: { ativo: false }
        });
        duplicatasMantidas++;
      } else {
        // Se não está em uso e é duplicata exata (100%), podemos deletar
        if (dup.similaridade >= 0.99) {
          console.log(`   🗑️ Removendo duplicata exata "${remover.nome}"...`);
          await prisma.exercicio.delete({
            where: { id: remover.id }
          });
          duplicatasTratadas++;
        } else {
          // Similar mas não idêntico - apenas desativar
          console.log(`   ⏸️ Desativando "${remover.nome}" (similar mas não idêntico)...`);
          await prisma.exercicio.update({
            where: { id: remover.id },
            data: { ativo: false }
          });
          duplicatasMantidas++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO TRATAMENTO DE DUPLICATAS');
    console.log('='.repeat(60));
    console.log(`🗑️ Duplicatas removidas: ${duplicatasTratadas}`);
    console.log(`⏸️ Duplicatas desativadas: ${duplicatasMantidas}`);
    console.log(`📦 Total processado: ${duplicatas.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao tratar duplicatas:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar tratamento
tratarDuplicatas()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

