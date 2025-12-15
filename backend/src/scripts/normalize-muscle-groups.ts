/**
 * Script para normalizar todos os grupos musculares no banco de dados
 * 
 * Normaliza:
 * - grupoMuscularPrincipal de todos os exercícios
 * - sinergistas de todos os exercícios
 * - Grupos na tabela GrupoMuscularVisual (se necessário)
 * 
 * Uso:
 *   npm run normalize-muscle-groups
 */

import { prisma } from '../lib/prisma';
import { normalizarGrupoParaCanonico } from '../services/grupo-muscular.service';
import { GRUPOS_CANONICOS } from '../services/muscle-group-canonical.service';

/**
 * Normaliza um grupo muscular para o formato canônico
 */
function normalizarGrupo(grupo: string): string | null {
  return normalizarGrupoParaCanonico(grupo);
}

/**
 * Normaliza array de grupos (sinergistas)
 */
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

/**
 * Normaliza todos os exercícios no banco
 */
async function normalizarExercicios(): Promise<void> {
  console.log('\n========================================');
  console.log('Normalização de Grupos Musculares - Exercícios');
  console.log('========================================\n');

  // Buscar todos os exercícios
  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      nome: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });

  console.log(`Encontrados ${exercicios.length} exercícios para normalizar\n`);

  let atualizados = 0;
  let erros = 0;
  const estatisticas: Record<string, number> = {};

  for (const exercicio of exercicios) {
    try {
      const grupoOriginal = exercicio.grupoMuscularPrincipal;
      const sinergistasOriginais = exercicio.sinergistas || [];

      // Normalizar grupo principal
      const grupoNormalizado = normalizarGrupo(grupoOriginal);
      
      if (!grupoNormalizado) {
        console.warn(
          `⚠️  Exercício "${exercicio.nome}" (${exercicio.id}): ` +
          `Grupo principal "${grupoOriginal}" não pôde ser normalizado. PULANDO.`
        );
        erros++;
        continue;
      }

      // Normalizar sinergistas
      const sinergistasNormalizados = normalizarGrupos(sinergistasOriginais);

      // Verificar se precisa atualizar
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

        // Estatísticas
        if (grupoNormalizado !== grupoOriginal) {
          estatisticas[`${grupoOriginal} → ${grupoNormalizado}`] = 
            (estatisticas[`${grupoOriginal} → ${grupoNormalizado}`] || 0) + 1;
        }

        if (atualizados % 50 === 0) {
          console.log(`Progresso: ${atualizados} exercícios atualizados...`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Erro ao normalizar exercício "${exercicio.nome}" (${exercicio.id}):`,
        error
      );
      erros++;
    }
  }

  console.log('\n========================================');
  console.log('Resultado da Normalização de Exercícios');
  console.log('========================================');
  console.log(`Total de exercícios: ${exercicios.length}`);
  console.log(`Atualizados: ${atualizados}`);
  console.log(`Erros: ${erros}`);
  console.log(`Sem alterações necessárias: ${exercicios.length - atualizados - erros}`);
  
  if (Object.keys(estatisticas).length > 0) {
    console.log('\nMudanças de grupos principais:');
    Object.entries(estatisticas)
      .sort((a, b) => b[1] - a[1])
      .forEach(([mudanca, count]) => {
        console.log(`  ${mudanca}: ${count} exercício(s)`);
      });
  }
  
  console.log('');
}

/**
 * Normaliza grupos na tabela GrupoMuscularVisual
 */
async function normalizarGruposVisuais(): Promise<void> {
  console.log('\n========================================');
  console.log('Normalização de Grupos Musculares - Visual');
  console.log('========================================\n');

  const gruposVisuais = await prisma.grupoMuscularVisual.findMany({
    select: {
      id: true,
      nome: true,
      slug: true
    }
  });

  console.log(`Encontrados ${gruposVisuais.length} grupos visuais\n`);

  let atualizados = 0;
  const gruposCanonicosSet = new Set(GRUPOS_CANONICOS);

  for (const grupoVisual of gruposVisuais) {
    const nomeOriginal = grupoVisual.nome;
    const nomeNormalizado = normalizarGrupo(nomeOriginal);

    // Se o nome já é canônico, pular
    if (gruposCanonicosSet.has(nomeOriginal as any)) {
      continue;
    }

    // Se pode ser normalizado e é diferente
    if (nomeNormalizado && nomeNormalizado !== nomeOriginal) {
      // Verificar se já existe um grupo com o nome canônico
      const grupoCanonicoExistente = await prisma.grupoMuscularVisual.findFirst({
        where: { nome: nomeNormalizado, ativo: true }
      });

      if (grupoCanonicoExistente) {
        // Se existe, podemos marcar o atual como inativo ou deletar
        // Por segurança, vamos apenas avisar
        console.warn(
          `⚠️  Grupo "${nomeOriginal}" pode ser normalizado para "${nomeNormalizado}", ` +
          `mas já existe um grupo ativo com esse nome. Mantendo original.`
        );
      } else {
        // Atualizar para o nome canônico
        try {
          await prisma.grupoMuscularVisual.update({
            where: { id: grupoVisual.id },
            data: { nome: nomeNormalizado }
          });
          atualizados++;
          console.log(`✅ "${nomeOriginal}" → "${nomeNormalizado}"`);
        } catch (error) {
          console.error(`❌ Erro ao atualizar grupo "${nomeOriginal}":`, error);
        }
      }
    }
  }

  console.log(`\n${atualizados} grupos visuais atualizados\n`);
}

/**
 * Verifica consistência após normalização
 */
async function verificarConsistencia(): Promise<void> {
  console.log('\n========================================');
  console.log('Verificação de Consistência');
  console.log('========================================\n');

  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      nome: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });

  const gruposCanonicosSet = new Set(GRUPOS_CANONICOS);
  const gruposInvalidos: Array<{ id: string; nome: string; grupo: string }> = [];
  const gruposInvalidosSinergistas: Array<{ id: string; nome: string; grupos: string[] }> = [];

  for (const exercicio of exercicios) {
    // Verificar grupo principal
    if (!gruposCanonicosSet.has(exercicio.grupoMuscularPrincipal as any)) {
      gruposInvalidos.push({
        id: exercicio.id,
        nome: exercicio.nome,
        grupo: exercicio.grupoMuscularPrincipal
      });
    }

    // Verificar sinergistas
    const sinergistasInvalidos = (exercicio.sinergistas || []).filter(
      s => !gruposCanonicosSet.has(s as any)
    );

    if (sinergistasInvalidos.length > 0) {
      gruposInvalidosSinergistas.push({
        id: exercicio.id,
        nome: exercicio.nome,
        grupos: sinergistasInvalidos
      });
    }
  }

  if (gruposInvalidos.length === 0 && gruposInvalidosSinergistas.length === 0) {
    console.log('✅ Todos os exercícios estão usando grupos canônicos!');
  } else {
    console.log(`⚠️  Encontrados problemas de consistência:\n`);
    
    if (gruposInvalidos.length > 0) {
      console.log(`Grupos principais inválidos: ${gruposInvalidos.length}`);
      gruposInvalidos.slice(0, 10).forEach(ex => {
        console.log(`  - "${ex.nome}" (${ex.id}): "${ex.grupo}"`);
      });
      if (gruposInvalidos.length > 10) {
        console.log(`  ... e mais ${gruposInvalidos.length - 10}`);
      }
    }

    if (gruposInvalidosSinergistas.length > 0) {
      console.log(`\nSinergistas inválidos: ${gruposInvalidosSinergistas.length}`);
      gruposInvalidosSinergistas.slice(0, 10).forEach(ex => {
        console.log(`  - "${ex.nome}" (${ex.id}): ${ex.grupos.join(', ')}`);
      });
      if (gruposInvalidosSinergistas.length > 10) {
        console.log(`  ... e mais ${gruposInvalidosSinergistas.length - 10}`);
      }
    }
  }

  console.log('');
}

/**
 * Função principal
 */
async function main() {
  console.log('========================================');
  console.log('Normalização de Grupos Musculares');
  console.log('========================================');
  console.log(`\nGrupos canônicos (${GRUPOS_CANONICOS.length}):`);
  GRUPOS_CANONICOS.forEach((grupo, index) => {
    console.log(`  ${index + 1}. ${grupo}`);
  });

  try {
    // Normalizar exercícios
    await normalizarExercicios();

    // Sincronizar grupos visuais após normalização
    console.log('\n========================================');
    console.log('Sincronizando grupos visuais dos exercícios...');
    console.log('========================================\n');
    
    const { sincronizarTodosExerciciosComGrupos } = await import('../services/grupo-muscular.service');
    await sincronizarTodosExerciciosComGrupos();
    
    console.log('✅ Sincronização de grupos visuais concluída!\n');

    // Verificar consistência
    await verificarConsistencia();

    console.log('✅ Normalização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante normalização:', error);
    process.exit(1);
  }
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main();
}
