import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mapeamento de benefícios motivacionais por grupo muscular
 */
const BENEFICIOS_POR_GRUPO: Record<string, string[]> = {
  'Peito': [
    'desenvolver força no peito',
    'melhorar a postura',
    'aumentar a capacidade funcional dos braços',
    'fortalecer o tórax para atividades diárias'
  ],
  'Costas': [
    'melhorar a postura',
    'prevenir dores nas costas',
    'desenvolver força funcional',
    'fortalecer a coluna para atividades diárias'
  ],
  'Ombros': [
    'aumentar a mobilidade dos ombros',
    'melhorar a estabilidade',
    'prevenir lesões no ombro',
    'fortalecer para movimentos do dia a dia'
  ],
  'Bíceps': [
    'desenvolver força nos braços',
    'melhorar a capacidade funcional',
    'aumentar a força de pegada',
    'fortalecer para atividades diárias'
  ],
  'Tríceps': [
    'desenvolver força nos braços',
    'melhorar a capacidade de empurrar',
    'aumentar a força funcional',
    'fortalecer para atividades diárias'
  ],
  'Quadríceps': [
    'desenvolver força nas pernas',
    'melhorar a estabilidade',
    'aumentar a potência em movimentos do dia a dia',
    'fortalecer a base de sustentação do corpo'
  ],
  'Posteriores': [
    'fortalecer a parte posterior das coxas',
    'melhorar a estabilidade do joelho',
    'prevenir lesões',
    'desenvolver força funcional'
  ],
  'Panturrilhas': [
    'fortalecer as panturrilhas',
    'melhorar a estabilidade',
    'aumentar a potência de salto',
    'desenvolver força para caminhadas e corridas'
  ],
  'Abdômen': [
    'fortalecer o core',
    'melhorar a postura',
    'prevenir dores nas costas',
    'desenvolver força funcional para atividades diárias'
  ],
  'Cardio': [
    'melhorar o condicionamento físico',
    'promover queima de gordura',
    'aumentar a resistência',
    'fortalecer o sistema cardiovascular',
    'essencial para saúde e bem-estar'
  ],
  'Flexibilidade': [
    'aumentar a amplitude de movimento',
    'melhorar a mobilidade articular',
    'prevenir lesões',
    'essencial para recuperação e manutenção da saúde'
  ]
};

/**
 * Descrições base por tipo de exercício (extraídas do nome)
 */
function obterDescricaoBase(nome: string, grupoMuscular: string): string {
  const nomeLower = nome.toLowerCase();
  
  // Agachamento
  if (nomeLower.includes('agachamento')) {
    return 'Movimento de agachamento que trabalha principalmente';
  }
  
  // Supino
  if (nomeLower.includes('supino')) {
    if (nomeLower.includes('inclinado')) {
      return 'Movimento de supino inclinado que trabalha principalmente';
    }
    if (nomeLower.includes('declinado')) {
      return 'Movimento de supino declinado que trabalha principalmente';
    }
    return 'Movimento de supino que trabalha principalmente';
  }
  
  // Crucifixo
  if (nomeLower.includes('crucifixo')) {
    return 'Movimento de abertura de braços que trabalha principalmente';
  }
  
  // Desenvolvimento
  if (nomeLower.includes('desenvolvimento')) {
    return 'Movimento de elevação que trabalha principalmente';
  }
  
  // Elevação
  if (nomeLower.includes('elevação') || nomeLower.includes('levantamento')) {
    return 'Movimento de elevação que trabalha principalmente';
  }
  
  // Remada
  if (nomeLower.includes('remada')) {
    return 'Movimento de puxada que trabalha principalmente';
  }
  
  // Puxada
  if (nomeLower.includes('puxada')) {
    return 'Movimento de puxada que trabalha principalmente';
  }
  
  // Barra Fixa
  if (nomeLower.includes('barra fixa')) {
    return 'Movimento de puxada na barra que trabalha principalmente';
  }
  
  // Rosca
  if (nomeLower.includes('rosca')) {
    return 'Movimento de flexão de braço que trabalha principalmente';
  }
  
  // Tríceps
  if (nomeLower.includes('tríceps') || nomeLower.includes('triceps')) {
    return 'Movimento de extensão de braço que trabalha principalmente';
  }
  
  // Abdominal
  if (nomeLower.includes('abdominal')) {
    return 'Exercício que fortalece';
  }
  
  // Prancha
  if (nomeLower.includes('prancha')) {
    return 'Exercício isométrico que fortalece';
  }
  
  // Panturrilha
  if (nomeLower.includes('panturrilha')) {
    return 'Movimento de elevação que trabalha principalmente';
  }
  
  // Stiff
  if (nomeLower.includes('stiff')) {
    return 'Movimento de flexão de quadril que trabalha principalmente';
  }
  
  // Cardio
  if (nomeLower.includes('bicicleta') || nomeLower.includes('esteira') || 
      nomeLower.includes('elíptico') || nomeLower.includes('escada')) {
    return 'Exercício cardiovascular que trabalha';
  }
  
  // Alongamento
  if (nomeLower.includes('alongamento')) {
    return 'Exercício de alongamento que melhora';
  }
  
  // Padrão genérico
  return 'Exercício que trabalha principalmente';
}

