import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MudancaExercicio {
  id: string;
  nomeAtual: string;
  nomeNovo: string;
  descricaoAtual: string | null;
  descricaoNova: string | null;
  nivelAtual: string;
  nivelNovo: string | null;
  mudancas: string[];
}

/**
 * Remove parênteses com nomes alternativos e barras com nomes alternativos
 */
function removerParentesesENomesAlternativos(nome: string): string {
  let nomeNormalizado = nome.trim();
  
  // Remover parênteses com conteúdo (ex: "Desenvolvimento com Barra (Shoulder Press)")
  nomeNormalizado = nomeNormalizado.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  
  // Remover barra com nome alternativo no final (ex: "Elevação Pélvica / Hip Thrust")
  nomeNormalizado = nomeNormalizado.replace(/\s*\/\s*[^/]+$/, '').trim();
  
  // Limpar espaços múltiplos
  nomeNormalizado = nomeNormalizado.replace(/\s+/g, ' ');
  
  return nomeNormalizado;
}

/**
 * Corrige vírgulas confusas em nomes
 */
function corrigirVirgulasEmNomes(nome: string): string {
  let nomeNormalizado = nome.trim();
  
  // Padrões comuns de vírgulas que indicam variações
  // Ex: "Levantamento com Cabo, Inclinação para a Frente" → "Levantamento Inclinado com Cabo"
  const padroesVirgula: Array<[RegExp, string]> = [
    [/,\s*Inclinação para a Frente/i, ' Inclinado'],
    [/,\s*Declinação/i, ' Declinado'],
    [/,\s*Reto/i, ' Reto'],
    [/,\s*Sentado/i, ' Sentado'],
    [/,\s*Em Pé/i, ' Em Pé'],
    [/,\s*Deitado/i, ' Deitado'],
    [/,\s*com Halteres/i, ' com Halteres'],
    [/,\s*com Barra/i, ' com Barra'],
  ];
  
  for (const [padrao, substituicao] of padroesVirgula) {
    if (padrao.test(nomeNormalizado)) {
      nomeNormalizado = nomeNormalizado.replace(padrao, substituicao);
      // Remover vírgulas restantes que possam ter ficado
      nomeNormalizado = nomeNormalizado.replace(/,\s*,/g, ',');
      nomeNormalizado = nomeNormalizado.replace(/,\s*$/, '');
    }
  }
  
  // Remover vírgulas isoladas no meio do nome (mantendo apenas se fizer sentido gramatical)
  // Ex: "X, Y" onde Y é uma descrição → simplificar
  const matchVirgula = nomeNormalizado.match(/^(.+?),\s*(.+)$/);
  if (matchVirgula) {
    const [, parte1, parte2] = matchVirgula;
    // Se a parte após vírgula parece ser uma variação/descrição, integrar ou remover
    if (parte2.length < 30 && !parte2.match(/^(com|em|de|para|por|até|através)/i)) {
      // Integrar a parte após vírgula no nome
      nomeNormalizado = `${parte1} ${parte2}`.trim();
    }
  }
  
  // Limpar espaços múltiplos
  nomeNormalizado = nomeNormalizado.replace(/\s+/g, ' ');
  
  return nomeNormalizado;
}

/**
 * Padroniza números em nomes (mantém numeral por padrão)
 */
function padronizarNumeros(nome: string): string {
  // Por padrão, manteremos números como numerais (4 Apoios)
  // Mas podemos normalizar variações como "quatro" → "4" se necessário
  let nomeNormalizado = nome;
  
  // Mapear números por extenso para numeral (opcional - comentado por padrão)
  const numerosPorExtenso: Record<string, string> = {
    'quatro': '4',
    'três': '3',
    'dois': '2',
    'um': '1',
    'cinco': '5',
    'seis': '6'
  };
  
  // Se quiser converter por extenso para numeral, descomente:
  // for (const [extenso, numeral] of Object.entries(numerosPorExtenso)) {
  //   const regex = new RegExp(`\\b${extenso}\\b`, 'gi');
  //   nomeNormalizado = nomeNormalizado.replace(regex, numeral);
  // }
  
  return nomeNormalizado;
}

/**
 * Identifica descrições repetitivas e redundâncias
 */
