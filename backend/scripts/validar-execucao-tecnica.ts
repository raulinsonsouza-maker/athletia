import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Palavras-chave por tipo de exercício (baseado no nome)
 */
const PALAVRAS_CHAVE_EXERCICIOS: Record<string, string[]> = {
  'supino': ['deite', 'banco', 'barra', 'halteres', 'empurre', 'desça', 'peito'],
  'agachamento': ['pés', 'joelhos', 'flexione', 'desça', 'quadril', 'em pé'],
  'remada': ['puxe', 'barra', 'halteres', 'costas', 'tronco', 'incline'],
  'puxada': ['puxe', 'barra', 'cabo', 'polia', 'costas', 'acima'],
  'rosca': ['flexione', 'braços', 'halteres', 'barra', 'cotovelos'],
  'tríceps': ['estenda', 'braços', 'halteres', 'cabo', 'polia', 'cotovelos'],
  'desenvolvimento': ['eleve', 'ombros', 'barra', 'halteres', 'acima', 'cabeça'],
  'elevação': ['eleve', 'ombros', 'braços', 'lateral', 'frontal'],
  'crucifixo': ['abra', 'braços', 'halteres', 'peito', 'cruz'],
  'panturrilha': ['eleve', 'calcanhares', 'pés', 'em pé', 'sentado'],
  'stiff': ['flexione', 'quadril', 'costas', 'barra', 'halteres'],
  'abdominal': ['deite', 'flexione', 'tronco', 'abdômen', 'core'],
  'prancha': ['apoie', 'braços', 'corpo', 'retilíneo', 'isométrico'],
  'barra fixa': ['puxe', 'barra', 'costas', 'acima', 'suspenso'],
  'cardio': ['pedale', 'corra', 'caminhe', 'movimento', 'contínuo']
};

/**
 * Palavras-chave de equipamentos
 */
const EQUIPAMENTOS: string[] = [
  'barra', 'halteres', 'halter', 'máquina', 'aparelho', 'banco', 'cabo', 
  'polia', 'anilhas', 'corda', 'bicicleta', 'esteira', 'elíptico', 'escada'
];

/**
 * Palavras-chave de posições
 */
const POSICOES: string[] = [
  'deite', 'deitado', 'sentado', 'em pé', 'incline', 'curvado', 'suspenso'
];

/**
 * Normaliza texto para comparação
 */
function normalizarTexto(texto: string | null): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extrai tipo de exercício do nome
 */
function extrairTipoExercicio(nome: string): string[] {
  const nomeLower = normalizarTexto(nome);
  const tipos: string[] = [];
  
  for (const [tipo, palavras] of Object.entries(PALAVRAS_CHAVE_EXERCICIOS)) {
    if (nomeLower.includes(tipo)) {
      tipos.push(tipo);
    }
  }
  
  return tipos;
}

/**
 * Verifica se execução menciona palavras-chave do tipo de exercício
 */
function validarPalavrasChave(nome: string, execucao: string | null): {
  valido: boolean;
  palavrasEncontradas: string[];
  palavrasEsperadas: string[];
  divergencia: string;
} {
  if (!execucao) {
    return {
      valido: false,
      palavrasEncontradas: [],
      palavrasEsperadas: [],
      divergencia: 'Execução técnica vazia'
    };
  }
  
  const tipos = extrairTipoExercicio(nome);
  if (tipos.length === 0) {
    return {
      valido: true,
      palavrasEncontradas: [],
      palavrasEsperadas: [],
      divergencia: ''
    };
  }
  
  const execucaoLower = normalizarTexto(execucao);
  const palavrasEsperadas: string[] = [];
  const palavrasEncontradas: string[] = [];
  
  tipos.forEach(tipo => {
    const palavras = PALAVRAS_CHAVE_EXERCICIOS[tipo] || [];
    palavrasEsperadas.push(...palavras);
    
    palavras.forEach(palavra => {
      if (execucaoLower.includes(palavra)) {
        palavrasEncontradas.push(palavra);
      }
    });
  });
  
  const taxaEncontrada = palavrasEsperadas.length > 0 
    ? palavrasEncontradas.length / palavrasEsperadas.length 
    : 0;
  
  const valido = taxaEncontrada >= 0.3; // Pelo menos 30% das palavras-chave
  
  let divergencia = '';
  if (!valido) {
    const palavrasFaltantes = palavrasEsperadas.filter(p => !palavrasEncontradas.includes(p));
    divergencia = `Faltam palavras-chave: ${palavrasFaltantes.slice(0, 3).join(', ')}`;
  }
  
  return {
    valido,
    palavrasEncontradas,
    palavrasEsperadas,
    divergencia
  };
}

