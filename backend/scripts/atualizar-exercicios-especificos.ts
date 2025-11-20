import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Dados dos exercícios a atualizar
 */
const exerciciosParaAtualizar = [
  {
    nome: 'Abdominal Bicicleta',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece o abdômen e o core, auxilia na postura e previne dores lombares.',
    ativo: true
  },
  {
    nome: 'Abdominal Infra',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que ativa o reto abdominal e o core, melhora a estabilidade da coluna.',
    ativo: true
  },
  {
    nome: 'Abdominal Lateral',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que trabalha os oblíquos, contribuindo para estabilidade lateral e postura.',
    ativo: true
  },
  {
    nome: 'Abdominal na Polia',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Intermediário',
    descricao: 'Variação com carga progressiva, ideal para aumentar força e volume no reto abdominal.',
    ativo: true
  },
  {
    nome: 'Abdominal Reto',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece o reto abdominal, essencial para postura e prevenção de dores nas costas.',
    ativo: true
  },
  {
    nome: 'Afundo',
    grupoMuscularPrincipal: 'Quadríceps',
    nivelDificuldade: 'Intermediário',
    descricao: 'Exercício que trabalha principalmente os quadríceps, desenvolvendo força e estabilidade nas pernas.',
    ativo: true
  },
  {
    nome: 'Agachamento Hack',
    grupoMuscularPrincipal: 'Quadríceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de agachamento que fortalece os quadríceps e melhora a estabilidade das pernas.',
    ativo: true
  },
  {
    nome: 'Agachamento Livre',
    grupoMuscularPrincipal: 'Quadríceps',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de agachamento que desenvolve força e estabilidade nos quadríceps e core.',
    ativo: true
  },
  {
    nome: 'Alongamento Geral',
    grupoMuscularPrincipal: 'Flexibilidade',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício de alongamento que melhora flexibilidade e mobilidade, prevenindo lesões.',
    ativo: true
  },
  {
    nome: 'Barra Fixa',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Avançado',
    descricao: 'Movimento de puxada que fortalece principalmente as costas, melhorando postura e prevenindo dores.',
    ativo: true
  },
  {
    nome: 'Bicicleta Ergométrica',
    grupoMuscularPrincipal: 'Cardio / Aeróbico',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício cardiovascular que melhora o condicionamento físico e promove queima de gordura.',
    ativo: true
  },
  {
    nome: 'Cadeira Abdutora',
    grupoMuscularPrincipal: 'Glúteos',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de abdução de quadril que ativa glúteo médio e mínimo, importante para estabilidade e estética lateral.',
    ativo: true
  },
  {
    nome: 'Cadeira Extensora',
    grupoMuscularPrincipal: 'Quadríceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece principalmente os quadríceps e melhora a estabilidade das pernas.',
    ativo: true
  },
  {
    nome: 'Crucifixo Declinado com Halteres',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de abertura de braços que fortalece o peitoral e melhora a postura.',
    ativo: true
  },
  {
    nome: 'Crucifixo em Aparelho, Deltóide Posterior',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de abertura de braços que trabalha os ombros, aumentando mobilidade e estabilidade.',
    ativo: true
  },
  {
    nome: 'Crucifixo Inclinado com Halteres',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de abertura de braços que fortalece o peitoral e melhora a postura.',
    ativo: true
  },
  {
    nome: 'Cruzamento de Cabos',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Exercício que trabalha o peitoral, contribuindo para força e desenvolvimento muscular.',
    ativo: true
  },
  {
    nome: 'Desenvolvimento com Barra',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de elevação vertical que fortalece deltoide anterior e medial, promovendo volume e força nos ombros.',
    ativo: true
  },
  {
    nome: 'Elevação Frontal',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de elevação que fortalece os ombros, aumentando mobilidade e estabilidade.',
    ativo: true
  },
  {
    nome: 'Elevação Lateral',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de elevação que fortalece os ombros e melhora a estabilidade lateral.',
    ativo: true
  },
  {
    nome: 'Elevação Pélvica',
    grupoMuscularPrincipal: 'Glúteos',
    nivelDificuldade: 'Intermediário',
    descricao: 'Exercício que ativa o glúteo máximo, eficiente para hipertrofia e força.',
    ativo: true
  },
  {
    nome: 'Elíptico',
    grupoMuscularPrincipal: 'Cardio / Aeróbico',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício cardiovascular que melhora condicionamento físico e promove queima de gordura.',
    ativo: true
  },
  {
    nome: 'Escada',
    grupoMuscularPrincipal: 'Cardio / Aeróbico',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício cardiovascular que melhora condicionamento físico e promove queima de gordura.',
    ativo: true
  },
  {
    nome: 'Esteira',
    grupoMuscularPrincipal: 'Cardio / Aeróbico',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício cardiovascular que melhora condicionamento físico e promove queima de gordura.',
    ativo: true
  },
  {
    nome: 'Flexão de Braços em Barras Paralelas',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Exercício que fortalece o peitoral e melhora a capacidade funcional de empurrar.',
    ativo: true
  },
  {
    nome: 'Glúteo 4 Apoios com Caneleira',
    grupoMuscularPrincipal: 'Glúteos',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de extensão de quadril focado no glúteo máximo, ideal para iniciantes.',
    ativo: true
  },
  {
    nome: 'Leg Press',
    grupoMuscularPrincipal: 'Quadríceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece quadríceps, melhorando força e estabilidade.',
    ativo: true
  },
  {
    nome: 'Levantamento com Cabo, Inclinação para a Frente',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de elevação que fortalece os ombros e aumenta mobilidade.',
    ativo: true
  },
  {
    nome: 'Levantamento Terra',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Avançado',
    descricao: 'Movimento de levantamento que fortalece costas, melhorando postura e prevenindo dores.',
    ativo: true
  },
  {
    nome: 'Mesa Flexora',
    grupoMuscularPrincipal: 'Posteriores de Coxa',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece a parte posterior das coxas e melhora a estabilidade do joelho.',
    ativo: true
  },
  {
    nome: 'Panturrilha em Pé',
    grupoMuscularPrincipal: 'Panturrilhas',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de elevação que fortalece panturrilhas e melhora estabilidade.',
    ativo: true
  },
  {
    nome: 'Panturrilha no Leg Press',
    grupoMuscularPrincipal: 'Panturrilhas',
    nivelDificuldade: 'Iniciante',
    descricao: 'Variação segura para iniciantes, ideal para fortalecimento das panturrilhas.',
    ativo: true
  },
  {
    nome: 'Peck Deck',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Exercício que fortalece o peitoral, contribuindo para desenvolvimento muscular.',
    ativo: true
  },
  {
    nome: 'Prancha',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício isométrico que fortalece abdômen e core, auxiliando na postura.',
    ativo: true
  },
  {
    nome: 'Prancha Lateral',
    grupoMuscularPrincipal: 'Abdômen',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício isométrico focado nos oblíquos, promovendo estabilidade da coluna.',
    ativo: true
  },
  {
    nome: 'Puxada Frontal',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de puxada que fortalece as costas, melhorando postura e estabilidade.',
    ativo: true
  },
  {
    nome: 'Remada Baixa',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de puxada que fortalece costas e melhora postura.',
    ativo: true
  },
  {
    nome: 'Remada Curvada com Barra',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de puxada que fortalece costas e melhora estabilidade da coluna.',
    ativo: true
  },
  {
    nome: 'Remada Unilateral com Halter',
    grupoMuscularPrincipal: 'Costas',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de puxada que fortalece costas e melhora simetria muscular.',
    ativo: true
  },
  {
    nome: 'Remada Vertical com Barra',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de puxada que fortalece ombros, aumentando mobilidade e estabilidade.',
    ativo: true
  },
  {
    nome: 'Rosca Concentrada',
    grupoMuscularPrincipal: 'Bíceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de flexão que fortalece bíceps e melhora capacidade funcional.',
    ativo: true
  },
  {
    nome: 'Rosca Direta com Barra',
    grupoMuscularPrincipal: 'Bíceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de flexão que fortalece bíceps, melhorando força e resistência.',
    ativo: true
  },
  {
    nome: 'Rosca Martelo',
    grupoMuscularPrincipal: 'Bíceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de flexão que fortalece bíceps e antebraço, ideal para iniciantes.',
    ativo: true
  },
  {
    nome: 'Rosca Scott',
    grupoMuscularPrincipal: 'Bíceps',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de flexão que fortalece bíceps e promove controle de movimento.',
    ativo: true
  },
  {
    nome: 'Rotação Externa com Cabo',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece ombros, aumentando mobilidade e estabilidade.',
    ativo: true
  },
  {
    nome: 'Rotação Interna com Cabo',
    grupoMuscularPrincipal: 'Ombros',
    nivelDificuldade: 'Iniciante',
    descricao: 'Exercício que fortalece ombros e melhora controle de rotação.',
    ativo: true
  },
  {
    nome: 'Stiff',
    grupoMuscularPrincipal: 'Posteriores de Coxa',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de flexão de quadril que fortalece parte posterior das coxas e joelhos.',
    ativo: true
  },
  {
    nome: 'Supino Declinado com Barra',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de supino declinado que fortalece o peitoral e melhora postura.',
    ativo: true
  },
  {
    nome: 'Supino Inclinado com Halteres',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de supino inclinado que fortalece peitoral e ombros.',
    ativo: true
  },
  {
    nome: 'Supino Reto com Barra',
    grupoMuscularPrincipal: 'Peito',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de supino que fortalece o peitoral e melhora força funcional.',
    ativo: true
  },
  {
    nome: 'Tríceps Coice',
    grupoMuscularPrincipal: 'Tríceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de extensão que fortalece tríceps e melhora capacidade de empurrar.',
    ativo: true
  },
  {
    nome: 'Tríceps Corda',
    grupoMuscularPrincipal: 'Tríceps',
    nivelDificuldade: 'Iniciante',
    descricao: 'Movimento de extensão que fortalece tríceps, ideal para iniciantes.',
    ativo: true
  },
  {
    nome: 'Tríceps Francês',
    grupoMuscularPrincipal: 'Tríceps',
    nivelDificuldade: 'Intermediário',
    descricao: 'Movimento de extensão que fortalece tríceps, aumentando força e resistência.',
    ativo: true
  }
];