function analisarDescricao(
  descricao: string | null,
  grupoMuscular: string,
  outrasDescricoes: Map<string, string[]>
): { temRepeticao: boolean; temRedundancia: boolean; descricoesSimilares: string[] } {
  if (!descricao) {
    return { temRepeticao: false, temRedundancia: false, descricoesSimilares: [] };
  }
  
  const descricaoLower = descricao.toLowerCase();
  const descricoesDoGrupo = outrasDescricoes.get(grupoMuscular) || [];
  
  // Verificar repetições exatas
  const temRepeticao = descricoesDoGrupo.some(d => 
    d.toLowerCase() === descricaoLower || 
    d.toLowerCase().includes(descricaoLower) ||
    descricaoLower.includes(d.toLowerCase())
  );
  
  // Verificar redundâncias comuns
  const redundancias = [
    /exercício cardiovascular que trabalha o sistema cardiovascular/i,
    /exercício que trabalha.*que trabalha/i,
    /fundamental para.*fundamental para/i,
    /essencial para.*essencial para/i,
  ];
  
  const temRedundancia = redundancias.some(regex => regex.test(descricao));
  
  // Encontrar descrições similares
  const descricoesSimilares = descricoesDoGrupo.filter(d => {
    const dLower = d.toLowerCase();
    // Verificar similaridade básica (mesmas palavras-chave)
    const palavrasChave = descricaoLower.split(/\s+/).filter(p => p.length > 4);
    return palavrasChave.some(palavra => dLower.includes(palavra));
  });
  
  return { temRepeticao, temRedundancia, descricoesSimilares };
}

/**
 * Melhora descrição removendo redundâncias e tornando mais específica
 */
function melhorarDescricao(
  descricao: string | null,
  nome: string,
  grupoMuscular: string
): string | null {
  if (!descricao) {
    return null;
  }
  
  let descricaoMelhorada = descricao.trim();
  
  // Remover redundâncias comuns
  const substituicoes: Array<[RegExp, string]> = [
    [/exercício cardiovascular que trabalha o sistema cardiovascular/gi, 'Exercício cardiovascular que melhora o condicionamento físico'],
    [/trabalha o sistema cardiovascular/gi, 'melhora o condicionamento físico'],
    [/fundamental para.*fundamental para/gi, 'fundamental para'],
    [/essencial para.*essencial para/gi, 'essencial para'],
    [/exercício que trabalha.*que trabalha/gi, 'exercício que trabalha'],
    [/melhora o condicionamento físico.*melhora o condicionamento físico/gi, 'melhora o condicionamento físico'],
    [/Essencial para melhorar o condicionamento físico, promover queima de gordura\./gi, 'Essencial para melhorar o condicionamento físico e promover queima de gordura.'],
  ];
  
  for (const [padrao, substituicao] of substituicoes) {
    descricaoMelhorada = descricaoMelhorada.replace(padrao, substituicao);
  }
  
  // Remover frases muito genéricas e repetitivas
  const frasesGenericas = [
    /^Exercício fundamental para desenvolvimento\.$/i,
    /^Exercício isolado para.*\.$/i,
  ];
  
  // Se a descrição for muito genérica, tentar melhorar baseado no nome
  if (frasesGenericas.some(regex => regex.test(descricaoMelhorada))) {
    // Adicionar contexto baseado no nome do exercício
    const palavrasChave = nome.toLowerCase().split(/\s+/);
    
    if (palavrasChave.includes('ombros') || palavrasChave.includes('deltóide')) {
      descricaoMelhorada = descricaoMelhorada.replace(
        /^Exercício.*$/i,
        `Exercício focado no desenvolvimento dos ombros, essencial para força e volume na região deltoide.`
      );
    } else if (palavrasChave.includes('peito') || palavrasChave.includes('peitoral')) {
      descricaoMelhorada = descricaoMelhorada.replace(
        /^Exercício.*$/i,
        `Exercício fundamental para desenvolvimento do peitoral, promovendo hipertrofia e força na região torácica.`
      );
    } else if (palavrasChave.includes('glúteo') || palavrasChave.includes('gluteo')) {
      descricaoMelhorada = descricaoMelhorada.replace(
        /^Exercício.*$/i,
        `Exercício essencial para desenvolvimento dos glúteos, promovendo força, hipertrofia e estabilidade do quadril.`
      );
    }
  }
  
  // Limpar espaços múltiplos
  descricaoMelhorada = descricaoMelhorada.replace(/\s+/g, ' ').trim();
  
  return descricaoMelhorada;
}

/**
 * Valida nível de dificuldade baseado na complexidade do exercício
 */
