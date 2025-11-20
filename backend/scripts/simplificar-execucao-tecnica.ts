import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Templates de simplificação por tipo de exercício
 */
const TEMPLATES_SIMPLIFICACAO: Record<string, (equipamento: string[], nome: string) => string> = {
  'supino': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    const inclinacao = nome.toLowerCase().includes('inclinado') ? ' inclinado' : '';
    const declinacao = nome.toLowerCase().includes('declinado') ? ' declinado' : '';
    return `Deite no banco${inclinacao}${declinacao}. Segure ${eq} na largura dos ombros. Desça até o peito e empurre para cima.`;
  },
  
  'agachamento': (equipamento, nome) => {
    if (nome.toLowerCase().includes('hack')) {
      return 'Posicione-se no aparelho. Flexione os joelhos descendo. Retorne à posição inicial.';
    }
    if (nome.toLowerCase().includes('livre')) {
      return 'Em pé, pés na largura dos ombros. Flexione os joelhos descendo. Retorne à posição inicial.';
    }
    return 'Em pé, pés na largura dos ombros. Flexione os joelhos descendo. Retorne à posição inicial.';
  },
  
  'afundo': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : '';
    return `Em pé, segure ${eq} nas mãos. Dê um passo à frente e flexione os joelhos. Retorne à posição inicial.`;
  },
  
  'cadeira extensora': (equipamento, nome) => {
    return 'Sente no aparelho. Estenda as pernas levantando os pés. Retorne controladamente.';
  },
  
  'leg press': (equipamento, nome) => {
    return 'Sente no aparelho. Flexione os joelhos descendo. Empurre as pernas estendendo.';
  },
  
  'remada': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    return `Incline o tronco. Segure ${eq} e puxe até o abdômen. Retorne controladamente.`;
  },
  
  'puxada': (equipamento, nome) => {
    if (nome.toLowerCase().includes('barra fixa')) {
      return 'Segure a barra acima da cabeça. Puxe o corpo até o queixo passar a barra. Retorne controladamente.';
    }
    return 'Segure a barra acima da cabeça. Puxe até o peito. Retorne controladamente.';
  },
  
  'rosca': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    return `Segure ${eq} com os braços estendidos. Flexione os braços levantando. Retorne controladamente.`;
  },
  
  'tríceps': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'o cabo';
    return `Segure ${eq} acima da cabeça. Estenda os braços para baixo. Retorne controladamente.`;
  },
  
  'desenvolvimento': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    const posicao = nome.toLowerCase().includes('sentado') ? 'Sentado, ' : '';
    return `${posicao}Segure ${eq} na altura dos ombros. Empurre para cima. Retorne controladamente.`;
  },
  
  'elevação': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    const direcao = nome.toLowerCase().includes('lateral') ? 'lateralmente' : 'à frente';
    return `Em pé, segure ${eq}. Eleve os braços ${direcao}. Retorne controladamente.`;
  },
  
  'crucifixo': (equipamento, nome) => {
    const eq = equipamento.some((e: string) => e.toLowerCase().includes('halter')) ? 'os halteres' : 
               equipamento.some((e: string) => e.toLowerCase().includes('cabo') || e.toLowerCase().includes('polia')) ? 'o cabo' : 'os halteres';
    const inclinacao = nome.toLowerCase().includes('inclinado') ? ' inclinado' : '';
    const declinacao = nome.toLowerCase().includes('declinado') ? ' declinado' : '';
    
    // Crucifixo invertido é para ombros
    if (nome.toLowerCase().includes('invertido')) {
      return 'Incline o tronco. Segure os halteres e abra os braços. Feche controladamente.';
    }
    
    // Crucifixo com cabos em polias baixas é em pé
    if (nome.toLowerCase().includes('polias') || nome.toLowerCase().includes('cabos')) {
      return 'Em pé, segure o cabo. Abra os braços em arco. Feche controladamente.';
    }
    
    // Crucifixo em aparelho para deltoide posterior
    if (nome.toLowerCase().includes('deltóide') || nome.toLowerCase().includes('posterior')) {
      return 'Sente no aparelho. Segure os pegadores e abra os braços. Feche controladamente.';
    }
    
    return `Deite no banco${inclinacao}${declinacao}. Segure ${eq} e abra os braços. Feche controladamente.`;
  },
  
  'panturrilha': (equipamento, nome) => {
    const posicao = nome.toLowerCase().includes('sentado') ? 'Sentado, ' : 'Em pé, ';
    return `${posicao}eleve os calcanhares o máximo possível. Desça controladamente.`;
  },
  
  'barra fixa': (equipamento, nome) => {
    return 'Segure a barra acima da cabeça. Puxe o corpo até o queixo passar a barra. Desça controladamente.';
  },
  
  'puxada': (equipamento, nome) => {
    return 'Segure a barra acima da cabeça. Puxe até o peito. Desça controladamente.';
  },
  
  'remada': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const posicao = nome.toLowerCase().includes('unilateral') ? 'Apoie um joelho no banco. ' : '';
    return `${posicao}Incline o tronco. Segure ${eq} e puxe até o abdômen. Retorne controladamente.`;
  },
  
  'levantamento terra': (equipamento, nome) => {
    return 'Em pé, segure a barra. Flexione os joelhos e quadris descendo. Retorne à posição inicial.';
  },
  
  'mesa flexora': (equipamento, nome) => {
    return 'Deite no aparelho. Flexione os joelhos trazendo os calcanhares em direção ao glúteo. Retorne controladamente.';
  },
  
  'stiff': (equipamento, nome) => {
    const eq = equipamento.includes('Halteres') ? 'os halteres' : 'a barra';
    return `Em pé, segure ${eq}. Flexione o quadril mantendo as costas retas. Retorne à posição inicial.`;
  },
  
  'abdominal': (equipamento, nome) => {
    if (nome.toLowerCase().includes('bicicleta')) {
      return 'Deite no chão. Flexione os joelhos e simule pedalar. Toque o cotovelo no joelho oposto.';
    }
    if (nome.toLowerCase().includes('lateral')) {
      return 'Deite de lado. Flexione o tronco lateralmente. Retorne controladamente.';
    }
    if (nome.toLowerCase().includes('infra')) {
      return 'Deite no chão. Eleve as pernas. Desça controladamente.';
    }
    return 'Deite no chão. Flexione o tronco levantando os ombros. Retorne controladamente.';
  },
  
  'prancha': (equipamento, nome) => {
    return 'Apoie os antebraços no chão. Mantenha o corpo retilíneo. Segure a posição.';
  },
  
  'cardio': (equipamento, nome) => {
    if (nome.toLowerCase().includes('bicicleta')) {
      return 'Sente na bicicleta. Pedale em ritmo constante. Mantenha a postura.';
    }
    if (nome.toLowerCase().includes('esteira')) {
      return 'Suba na esteira. Caminhe ou corra em ritmo constante. Mantenha a postura.';
    }
    return 'Execute o movimento de forma contínua. Mantenha ritmo constante.';
  }
};

