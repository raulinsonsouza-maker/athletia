import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normaliza nome para comparação (remove acentos, espaços extras, etc)
 */
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim()
    .replace(/[^\w\s]/g, ''); // Remove caracteres especiais
}

/**
 * Calcula similaridade entre dois nomes (0-1)
 */
function calcularSimilaridade(nome1: string, nome2: string): number {
  const n1 = normalizarNome(nome1);
  const n2 = normalizarNome(nome2);
  
  // Se são idênticos após normalização
  if (n1 === n2) return 1.0;
  
  // Verificar se um contém o outro
  if (n1.includes(n2) || n2.includes(n1)) {
    const menor = Math.min(n1.length, n2.length);
    const maior = Math.max(n1.length, n2.length);
    return menor / maior;
  }
  
  // Calcular palavras em comum
  const palavras1 = n1.split(' ').filter(p => p.length > 2);
  const palavras2 = n2.split(' ').filter(p => p.length > 2);
  
  if (palavras1.length === 0 || palavras2.length === 0) return 0;
  
  const palavrasComuns = palavras1.filter(p => palavras2.includes(p));
  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  
  return palavrasComuns.length / totalPalavras;
}

/**
 * Normaliza texto para comparação de conteúdo
 */
function normalizarTexto(texto: string | null): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\w\s]/g, '');
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
 * Analisa qualidade da descrição
 */
function analisarDescricao(descricao: string | null): {
  temDescricao: boolean;
  tamanho: number;
  qualidade: 'boa' | 'media' | 'ruim' | 'vazia';
  sugestoes: string[];
} {
  if (!descricao || descricao.trim().length === 0) {
    return {
      temDescricao: false,
      tamanho: 0,
      qualidade: 'vazia',
      sugestoes: ['Adicionar descrição explicando o exercício e seus benefícios']
    };
  }

  const tamanho = descricao.length;
  const sugestoes: string[] = [];

  if (tamanho < 50) {
    sugestoes.push('Descrição muito curta. Expandir com mais detalhes sobre o exercício');
  }

  if (tamanho > 500) {
    sugestoes.push('Descrição muito longa. Considerar resumir para melhor legibilidade');
  }

  // Verificar se menciona grupo muscular
  const gruposMusculares = ['peito', 'costas', 'ombro', 'bíceps', 'tríceps', 'quadríceps', 'posterior', 'panturrilha', 'abdômen'];
  const mencionaGrupo = gruposMusculares.some(grupo => 
    descricao.toLowerCase().includes(grupo)
  );
  
  if (!mencionaGrupo) {
    sugestoes.push('Considerar mencionar o grupo muscular principal trabalhado');
  }

  let qualidade: 'boa' | 'media' | 'ruim' = tamanho >= 100 && tamanho <= 500 ? 'boa' : 'media';
  if (tamanho < 50) qualidade = 'ruim';

  return {
    temDescricao: true,
    tamanho,
    qualidade,
    sugestoes
  };
}

/**
 * Analisa execução técnica
 */
function analisarExecucaoTecnica(execucao: string | null): {
  temExecucao: boolean;
  tamanho: number;
  qualidade: 'boa' | 'media' | 'ruim' | 'vazia';
  sugestoes: string[];
} {
  if (!execucao || execucao.trim().length === 0) {
    return {
      temExecucao: false,
      tamanho: 0,
      qualidade: 'vazia',
      sugestoes: [
        'Adicionar instruções de execução técnica',
        'Incluir: posição inicial, movimento concêntrico, movimento excêntrico',
        'Mencionar pontos de atenção (postura, respiração, controle)'
      ]
    };
  }

  const tamanho = execucao.length;
  const sugestoes: string[] = [];

  if (tamanho < 80) {
    sugestoes.push('Execução técnica muito curta. Expandir com mais detalhes do movimento');
  }

  // Verificar se menciona fases do movimento
  const fases = ['concêntrica', 'excêntrica', 'inicial', 'final', 'contração', 'alongamento'];
  const mencionaFases = fases.some(fase => execucao.toLowerCase().includes(fase));
  
  if (!mencionaFases) {
    sugestoes.push('Considerar descrever as fases do movimento (concêntrica e excêntrica)');
  }

  // Verificar se menciona postura/respiração
  const pontosAtencao = ['postura', 'respiração', 'controle', 'velocidade', 'cadência'];
  const mencionaAtencao = pontosAtencao.some(ponto => execucao.toLowerCase().includes(ponto));
  
  if (!mencionaAtencao) {
    sugestoes.push('Considerar mencionar pontos de atenção: postura, respiração, controle do movimento');
  }

  let qualidade: 'boa' | 'media' | 'ruim' = tamanho >= 150 && tamanho <= 400 ? 'boa' : 'media';
  if (tamanho < 80) qualidade = 'ruim';

  return {
    temExecucao: true,
    tamanho,
    qualidade,
    sugestoes
  };
}

