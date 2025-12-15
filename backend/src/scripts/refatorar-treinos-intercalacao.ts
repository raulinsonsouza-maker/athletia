/**
 * Script CLI para refatorar treinos existentes aplicando intercalação de grupos musculares
 * 
 * Uso:
 *   npm run refatorar-treinos-intercalacao [userId?] [--dry-run]
 * 
 * Se userId for fornecido, refatora apenas treinos daquele usuário
 * Se não for fornecido, refatora todos os treinos canônicos (IA com 2 grupos)
 * 
 * --dry-run: apenas mostra o que seria feito, sem aplicar mudanças
 */

import { prisma } from '../lib/prisma';
import { intercalarExerciciosPorGrupo } from '../services/treino-core.service';

/**
 * Identifica se um treino é canônico (tem exatamente 2 grupos musculares principais)
 */
function isTreinoCanonico(exercicios: any[]): boolean {
  const gruposPrincipais = new Set<string>();
  
  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    if (grupo && grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade') {
      gruposPrincipais.add(grupo);
    }
  });
  
  return gruposPrincipais.size === 2;
}

/**
 * Separa exercícios por grupo muscular
 */
function separarExerciciosPorGrupo(exercicios: any[]): { grupos: any[][], gruposNomes: string[] } {
  const gruposMap = new Map<string, any[]>();
  const gruposNomes: string[] = [];
  
  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    if (grupo && grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade') {
      if (!gruposMap.has(grupo)) {
        gruposMap.set(grupo, []);
        gruposNomes.push(grupo);
      }
      gruposMap.get(grupo)!.push(ex);
    }
  });
  
  // Ordenar grupos pela ordem de aparição
  const grupos = gruposNomes.map(nome => gruposMap.get(nome)!);
  
  return { grupos, gruposNomes };
}

/**
 * Refatora um treino aplicando intercalação
 */
async function refatorarTreino(treinoId: string, dryRun: boolean = false): Promise<boolean> {
  // Buscar treino com exercícios
  const treino = await prisma.treino.findUnique({
    where: { id: treinoId },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });
  
  if (!treino) {
    console.warn(`  ⚠️  Treino ${treinoId} não encontrado`);
    return false;
  }
  
  // Separar exercícios de força e outros (cardio, alongamento)
  const exerciciosForca = treino.exercicios.filter(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    return grupo && grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade';
  });
  
  const exerciciosEspeciais = treino.exercicios.filter(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal;
    return grupo === 'Cardio' || grupo === 'Alongamento' || grupo === 'Flexibilidade';
  });
  
  // Verificar se é treino canônico (2 grupos)
  if (!isTreinoCanonico(exerciciosForca)) {
    console.log(`  ⏭️  Treino ${treinoId} não é canônico (${new Set(exerciciosForca.map(ex => ex.exercicio?.grupoMuscularPrincipal).filter(Boolean)).size} grupos). Pulando...`);
    return false;
  }
  
  // Separar por grupos
  const { grupos, gruposNomes } = separarExerciciosPorGrupo(exerciciosForca);
  
  if (grupos.length !== 2) {
    console.warn(`  ⚠️  Treino ${treinoId} tem ${grupos.length} grupos ao invés de 2. Pulando...`);
    return false;
  }
  
  // Verificar se já está intercalado (verificar padrão alternado)
  const ordemAtual = exerciciosForca.map(ex => ex.exercicio?.grupoMuscularPrincipal);
  let jaIntercalado = true;
  for (let i = 1; i < ordemAtual.length; i++) {
    if (ordemAtual[i] === ordemAtual[i - 1]) {
      jaIntercalado = false;
      break;
    }
  }
  
  if (jaIntercalado) {
    console.log(`  ✅ Treino ${treinoId} já está intercalado. Pulando...`);
    return false;
  }
  
  // Intercalar exercícios
  const exerciciosIntercalados = intercalarExerciciosPorGrupo(grupos);
  
  // Combinar: exercícios intercalados + exercícios especiais (cardio/alongamento no final)
  const novaOrdem = [...exerciciosIntercalados, ...exerciciosEspeciais];
  
  if (dryRun) {
    console.log(`  🔍 [DRY RUN] Treino ${treinoId} seria refatorado:`);
    console.log(`     Grupos: ${gruposNomes.join(' e ')}`);
    console.log(`     Ordem atual: ${ordemAtual.slice(0, 8).join(' → ')}...`);
    console.log(`     Nova ordem: ${novaOrdem.map(ex => ex.exercicio?.grupoMuscularPrincipal).slice(0, 8).join(' → ')}...`);
    return true;
  }
  
  // Atualizar ordem no banco
  try {
    await prisma.$transaction(
      novaOrdem.map((exercicioTreino, index) =>
        prisma.exercicioTreino.update({
          where: { id: exercicioTreino.id },
          data: { ordem: index }
        })
      )
    );
    
    console.log(`  ✅ Treino ${treinoId} refatorado: ${gruposNomes.join(' e ')} intercalados`);
    return true;
  } catch (error) {
    console.error(`  ❌ Erro ao refatorar treino ${treinoId}:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const userId = args.find(arg => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  
  console.log('========================================');
  console.log('Refatoração de Treinos - Intercalação');
  console.log('========================================\n');
  
  if (dryRun) {
    console.log('🔍 MODO DRY RUN - Nenhuma mudança será aplicada\n');
  }
  
  if (userId) {
    console.log(`Refatorando treinos para usuário: ${userId}`);
  } else {
    console.log('Refatorando TODOS os treinos canônicos (IA com 2 grupos)');
  }
  
  console.log('');
  
  try {
    // Buscar treinos
    const whereClause: any = {
      criadoPor: 'IA',
      exercicios: {
        some: {}
      }
    };
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    const treinos = await prisma.treino.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        userId: true,
        data: true,
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { data: 'desc' }
    });
    
    console.log(`📊 Encontrados ${treinos.length} treinos para análise\n`);
    
    if (treinos.length === 0) {
      console.log('✅ Nenhum treino encontrado para refatorar');
      process.exit(0);
    }
    
    let refatorados = 0;
    let pulados = 0;
    let erros = 0;
    
    for (const treino of treinos) {
      const resultado = await refatorarTreino(treino.id, dryRun);
      if (resultado) {
        refatorados++;
      } else {
        pulados++;
      }
    }
    
    console.log('\n========================================');
    console.log('Resumo:');
    console.log(`  ✅ Refatorados: ${refatorados}`);
    console.log(`  ⏭️  Pulados: ${pulados}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log('========================================\n');
    
    if (dryRun) {
      console.log('💡 Execute sem --dry-run para aplicar as mudanças');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante refatoração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main();
}
