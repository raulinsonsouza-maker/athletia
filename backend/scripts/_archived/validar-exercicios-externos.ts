import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { compareTwoStrings } from 'string-similarity';

const prisma = new PrismaClient();

/**
 * Mapeamento de grupos musculares do FitnessProgramer para nossos grupos
 */
const MAPEAMENTO_GRUPOS: Record<string, string> = {
  'neck': 'Pescoço',
  'trapezius': 'Trapézio',
  'shoulder': 'Ombros',
  'chest': 'Peito',
  'back': 'Costas',
  'wing': 'Costas',
  'erector spinae': 'Costas',
  'biceps': 'Bíceps',
  'triceps': 'Tríceps',
  'forearm': 'Antebraço',
  'abs': 'Abdômen',
  'core': 'Abdômen',
  'leg': 'Quadríceps',
  'calf': 'Panturrilha',
  'hips': 'Glúteos',
  'cardio': 'Cardio',
  'full body': 'Full Body'
};

/**
 * Interface para exercício do FitnessProgramer
 */
interface ExercicioFitnessProgramer {
  nome: string;
  grupoMuscular: string;
  descricao?: string;
  execucaoTecnica?: string;
  equipamento?: string[];
  url?: string;
}

/**
 * Normaliza texto para comparação
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
 * Mapeia grupo muscular do FitnessProgramer para nosso formato
 */
function mapearGrupoMuscular(grupoFP: string): string {
  const grupoLower = grupoFP.toLowerCase();
  
  for (const [key, value] of Object.entries(MAPEAMENTO_GRUPOS)) {
    if (grupoLower.includes(key)) {
      return value;
    }
  }
  
  return grupoFP; // Retorna original se não encontrar mapeamento
}

/**
 * Extrai exercícios de uma página do FitnessProgramer
 */
async function extrairExerciciosDaPagina(url: string, grupoMuscular: string): Promise<ExercicioFitnessProgramer[]> {
  try {
    console.log(`  📥 Buscando: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const exercicios: ExercicioFitnessProgramer[] = [];
    
    // Tentar diferentes seletores comuns para listas de exercícios
    const seletores = [
      'article.exercise',
      '.exercise-item',
      '.exercise-card',
      'div[class*="exercise"]',
      'li[class*="exercise"]',
      'a[href*="/exercise/"]'
    ];
    
    for (const seletor of seletores) {
      $(seletor).each((_, element) => {
        const $el = $(element);
        const nome = $el.find('h2, h3, .title, a').first().text().trim();
        const link = $el.find('a').first().attr('href');
        
        if (nome && nome.length > 2) {
          exercicios.push({
            nome,
            grupoMuscular: mapearGrupoMuscular(grupoMuscular),
            url: link ? (link.startsWith('http') ? link : `https://fitnessprogramer.com${link}`) : undefined
          });
        }
      });
      
      if (exercicios.length > 0) break;
    }
    
    // Se não encontrou com seletores específicos, tentar buscar links de exercícios
    if (exercicios.length === 0) {
      $('a[href*="/exercise/"], a[href*="/exercises/"]').each((_, element) => {
        const $el = $(element);
        const nome = $el.text().trim();
        const link = $el.attr('href');
        
        if (nome && nome.length > 2 && nome.length < 100) {
          exercicios.push({
            nome,
            grupoMuscular: mapearGrupoMuscular(grupoMuscular),
            url: link ? (link.startsWith('http') ? link : `https://fitnessprogramer.com${link}`) : undefined
          });
        }
      });
    }
    
    // Remover duplicatas
    const unicos = new Map<string, ExercicioFitnessProgramer>();
    exercicios.forEach(ex => {
      const key = normalizarTexto(ex.nome);
      if (!unicos.has(key)) {
        unicos.set(key, ex);
      }
    });
    
    return Array.from(unicos.values());
  } catch (error: any) {
    console.error(`  ❌ Erro ao buscar ${url}:`, error.message);
    return [];
  }
}

/**
 * Extrai detalhes de um exercício específico
 */
async function extrairDetalhesExercicio(url: string): Promise<{ descricao?: string; execucaoTecnica?: string; equipamento?: string[] }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    const descricao = $('.description, .exercise-description, [class*="description"]').first().text().trim();
    const execucao = $('.instructions, .how-to, [class*="instruction"], [class*="execution"]').first().text().trim();
    
    const equipamento: string[] = [];
    $('[class*="equipment"], [class*="equipment"]').each((_, el) => {
      const texto = $(el).text().trim();
      if (texto) equipamento.push(texto);
    });
    
    return {
      descricao: descricao || undefined,
      execucaoTecnica: execucao || undefined,
      equipamento: equipamento.length > 0 ? equipamento : undefined
    };
  } catch (error: any) {
    console.error(`  ❌ Erro ao buscar detalhes de ${url}:`, error.message);
    return {};
  }
}

