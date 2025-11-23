import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Gera descrição melhorada baseada na base de conhecimento
 */
function gerarDescricaoMelhorada(
  nome: string,
  grupoMuscular: string,
  equipamentos: string[]
): string {
  const grupoLower = grupoMuscular.toLowerCase();
  const isPesoCorporal = equipamentos.some(eq => 
    eq.toLowerCase().includes('peso corporal') || 
    eq.toLowerCase().includes('corpo')
  );

  // Descrições baseadas em grupo muscular e base de conhecimento
  const descricoesPorGrupo: Record<string, string> = {
    'peito': 'Exercício para desenvolvimento dos músculos peitorais. Trabalha principalmente a porção do peito indicada pela variação do exercício, promovendo hipertrofia e força através de movimento de adução horizontal do ombro.',
    'costas': 'Exercício para desenvolvimento dos músculos das costas. Trabalha principalmente os músculos dorsais, promovendo hipertrofia e força através de movimento de puxada, essencial para postura e equilíbrio muscular.',
    'ombros': 'Exercício para desenvolvimento dos músculos deltoides. Trabalha principalmente a porção do ombro indicada pela variação, promovendo hipertrofia e força através de movimento de elevação ou abdução do braço.',
    'bíceps': 'Exercício isolado para desenvolvimento dos músculos bíceps braquial. Trabalha a flexão do cotovelo, promovendo hipertrofia e definição muscular dos braços.',
    'tríceps': 'Exercício isolado para desenvolvimento dos músculos tríceps braquial. Trabalha a extensão do cotovelo, promovendo hipertrofia e definição muscular dos braços. Essencial para desenvolvimento completo dos braços.',
    'quadríceps': 'Exercício para desenvolvimento dos músculos quadríceps (frente da coxa). Trabalha a extensão do joelho, promovendo hipertrofia e força das pernas. Fundamental para estabilidade e potência das pernas.',
    'posteriores': 'Exercício para desenvolvimento dos músculos posteriores da coxa (isquiotibiais). Trabalha a flexão do joelho e extensão do quadril, promovendo hipertrofia e força. Essencial para equilíbrio muscular e prevenção de lesões.',
    'panturrilhas': 'Exercício para desenvolvimento dos músculos da panturrilha (gastrocnêmio e sóleo). Trabalha a flexão plantar, promovendo hipertrofia e força. Importante para estabilidade e estética das pernas.',
    'abdômen': 'Exercício para desenvolvimento dos músculos abdominais e core. Trabalha a estabilização e flexão do tronco, promovendo força funcional e definição. Essencial para postura e prevenção de lesões na coluna.',
    'cardio': 'Exercício cardiovascular para melhoria do condicionamento físico. Promove queima de gordura, melhora da capacidade cardiorrespiratória e resistência. Essencial para saúde cardiovascular e emagrecimento.',
    'flexibilidade': 'Exercício de alongamento e flexibilidade. Promove aumento da amplitude de movimento, melhora da mobilidade articular e prevenção de lesões. Essencial para recuperação e manutenção da saúde musculoesquelética.'
  };

  // Buscar descrição base
  let descricao = descricoesPorGrupo[grupoLower] || 
    `Exercício para desenvolvimento dos músculos ${grupoMuscular.toLowerCase()}. Promove hipertrofia, força e condicionamento físico.`;

  // Personalizar baseado em equipamento
  if (isPesoCorporal) {
    descricao = descricao.replace('Exercício para', 'Exercício com peso corporal para');
    descricao += ' Utiliza apenas o peso do corpo, ideal para iniciantes e treinos em casa.';
  } else if (equipamentos.some(eq => eq.toLowerCase().includes('halter'))) {
    descricao += ' Utiliza halteres, permitindo maior amplitude de movimento e estabilização independente de cada lado.';
  } else if (equipamentos.some(eq => eq.toLowerCase().includes('barra'))) {
    descricao += ' Utiliza barra, permitindo maior carga e desenvolvimento de força máxima.';
  } else if (equipamentos.some(eq => eq.toLowerCase().includes('máquina') || eq.toLowerCase().includes('aparelho'))) {
    descricao += ' Utiliza máquina/aparelho, oferecendo maior segurança e guia de movimento, ideal para iniciantes.';
  } else if (equipamentos.some(eq => eq.toLowerCase().includes('cabo'))) {
    descricao += ' Utiliza cabos/polias, oferecendo resistência constante em toda a amplitude do movimento.';
  }

  return descricao;
}