/**
 * Simplifica execução técnica removendo complexidade
 */
function simplificarExecucao(
  execucaoAtual: string | null,
  nomeExercicio: string,
  equipamentoNecessario: string[]
): string {
  if (!execucaoAtual) {
    // Se não tem execução, tentar gerar do template
    return gerarExecucaoDoTemplate(nomeExercicio, equipamentoNecessario);
  }
  
  // Tentar usar template se disponível
  const template = encontrarTemplate(nomeExercicio);
  if (template) {
    return template(equipamentoNecessario, nomeExercicio);
  }
  
  // Simplificar execução existente
  let simplificada = execucaoAtual.trim();
  
  // Remover termos técnicos desnecessários
  simplificada = simplificada.replace(/\b(concêntrica|excêntrica|isométrica|biomecânica)\b/gi, '');
  simplificada = simplificada.replace(/\b(mantendo|mantenha)\s+(os|as|o|a)\s+(cotovelos|joelhos|ombros)\s+(em|a)\s+\d+°/gi, '');
  simplificada = simplificada.replace(/\b(contraia|contrair)\s+(o|a|os|as)\s+/gi, '');
  
  // Remover redundâncias
  simplificada = simplificada.replace(/\b(controladamente|controlado)\s*,\s*(controladamente|controlado)\b/gi, 'controladamente');
  simplificada = simplificada.replace(/\b(para cima|para baixo|para frente)\s*,\s*(para cima|para baixo|para frente)\b/gi, (match) => {
    return match.split(',')[0].trim();
  });
  
  // Simplificar frases longas
  simplificada = simplificada.replace(/\bsegure\s+(a|o|os|as)\s+([^,]+)\s+com\s+pegada\s+(média|aberta|fechada)\s*\([^)]+\)/gi, 'segure $1 $2');
  simplificada = simplificada.replace(/\bdesça\s+controladamente\s+até\s+/gi, 'desça até ');
  simplificada = simplificada.replace(/\bretorne\s+controladamente\s+à\s+/gi, 'retorne à ');
  
  // Remover "Posição inicial:" e "Fase:" que tornam o texto complexo
  simplificada = simplificada.replace(/\b(posição inicial|fase excêntrica|fase concêntrica|fase)\s*:?\s*/gi, '');
  
  // Remover padrões como "Fase :" ou "Fase:"
  simplificada = simplificada.replace(/\bfase\s*:?\s*/gi, '');
  
  // Remover espaços duplos e múltiplos (fazer múltiplas vezes para garantir)
  simplificada = simplificada.replace(/\s{2,}/g, ' ');
  simplificada = simplificada.replace(/\s{2,}/g, ' ');
  
  // Dividir em frases curtas (máximo 3-4 frases)
  const frases = simplificada.split(/[.,;]/).filter(f => f.trim().length > 0);
  if (frases.length > 4) {
    simplificada = frases.slice(0, 4).join('. ') + '.';
  }
  
  // Limitar tamanho (ideal: 80-150 caracteres)
  if (simplificada.length > 200) {
    const primeiroPonto = simplificada.indexOf('.');
    if (primeiroPonto > 50 && primeiroPonto < 200) {
      simplificada = simplificada.substring(0, primeiroPonto + 1);
    } else {
      simplificada = simplificada.substring(0, 150).trim();
      if (!simplificada.endsWith('.')) {
        simplificada += '.';
      }
    }
  }
  
  // Capitalizar primeira letra
  if (simplificada.length > 0) {
    simplificada = simplificada.charAt(0).toUpperCase() + simplificada.slice(1);
  }
  
  return simplificada.trim();
}