/**
 * Analisa erros comuns
 */
function analisarErrosComuns(erros: string[]): {
  temErros: boolean;
  quantidade: number;
  qualidade: 'boa' | 'media' | 'ruim' | 'vazia';
  sugestoes: string[];
} {
  if (!erros || erros.length === 0) {
    return {
      temErros: false,
      quantidade: 0,
      qualidade: 'vazia',
      sugestoes: [
        'Adicionar erros comuns para ajudar usuários a evitar lesões',
        'Exemplos: usar carga excessiva, execução incorreta, falta de controle excêntrico'
      ]
    };
  }

  const sugestoes: string[] = [];

  if (erros.length < 2) {
    sugestoes.push('Considerar adicionar mais erros comuns (mínimo 2-3)');
  }

  if (erros.length > 5) {
    sugestoes.push('Muitos erros listados. Considerar priorizar os mais importantes');
  }

  // Verificar qualidade dos erros
  const errosVazios = erros.filter(e => !e || e.trim().length === 0);
  if (errosVazios.length > 0) {
    sugestoes.push('Remover erros vazios ou sem conteúdo');
  }

  const errosMuitoCurtos = erros.filter(e => e && e.trim().length < 10);
  if (errosMuitoCurtos.length > 0) {
    sugestoes.push('Alguns erros estão muito curtos. Expandir com mais detalhes');
  }

  let qualidade: 'boa' | 'media' | 'ruim' = erros.length >= 2 && erros.length <= 5 ? 'boa' : 'media';
  if (erros.length === 0 || errosVazios.length > 0) qualidade = 'ruim';

  return {
    temErros: true,
    quantidade: erros.length,
    qualidade,
    sugestoes
  };
}

/**
 * Script principal de análise
 */
