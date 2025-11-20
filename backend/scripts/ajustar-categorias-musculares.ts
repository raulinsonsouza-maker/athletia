import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ajustes de categorias musculares
 */
const ajustesCategorias = [
  {
    nome: 'Mesa Flexora',
    categoriaAtual: 'Posteriores de Coxa',
    categoriaNova: 'Posteriores'
  },
  {
    nome: 'Stiff',
    categoriaAtual: 'Posteriores de Coxa',
    categoriaNova: 'Posteriores'
  },
  {
    nome: 'Bicicleta Ergométrica',
    categoriaAtual: 'Cardio / Aeróbico',
    categoriaNova: 'Cardio'
  },
  {
    nome: 'Elíptico',
    categoriaAtual: 'Cardio / Aeróbico',
    categoriaNova: 'Cardio'
  },
  {
    nome: 'Escada',
    categoriaAtual: 'Cardio / Aeróbico',
    categoriaNova: 'Cardio'
  },
  {
    nome: 'Esteira',
    categoriaAtual: 'Cardio / Aeróbico',
    categoriaNova: 'Cardio'
  }
];

/**
 * Script principal
 */
async function ajustarCategoriasMusculares() {
  console.log('📝 Iniciando ajuste de categorias musculares...\n');

  try {
    let atualizados = 0;
    let naoEncontrados = 0;
    let erros = 0;

    for (const ajuste of ajustesCategorias) {
      try {
        // Buscar exercício por nome (case insensitive)
        const exercicio = await prisma.exercicio.findFirst({
          where: {
            nome: {
              equals: ajuste.nome,
              mode: 'insensitive'
            }
          }
        });

        if (!exercicio) {
          console.log(`⚠️  Exercício não encontrado: "${ajuste.nome}"`);
          naoEncontrados++;
          continue;
        }

        // Verificar se a categoria atual está correta
        if (exercicio.grupoMuscularPrincipal !== ajuste.categoriaAtual) {
          console.log(`ℹ️  Exercício "${ajuste.nome}" tem categoria "${exercicio.grupoMuscularPrincipal}" (esperado: "${ajuste.categoriaAtual}"). Atualizando mesmo assim.`);
        }

        // Atualizar categoria
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: {
            grupoMuscularPrincipal: ajuste.categoriaNova
          }
        });

        console.log(`✅ "${ajuste.nome}": "${ajuste.categoriaAtual}" → "${ajuste.categoriaNova}"`);
        atualizados++;
      } catch (error: any) {
        console.error(`❌ Erro ao atualizar "${ajuste.nome}":`, error.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DO AJUSTE');
    console.log('='.repeat(80));
    console.log(`✅ Exercícios atualizados: ${atualizados}`);
    if (naoEncontrados > 0) {
      console.log(`⚠️  Exercícios não encontrados: ${naoEncontrados}`);
    }
    if (erros > 0) {
      console.log(`❌ Erros: ${erros}`);
    }
    console.log(`📝 Total processado: ${ajustesCategorias.length}`);
    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao ajustar categorias:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
ajustarCategoriasMusculares()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

