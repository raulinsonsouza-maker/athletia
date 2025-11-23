import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Templates de correção baseados no nome do exercício
 */
const TEMPLATES_CORRECAO: Record<string, (equipamento: string[], nome: string) => string> = {
  'supino': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const inclinacao = nome.toLowerCase().includes('inclinado') ? ' inclinado' : '';
    const declinacao = nome.toLowerCase().includes('declinado') ? ' declinado' : '';
    return `Deite no banco${inclinacao}${declinacao}. Segure ${eq} na largura dos ombros. Desça até o peito e empurre para cima.`;
  },
  
  'agachamento': (equipamento, nome) => {
    if (nome.toLowerCase().includes('hack')) {
      return 'Posicione-se no aparelho. Flexione os joelhos descendo. Retorne à posição inicial.';
    }
    if (nome.toLowerCase().includes('livre') || nome.toLowerCase().includes('barra')) {
      return 'Em pé, pés na largura dos ombros. Segure a barra nos ombros. Flexione os joelhos descendo. Retorne à posição inicial.';
    }
    return 'Em pé, pés na largura dos ombros. Flexione os joelhos descendo. Retorne à posição inicial.';
  },
  
  'remada': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const posicao = nome.toLowerCase().includes('unilateral') ? 'Apoie um joelho no banco. ' : '';
    return `${posicao}Incline o tronco. Segure ${eq} e puxe até o abdômen. Retorne controladamente.`;
  },
  
  'puxada': (equipamento, nome) => {
    if (nome.toLowerCase().includes('barra fixa')) {
      return 'Segure a barra acima da cabeça. Puxe o corpo até o queixo passar a barra. Retorne controladamente.';
    }
    return 'Segure a barra acima da cabeça. Puxe até o peito. Retorne controladamente.';
  },
  
  'rosca': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const posicao = nome.toLowerCase().includes('scott') ? 'Apoie os braços no banco Scott. ' : '';
    const tipo = nome.toLowerCase().includes('martelo') ? 'com pegada neutra' : '';
    return `${posicao}Segure ${eq} ${tipo} com os braços estendidos. Flexione os braços levantando. Retorne controladamente.`;
  },
  
  'tríceps': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 
               equipamento.some(e => e.toLowerCase().includes('cabo') || e.toLowerCase().includes('polia')) ? 'o cabo' : 'os halteres';
    const posicao = nome.toLowerCase().includes('francês') ? 'Deite no banco. ' : 'Em pé, ';
    return `${posicao}Segure ${eq} acima da cabeça. Estenda os braços para baixo. Retorne controladamente.`;
  },
  
  'desenvolvimento': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const posicao = nome.toLowerCase().includes('sentado') ? 'Sentado, ' : 'Em pé, ';
    return `${posicao}Segure ${eq} na altura dos ombros. Empurre para cima. Retorne controladamente.`;
  },
  
  'elevação': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
    const direcao = nome.toLowerCase().includes('lateral') ? 'lateralmente' : 'à frente';
    return `Em pé, segure ${eq}. Eleve os braços ${direcao}. Retorne controladamente.`;
  },
  
  'crucifixo': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 
               equipamento.some(e => e.toLowerCase().includes('cabo') || e.toLowerCase().includes('polia')) ? 'o cabo' : 'os halteres';
    const inclinacao = nome.toLowerCase().includes('inclinado') ? ' inclinado' : '';
    const declinacao = nome.toLowerCase().includes('declinado') ? ' declinado' : '';
    
    // Crucifixo invertido é para ombros, não peito
    if (nome.toLowerCase().includes('invertido')) {
      return 'Incline o tronco. Segure os halteres e abra os braços. Feche controladamente.';
    }
    
    // Crucifixo em aparelho para deltoide posterior
    if (nome.toLowerCase().includes('deltóide') || nome.toLowerCase().includes('posterior')) {
      return 'Sente no aparelho. Segure os pegadores e abra os braços. Feche controladamente.';
    }
    
    return `Deite no banco${inclinacao}${declinacao}. Segure ${eq} e abra os braços. Feche controladamente.`;
  },
  
  'panturrilha': (equipamento, nome) => {
    const posicao = nome.toLowerCase().includes('sentado') ? 'Sentado, ' : 'Em pé, ';
    return `${posicao}eleve os calcanhares. Desça controladamente.`;
  },
  
  'stiff': (equipamento, nome) => {
    const eq = equipamento.some(e => e.toLowerCase().includes('halter')) ? 'os halteres' : 'a barra';
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
    if (nome.toLowerCase().includes('elíptico')) {
      return 'Suba no elíptico. Movimente as pernas em ritmo constante. Mantenha a postura.';
    }
    if (nome.toLowerCase().includes('escada')) {
      return 'Suba na escada. Suba os degraus em ritmo constante. Mantenha a postura.';
    }
    return 'Execute o movimento de forma contínua. Mantenha ritmo constante.';
  }
};

