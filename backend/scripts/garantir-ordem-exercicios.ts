import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para garantir ordem correta: cardio primeiro (0), alongamento último
 */
async function garantirOrdemExercicios() {
  console.log('🔄 Garantindo ordem correta dos exercícios em todos os treinos...\n');

  try {
    // Buscar todos os treinos
    const treinos = await prisma.treino.findMany({
      include: {
        exercicios: {
          include: { exercicio: true }
        }
      }
    });

    console.log(`📊 Encontrados ${treinos.length} treinos\n`);

    let totalReordenados = 0;
    let totalErros = 0;

    for (const treino of treinos) {
      // Filtrar exercícios de força (excluir Cardio e Flexibilidade)
      const exerciciosForca = treino.exercicios.filter((ex: any) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
      });

      // Se não tem exercícios de força, pular
      if (exerciciosForca.length === 0) {
        continue;
      }

      try {
        // Separar exercícios por tipo
        const cardio = treino.exercicios.find((ex: any) => 
          ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
        );
        const alongamento = treino.exercicios.find((ex: any) => 
          ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
        );

        // Sempre reordenar para garantir ordem correta
        {
          // Reordenar: cardio primeiro (0), força no meio, alongamento último
          if (cardio) {
            await prisma.exercicioTreino.update({
              where: { id: cardio.id },
              data: { ordem: 0 }
            });
          }

          // Atualizar exercícios de força (ordem 1, 2, 3...)
          let ordem = 1;
          for (const ex of exerciciosForca) {
            await prisma.exercicioTreino.update({
              where: { id: ex.id },
              data: { ordem: ordem++ }
            });
          }

          // Atualizar alongamento para última ordem
          if (alongamento) {
            await prisma.exercicioTreino.update({
              where: { id: alongamento.id },
              data: { ordem: ordem }
            });
          }

          totalReordenados++;
          console.log(`  ✅ Treino ${new Date(treino.data).toLocaleDateString('pt-BR')} reordenado`);
        }
      } catch (error: any) {
        console.error(`  ❌ Erro ao reordenar treino ${treino.id}:`, error.message);
        totalErros++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA REORDENAÇÃO:');
    console.log('='.repeat(60));
    console.log(`✅ Treinos reordenados: ${totalReordenados}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('❌ Erro ao garantir ordem:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
garantirOrdemExercicios()
  .then(() => {
    console.log('\n✅ Garantia de ordem concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na garantia de ordem:', error);
    process.exit(1);
  });