/**
 * Busca exercícios do FitnessProgramer por grupo muscular
 */
async function buscarExerciciosFitnessProgramer(): Promise<ExercicioFitnessProgramer[]> {
  console.log('🌐 Buscando exercícios do FitnessProgramer.com...\n');
  
  const grupos = [
    { nome: 'neck', url: 'https://fitnessprogramer.com/exercises/neck/' },
    { nome: 'trapezius', url: 'https://fitnessprogramer.com/exercises/trapezius/' },
    { nome: 'shoulder', url: 'https://fitnessprogramer.com/exercises/shoulder/' },
    { nome: 'chest', url: 'https://fitnessprogramer.com/exercises/chest/' },
    { nome: 'back', url: 'https://fitnessprogramer.com/exercises/back/' },
    { nome: 'biceps', url: 'https://fitnessprogramer.com/exercises/biceps/' },
    { nome: 'triceps', url: 'https://fitnessprogramer.com/exercises/triceps/' },
    { nome: 'forearm', url: 'https://fitnessprogramer.com/exercises/forearm/' },
    { nome: 'abs', url: 'https://fitnessprogramer.com/exercises/abs/' },
    { nome: 'leg', url: 'https://fitnessprogramer.com/exercises/leg/' },
    { nome: 'calf', url: 'https://fitnessprogramer.com/exercises/calf/' },
    { nome: 'hips', url: 'https://fitnessprogramer.com/exercises/hips/' }
  ];
  
  const todosExercicios: ExercicioFitnessProgramer[] = [];
  
  for (const grupo of grupos) {
    console.log(`📂 Grupo: ${grupo.nome}`);
    const exercicios = await extrairExerciciosDaPagina(grupo.url, grupo.nome);
    todosExercicios.push(...exercicios);
    console.log(`  ✅ Encontrados ${exercicios.length} exercícios\n`);
    
    // Pequeno delay para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return todosExercicios;
}

/**
 * Compara exercícios locais com os do FitnessProgramer
 */
function compararExercicios(
  exerciciosLocais: any[],
  exerciciosFP: ExercicioFitnessProgramer[]
): {
  exerciciosFaltantes: ExercicioFitnessProgramer[];
  exerciciosComDescricaoInferior: Array<{ local: any; fp: ExercicioFitnessProgramer; similaridade: number }>;
  exerciciosSimilares: Array<{ local: any; fp: ExercicioFitnessProgramer; similaridade: number }>;
} {
  console.log('🔍 Comparando exercícios locais com FitnessProgramer...\n');
  
  const exerciciosFaltantes: ExercicioFitnessProgramer[] = [];
  const exerciciosComDescricaoInferior: Array<{ local: any; fp: ExercicioFitnessProgramer; similaridade: number }> = [];
  const exerciciosSimilares: Array<{ local: any; fp: ExercicioFitnessProgramer; similaridade: number }> = [];
  
  // Verificar exercícios do FitnessProgramer que não temos
  for (const exFP of exerciciosFP) {
    const grupoMapeado = mapearGrupoMuscular(exFP.grupoMuscular);
    const exerciciosMesmoGrupo = exerciciosLocais.filter(
      ex => ex.grupoMuscularPrincipal === grupoMapeado
    );
    
    // Procurar exercício similar
    let encontrado = false;
    let maiorSimilaridade = 0;
    let exercicioSimilar: any = null;
    
    for (const exLocal of exerciciosMesmoGrupo) {
      const similaridade = compareTwoStrings(
        normalizarTexto(exFP.nome),
        normalizarTexto(exLocal.nome)
      );
      
      if (similaridade > maiorSimilaridade) {
        maiorSimilaridade = similaridade;
        exercicioSimilar = exLocal;
      }
      
      if (similaridade >= 0.7) {
        encontrado = true;
        
        // Verificar qualidade da descrição
        const temDescricaoLocal = exLocal.descricao && exLocal.descricao.length > 50;
        const temDescricaoFP = exFP.descricao && exFP.descricao.length > 50;
        
        if (!temDescricaoLocal && temDescricaoFP) {
          exerciciosComDescricaoInferior.push({
            local: exLocal,
            fp: exFP,
            similaridade
          });
        } else if (similaridade >= 0.5 && similaridade < 0.7) {
          exerciciosSimilares.push({
            local: exLocal,
            fp: exFP,
            similaridade
          });
        }
        break;
      }
    }
    
    if (!encontrado) {
      exerciciosFaltantes.push(exFP);
    }
  }
  
  return {
    exerciciosFaltantes,
    exerciciosComDescricaoInferior,
    exerciciosSimilares
  };
}

/**
 * Script principal de validação externa
 */
async function validarExerciciosExternos() {
  console.log('🌐 Iniciando validação externa com FitnessProgramer.com...\n');
  console.log('⚠️  NOTA: Este processo pode demorar devido às requisições HTTP.\n');

  try {
    // 1. Buscar exercícios do FitnessProgramer
    const exerciciosFP = await buscarExerciciosFitnessProgramer();
    console.log(`\n✅ Total de exercícios encontrados no FitnessProgramer: ${exerciciosFP.length}\n`);

    // 2. Buscar exercícios locais
    const exerciciosLocais = await prisma.exercicio.findMany({
      where: { ativo: true }
    });
    console.log(`📊 Total de exercícios ativos no nosso banco: ${exerciciosLocais.length}\n`);

    // 3. Comparar
    const comparacao = compararExercicios(exerciciosLocais, exerciciosFP);

    // 4. Relatório
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO EXTERNA');
    console.log('='.repeat(60));
    console.log(`Exercícios no FitnessProgramer: ${exerciciosFP.length}`);
    console.log(`Exercícios no nosso banco: ${exerciciosLocais.length}`);
    console.log(`\n📉 Exercícios faltantes: ${comparacao.exerciciosFaltantes.length}`);
    console.log(`📝 Exercícios com descrição inferior: ${comparacao.exerciciosComDescricaoInferior.length}`);
    console.log(`🔗 Exercícios similares (possíveis variações): ${comparacao.exerciciosSimilares.length}`);
    console.log('='.repeat(60) + '\n');

    // 5. Listar exercícios faltantes
    if (comparacao.exerciciosFaltantes.length > 0) {
      console.log('📉 EXERCÍCIOS RECOMENDADOS PARA ADICIONAR:\n');
      comparacao.exerciciosFaltantes.slice(0, 30).forEach((ex, index) => {
        console.log(`${index + 1}. "${ex.nome}"`);
        console.log(`   Grupo: ${ex.grupoMuscular}`);
        if (ex.url) {
          console.log(`   URL: ${ex.url}`);
        }
        console.log('');
      });
      
      if (comparacao.exerciciosFaltantes.length > 30) {
        console.log(`   ... e mais ${comparacao.exerciciosFaltantes.length - 30} exercícios\n`);
      }
    }

    // 6. Listar exercícios com descrição inferior
    if (comparacao.exerciciosComDescricaoInferior.length > 0) {
      console.log('\n📝 EXERCÍCIOS QUE PRECISAM MELHORIAS NA DESCRIÇÃO:\n');
      comparacao.exerciciosComDescricaoInferior.slice(0, 20).forEach((item, index) => {
        console.log(`${index + 1}. "${item.local.nome}" (Similaridade: ${(item.similaridade * 100).toFixed(0)}%)`);
        console.log(`   FitnessProgramer: "${item.fp.nome}"`);
        if (item.fp.url) {
          console.log(`   URL: ${item.fp.url}`);
        }
        console.log('');
      });
      
      if (comparacao.exerciciosComDescricaoInferior.length > 20) {
        console.log(`   ... e mais ${comparacao.exerciciosComDescricaoInferior.length - 20} exercícios\n`);
      }
    }

    // 7. Estatísticas de cobertura
    const gruposFP = new Set(exerciciosFP.map(e => e.grupoMuscular));
    const gruposLocais = new Set(exerciciosLocais.map(e => e.grupoMuscularPrincipal));
    
    console.log('\n📈 COBERTURA POR GRUPO MUSCULAR:\n');
    gruposFP.forEach(grupo => {
      const countFP = exerciciosFP.filter(e => e.grupoMuscular === grupo).length;
      const countLocal = exerciciosLocais.filter(e => e.grupoMuscularPrincipal === grupo).length;
      const percentual = countLocal > 0 ? ((countLocal / countFP) * 100).toFixed(1) : '0.0';
      console.log(`  ${grupo}: ${countLocal}/${countFP} (${percentual}%)`);
    });

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar exercícios faltantes e adicionar os mais relevantes');
    console.log('   2. Melhorar descrições dos exercícios identificados');
    console.log('   3. Verificar se exercícios similares são variações legítimas');
    console.log('');

  } catch (error: any) {
    console.error('❌ Erro ao validar exercícios externos:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar validação
validarExerciciosExternos()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