/**
 * Gera execução técnica melhorada baseada na base de conhecimento
 */
function gerarExecucaoTecnicaMelhorada(
  nome: string,
  grupoMuscular: string,
  equipamentos: string[]
): string {
  const grupoLower = grupoMuscular.toLowerCase();
  const isPesoCorporal = equipamentos.some(eq => 
    eq.toLowerCase().includes('peso corporal') || 
    eq.toLowerCase().includes('corpo')
  );

  // Execuções técnicas baseadas em grupo muscular
  const execucoesPorGrupo: Record<string, string> = {
    'peito': 'Posição inicial: Deite no banco com os pés apoiados no chão. Segure o peso com os braços estendidos acima do peito. Fase excêntrica: Abaixe o peso de forma controlada até sentir alongamento no peito, mantendo os cotovelos ligeiramente flexionados. Fase concêntrica: Empurre o peso de volta à posição inicial, contraindo os músculos peitorais. Respire: expire na subida, inspire na descida. Mantenha o core contraído e as escápulas estabilizadas.',
    'costas': 'Posição inicial: Fique em pé ou sentado com postura ereta, peito aberto. Segure o peso com os braços estendidos. Fase excêntrica: Puxe o peso de forma controlada, aproximando as escápulas e contraindo as costas. Fase concêntrica: Retorne à posição inicial de forma controlada, sentindo o alongamento dos músculos dorsais. Respire: expire na puxada, inspire no retorno. Mantenha o core estável e evite balançar o corpo.',
    'ombros': 'Posição inicial: Fique em pé ou sentado com postura ereta, peito aberto. Segure o peso ao lado do corpo. Fase excêntrica: Eleve o peso de forma controlada até a altura dos ombros ou acima da cabeça, dependendo da variação. Fase concêntrica: Retorne à posição inicial de forma controlada, mantendo o controle do movimento. Respire: expire na elevação, inspire no retorno. Mantenha o core estável e evite arquear as costas.',
    'bíceps': 'Posição inicial: Fique em pé ou sentado com os braços ao lado do corpo, cotovelos próximos ao tronco. Segure o peso com pegada supinada (palmas para cima). Fase concêntrica: Flexione os cotovelos elevando o peso até contrair completamente os bíceps, mantendo os cotovelos fixos. Fase excêntrica: Retorne à posição inicial de forma controlada, sentindo o alongamento dos bíceps. Respire: expire na flexão, inspire no retorno. Mantenha o tronco estável e evite balançar.',
    'tríceps': 'Posição inicial: Fique em pé ou sentado com os braços elevados, cotovelos próximos à cabeça. Segure o peso atrás da cabeça ou acima. Fase concêntrica: Estenda os cotovelos elevando o peso, contraindo completamente os tríceps. Fase excêntrica: Retorne à posição inicial de forma controlada, sentindo o alongamento dos tríceps. Respire: expire na extensão, inspire no retorno. Mantenha os cotovelos fixos e o tronco estável.',
    'quadríceps': 'Posição inicial: Fique em pé com os pés na largura dos ombros, pés ligeiramente apontados para fora. Segure o peso nos ombros ou nas mãos. Fase excêntrica: Desça o corpo flexionando os joelhos e quadris, mantendo o tronco ereto, até os joelhos formarem um ângulo de aproximadamente 90 graus. Fase concêntrica: Estenda os joelhos e quadris retornando à posição inicial, contraindo os quadríceps. Respire: expire na subida, inspire na descida. Mantenha os joelhos alinhados com os pés e o core contraído.',
    'posteriores': 'Posição inicial: Fique em pé com os pés na largura dos ombros. Segure o peso nas mãos ou nos ombros. Fase excêntrica: Flexione o quadril mantendo os joelhos ligeiramente flexionados, descendo o tronco até sentir alongamento nos posteriores. Fase concêntrica: Estenda o quadril retornando à posição inicial, contraindo os músculos posteriores. Respire: expire na subida, inspire na descida. Mantenha as costas retas e o core contraído.',
    'panturrilhas': 'Posição inicial: Fique em pé com os pés na largura dos ombros, pés apoiados no chão ou em uma plataforma elevada. Segure o peso nos ombros ou nas mãos. Fase concêntrica: Eleve o corpo na ponta dos pés, contraindo as panturrilhas ao máximo. Fase excêntrica: Retorne à posição inicial de forma controlada, sentindo o alongamento das panturrilhas. Respire: expire na elevação, inspire no retorno. Mantenha o tronco ereto e o movimento controlado.',
    'abdômen': 'Posição inicial: Deite no chão com os joelhos flexionados e pés apoiados, ou na posição indicada pela variação do exercício. Fase concêntrica: Contraia os músculos abdominais elevando o tronco ou aproximando os joelhos do peito, dependendo da variação. Fase excêntrica: Retorne à posição inicial de forma controlada, mantendo a tensão nos abdominais. Respire: expire na contração, inspire no retorno. Mantenha o movimento controlado e evite puxar o pescoço.',
    'cardio': 'Inicie o exercício em ritmo moderado para aquecimento. Mantenha postura ereta e respiração controlada. Ajuste a intensidade conforme seu condicionamento. Mantenha o exercício por 20-30 minutos para benefícios cardiovasculares. Termine com desaceleração gradual.',
    'flexibilidade': 'Inicie em posição confortável. Execute o alongamento de forma lenta e controlada, mantendo a respiração profunda. Mantenha a posição por 20-30 segundos, sentindo o alongamento sem dor. Retorne à posição inicial de forma controlada. Repita 2-3 vezes.'
  };

  let execucao = execucoesPorGrupo[grupoLower] || 
    `Posição inicial: Prepare-se na posição adequada para o exercício. Fase concêntrica: Execute o movimento principal contraindo os músculos alvo. Fase excêntrica: Retorne à posição inicial de forma controlada. Respire de forma coordenada com o movimento. Mantenha postura adequada e controle do movimento.`;

  // Ajustar baseado em equipamento
  if (isPesoCorporal) {
    execucao = execucao.replace('Segure o peso', 'Use apenas o peso do corpo');
  }

  return execucao;
}

