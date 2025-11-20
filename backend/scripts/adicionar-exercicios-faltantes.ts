import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Função para gerar ID baseado no nome do exercício
 */
function gerarId(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizar grupo muscular principal
 */
function normalizarGrupoMuscular(grupo: string): string {
  const grupos: Record<string, string> = {
    'glúteos / abdutores': 'Glúteos',
    'abdômen / core': 'Abdômen',
    'glúteos': 'Glúteos',
    'ombros': 'Ombros',
    'abdômen': 'Abdômen',
    'panturrilhas': 'Panturrilhas'
  };
  
  const grupoLower = grupo.toLowerCase().trim();
  return grupos[grupoLower] || grupo;
}

/**
 * Normalizar equipamentos
 */
function normalizarEquipamentos(equipamentos: string[]): string[] {
  const normalizados: string[] = [];
  
  equipamentos.forEach(eq => {
    const eqLower = eq.toLowerCase().trim();
    
    // Normalizações específicas
    if (eqLower.includes('suporte') || eqLower.includes('rack')) {
      normalizados.push('Rack');
    } else if (eqLower.includes('aparelho abdutora')) {
      normalizados.push('Máquina');
    } else if (eqLower.includes('leg press')) {
      normalizados.push('Máquina');
    } else if (eqLower.includes('polia') && eqLower.includes('corda')) {
      normalizados.push('Polia');
      normalizados.push('Corda');
    } else if (eqLower === 'nenhum' || eqLower === '') {
      // Não adicionar nada
    } else {
      // Capitalizar primeira letra
      normalizados.push(eq.charAt(0).toUpperCase() + eq.slice(1).toLowerCase());
    }
  });
  
  return normalizados;
}

/**
 * Normalizar sinergistas
 */
function normalizarSinergistas(sinergistas: string[]): string[] {
  const gruposPadronizados: Record<string, string> = {
    'trapézio superior': 'Trapézio',
    'trapézio': 'Trapézio',
    'tríceps': 'Tríceps',
    'isquiotibiais': 'Isquiotibiais',
    'lombar': 'Lombar',
    'tensor da fáscia lata': 'Quadríceps',
    'oblíquos': 'Abdômen',
    'quadrado lombar': 'Lombar',
    'sóleo': 'Panturrilhas'
  };
  
  return sinergistas.map(s => {
    const sLower = s.toLowerCase().trim();
    return gruposPadronizados[sLower] || s;
  });
}

/**
 * Dados dos exercícios a adicionar
 */
const exerciciosParaAdicionar = [
  {
    nome: 'Desenvolvimento com Barra (Shoulder Press)',
    grupoMuscularPrincipal: 'Ombros',
    sinergistas: ['Tríceps', 'Trapézio Superior'],
    descricao: 'Movimento de elevação vertical que trabalha principalmente o deltoide anterior e medial. Essencial para força e volume na região dos ombros.',
    execucaoTecnica: 'Em pé ou sentado, segure a barra na altura dos ombros. Empurre para cima até estender os braços. Retorne controladamente.',
    errosComuns: [
      'Arqueamento excessivo da lombar',
      'Descer menos que o necessário',
      'Usar impulso para empurrar a barra'
    ],
    equipamentoNecessario: ['Barra', 'Anilhas', 'Suporte / Rack'],
    nivelDificuldade: 'Intermediário',
    cargaInicialSugerida: 10,
    rpeSugerido: 6
  },
  {
    nome: 'Elevação Pélvica / Hip Thrust',
    grupoMuscularPrincipal: 'Glúteos',
    sinergistas: ['Isquiotibiais', 'Lombar'],
    descricao: 'Exercício fundamental para glúteo máximo, sendo um dos mais eficientes para hipertrofia e força dos glúteos.',
    execucaoTecnica: 'Sente no chão com a parte superior das costas apoiada no banco. Role a barra sobre o quadril. Eleve o quadril até alinhar tronco e coxas. Retorne devagar.',
    errosComuns: [
      'Não estender completamente o quadril',
      'Empurrar com a lombar',
      'Deixar os joelhos abrirem ou fecharem'
    ],
    equipamentoNecessario: ['Barra', 'Anilhas', 'Banco'],
    nivelDificuldade: 'Intermediário',
    cargaInicialSugerida: 20,
    rpeSugerido: 7
  },
  {
    nome: 'Cadeira Abdutora',
    grupoMuscularPrincipal: 'Glúteos / Abdutores',
    sinergistas: ['Tensor da fáscia lata'],
    descricao: 'Movimento de abdução de quadril que ativa glúteo médio e mínimo, importante para estabilidade do quadril e melhora estética lateral.',
    execucaoTecnica: 'Sente-se no aparelho e posicione as pernas nas almofadas. Afaste as pernas abrindo os joelhos. Retorne controladamente.',
    errosComuns: [
      'Jogar o tronco para frente',
      'Fazer movimento curto',
      'Usar balanço'
    ],
    equipamentoNecessario: ['Aparelho Abdutora'],
    nivelDificuldade: 'Iniciante',
    cargaInicialSugerida: 20,
    rpeSugerido: 6
  },
  {
    nome: 'Glúteo 4 Apoios com Caneleira',
    grupoMuscularPrincipal: 'Glúteos',
    sinergistas: ['Isquiotibiais'],
    descricao: 'Exercício de extensão de quadril focado no glúteo máximo, ótimo para alunos iniciantes e para conscientização muscular.',
    execucaoTecnica: 'Em quatro apoios, eleve a perna dobrada até alinhar coxa e tronco. Retorne devagar sem apoiar no chão.',
    errosComuns: [
      'Arquear lombar',
      'Movimento muito curto',
      'Chutar para cima usando impulsão'
    ],
    equipamentoNecessario: ['Caneleira'],
    nivelDificuldade: 'Iniciante',
    cargaInicialSugerida: 2,
    rpeSugerido: 6
  },
  {
    nome: 'Prancha Lateral',
    grupoMuscularPrincipal: 'Abdômen / Core',
    sinergistas: ['Oblíquos', 'Quadrado lombar'],
    descricao: 'Exercício isométrico focado no core lateral, essencial para estabilidade da coluna e prevenção de dores lombares.',
    execucaoTecnica: 'Deite-se de lado e apoie o antebraço no chão. Eleve o quadril mantendo o corpo alinhado. Segure a posição.',
    errosComuns: [
      'Deixar o quadril cair',
      'Girar o tronco',
      'Segurar a respiração'
    ],
    equipamentoNecessario: ['Nenhum'],
    nivelDificuldade: 'Iniciante',
    cargaInicialSugerida: null,
    rpeSugerido: 7
  },
  {
    nome: 'Abdominal na Polia (Corda)',
    grupoMuscularPrincipal: 'Abdômen',
    sinergistas: ['Oblíquos'],
    descricao: 'Variação com carga progressiva ideal para aumentar força e volume no reto abdominal.',
    execucaoTecnica: 'Ajoelhado, segure a corda atrás da cabeça. Flexione o tronco levando os cotovelos ao chão. Retorne devagar.',
    errosComuns: [
      'Puxar com os braços',
      'Não arredondar a coluna',
      'Movimento muito curto'
    ],
    equipamentoNecessario: ['Polia', 'Corda'],
    nivelDificuldade: 'Intermediário',
    cargaInicialSugerida: 10,
    rpeSugerido: 7
  },
  {
    nome: 'Panturrilha no Leg Press',
    grupoMuscularPrincipal: 'Panturrilhas',
    sinergistas: ['Sóleo'],
    descricao: 'Variação prática e segura de panturrilha, ideal para iniciantes e alunos com dificuldade em ficar em pé.',
    execucaoTecnica: 'No leg press, posicione apenas a ponta dos pés na plataforma. Estenda o tornozelo elevando o peso. Retorne alongando bem.',
    errosComuns: [
      'Movimento curto',
      'Deixar o pé escorregar',
      'Dobrar joelhos'
    ],
    equipamentoNecessario: ['Leg Press'],
    nivelDificuldade: 'Iniciante',
    cargaInicialSugerida: 40,
    rpeSugerido: 6
  }
];

/**
 * Script principal
 */
async function adicionarExerciciosFaltantes() {
  console.log('📝 Iniciando adição de exercícios faltantes...\n');

  try {
    let adicionados = 0;
    let atualizados = 0;
    let jaExistentes = 0;

    for (const exercicioData of exerciciosParaAdicionar) {
      // Gerar ID
      const id = gerarId(exercicioData.nome);
      
      // Normalizar dados
      const grupoMuscularPrincipal = normalizarGrupoMuscular(exercicioData.grupoMuscularPrincipal);
      const sinergistas = normalizarSinergistas(exercicioData.sinergistas);
      const equipamentoNecessario = normalizarEquipamentos(exercicioData.equipamentoNecessario);
      
      // Verificar se já existe
      const existente = await prisma.exercicio.findUnique({
        where: { id }
      });

      if (existente) {
        console.log(`⚠️  Exercício já existe: "${exercicioData.nome}" (ID: ${id})`);
        jaExistentes++;
        continue;
      }

      // Verificar se existe por nome (case insensitive)
      const existentePorNome = await prisma.exercicio.findFirst({
        where: {
          nome: {
            equals: exercicioData.nome,
            mode: 'insensitive'
          }
        }
      });

      if (existentePorNome) {
        console.log(`⚠️  Exercício com nome similar já existe: "${existentePorNome.nome}"`);
        jaExistentes++;
        continue;
      }

      // Criar exercício
      try {
        await prisma.exercicio.create({
          data: {
            id,
            nome: exercicioData.nome,
            grupoMuscularPrincipal,
            sinergistas,
            descricao: exercicioData.descricao,
            execucaoTecnica: exercicioData.execucaoTecnica,
            errosComuns: exercicioData.errosComuns,
            equipamentoNecessario,
            nivelDificuldade: exercicioData.nivelDificuldade,
            cargaInicialSugerida: exercicioData.cargaInicialSugerida,
            rpeSugerido: exercicioData.rpeSugerido,
            alternativas: [],
            ativo: true
          }
        });

        console.log(`✅ Exercício adicionado: "${exercicioData.nome}"`);
        adicionados++;
      } catch (error: any) {
        console.error(`❌ Erro ao adicionar "${exercicioData.nome}":`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO');
    console.log('='.repeat(60));
    console.log(`✅ Exercícios adicionados: ${adicionados}`);
    console.log(`⚠️  Exercícios já existentes: ${jaExistentes}`);
    console.log(`📝 Total processado: ${exerciciosParaAdicionar.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao adicionar exercícios:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
adicionarExerciciosFaltantes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