/**
 * Encontra template de correção baseado no nome
 */
function encontrarTemplateCorrecao(nomeExercicio: string): ((equipamento: string[], nome: string) => string) | null {
  const nomeLower = nomeExercicio.toLowerCase();
  
  for (const [tipo, template] of Object.entries(TEMPLATES_CORRECAO)) {
    if (nomeLower.includes(tipo)) {
      return template;
    }
  }
  
  return null;
}

/**
 * Corrige execução técnica baseada no nome do exercício
 */
function corrigirExecucao(
  execucaoAtual: string | null,
  nomeExercicio: string,
  equipamentoNecessario: string[]
): string {
  // Tentar usar template de correção
  const template = encontrarTemplateCorrecao(nomeExercicio);
  if (template) {
    return template(equipamentoNecessario, nomeExercicio);
  }
  
  // Se não encontrou template e não tem execução, gerar genérica
  if (!execucaoAtual) {
    return 'Execute o movimento de forma controlada. Mantenha a postura correta.';
  }
  
  // Se tem execução mas pode estar incorreta, tentar corrigir baseado no nome
  const nomeLower = nomeExercicio.toLowerCase();
  let corrigida = execucaoAtual.trim();
  
  // Corrigir divergências comuns
  
  // Se nome diz "inclinado" mas execução não menciona
  if (nomeLower.includes('inclinado') && !corrigida.toLowerCase().includes('inclinado')) {
    corrigida = corrigida.replace(/banco/gi, 'banco inclinado');
  }
  
  // Se nome diz "declinado" mas execução não menciona
  if (nomeLower.includes('declinado') && !corrigida.toLowerCase().includes('declinado')) {
    corrigida = corrigida.replace(/banco/gi, 'banco declinado');
  }
  
  // Se nome diz "halteres" mas execução menciona "barra"
  if (nomeLower.includes('halter') && corrigida.toLowerCase().includes('barra') && !corrigida.toLowerCase().includes('halter')) {
    corrigida = corrigida.replace(/barra/gi, 'halteres');
  }
  
  // Se nome diz "barra" mas execução menciona "halteres"
  if (nomeLower.includes('barra') && !nomeLower.includes('halter') && corrigida.toLowerCase().includes('halter') && !corrigida.toLowerCase().includes('barra')) {
    corrigida = corrigida.replace(/halteres?/gi, 'a barra');
  }
  
  // Se nome diz "sentado" mas execução não menciona
  if (nomeLower.includes('sentado') && !corrigida.toLowerCase().includes('sentado')) {
    if (corrigida.toLowerCase().startsWith('em pé')) {
      corrigida = corrigida.replace(/^em pé/gi, 'Sentado');
    } else {
      corrigida = 'Sentado, ' + corrigida;
    }
  }
  
  return corrigida.trim();
}

/**
 * Script principal de correção
 */