function validarNivelDificuldade(
  nome: string,
  execucaoTecnica: string | null,
  nivelAtual: string
): string | null {
  const nomeLower = nome.toLowerCase();
  const execucaoLower = (execucaoTecnica || '').toLowerCase();
  
  // Exercícios que geralmente são iniciantes
  const indicadoresIniciante = [
    'cadeira', 'máquina', 'aparelho', 'assistido', 'com apoio',
    'prancha', 'abdominal básico', 'flexão de joelhos',
    'glúteo 4 apoios', 'glúteo quatro apoios', 'caneleira'
  ];
  
  // Exercícios que geralmente são avançados
  const indicadoresAvancado = [
    'barra livre', 'peso livre', 'sem apoio', 'unilateral',
    'com rotação', 'explosivo', 'pliométrico', 'olimpico',
    'agachamento frontal', 'desenvolvimento em pé'
  ];
  
  // Exercícios intermediários geralmente têm equipamento específico mas não são muito complexos
  const indicadoresIntermediario = [
    'com halteres', 'com barra', 'no banco', 'na polia',
    'leg press', 'supino', 'remada'
  ];
  
  // Verificar se o nível atual está correto
  let nivelSugerido: string | null = null;
  
  const temIndicadorIniciante = indicadoresIniciante.some(ind => 
    nomeLower.includes(ind) || execucaoLower.includes(ind)
  );
  
  const temIndicadorAvancado = indicadoresAvancado.some(ind => 
    nomeLower.includes(ind) || execucaoLower.includes(ind)
  );
  
  const temIndicadorIntermediario = indicadoresIntermediario.some(ind => 
    nomeLower.includes(ind) || execucaoLower.includes(ind)
  );
  
  if (temIndicadorIniciante && nivelAtual !== 'Iniciante') {
    nivelSugerido = 'Iniciante';
  } else if (temIndicadorAvancado && nivelAtual !== 'Avançado') {
    nivelSugerido = 'Avançado';
  } else if (temIndicadorIntermediario && !temIndicadorIniciante && !temIndicadorAvancado && nivelAtual === 'Iniciante') {
    nivelSugerido = 'Intermediário';
  }
  
  return nivelSugerido;
}

/**
 * Script principal
 */
