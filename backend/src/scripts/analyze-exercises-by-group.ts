/**
 * Script para analisar exercícios por grupo muscular no banco de dados
 * 
 * Mostra quantos exercícios existem para cada grupo canônico
 */

import { prisma } from '../lib/prisma';
import { normalizarGrupoParaCanonico } from '../services/grupo-muscular.service';
import { GRUPOS_CANONICOS } from '../services/muscle-group-canonical.service';

async function main() {
  console.log('========================================');
  console.log('Análise de Exercícios por Grupo Muscular');
  console.log('========================================\n');

  // Buscar todos os exercícios ativos
  const exercicios = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });

  console.log(`Total de exercícios ativos: ${exercicios.length}\n`);

  // Contar por grupo canônico
  const estatisticas: Record<string, {
    comoPrincipal: number;
    comoSinergista: number;
    total: Set<string>; // IDs únicos
  }> = {};

  // Inicializar estatísticas
  GRUPOS_CANONICOS.forEach(grupo => {
    estatisticas[grupo] = {
      comoPrincipal: 0,
      comoSinergista: 0,
      total: new Set()
    };
  });

  // Processar cada exercício
  for (const exercicio of exercicios) {
    const grupoPrincipalCanonico = normalizarGrupoParaCanonico(exercicio.grupoMuscularPrincipal);
    
    if (grupoPrincipalCanonico) {
      if (estatisticas[grupoPrincipalCanonico]) {
        estatisticas[grupoPrincipalCanonico].comoPrincipal++;
        estatisticas[grupoPrincipalCanonico].total.add(exercicio.id);
      }
    }

    // Processar sinergistas
    if (exercicio.sinergistas && exercicio.sinergistas.length > 0) {
      for (const sinergista of exercicio.sinergistas) {
        const sinergistaCanonico = normalizarGrupoParaCanonico(sinergista);
        if (sinergistaCanonico && estatisticas[sinergistaCanonico]) {
          estatisticas[sinergistaCanonico].comoSinergista++;
          estatisticas[sinergistaCanonico].total.add(exercicio.id);
        }
      }
    }
  }

  // Mostrar estatísticas
  console.log('Estatísticas por Grupo Canônico:\n');
  console.log('Grupo'.padEnd(20) + 'Principal'.padEnd(12) + 'Sinergista'.padEnd(12) + 'Total Único');
  console.log('─'.repeat(60));

  for (const grupo of GRUPOS_CANONICOS) {
    const stats = estatisticas[grupo];
    const totalUnico = stats.total.size;
    const status = totalUnico >= 4 ? '✅' : totalUnico >= 2 ? '⚠️' : '❌';
    
    console.log(
      `${status} ${grupo.padEnd(17)} ` +
      `${stats.comoPrincipal.toString().padEnd(12)} ` +
      `${stats.comoSinergista.toString().padEnd(12)} ` +
      `${totalUnico}`
    );
  }

  console.log('\n');

  // Mostrar grupos com problemas
  console.log('Grupos com menos de 4 exercícios únicos:');
  console.log('─'.repeat(60));
  
  const gruposComProblemas = GRUPOS_CANONICOS.filter(
    grupo => estatisticas[grupo].total.size < 4
  );

  if (gruposComProblemas.length === 0) {
    console.log('✅ Todos os grupos têm pelo menos 4 exercícios únicos!\n');
  } else {
    gruposComProblemas.forEach(grupo => {
      const stats = estatisticas[grupo];
      console.log(`❌ ${grupo}: ${stats.total.size} exercícios únicos (${stats.comoPrincipal} principais, ${stats.comoSinergista} sinergistas)`);
    });
    console.log('');
  }

  // Mostrar alguns exemplos de exercícios problemáticos
  console.log('\nExemplos de exercícios por grupo (primeiros 5):');
  console.log('─'.repeat(60));

  for (const grupo of GRUPOS_CANONICOS.slice(0, 3)) { // Mostrar apenas primeiros 3
    const exerciciosDoGrupo = exercicios.filter(ex => {
      const grupoPrincipalCanonico = normalizarGrupoParaCanonico(ex.grupoMuscularPrincipal);
      const sinergistasCanonicos = (ex.sinergistas || []).map(s => normalizarGrupoParaCanonico(s));
      
      return grupoPrincipalCanonico === grupo || sinergistasCanonicos.includes(grupo);
    }).slice(0, 5);

    if (exerciciosDoGrupo.length > 0) {
      console.log(`\n${grupo}:`);
      exerciciosDoGrupo.forEach(ex => {
        const grupoPrincipalCanonico = normalizarGrupoParaCanonico(ex.grupoMuscularPrincipal);
        const tipo = grupoPrincipalCanonico === grupo ? '[PRINCIPAL]' : '[SINERGISTA]';
        console.log(`  ${tipo} ${ex.nome} (${ex.grupoMuscularPrincipal})`);
      });
    }
  }

  // Verificar pares sinérgicos problemáticos
  console.log('\n\nAnálise de Pares Sinérgicos:');
  console.log('─'.repeat(60));
  
  const { obterParesSinergicos } = await import('../services/muscle-synergy-matrix.service');
  const pares = obterParesSinergicos();
  
  for (const [grupo1, grupo2] of pares.slice(0, 5)) { // Primeiros 5 pares
    const stats1 = estatisticas[grupo1];
    const stats2 = estatisticas[grupo2];
    
    console.log(`\nPar: ${grupo1} + ${grupo2}`);
    console.log(`  ${grupo1}: ${stats1.total.size} exercícios únicos`);
    console.log(`  ${grupo2}: ${stats2.total.size} exercícios únicos`);
    
    if (stats1.total.size < 4 || stats2.total.size < 4) {
      console.log(`  ⚠️  Este par pode ter problemas na geração de treinos`);
    }
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}