async function corrigirExecucaoTecnica() {
  console.log('🔧 Iniciando correção de execução técnica...\n');

  try {
    // Ler validação anterior se existir
    const validacaoPath = path.join(__dirname, 'validar-execucao-tecnica.ts');
    const fs = require('fs');
    
    // Buscar todos os exercícios
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);

    const correcoes: Array<{
      id: string;
      nome: string;
      antes: string;
      depois: string;
      motivo: string;
    }> = [];

    // Processar cada exercício
    console.log('🔄 Processando exercícios...\n');
    
    for (const ex of exercicios) {
      const execucaoAntes = ex.execucaoTecnica || '';
      const execucaoDepois = corrigirExecucao(
        ex.execucaoTecnica,
        ex.nome,
        ex.equipamentoNecessario || []
      );
      
      if (execucaoAntes !== execucaoDepois) {
        // Determinar motivo da correção
        let motivo = 'Correção baseada no nome do exercício';
        const nomeLower = ex.nome.toLowerCase();
        
        if (nomeLower.includes('inclinado') && !execucaoAntes.toLowerCase().includes('inclinado')) {
          motivo = 'Adicionado "inclinado" conforme nome';
        } else if (nomeLower.includes('declinado') && !execucaoAntes.toLowerCase().includes('declinado')) {
          motivo = 'Adicionado "declinado" conforme nome';
        } else if (nomeLower.includes('halter') && execucaoAntes.toLowerCase().includes('barra') && !execucaoAntes.toLowerCase().includes('halter')) {
          motivo = 'Corrigido equipamento: barra → halteres';
        } else if (nomeLower.includes('barra') && !nomeLower.includes('halter') && execucaoAntes.toLowerCase().includes('halter') && !execucaoAntes.toLowerCase().includes('barra')) {
          motivo = 'Corrigido equipamento: halteres → barra';
        } else if (nomeLower.includes('sentado') && !execucaoAntes.toLowerCase().includes('sentado')) {
          motivo = 'Adicionado "sentado" conforme nome';
        }
        
        correcoes.push({
          id: ex.id,
          nome: ex.nome,
          antes: execucaoAntes,
          depois: execucaoDepois,
          motivo
        });
      }
    }

    console.log(`✅ Processamento concluído!\n`);
    console.log(`📝 Execuções que serão corrigidas: ${correcoes.length}\n`);

    // Mostrar exemplos
    console.log('📋 EXEMPLOS DE CORREÇÕES (primeiros 20):\n');
    correcoes.slice(0, 20).forEach((correcao, index) => {
      console.log(`${index + 1}. "${correcao.nome}"`);
      console.log(`   Motivo: ${correcao.motivo}`);
      console.log(`   ANTES: ${correcao.antes.substring(0, 120)}${correcao.antes.length > 120 ? '...' : ''}`);
      console.log(`   DEPOIS: ${correcao.depois}`);
      console.log('');
    });

    if (correcoes.length > 20) {
      console.log(`   ... e mais ${correcoes.length - 20} execuções serão corrigidas\n`);
    }

    // Estatísticas
    const motivos = new Map<string, number>();
    correcoes.forEach(c => {
      motivos.set(c.motivo, (motivos.get(c.motivo) || 0) + 1);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTATÍSTICAS DE CORREÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de exercícios: ${exercicios.length}`);
    console.log(`Execuções corrigidas: ${correcoes.length} (${((correcoes.length / exercicios.length) * 100).toFixed(1)}%)`);
    console.log(`\nCorreções por motivo:`);
    Array.from(motivos.entries()).forEach(([motivo, count]) => {
      console.log(`  - ${motivo}: ${count}`);
    });
    console.log('='.repeat(60) + '\n');

    // Salvar correções
    const outputPath = path.join(__dirname, 'execucoes-corrigidas.json');
    fs.writeFileSync(outputPath, JSON.stringify(correcoes, null, 2), 'utf-8');
    console.log(`💾 Correções salvas em: ${outputPath}`);
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar o arquivo execucoes-corrigidas.json');
    console.log('   2. Executar: npm run aplicar-execucao-melhorada');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao corrigir execução técnica:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar correção
corrigirExecucaoTecnica()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

