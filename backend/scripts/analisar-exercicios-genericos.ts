import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normaliza texto para comparação (remove acentos, espaços extras, etc)
 */
function normalizarTexto(texto: string | null): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim()
    .replace(/[^\w\s]/g, ''); // Remove caracteres especiais
}

/**
 * Calcula similaridade entre dois textos usando algoritmo de Jaccard
 */
function calcularSimilaridadeTexto(texto1: string | null, texto2: string | null): number {
  if (!texto1 || !texto2) return 0;
  
  const t1 = normalizarTexto(texto1);
  const t2 = normalizarTexto(texto2);
  
  if (t1 === t2) return 1.0;
  if (t1.length === 0 || t2.length === 0) return 0;
  
  // Dividir em palavras
  const palavras1 = new Set(t1.split(' ').filter(p => p.length > 2));
  const palavras2 = new Set(t2.split(' ').filter(p => p.length > 2));
  
  if (palavras1.size === 0 || palavras2.size === 0) return 0;
  
  // Calcular interseção
  const palavras1Array = Array.from(palavras1);
  const palavras2Array = Array.from(palavras2);
  const intersecao = new Set(palavras1Array.filter(p => palavras2.has(p)));
  
  // Calcular união
  const uniao = new Set([...palavras1Array, ...palavras2Array]);
  
  // Similaridade de Jaccard
  return intersecao.size / uniao.size;
}

/**
 * Verifica se descrição é genérica
 */
function isDescricaoGenerica(descricao: string | null): boolean {
  if (!descricao) return true;
  
  const desc = normalizarTexto(descricao);
  const padroesGenericos = [
    /exercicio para (trabalhar|fortalecer|desenvolver)/i,
    /exercicio de/i,
    /movimento para/i,
    /trabalha (o|a|os|as) (musculo|musculos|grupo)/i,
    /foca (em|no|na)/i,
    /^exercicio$/i,
    /^movimento$/i
  ];
  
  return padroesGenericos.some(padrao => padrao.test(desc)) || desc.length < 30;
}

/**
 * Verifica se equipamentos são compatíveis (mesmo tipo de movimento)
 */
function equipamentosCompatíveis(equip1: string[], equip2: string[]): boolean {
  const tipos1 = equip1.map(e => {
    const eq = e.toLowerCase();
    if (eq.includes('halter') || eq.includes('dumbbell')) return 'halteres';
    if (eq.includes('barra') || eq.includes('barbell')) return 'barra';
    if (eq.includes('maquina') || eq.includes('machine')) return 'maquina';
    if (eq.includes('peso') && eq.includes('corporal')) return 'corporal';
    return 'outro';
  });
  
  const tipos2 = equip2.map(e => {
    const eq = e.toLowerCase();
    if (eq.includes('halter') || eq.includes('dumbbell')) return 'halteres';
    if (eq.includes('barra') || eq.includes('barbell')) return 'barra';
    if (eq.includes('maquina') || eq.includes('machine')) return 'maquina';
    if (eq.includes('peso') && eq.includes('corporal')) return 'corporal';
    return 'outro';
  });
  
  // Se têm tipos em comum, são compatíveis
  return tipos1.some(t => tipos2.includes(t)) || tipos1.length === 0 || tipos2.length === 0;
}

/**
 * Agrupa exercícios similares
 */
function agruparExerciciosSimilares(
  exercicios: any[],
  thresholdDescricao: number = 0.7,
  thresholdExecucao: number = 0.8
): Array<{ exercicios: any[]; similaridadeMedia: number; tipo: string }> {
  const grupos: Array<{ exercicios: any[]; similaridadeMedia: number; tipo: string }> = [];
  const processados = new Set<string>();
  
  for (let i = 0; i < exercicios.length; i++) {
    if (processados.has(exercicios[i].id)) continue;
    
    const grupo = [exercicios[i]];
    let similaridadeTotal = 0;
    let countSimilaridades = 0;
    let tipoSimilaridade = '';
    
    for (let j = i + 1; j < exercicios.length; j++) {
      if (processados.has(exercicios[j].id)) continue;
      
      // Verificar mesmo grupo muscular
      if (exercicios[i].grupoMuscularPrincipal !== exercicios[j].grupoMuscularPrincipal) {
        continue;
      }
      
      // Calcular similaridades
      const simDescricao = calcularSimilaridadeTexto(
        exercicios[i].descricao,
        exercicios[j].descricao
      );
      const simExecucao = calcularSimilaridadeTexto(
        exercicios[i].execucaoTecnica,
        exercicios[j].execucaoTecnica
      );
      
      // Verificar se são similares
      const similarPorDescricao = simDescricao >= thresholdDescricao;
      const similarPorExecucao = simExecucao >= thresholdExecucao;
      const equipamentosCompat = equipamentosCompatíveis(
        exercicios[i].equipamentoNecessario || [],
        exercicios[j].equipamentoNecessario || []
      );
      
      if ((similarPorDescricao || similarPorExecucao) && equipamentosCompat) {
        grupo.push(exercicios[j]);
        processados.add(exercicios[j].id);
        
        if (similarPorExecucao) {
          similaridadeTotal += simExecucao;
          tipoSimilaridade = 'execucao';
        } else {
          similaridadeTotal += simDescricao;
          tipoSimilaridade = 'descricao';
        }
        countSimilaridades++;
      }
    }
    
    if (grupo.length > 1) {
      grupos.push({
        exercicios: grupo,
        similaridadeMedia: countSimilaridades > 0 ? similaridadeTotal / countSimilaridades : 0,
        tipo: tipoSimilaridade || 'descricao'
      });
      processados.add(exercicios[i].id);
    }
  }
  
  return grupos;
}