/**
 * Verifica se execução menciona equipamento correto
 */
function validarEquipamento(
  equipamentoNecessario: string[],
  execucao: string | null
): {
  valido: boolean;
  equipamentoMencionado: string[];
  equipamentoEsperado: string[];
  divergencia: string;
} {
  if (!execucao || !equipamentoNecessario || equipamentoNecessario.length === 0) {
    return {
      valido: true,
      equipamentoMencionado: [],
      equipamentoEsperado: [],
      divergencia: ''
    };
  }
  
  const execucaoLower = normalizarTexto(execucao);
  const equipamentoEsperado = equipamentoNecessario.map(e => normalizarTexto(e));
  const equipamentoMencionado: string[] = [];
  
  EQUIPAMENTOS.forEach(eq => {
    if (execucaoLower.includes(eq)) {
      equipamentoMencionado.push(eq);
    }
  });
  
  // Verificar se pelo menos um equipamento esperado é mencionado
  const valido = equipamentoEsperado.some(eq => {
    const eqLower = normalizarTexto(eq);
    return EQUIPAMENTOS.some(e => eqLower.includes(e) && execucaoLower.includes(e));
  });
  
  let divergencia = '';
  if (!valido) {
    divergencia = `Equipamento não mencionado: ${equipamentoNecessario.join(', ')}`;
  }
  
  return {
    valido,
    equipamentoMencionado,
    equipamentoEsperado,
    divergencia
  };
}

/**
 * Verifica se execução menciona posição correta baseada no nome
 */
function validarPosicao(nome: string, execucao: string | null): {
  valido: boolean;
  posicaoMencionada: string;
  posicaoEsperada: string;
  divergencia: string;
} {
  if (!execucao) {
    return {
      valido: false,
      posicaoMencionada: '',
      posicaoEsperada: '',
      divergencia: 'Execução técnica vazia'
    };
  }
  
  const nomeLower = normalizarTexto(nome);
  const execucaoLower = normalizarTexto(execucao);
  
  // Inferir posição esperada do nome
  let posicaoEsperada = '';
  if (nomeLower.includes('supino') || nomeLower.includes('crucifixo') || nomeLower.includes('abdominal')) {
    posicaoEsperada = 'deite';
  } else if (nomeLower.includes('agachamento') || nomeLower.includes('panturrilha') || nomeLower.includes('stiff')) {
    posicaoEsperada = 'em pé';
  } else if (nomeLower.includes('desenvolvimento') || nomeLower.includes('sentado')) {
    posicaoEsperada = 'sentado';
  } else if (nomeLower.includes('remada') || nomeLower.includes('curvado')) {
    posicaoEsperada = 'incline';
  } else if (nomeLower.includes('barra fixa') || nomeLower.includes('puxada')) {
    posicaoEsperada = 'suspenso';
  }
  
  // Verificar se posição é mencionada na execução
  const posicaoMencionada = POSICOES.find(p => execucaoLower.includes(p)) || '';
  
  const valido = !posicaoEsperada || posicaoMencionada.includes(posicaoEsperada) || execucaoLower.includes(posicaoEsperada);
  
  let divergencia = '';
  if (!valido && posicaoEsperada) {
    divergencia = `Posição esperada "${posicaoEsperada}" não mencionada`;
  }
  
  return {
    valido,
    posicaoMencionada,
    posicaoEsperada,
    divergencia
  };
}

/**
 * Analisa complexidade da execução técnica
 */