/**
 * Encontra template apropriado para o exercício
 */
function encontrarTemplate(nomeExercicio: string): ((equipamento: string[], nome: string) => string) | null {
  const nomeLower = nomeExercicio.toLowerCase();
  
  for (const [tipo, template] of Object.entries(TEMPLATES_SIMPLIFICACAO)) {
    if (nomeLower.includes(tipo)) {
      return template;
    }
  }
  
  return null;
}

/**
 * Gera execução do template se não houver execução atual
 */
function gerarExecucaoDoTemplate(nomeExercicio: string, equipamentoNecessario: string[]): string {
  const template = encontrarTemplate(nomeExercicio);
  if (template) {
    return template(equipamentoNecessario, nomeExercicio);
  }
  
  // Template genérico
  return 'Execute o movimento de forma controlada. Mantenha a postura correta.';
}

/**
 * Script principal de simplificação
 */
async function simplificarExecucaoTecnica() {
  console.log('✨ Iniciando simplificação de execução técnica...\n');

  try {
    // Buscar todos os exercícios
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);

    const melhorias: Array<{
      id: string;
      nome: string;
      antes: string;
      depois: string;
      tamanhoAntes: number;
      tamanhoDepois: number;
    }> = [];

    // Processar cada exercício
    console.log('🔄 Processando exercícios...\n');
    
    for (const ex of exercicios) {
      const execucaoAntes = ex.execucaoTecnica || '';
      const execucaoDepois = simplificarExecucao(
        ex.execucaoTecnica,
        ex.nome,
        ex.equipamentoNecessario || []
      );
      
      if (execucaoAntes !== execucaoDepois) {
        melhorias.push({
          id: ex.id,
          nome: ex.nome,
          antes: execucaoAntes,
          depois: execucaoDepois,
          tamanhoAntes: execucaoAntes.length,
          tamanhoDepois: execucaoDepois.length
        });
      }
    }

    console.log(`✅ Processamento concluído!\n`);
    console.log(`📝 Execuções que serão simplificadas: ${melhorias.length}\n`);

    // Mostrar exemplos
    console.log('📋 EXEMPLOS DE SIMPLIFICAÇÃO (primeiros 20):\n');
    melhorias.slice(0, 20).forEach((melhoria, index) => {
      console.log(`${index + 1}. "${melhoria.nome}"`);
      console.log(`   ANTES (${melhoria.tamanhoAntes} chars): ${melhoria.antes.substring(0, 120)}${melhoria.antes.length > 120 ? '...' : ''}`);
      console.log(`   DEPOIS (${melhoria.tamanhoDepois} chars): ${melhoria.depois}`);
      console.log('');
    });

    if (melhorias.length > 20) {
      console.log(`   ... e mais ${melhorias.length - 20} execuções serão simplificadas\n`);
    }

    // Estatísticas
    const tamanhoMedioAntes = melhorias.length > 0
      ? melhorias.reduce((acc, m) => acc + m.tamanhoAntes, 0) / melhorias.length
      : 0;
    const tamanhoMedioDepois = melhorias.length > 0
      ? melhorias.reduce((acc, m) => acc + m.tamanhoDepois, 0) / melhorias.length
      : 0;
    const reducaoMedia = tamanhoMedioAntes - tamanhoMedioDepois;

    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTATÍSTICAS DE SIMPLIFICAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de exercícios: ${exercicios.length}`);
    console.log(`Execuções simplificadas: ${melhorias.length} (${((melhorias.length / exercicios.length) * 100).toFixed(1)}%)`);
    console.log(`Tamanho médio ANTES: ${tamanhoMedioAntes.toFixed(0)} caracteres`);
    console.log(`Tamanho médio DEPOIS: ${tamanhoMedioDepois.toFixed(0)} caracteres`);
    console.log(`Redução média: ${reducaoMedia.toFixed(0)} caracteres`);
    console.log('='.repeat(60) + '\n');

    // Salvar melhorias
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'execucoes-simplificadas.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(melhorias, null, 2), 'utf-8');
    console.log(`💾 Melhorias salvas em: ${outputPath}`);
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar o arquivo execucoes-simplificadas.json');
    console.log('   2. Executar: npm run corrigir-execucao-tecnica');
    console.log('   3. Executar: npm run aplicar-execucao-melhorada');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao simplificar execução técnica:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar simplificação
simplificarExecucaoTecnica()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