async function padronizarExercicios(preview: boolean = true) {
  console.log('📝 Iniciando padronização de exercícios...\n');
  
  try {
    // Buscar todos os exercícios
    const exercicios = await prisma.exercicio.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log(`📊 Total de exercícios encontrados: ${exercicios.length}\n`);
    
    // Agrupar descrições por grupo muscular para análise de repetições
    const descricoesPorGrupo = new Map<string, string[]>();
    exercicios.forEach(ex => {
      if (ex.descricao) {
        const grupo = ex.grupoMuscularPrincipal;
        if (!descricoesPorGrupo.has(grupo)) {
          descricoesPorGrupo.set(grupo, []);
        }
        descricoesPorGrupo.get(grupo)!.push(ex.descricao);
      }
    });
    
    const mudancas: MudancaExercicio[] = [];
    
    // Processar cada exercício
    for (const exercicio of exercicios) {
      const mudanca: MudancaExercicio = {
        id: exercicio.id,
        nomeAtual: exercicio.nome,
        nomeNovo: exercicio.nome,
        descricaoAtual: exercicio.descricao,
        descricaoNova: exercicio.descricao,
        nivelAtual: exercicio.nivelDificuldade,
        nivelNovo: null,
        mudancas: []
      };
      
      // 1. Normalizar nome
      let nomeNormalizado = removerParentesesENomesAlternativos(exercicio.nome);
      nomeNormalizado = corrigirVirgulasEmNomes(nomeNormalizado);
      nomeNormalizado = padronizarNumeros(nomeNormalizado);
      
      if (nomeNormalizado !== exercicio.nome) {
        mudanca.nomeNovo = nomeNormalizado;
        mudanca.mudancas.push(`Nome: "${exercicio.nome}" → "${nomeNormalizado}"`);
      }
      
      // 2. Analisar e melhorar descrição
      const outrasDescricoes = new Map<string, string[]>();
      descricoesPorGrupo.forEach((descricoes, grupo) => {
        outrasDescricoes.set(grupo, descricoes.filter(d => d !== exercicio.descricao));
      });
      
      const analise = analisarDescricao(
        exercicio.descricao,
        exercicio.grupoMuscularPrincipal,
        outrasDescricoes
      );
      
      if (analise.temRepeticao || analise.temRedundancia) {
        const descricaoMelhorada = melhorarDescricao(
          exercicio.descricao,
          nomeNormalizado,
          exercicio.grupoMuscularPrincipal
        );
        
        if (descricaoMelhorada && descricaoMelhorada !== exercicio.descricao) {
          mudanca.descricaoNova = descricaoMelhorada;
          mudanca.mudancas.push(`Descrição melhorada (removidas repetições/redundâncias)`);
        }
      }
      
      // 3. Validar nível de dificuldade
      const nivelSugerido = validarNivelDificuldade(
        nomeNormalizado,
        exercicio.execucaoTecnica,
        exercicio.nivelDificuldade
      );
      
      if (nivelSugerido) {
        mudanca.nivelNovo = nivelSugerido;
        mudanca.mudancas.push(`Nível: "${exercicio.nivelDificuldade}" → "${nivelSugerido}"`);
      }
      
      // Adicionar à lista se houver mudanças
      if (mudanca.mudancas.length > 0) {
        mudancas.push(mudanca);
      }
    }
    
    // Gerar relatório
    console.log('='.repeat(80));
    console.log('📊 RELATÓRIO DE PADRONIZAÇÃO');
    console.log('='.repeat(80));
    console.log(`\nTotal de exercícios analisados: ${exercicios.length}`);
    console.log(`Exercícios com mudanças propostas: ${mudancas.length}\n`);
    
    if (mudancas.length > 0) {
      // Agrupar por tipo de mudança
      const mudancasNome = mudancas.filter(m => m.nomeNovo !== m.nomeAtual);
      const mudancasDescricao = mudancas.filter(m => m.descricaoNova !== m.descricaoAtual);
      const mudancasNivel = mudancas.filter(m => m.nivelNovo !== null);
      
      console.log(`📝 Mudanças de nome: ${mudancasNome.length}`);
      console.log(`📄 Mudanças de descrição: ${mudancasDescricao.length}`);
      console.log(`📊 Mudanças de nível: ${mudancasNivel.length}\n`);
      
      // Exemplos de mudanças
      console.log('Exemplos de mudanças:\n');
      mudancas.slice(0, 10).forEach((m, i) => {
        console.log(`${i + 1}. ${m.nomeAtual}`);
        m.mudancas.forEach(mud => console.log(`   - ${mud}`));
        console.log();
      });
      
      if (mudancas.length > 10) {
        console.log(`... e mais ${mudancas.length - 10} exercícios\n`);
      }
      
      // Salvar relatório JSON
      const relatorioPath = path.join(__dirname, 'padronizacao-exercicios-relatorio.json');
      fs.writeFileSync(
        relatorioPath,
        JSON.stringify(mudancas, null, 2),
        'utf-8'
      );
      console.log(`💾 Relatório salvo em: ${relatorioPath}\n`);
      
      // Aplicar mudanças se não for preview
      if (!preview) {
        console.log('🔄 Aplicando mudanças ao banco de dados...\n');
        
        let aplicados = 0;
        let erros = 0;
        
        for (const mudanca of mudancas) {
          try {
            const dadosUpdate: any = {};
            
            if (mudanca.nomeNovo !== mudanca.nomeAtual) {
              dadosUpdate.nome = mudanca.nomeNovo;
            }
            
            if (mudanca.descricaoNova !== mudanca.descricaoAtual) {
              dadosUpdate.descricao = mudanca.descricaoNova;
            }
            
            if (mudanca.nivelNovo) {
              dadosUpdate.nivelDificuldade = mudanca.nivelNovo;
            }
            
            await prisma.exercicio.update({
              where: { id: mudanca.id },
              data: dadosUpdate
            });
            
            aplicados++;
          } catch (error: any) {
            console.error(`❌ Erro ao atualizar exercício ${mudanca.id}:`, error.message);
            erros++;
          }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ RESUMO DA APLICAÇÃO');
        console.log('='.repeat(80));
        console.log(`✅ Exercícios atualizados: ${aplicados}`);
        if (erros > 0) {
          console.log(`❌ Erros: ${erros}`);
        }
        console.log('='.repeat(80) + '\n');
      } else {
        console.log('ℹ️  Modo PREVIEW ativado. Use --apply para aplicar as mudanças.\n');
      }
    } else {
      console.log('✅ Nenhuma mudança necessária. Todos os exercícios já estão padronizados!\n');
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao padronizar exercícios:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
const args = process.argv.slice(2);
const preview = !args.includes('--apply');

padronizarExercicios(preview)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