function analisarComplexidade(execucao: string | null): {
  tamanho: number;
  complexidade: 'simples' | 'media' | 'complexa';
  problemas: string[];
} {
  if (!execucao) {
    return {
      tamanho: 0,
      complexidade: 'simples',
      problemas: ['Execução técnica vazia']
    };
  }
  
  const tamanho = execucao.length;
  const problemas: string[] = [];
  
  // Verificar tamanho
  if (tamanho > 200) {
    problemas.push('Execução muito longa (>200 caracteres)');
  }
  
  // Verificar termos técnicos excessivos
  const termosTecnicos = ['concêntrica', 'excêntrica', 'isométrica', 'biomecânica', 'articulação', 'sinergista'];
  const termosEncontrados = termosTecnicos.filter(t => execucao.toLowerCase().includes(t));
  if (termosEncontrados.length > 2) {
    problemas.push(`Muitos termos técnicos: ${termosEncontrados.join(', ')}`);
  }
  
  // Verificar vírgulas excessivas (indica complexidade)
  const virgulas = (execucao.match(/,/g) || []).length;
  if (virgulas > 5) {
    problemas.push('Muitas vírgulas, texto pode ser simplificado');
  }
  
  // Determinar complexidade
  let complexidade: 'simples' | 'media' | 'complexa' = 'simples';
  if (tamanho > 150 || problemas.length > 1) {
    complexidade = 'media';
  }
  if (tamanho > 200 || problemas.length > 2) {
    complexidade = 'complexa';
  }
  
  return {
    tamanho,
    complexidade,
    problemas
  };
}

/**
 * Script principal de validação
 */