/**
 * Script principal
 */
async function atualizarExerciciosEspecificos() {
  console.log('📝 Iniciando atualização de exercícios específicos...\n');

  try {
    let atualizados = 0;
    let naoEncontrados = 0;
    let erros = 0;

    for (const exercicioData of exerciciosParaAtualizar) {
      try {
        // Buscar exercício por nome (case insensitive)
        let exercicio = await prisma.exercicio.findFirst({
          where: {
            nome: {
              equals: exercicioData.nome,
              mode: 'insensitive'
            }
          }
        });

        // Se não encontrou exato, tenta buscar por nome similar (sem vírgulas, espaços extras, etc)
        if (!exercicio) {
          const nomeNormalizado = exercicioData.nome
            .toLowerCase()
            .replace(/[,\-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          const todosExercicios = await prisma.exercicio.findMany({
            where: {
              nome: {
                contains: nomeNormalizado.split(' ')[0], // Primeira palavra
                mode: 'insensitive'
              }
            }
          });
          
          // Encontrar o mais similar
          exercicio = todosExercicios.find(ex => {
            const exNomeNormalizado = ex.nome
              .toLowerCase()
              .replace(/[,\-]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            return exNomeNormalizado === nomeNormalizado || 
                   exNomeNormalizado.includes(nomeNormalizado) ||
                   nomeNormalizado.includes(exNomeNormalizado);
          }) || null;
        }

        if (!exercicio) {
          console.log(`⚠️  Exercício não encontrado: "${exercicioData.nome}"`);
          naoEncontrados++;
          continue;
        }

        // Preparar dados para atualização
        const dadosUpdate: any = {
          grupoMuscularPrincipal: exercicioData.grupoMuscularPrincipal,
          nivelDificuldade: exercicioData.nivelDificuldade,
          descricao: exercicioData.descricao,
          ativo: exercicioData.ativo
        };

        // Atualizar exercício
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: dadosUpdate
        });

        console.log(`✅ Exercício atualizado: "${exercicioData.nome}"`);
        atualizados++;
      } catch (error: any) {
        console.error(`❌ Erro ao atualizar "${exercicioData.nome}":`, error.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DA ATUALIZAÇÃO');
    console.log('='.repeat(80));
    console.log(`✅ Exercícios atualizados: ${atualizados}`);
    if (naoEncontrados > 0) {
      console.log(`⚠️  Exercícios não encontrados: ${naoEncontrados}`);
    }
    if (erros > 0) {
      console.log(`❌ Erros: ${erros}`);
    }
    console.log(`📝 Total processado: ${exerciciosParaAtualizar.length}`);
    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('❌ Erro ao atualizar exercícios:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
atualizarExerciciosEspecificos()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