/**
 * Gera erros comuns melhorados baseados na base de conhecimento
 */
function gerarErrosComunsMelhorados(
  grupoMuscular: string,
  equipamentos: string[]
): string[] {
  const grupoLower = grupoMuscular.toLowerCase();
  const isPesoCorporal = equipamentos.some(eq => 
    eq.toLowerCase().includes('peso corporal') || 
    eq.toLowerCase().includes('corpo')
  );

  // Erros comuns baseados em grupo muscular
  const errosPorGrupo: Record<string, string[]> = {
    'peito': [
      'Usar carga excessiva comprometendo a técnica',
      'Não contrair completamente os músculos peitorais',
      'Arquear excessivamente as costas durante o movimento',
      'Não controlar a fase excêntrica (descida do peso)',
      'Afastar demais os cotovelos do corpo'
    ],
    'costas': [
      'Usar carga excessiva comprometendo a técnica',
      'Não contrair as escápulas durante a puxada',
      'Balançar o corpo para gerar momentum',
      'Não controlar a fase excêntrica do movimento',
      'Arredondar as costas durante o exercício'
    ],
    'ombros': [
      'Usar carga excessiva comprometendo a técnica',
      'Arquear as costas durante a elevação',
      'Elevar os ombros (encolher) durante o movimento',
      'Não controlar a fase excêntrica',
      'Movimento muito rápido sem controle'
    ],
    'bíceps': [
      'Usar carga excessiva comprometendo a técnica',
      'Balançar o corpo para ajudar no movimento',
      'Não controlar a fase excêntrica (descida do peso)',
      'Mover os cotovelos durante a flexão',
      'Não contrair completamente os bíceps no topo'
    ],
    'tríceps': [
      'Usar carga excessiva comprometendo a técnica',
      'Não controlar a fase excêntrica do movimento',
      'Mover os cotovelos durante a extensão',
      'Arquear as costas para compensar',
      'Não estender completamente os cotovelos'
    ],
    'quadríceps': [
      'Usar carga excessiva comprometendo a técnica',
      'Não descer até a amplitude completa',
      'Joelhos desalinhados (valgo ou varo)',
      'Não controlar a fase excêntrica (descida)',
      'Arredondar as costas durante o agachamento'
    ],
    'posteriores': [
      'Usar carga excessiva comprometendo a técnica',
      'Arredondar as costas durante o movimento',
      'Não controlar a fase excêntrica',
      'Flexionar demais os joelhos',
      'Não sentir o alongamento nos posteriores'
    ],
    'panturrilhas': [
      'Usar carga excessiva comprometendo a técnica',
      'Não elevar completamente na ponta dos pés',
      'Movimento muito rápido sem controle',
      'Não controlar a fase excêntrica',
      'Não usar amplitude completa do movimento'
    ],
    'abdômen': [
      'Puxar o pescoço com as mãos',
      'Movimento muito rápido sem controle',
      'Não contrair completamente os abdominais',
      'Arquear as costas durante o movimento',
      'Não controlar a respiração durante o exercício'
    ],
    'cardio': [
      'Intensidade muito alta no início',
      'Postura incorreta durante o exercício',
      'Não fazer aquecimento adequado',
      'Não manter hidratação durante o exercício',
      'Ignorar sinais de fadiga excessiva'
    ],
    'flexibilidade': [
      'Alongar até sentir dor',
      'Movimento brusco e rápido',
      'Não manter a respiração controlada',
      'Não manter a posição tempo suficiente',
      'Forçar além da amplitude natural'
    ]
  };

  let erros = errosPorGrupo[grupoLower] || [
    'Usar carga excessiva comprometendo a técnica',
    'Não controlar a fase excêntrica do movimento',
    'Execução muito rápida sem controle',
    'Postura incorreta durante o exercício',
    'Não contrair completamente os músculos alvo'
  ];

  // Ajustar para peso corporal
  if (isPesoCorporal) {
    erros = erros.filter(erro => !erro.includes('carga excessiva'));
    erros.unshift('Execução muito rápida sem controle do movimento');
  }

  // Retornar 3-5 erros mais importantes
  return erros.slice(0, 5);
}