async function validarExecucaoTecnica() {
  console.log('🔍 Iniciando validação de execução técnica...\n');

  try {
    // Buscar todos os exercícios
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);

    const problemas: Array<{
      exercicio: any;
      validacaoPalavras: any;
      validacaoEquipamento: any;
      validacaoPosicao: any;
      complexidade: any;
      problemas: string[];
    }> = [];

    // Validar cada exercício
    console.log('🔄 Validando exercícios...\n');
    
    for (const ex of exercicios) {
      const validacaoPalavras = validarPalavrasChave(ex.nome, ex.execucaoTecnica);
      const validacaoEquipamento = validarEquipamento(ex.equipamentoNecessario || [], ex.execucaoTecnica);
      const validacaoPosicao = validarPosicao(ex.nome, ex.execucaoTecnica);
      const complexidade = analisarComplexidade(ex.execucaoTecnica);
      
      const problemasEx: string[] = [];
      
      if (!validacaoPalavras.valido) {
        problemasEx.push(`Palavras-chave: ${validacaoPalavras.divergencia}`);
      }
      
      if (!validacaoEquipamento.valido) {
        problemasEx.push(`Equipamento: ${validacaoEquipamento.divergencia}`);
      }
      
      if (!validacaoPosicao.valido) {
        problemasEx.push(`Posição: ${validacaoPosicao.divergencia}`);
      }
      
      if (complexidade.complexidade === 'complexa' || complexidade.problemas.length > 0) {
        problemasEx.push(`Complexidade: ${complexidade.problemas.join(', ')}`);
      }
      
      if (problemasEx.length > 0) {
        problemas.push({
          exercicio: ex,
          validacaoPalavras,
          validacaoEquipamento,
          validacaoPosicao,
          complexidade,
          problemas: problemasEx
        });
      }
    }

    console.log(`⚠️ Encontrados ${problemas.length} exercícios com problemas:\n`);

    // Agrupar por tipo de problema
    const problemasPalavras = problemas.filter(p => !p.validacaoPalavras.valido);
    const problemasEquipamento = problemas.filter(p => !p.validacaoEquipamento.valido);
    const problemasPosicao = problemas.filter(p => !p.validacaoPosicao.valido);
    const problemasComplexidade = problemas.filter(p => p.complexidade.complexidade === 'complexa');

    // Mostrar problemas de palavras-chave
    if (problemasPalavras.length > 0) {
      console.log(`\n📝 PROBLEMAS DE PALAVRAS-CHAVE (${problemasPalavras.length}):\n`);
      problemasPalavras.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. "${item.exercicio.nome}"`);
        console.log(`   Execução: ${item.exercicio.execucaoTecnica?.substring(0, 100)}...`);
        console.log(`   Problema: ${item.validacaoPalavras.divergencia}`);
        console.log('');
      });
      if (problemasPalavras.length > 15) {
        console.log(`   ... e mais ${problemasPalavras.length - 15} exercícios\n`);
      }
    }

    // Mostrar problemas de equipamento
    if (problemasEquipamento.length > 0) {
      console.log(`\n🔧 PROBLEMAS DE EQUIPAMENTO (${problemasEquipamento.length}):\n`);
      problemasEquipamento.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. "${item.exercicio.nome}"`);
        console.log(`   Equipamento esperado: ${(item.exercicio.equipamentoNecessario || []).join(', ')}`);
        console.log(`   Problema: ${item.validacaoEquipamento.divergencia}`);
        console.log('');
      });
      if (problemasEquipamento.length > 15) {
        console.log(`   ... e mais ${problemasEquipamento.length - 15} exercícios\n`);
      }
    }

    // Mostrar problemas de posição
    if (problemasPosicao.length > 0) {
      console.log(`\n📍 PROBLEMAS DE POSIÇÃO (${problemasPosicao.length}):\n`);
      problemasPosicao.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. "${item.exercicio.nome}"`);
        console.log(`   Posição esperada: ${item.validacaoPosicao.posicaoEsperada}`);
        console.log(`   Problema: ${item.validacaoPosicao.divergencia}`);
        console.log('');
      });
      if (problemasPosicao.length > 15) {
        console.log(`   ... e mais ${problemasPosicao.length - 15} exercícios\n`);
      }
    }

    // Mostrar problemas de complexidade
    if (problemasComplexidade.length > 0) {
      console.log(`\n📊 EXECUÇÕES MUITO COMPLEXAS (${problemasComplexidade.length}):\n`);
      problemasComplexidade.slice(0, 15).forEach((item, index) => {
        console.log(`${index + 1}. "${item.exercicio.nome}"`);
        console.log(`   Tamanho: ${item.complexidade.tamanho} caracteres`);
        console.log(`   Problemas: ${item.complexidade.problemas.join(', ')}`);
        console.log(`   Execução: ${item.exercicio.execucaoTecnica?.substring(0, 120)}...`);
        console.log('');
      });
      if (problemasComplexidade.length > 15) {
        console.log(`   ... e mais ${problemasComplexidade.length - 15} exercícios\n`);
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA VALIDAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de exercícios analisados: ${exercicios.length}`);
    console.log(`Exercícios com problemas: ${problemas.length} (${((problemas.length / exercicios.length) * 100).toFixed(1)}%)`);
    console.log(`\nProblemas por tipo:`);
    console.log(`  - Palavras-chave: ${problemasPalavras.length}`);
    console.log(`  - Equipamento: ${problemasEquipamento.length}`);
    console.log(`  - Posição: ${problemasPosicao.length}`);
    console.log(`  - Complexidade: ${problemasComplexidade.length}`);
    console.log('='.repeat(60) + '\n');

    // Salvar relatório
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'validacao-execucao-tecnica.json');
    
    fs.writeFileSync(outputPath, JSON.stringify({
      dataValidacao: new Date().toISOString(),
      totalExercicios: exercicios.length,
      problemas: problemas.map(p => ({
        id: p.exercicio.id,
        nome: p.exercicio.nome,
        problemas: p.problemas,
        validacaoPalavras: p.validacaoPalavras,
        validacaoEquipamento: p.validacaoEquipamento,
        validacaoPosicao: p.validacaoPosicao,
        complexidade: p.complexidade
      }))
    }, null, 2), 'utf-8');
    
    console.log(`💾 Relatório salvo em: ${outputPath}`);
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Executar: npm run simplificar-execucao-tecnica');
    console.log('   2. Executar: npm run corrigir-execucao-tecnica');
    console.log('   3. Revisar melhorias e aplicar');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao validar execução técnica:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar validação
validarExecucaoTecnica()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