/**
 * Script principal de análise de exercícios genéricos
 */
async function analisarExerciciosGenericos() {
  console.log('🔍 Iniciando análise profunda de exercícios genéricos...\n');

  try {
    // Buscar todos os exercícios (ativos e inativos)
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);

    // 1. Identificar descrições genéricas
    console.log('📝 IDENTIFICANDO DESCRIÇÕES GENÉRICAS...\n');
    const descricoesGenericas = exercicios.filter(ex => 
      isDescricaoGenerica(ex.descricao)
    );

    console.log(`⚠️ Encontradas ${descricoesGenericas.length} descrições genéricas:\n`);
    descricoesGenericas.slice(0, 20).forEach((ex, index) => {
      console.log(`${index + 1}. "${ex.nome}"`);
      console.log(`   Descrição: ${ex.descricao?.substring(0, 100) || 'VAZIA'}...`);
      console.log(`   Grupo: ${ex.grupoMuscularPrincipal}`);
      console.log('');
    });

    if (descricoesGenericas.length > 20) {
      console.log(`   ... e mais ${descricoesGenericas.length - 20} exercícios com descrições genéricas\n`);
    }

    // 2. Agrupar exercícios similares por descrição
    console.log('\n🔗 AGRUPANDO EXERCÍCIOS SIMILARES POR DESCRIÇÃO...\n');
    const gruposPorDescricao = agruparExerciciosSimilares(exercicios, 0.7, 0.8);
    
    console.log(`📦 Encontrados ${gruposPorDescricao.length} grupos de exercícios similares:\n`);
    gruposPorDescricao.forEach((grupo, index) => {
      console.log(`Grupo ${index + 1} (Similaridade: ${(grupo.similaridadeMedia * 100).toFixed(0)}% por ${grupo.tipo}):`);
      grupo.exercicios.forEach(ex => {
        console.log(`  - "${ex.nome}" (${ex.ativo ? 'Ativo' : 'Inativo'}) [${ex.id}]`);
        console.log(`    Grupo: ${ex.grupoMuscularPrincipal}`);
        console.log(`    Equipamento: ${(ex.equipamentoNecessario || []).join(', ') || 'N/A'}`);
      });
      console.log('');
    });

    // 3. Identificar exercícios com execução técnica idêntica
    console.log('\n🏋️ IDENTIFICANDO EXECUÇÕES TÉCNICAS IDÊNTICAS...\n');
    const execucoesIdenticas: Array<{ exercicio1: any; exercicio2: any; similaridade: number }> = [];
    
    for (let i = 0; i < exercicios.length; i++) {
      for (let j = i + 1; j < exercicios.length; j++) {
        if (!exercicios[i].execucaoTecnica || !exercicios[j].execucaoTecnica) continue;
        
        const similaridade = calcularSimilaridadeTexto(
          exercicios[i].execucaoTecnica,
          exercicios[j].execucaoTecnica
        );
        
        if (similaridade >= 0.8) {
          execucoesIdenticas.push({
            exercicio1: exercicios[i],
            exercicio2: exercicios[j],
            similaridade
          });
        }
      }
    }

    console.log(`⚠️ Encontradas ${execucoesIdenticas.length} pares com execução técnica muito similar (≥80%):\n`);
    execucoesIdenticas.slice(0, 15).forEach((par, index) => {
      console.log(`${index + 1}. Similaridade: ${(par.similaridade * 100).toFixed(0)}%`);
      console.log(`   - "${par.exercicio1.nome}" (${par.exercicio1.ativo ? 'Ativo' : 'Inativo'})`);
      console.log(`   - "${par.exercicio2.nome}" (${par.exercicio2.ativo ? 'Ativo' : 'Inativo'})`);
      console.log(`   Grupo: ${par.exercicio1.grupoMuscularPrincipal} vs ${par.exercicio2.grupoMuscularPrincipal}`);
      console.log('');
    });

    if (execucoesIdenticas.length > 15) {
      console.log(`   ... e mais ${execucoesIdenticas.length - 15} pares similares\n`);
    }

    // 4. Identificar exercícios que diferem apenas no equipamento
    console.log('\n🔧 IDENTIFICANDO EXERCÍCIOS QUE DIFEREM APENAS NO EQUIPAMENTO...\n');
    const apenasEquipamento: Array<{ exercicio1: any; exercicio2: any; similaridade: number }> = [];
    
    for (let i = 0; i < exercicios.length; i++) {
      for (let j = i + 1; j < exercicios.length; j++) {
        // Mesmo grupo muscular
        if (exercicios[i].grupoMuscularPrincipal !== exercicios[j].grupoMuscularPrincipal) continue;
        
        // Descrições ou execuções muito similares
        const simDescricao = calcularSimilaridadeTexto(
          exercicios[i].descricao,
          exercicios[j].descricao
        );
        const simExecucao = calcularSimilaridadeTexto(
          exercicios[i].execucaoTecnica,
          exercicios[j].execucaoTecnica
        );
        
        const similar = simDescricao >= 0.7 || simExecucao >= 0.8;
        
        // Equipamentos diferentes
        const equip1 = (exercicios[i].equipamentoNecessario || []).sort().join(',');
        const equip2 = (exercicios[j].equipamentoNecessario || []).sort().join(',');
        const equipamentosDiferentes = equip1 !== equip2;
        
        if (similar && equipamentosDiferentes) {
          apenasEquipamento.push({
            exercicio1: exercicios[i],
            exercicio2: exercicios[j],
            similaridade: Math.max(simDescricao, simExecucao)
          });
        }
      }
    }

    console.log(`⚠️ Encontrados ${apenasEquipamento.length} pares que diferem apenas no equipamento:\n`);
    apenasEquipamento.slice(0, 15).forEach((par, index) => {
      console.log(`${index + 1}. Similaridade: ${(par.similaridade * 100).toFixed(0)}%`);
      console.log(`   - "${par.exercicio1.nome}"`);
      console.log(`     Equipamento: ${(par.exercicio1.equipamentoNecessario || []).join(', ') || 'N/A'}`);
      console.log(`   - "${par.exercicio2.nome}"`);
      console.log(`     Equipamento: ${(par.exercicio2.equipamentoNecessario || []).join(', ') || 'N/A'}`);
      console.log('');
    });

    if (apenasEquipamento.length > 15) {
      console.log(`   ... e mais ${apenasEquipamento.length - 15} pares\n`);
    }

    // 5. Resumo e sugestões
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ANÁLISE DE EXERCÍCIOS GENÉRICOS');
    console.log('='.repeat(60));
    console.log(`Total de exercícios analisados: ${exercicios.length}`);
    console.log(`\n📝 Descrições genéricas: ${descricoesGenericas.length} (${((descricoesGenericas.length / exercicios.length) * 100).toFixed(1)}%)`);
    console.log(`🔗 Grupos de exercícios similares: ${gruposPorDescricao.length}`);
    console.log(`🏋️ Pares com execução técnica idêntica: ${execucoesIdenticas.length}`);
    console.log(`🔧 Pares que diferem apenas no equipamento: ${apenasEquipamento.length}`);
    console.log('='.repeat(60) + '\n');

    // 6. Sugestões de consolidação
    console.log('💡 SUGESTÕES DE CONSOLIDAÇÃO:\n');
    
    if (gruposPorDescricao.length > 0) {
      console.log('1. GRUPOS PARA CONSOLIDAR:');
      gruposPorDescricao.slice(0, 10).forEach((grupo, index) => {
        console.log(`   Grupo ${index + 1}:`);
        const ativos = grupo.exercicios.filter(e => e.ativo);
        const inativos = grupo.exercicios.filter(e => !e.ativo);
        
        if (ativos.length > 0 && inativos.length > 0) {
          console.log(`   → Manter: "${ativos[0].nome}" (${ativos[0].id})`);
          console.log(`   → Remover/Desativar: ${inativos.map(e => `"${e.nome}"`).join(', ')}`);
        } else if (grupo.exercicios.length > 1) {
          console.log(`   → Manter: "${grupo.exercicios[0].nome}" (${grupo.exercicios[0].id})`);
          console.log(`   → Revisar: ${grupo.exercicios.slice(1).map(e => `"${e.nome}"`).join(', ')}`);
        }
        console.log('');
      });
    }

    if (execucoesIdenticas.length > 0) {
      console.log('\n2. EXECUÇÕES TÉCNICAS IDÊNTICAS:');
      console.log('   → Revisar se são variações legítimas ou duplicatas');
      console.log('   → Considerar unificar em um único exercício com variações de equipamento');
    }

    if (apenasEquipamento.length > 0) {
      console.log('\n3. VARIAÇÕES POR EQUIPAMENTO:');
      console.log('   → Considerar manter como variações legítimas');
      console.log('   → Ou consolidar em um exercício com campo de equipamentos alternativos');
    }

    console.log('\n📋 Próximos passos:');
    console.log('   1. Revisar grupos de exercícios similares');
    console.log('   2. Decidir quais consolidar e quais manter separados');
    console.log('   3. Melhorar descrições genéricas');
    console.log('   4. Verificar se execuções idênticas são variações legítimas');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao analisar exercícios genéricos:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar análise
analisarExerciciosGenericos()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