/**
 * Obter grupo muscular formatado
 */
function obterGrupoFormatado(grupoMuscular: string): string {
  const grupos: Record<string, string> = {
    'Peito': 'o peitoral',
    'Costas': 'as costas',
    'Ombros': 'os ombros',
    'Bíceps': 'os bíceps',
    'Tríceps': 'os tríceps',
    'Quadríceps': 'os quadríceps',
    'Posteriores': 'a parte posterior das coxas',
    'Panturrilhas': 'as panturrilhas',
    'Abdômen': 'o abdômen e o core',
    'Cardio': 'o sistema cardiovascular',
    'Flexibilidade': 'a flexibilidade e mobilidade'
  };
  
  return grupos[grupoMuscular] || grupoMuscular.toLowerCase();
}

/**
 * Obter benefício motivacional
 */
function obterBeneficio(grupoMuscular: string, descricaoBase: string): string {
  const beneficios = BENEFICIOS_POR_GRUPO[grupoMuscular];
  if (!beneficios || beneficios.length === 0) {
    return 'desenvolver força e melhorar a saúde';
  }
  
  // Selecionar 2 benefícios, evitando duplicação com a descrição base
  const descLower = descricaoBase.toLowerCase();
  const beneficiosFiltrados = beneficios.filter(b => {
    const bLower = b.toLowerCase();
    // Evitar repetir se já mencionado na descrição base
    if (descLower.includes('fortalece') && bLower.includes('fortalecer')) return false;
    if (descLower.includes('melhora') && bLower.includes('melhorar')) return false;
    return true;
  });
  
  const selecionados = beneficiosFiltrados.length >= 2 
    ? beneficiosFiltrados.slice(0, 2)
    : beneficios.slice(0, 2);
  
  return selecionados.join(', ') + '.';
}

/**
 * Melhora descrição tornando-a descritiva e motivacional
 */
