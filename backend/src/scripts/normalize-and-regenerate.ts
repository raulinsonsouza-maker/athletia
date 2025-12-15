/**
 * Script completo: Normaliza grupos musculares E regenera todos os treinos
 * 
 * Este script faz:
 * 1. Normaliza todos os grupos musculares dos exercícios
 * 2. Sincroniza grupos visuais
 * 3. Regenera todos os treinos com a nova lógica canônica
 * 
 * Uso:
 *   npm run normalize-and-regenerate [userId?]
 * 
 * Se userId for fornecido, normaliza e regenera apenas para aquele usuário
 */

import { regenerarTodosTreinosCanonico } from '../services/treino-regeneration.service';
import { sincronizarTodosExerciciosComGrupos } from '../services/grupo-muscular.service';

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0]; // Opcional

  console.log('========================================');
  console.log('Normalização e Regeneração Completa');
  console.log('========================================\n');

  if (userId) {
    console.log(`Processando apenas para usuário: ${userId}\n`);
  } else {
    console.log('Processando TODOS os usuários\n');
  }

  try {
    // Passo 1: Normalizar exercícios
    console.log('PASSO 1: Normalizando grupos musculares dos exercícios...');
    console.log('─'.repeat(50));
    
    // Executar normalização inline (importar funções necessárias)
    const { prisma } = await import('../lib/prisma');
    const { normalizarGrupoParaCanonico } = await import('../services/grupo-muscular.service');
    const { GRUPOS_CANONICOS } = await import('../services/muscle-group-canonical.service');

    function normalizarGrupo(grupo: string): string | null {
      return normalizarGrupoParaCanonico(grupo);
    }

    function normalizarGrupos(grupos: string[]): string[] {
      const normalizados: string[] = [];
      const visto = new Set<string>();

      for (const grupo of grupos) {
        const normalizado = normalizarGrupo(grupo);
        if (normalizado && !visto.has(normalizado)) {
          normalizados.push(normalizado);
          visto.add(normalizado);
        }
      }

      return normalizados;
    }

    const exercicios = await prisma.exercicio.findMany({
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true
      }
    });

    console.log(`Encontrados ${exercicios.length} exercícios para normalizar`);

    let atualizados = 0;
    for (const exercicio of exercicios) {
      try {
        const grupoOriginal = exercicio.grupoMuscularPrincipal;
        const sinergistasOriginais = exercicio.sinergistas || [];

        const grupoNormalizado = normalizarGrupo(grupoOriginal);
        
        if (!grupoNormalizado) {
          console.warn(`⚠️  Exercício "${exercicio.nome}": grupo "${grupoOriginal}" não pode ser normalizado`);
          continue;
        }

        const sinergistasNormalizados = normalizarGrupos(sinergistasOriginais);

        const precisaAtualizar = 
          grupoNormalizado !== grupoOriginal ||
          JSON.stringify(sinergistasNormalizados.sort()) !== JSON.stringify((sinergistasOriginais || []).sort());

        if (precisaAtualizar) {
          await prisma.exercicio.update({
            where: { id: exercicio.id },
            data: {
              grupoMuscularPrincipal: grupoNormalizado,
              sinergistas: sinergistasNormalizados
            }
          });

          atualizados++;
        }
      } catch (error) {
        console.error(`❌ Erro ao normalizar exercício "${exercicio.nome}":`, error);
      }
    }

    console.log(`✅ ${atualizados} exercícios atualizados\n`);

    // Passo 2: Sincronizar grupos visuais
    console.log('PASSO 2: Sincronizando grupos visuais...');
    console.log('─'.repeat(50));
    await sincronizarTodosExerciciosComGrupos();
    console.log('✅ Sincronização concluída\n');

    // Passo 3: Verificar consistência
    console.log('PASSO 3: Verificando consistência...');
    console.log('─'.repeat(50));
    
    const gruposCanonicosSet = new Set(GRUPOS_CANONICOS);
    const exerciciosFinais = await prisma.exercicio.findMany({
      select: {
        id: true,
        nome: true,
        grupoMuscularPrincipal: true,
        sinergistas: true
      }
    });

    const gruposInvalidos = exerciciosFinais.filter(
      ex => !gruposCanonicosSet.has(ex.grupoMuscularPrincipal as any)
    );

    if (gruposInvalidos.length === 0) {
      console.log('✅ Todos os exercícios estão usando grupos canônicos!\n');
    } else {
      console.log(`⚠️  ${gruposInvalidos.length} exercícios ainda têm grupos inválidos\n`);
    }

    // Passo 4: Regenerar treinos
    console.log('PASSO 4: Regenerando treinos com lógica canônica...');
    console.log('─'.repeat(50));
    await regenerarTodosTreinosCanonico(userId);
    console.log('✅ Regeneração concluída\n');

    console.log('========================================');
    console.log('✅ Processo completo finalizado com sucesso!');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante o processo:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