/**
 * Script principal para melhorar descrições
 */
async function melhorarDescricoes() {
  console.log('🔧 Iniciando melhoria de descrições, execução técnica e erros comuns...\n');

  try {
    // Buscar todos os exercícios
    const exercicios = await prisma.exercicio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de exercícios: ${exercicios.length}\n`);

    let atualizados = 0;
    let mantidos = 0;
    let erros = 0;

    for (const exercicio of exercicios) {
      try {
        let precisaAtualizar = false;
        const atualizacoes: any = {};

        // Verificar e melhorar descrição
        if (!exercicio.descricao || exercicio.descricao.length < 100) {
          const novaDescricao = gerarDescricaoMelhorada(
            exercicio.nome,
            exercicio.grupoMuscularPrincipal,
            exercicio.equipamentoNecessario
          );
          atualizacoes.descricao = novaDescricao;
          precisaAtualizar = true;
        }

        // Verificar e melhorar execução técnica
        if (!exercicio.execucaoTecnica || exercicio.execucaoTecnica.length < 150) {
          const novaExecucao = gerarExecucaoTecnicaMelhorada(
            exercicio.nome,
            exercicio.grupoMuscularPrincipal,
            exercicio.equipamentoNecessario
          );
          atualizacoes.execucaoTecnica = novaExecucao;
          precisaAtualizar = true;
        }

        // Verificar e melhorar erros comuns
        if (!exercicio.errosComuns || exercicio.errosComuns.length < 2) {
          const novosErros = gerarErrosComunsMelhorados(
            exercicio.grupoMuscularPrincipal,
            exercicio.equipamentoNecessario
          );
          atualizacoes.errosComuns = novosErros;
          precisaAtualizar = true;
        }

        if (precisaAtualizar) {
          await prisma.exercicio.update({
            where: { id: exercicio.id },
            data: atualizacoes
          });

          atualizados++;
          console.log(`✅ "${exercicio.nome}"`);
          if (atualizacoes.descricao) {
            console.log(`   📝 Descrição atualizada (${atualizacoes.descricao.length} caracteres)`);
          }
          if (atualizacoes.execucaoTecnica) {
            console.log(`   🏋️ Execução técnica atualizada (${atualizacoes.execucaoTecnica.length} caracteres)`);
          }
          if (atualizacoes.errosComuns) {
            console.log(`   ⚠️ Erros comuns atualizados (${atualizacoes.errosComuns.length} erros)`);
          }
        } else {
          mantidos++;
        }
      } catch (error: any) {
        erros++;
        console.error(`❌ Erro ao atualizar "${exercicio.nome}":`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ATUALIZAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Exercícios atualizados: ${atualizados}`);
    console.log(`⏭️ Exercícios mantidos (já estavam bons): ${mantidos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log('='.repeat(60) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao melhorar descrições:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar melhoria
melhorarDescricoes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