function melhorarDescricao(
  descricaoAtual: string | null,
  nomeExercicio: string,
  grupoMuscular: string
): string {
  // Gerar nova descrição baseada no nome e grupo muscular
  const descricaoBase = obterDescricaoBase(nomeExercicio, grupoMuscular);
  const grupoFormatado = obterGrupoFormatado(grupoMuscular);
  const beneficio = obterBeneficio(grupoMuscular, descricaoBase);
  
  // Construir descrição completa
  let novaDescricao = `${descricaoBase} ${grupoFormatado}. `;
  
  // Adicionar benefício motivacional
  novaDescricao += `Essencial para ${beneficio}`;
  
  // Remover duplicações comuns (palavras repetidas consecutivamente)
  novaDescricao = novaDescricao.replace(/\b(\w+(?:\s+\w+)*),\s*\1\b/gi, '$1');
  novaDescricao = novaDescricao.replace(/\b(fortalecer o core)\s*,\s*(fortalecer o core)\b/gi, 'fortalecer o core');
  novaDescricao = novaDescricao.replace(/\b(melhorar a postura)\s*,\s*(melhorar a postura)\b/gi, 'melhorar a postura');
  
  // Capitalizar primeira letra
  if (novaDescricao.length > 0) {
    novaDescricao = novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1);
  }
  
  // Limitar tamanho (ideal: 80-200 caracteres)
  if (novaDescricao.length > 250) {
    // Tentar manter até o primeiro ponto final após 150 caracteres
    const primeiroPonto = novaDescricao.indexOf('.', 150);
    if (primeiroPonto > 150 && primeiroPonto < 250) {
      novaDescricao = novaDescricao.substring(0, primeiroPonto + 1);
    } else {
      // Cortar em 200 caracteres
      novaDescricao = novaDescricao.substring(0, 200).trim();
      if (!novaDescricao.endsWith('.')) {
        novaDescricao += '.';
      }
    }
  }
  
  return novaDescricao.trim();
}

/**
 * Script principal de melhoria
 */
async function melhorarDescricoesDescritivas() {
  console.log('✨ Iniciando melhoria de descrições (versão descritiva e motivacional)...\n');

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
      const descricaoAntes = ex.descricao || '';
      const descricaoDepois = melhorarDescricao(
        ex.descricao,
        ex.nome,
        ex.grupoMuscularPrincipal
      );
      
      melhorias.push({
        id: ex.id,
        nome: ex.nome,
        antes: descricaoAntes,
        depois: descricaoDepois,
        tamanhoAntes: descricaoAntes.length,
        tamanhoDepois: descricaoDepois.length
      });
    }

    console.log(`✅ Processamento concluído!\n`);
    console.log(`📝 Total de descrições processadas: ${melhorias.length}\n`);

    // Mostrar exemplos
    console.log('📋 EXEMPLOS DE MELHORIAS (primeiros 20):\n');
    melhorias.slice(0, 20).forEach((melhoria, index) => {
      console.log(`${index + 1}. "${melhoria.nome}"`);
      console.log(`   ANTES (${melhoria.tamanhoAntes} chars): ${melhoria.antes.substring(0, 100)}${melhoria.antes.length > 100 ? '...' : ''}`);
      console.log(`   DEPOIS (${melhoria.tamanhoDepois} chars): ${melhoria.depois}`);
      console.log('');
    });

    if (melhorias.length > 20) {
      console.log(`   ... e mais ${melhorias.length - 20} descrições serão melhoradas\n`);
    }

    // Estatísticas
    const tamanhoMedioAntes = melhorias.reduce((acc, m) => acc + m.tamanhoAntes, 0) / melhorias.length;
    const tamanhoMedioDepois = melhorias.reduce((acc, m) => acc + m.tamanhoDepois, 0) / melhorias.length;
    const mudancaMedia = tamanhoMedioDepois - tamanhoMedioAntes;

    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTATÍSTICAS DE MELHORIA');
    console.log('='.repeat(60));
    console.log(`Total de exercícios: ${exercicios.length}`);
    console.log(`Tamanho médio ANTES: ${tamanhoMedioAntes.toFixed(0)} caracteres`);
    console.log(`Tamanho médio DEPOIS: ${tamanhoMedioDepois.toFixed(0)} caracteres`);
    console.log(`Mudança média: ${mudancaMedia > 0 ? '+' : ''}${mudancaMedia.toFixed(0)} caracteres`);
    console.log('='.repeat(60) + '\n');

    // Salvar melhorias em arquivo JSON para revisão
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'descricoes-descritivas-melhoradas.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(melhorias, null, 2), 'utf-8');
    console.log(`💾 Melhorias salvas em: ${outputPath}`);
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar o arquivo descricoes-descritivas-melhoradas.json');
    console.log('   2. Executar: npm run aplicar-descricoes-descritivas');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao melhorar descrições:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar melhoria
melhorarDescricoesDescritivas()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