async function analisarExercicios() {
  console.log('🔍 Iniciando análise completa de exercícios...\n');

  try {
    // Buscar todos os exercícios (ativos e inativos)
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);

    // Estatísticas gerais
    const ativos = exercicios.filter(e => e.ativo).length;
    const inativos = exercicios.filter(e => !e.ativo).length;
    
    console.log('📈 ESTATÍSTICAS GERAIS');
    console.log('='.repeat(60));
    console.log(`✅ Ativos: ${ativos}`);
    console.log(`❌ Inativos: ${inativos}`);
    console.log('='.repeat(60) + '\n');

    // 1. Identificar duplicatas (por nome)
    console.log('🔍 IDENTIFICANDO EXERCÍCIOS DUPLICADOS (POR NOME)...\n');
    const duplicatas: Array<{ exercicio1: any; exercicio2: any; similaridade: number }> = [];
    
    for (let i = 0; i < exercicios.length; i++) {
      for (let j = i + 1; j < exercicios.length; j++) {
        const similaridade = calcularSimilaridade(exercicios[i].nome, exercicios[j].nome);
        if (similaridade >= 0.7) { // 70% de similaridade
          duplicatas.push({
            exercicio1: exercicios[i],
            exercicio2: exercicios[j],
            similaridade
          });
        }
      }
    }

    console.log(`⚠️ Encontradas ${duplicatas.length} possíveis duplicatas por nome:\n`);
    duplicatas.forEach((dup, index) => {
      console.log(`${index + 1}. Similaridade: ${(dup.similaridade * 100).toFixed(0)}%`);
      console.log(`   - "${dup.exercicio1.nome}" (${dup.exercicio1.ativo ? 'Ativo' : 'Inativo'}) [${dup.exercicio1.id}]`);
      console.log(`   - "${dup.exercicio2.nome}" (${dup.exercicio2.ativo ? 'Ativo' : 'Inativo'}) [${dup.exercicio2.id}]`);
      console.log(`   Grupo: ${dup.exercicio1.grupoMuscularPrincipal} vs ${dup.exercicio2.grupoMuscularPrincipal}`);
      console.log('');
    });

    // 1.1. Identificar duplicatas por conteúdo (descrição + execução técnica)
    console.log('\n🔍 IDENTIFICANDO EXERCÍCIOS DUPLICADOS (POR CONTEÚDO)...\n');
    const duplicatasConteudo: Array<{ exercicio1: any; exercicio2: any; similaridadeDesc: number; similaridadeExec: number }> = [];
    
    for (let i = 0; i < exercicios.length; i++) {
      for (let j = i + 1; j < exercicios.length; j++) {
        // Mesmo grupo muscular
        if (exercicios[i].grupoMuscularPrincipal !== exercicios[j].grupoMuscularPrincipal) continue;
        
        const simDesc = calcularSimilaridadeTexto(exercicios[i].descricao, exercicios[j].descricao);
        const simExec = calcularSimilaridadeTexto(exercicios[i].execucaoTecnica, exercicios[j].execucaoTecnica);
        
        // Se descrição ou execução são muito similares (≥70% ou ≥80%)
        if (simDesc >= 0.7 || simExec >= 0.8) {
          duplicatasConteudo.push({
            exercicio1: exercicios[i],
            exercicio2: exercicios[j],
            similaridadeDesc: simDesc,
            similaridadeExec: simExec
          });
        }
      }
    }

    console.log(`⚠️ Encontradas ${duplicatasConteudo.length} possíveis duplicatas por conteúdo:\n`);
    duplicatasConteudo.slice(0, 15).forEach((dup, index) => {
      console.log(`${index + 1}. Similaridade Descrição: ${(dup.similaridadeDesc * 100).toFixed(0)}% | Execução: ${(dup.similaridadeExec * 100).toFixed(0)}%`);
      console.log(`   - "${dup.exercicio1.nome}" (${dup.exercicio1.ativo ? 'Ativo' : 'Inativo'})`);
      console.log(`   - "${dup.exercicio2.nome}" (${dup.exercicio2.ativo ? 'Ativo' : 'Inativo'})`);
      console.log('');
    });

    if (duplicatasConteudo.length > 15) {
      console.log(`   ... e mais ${duplicatasConteudo.length - 15} pares similares\n`);
    }

    // 1.2. Identificar descrições genéricas
    console.log('\n📝 IDENTIFICANDO DESCRIÇÕES GENÉRICAS...\n');
    const descricoesGenericas = exercicios.filter(ex => isDescricaoGenerica(ex.descricao));
    
    console.log(`⚠️ Encontradas ${descricoesGenericas.length} descrições genéricas:\n`);
    descricoesGenericas.slice(0, 10).forEach((ex, index) => {
      console.log(`${index + 1}. "${ex.nome}"`);
      console.log(`   Descrição: ${ex.descricao?.substring(0, 100) || 'VAZIA'}...`);
      console.log('');
    });

    if (descricoesGenericas.length > 10) {
      console.log(`   ... e mais ${descricoesGenericas.length - 10} exercícios com descrições genéricas\n`);
    }

    // 2. Analisar qualidade das descrições
    console.log('\n📝 ANALISANDO QUALIDADE DAS DESCRIÇÕES...\n');
    const problemasDescricao: Array<{ exercicio: any; analise: any }> = [];
    
    exercicios.forEach(ex => {
      const analise = analisarDescricao(ex.descricao);
      if (analise.qualidade !== 'boa' || analise.sugestoes.length > 0) {
        problemasDescricao.push({ exercicio: ex, analise });
      }
    });

    console.log(`⚠️ ${problemasDescricao.length} exercícios com problemas na descrição:\n`);
    problemasDescricao.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. "${item.exercicio.nome}"`);
      console.log(`   Qualidade: ${item.analise.qualidade}`);
      console.log(`   Tamanho: ${item.analise.tamanho} caracteres`);
      item.analise.sugestoes.forEach((sugestao: string) => {
        console.log(`   💡 ${sugestao}`);
      });
      console.log('');
    });

    if (problemasDescricao.length > 10) {
      console.log(`   ... e mais ${problemasDescricao.length - 10} exercícios com problemas\n`);
    }

    // 3. Analisar execução técnica
    console.log('\n🏋️ ANALISANDO EXECUÇÃO TÉCNICA...\n');
    const problemasExecucao: Array<{ exercicio: any; analise: any }> = [];
    
    exercicios.forEach(ex => {
      const analise = analisarExecucaoTecnica(ex.execucaoTecnica);
      if (analise.qualidade !== 'boa' || analise.sugestoes.length > 0) {
        problemasExecucao.push({ exercicio: ex, analise });
      }
    });

    console.log(`⚠️ ${problemasExecucao.length} exercícios com problemas na execução técnica:\n`);
    problemasExecucao.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. "${item.exercicio.nome}"`);
      console.log(`   Qualidade: ${item.analise.qualidade}`);
      console.log(`   Tamanho: ${item.analise.tamanho} caracteres`);
      item.analise.sugestoes.forEach((sugestao: string) => {
        console.log(`   💡 ${sugestao}`);
      });
      console.log('');
    });

    if (problemasExecucao.length > 10) {
      console.log(`   ... e mais ${problemasExecucao.length - 10} exercícios com problemas\n`);
    }

    // 4. Analisar erros comuns
    console.log('\n⚠️ ANALISANDO ERROS COMUNS...\n');
    const problemasErros: Array<{ exercicio: any; analise: any }> = [];
    
    exercicios.forEach(ex => {
      const analise = analisarErrosComuns(ex.errosComuns);
      if (analise.qualidade !== 'boa' || analise.sugestoes.length > 0) {
        problemasErros.push({ exercicio: ex, analise });
      }
    });

    console.log(`⚠️ ${problemasErros.length} exercícios com problemas nos erros comuns:\n`);
    problemasErros.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. "${item.exercicio.nome}"`);
      console.log(`   Qualidade: ${item.analise.qualidade}`);
      console.log(`   Quantidade: ${item.analise.quantidade} erros`);
      item.analise.sugestoes.forEach((sugestao: string) => {
        console.log(`   💡 ${sugestao}`);
      });
      console.log('');
    });

    if (problemasErros.length > 10) {
      console.log(`   ... e mais ${problemasErros.length - 10} exercícios com problemas\n`);
    }

    // 5. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ANÁLISE');
    console.log('='.repeat(60));
    console.log(`Total de exercícios: ${exercicios.length}`);
    console.log(`  - Ativos: ${ativos}`);
    console.log(`  - Inativos: ${inativos}`);
    console.log(`\n🔍 Duplicatas por nome: ${duplicatas.length}`);
    console.log(`🔍 Duplicatas por conteúdo: ${duplicatasConteudo.length}`);
    console.log(`📝 Descrições genéricas: ${descricoesGenericas.length}`);
    console.log(`📝 Exercícios com problemas na descrição: ${problemasDescricao.length}`);
    console.log(`🏋️ Exercícios com problemas na execução técnica: ${problemasExecucao.length}`);
    console.log(`⚠️ Exercícios com problemas nos erros comuns: ${problemasErros.length}`);
    console.log('='.repeat(60) + '\n');

    // 6. Gerar relatório detalhado em arquivo
    const relatorio = {
      dataAnalise: new Date().toISOString(),
      totalExercicios: exercicios.length,
      ativos,
      inativos,
      duplicatas: duplicatas.map(d => ({
        exercicio1: { id: d.exercicio1.id, nome: d.exercicio1.nome, ativo: d.exercicio1.ativo },
        exercicio2: { id: d.exercicio2.id, nome: d.exercicio2.nome, ativo: d.exercicio2.ativo },
        similaridade: d.similaridade
      })),
      duplicatasConteudo: duplicatasConteudo.map(d => ({
        exercicio1: { id: d.exercicio1.id, nome: d.exercicio1.nome, ativo: d.exercicio1.ativo },
        exercicio2: { id: d.exercicio2.id, nome: d.exercicio2.nome, ativo: d.exercicio2.ativo },
        similaridadeDesc: d.similaridadeDesc,
        similaridadeExec: d.similaridadeExec
      })),
      descricoesGenericas: descricoesGenericas.map(e => ({
        id: e.id,
        nome: e.nome,
        descricao: e.descricao
      })),
      problemasDescricao: problemasDescricao.map(p => ({
        id: p.exercicio.id,
        nome: p.exercicio.nome,
        analise: p.analise
      })),
      problemasExecucao: problemasExecucao.map(p => ({
        id: p.exercicio.id,
        nome: p.exercicio.nome,
        analise: p.analise
      })),
      problemasErros: problemasErros.map(p => ({
        id: p.exercicio.id,
        nome: p.exercicio.nome,
        analise: p.analise
      }))
    };

    console.log('💾 Relatório detalhado gerado (ver console acima para detalhes)');
    console.log('📋 Próximos passos:');
    console.log('   1. Revisar duplicatas e decidir quais manter/remover');
    console.log('   2. Melhorar descrições dos exercícios com problemas');
    console.log('   3. Completar execução técnica faltante');
    console.log('   4. Adicionar erros comuns importantes');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao analisar exercícios:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar análise
analisarExercicios()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

