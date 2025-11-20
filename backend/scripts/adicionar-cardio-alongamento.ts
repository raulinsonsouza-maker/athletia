import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Busca ou cria exercício aeróbico no banco de dados
 */
async function buscarOuCriarExercicioAerobico(nome: string): Promise<any> {
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: nome, mode: 'insensitive' },
      ativo: true
    }
  });

  if (!exercicio) {
    console.log(`📝 Criando exercício aeróbico: ${nome}`);
    exercicio = await prisma.exercicio.create({
      data: {
        nome,
        grupoMuscularPrincipal: 'Cardio',
        sinergistas: [],
        descricao: `Exercício aeróbico: ${nome}`,
        execucaoTecnica: `Realize ${nome} em ritmo moderado por 20-30 minutos`,
        errosComuns: [],
        equipamentoNecessario: nome === 'Esteira' ? ['Esteira'] : nome === 'Bicicleta Ergométrica' ? ['Bicicleta Ergométrica'] : nome === 'Elíptico' ? ['Elíptico'] : ['Escada'],
        nivelDificuldade: 'Iniciante',
        cargaInicialSugerida: 0,
        rpeSugerido: 5,
        ativo: true
      }
    });
  }

  return exercicio;
}

/**
 * Busca ou cria exercício de alongamento no banco de dados
 */
async function buscarOuCriarExercicioAlongamento(): Promise<any> {
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: 'Alongamento Geral', mode: 'insensitive' },
      ativo: true
    }
  });

  if (!exercicio) {
    console.log(`📝 Criando exercício de alongamento`);
    exercicio = await prisma.exercicio.create({
      data: {
        nome: 'Alongamento Geral',
        grupoMuscularPrincipal: 'Flexibilidade',
        sinergistas: [],
        descricao: 'Alongamento geral de todos os grupos musculares trabalhados',
        execucaoTecnica: 'Realize alongamentos estáticos de 20-30 segundos para cada grupo muscular principal trabalhado no treino',
        errosComuns: [],
        equipamentoNecessario: [],
        nivelDificuldade: 'Iniciante',
        cargaInicialSugerida: 0,
        rpeSugerido: 3,
        ativo: true
      }
    });
  }

  return exercicio;
}

/**
 * Seleciona exercício aeróbico do dia (rotação)
 */
async function selecionarExercicioAerobicoDoDia(data: Date): Promise<any> {
  const EXERCICIOS_AEROBICOS = [
    'Esteira',
    'Bicicleta Ergométrica',
    'Elíptico',
    'Escada'
  ];

  // Usar o dia do ano para rotação
  const inicioAno = new Date(data.getFullYear(), 0, 1);
  const diasDesdeInicio = Math.floor((data.getTime() - inicioAno.getTime()) / (1000 * 60 * 60 * 24));
  const indice = diasDesdeInicio % EXERCICIOS_AEROBICOS.length;
  const nomeExercicio = EXERCICIOS_AEROBICOS[indice];

  return await buscarOuCriarExercicioAerobico(nomeExercicio);
}

/**
 * Script para adicionar cardio e alongamento a todos os treinos
 */
async function adicionarCardioEAlongamento() {
  console.log('🔄 Iniciando adição de cardio e alongamento para todos os treinos...\n');

  try {
    // Buscar todos os treinos que têm exercícios de força
    const treinos = await prisma.treino.findMany({
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { data: 'asc' }
    });

    console.log(`📊 Encontrados ${treinos.length} treinos\n`);

    let totalCardioAdicionados = 0;
    let totalAlongamentoAdicionados = 0;
    let totalTreinosProcessados = 0;
    let totalErros = 0;

    for (const treino of treinos) {
      // Filtrar exercícios de força (excluir Cardio e Flexibilidade)
      const exerciciosForca = treino.exercicios.filter((ex: any) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
      });

      // Se não tem exercícios de força, pular
      if (exerciciosForca.length === 0) {
        continue;
      }

      totalTreinosProcessados++;
      
      console.log(`\n📅 Processando treino ${new Date(treino.data).toLocaleDateString('pt-BR')} (${treino.id})`);

      // Verificar se já tem cardio
      const temCardio = treino.exercicios.some((ex: any) => 
        ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
      );

      // Verificar se já tem alongamento
      const temAlongamento = treino.exercicios.some((ex: any) => 
        ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
      );
      
      console.log(`  📊 Exercícios: ${treino.exercicios.length} total, ${exerciciosForca.length} força`);
      console.log(`  🏃 Tem cardio: ${temCardio ? 'Sim' : 'Não'}`);
      console.log(`  🧘 Tem alongamento: ${temAlongamento ? 'Sim' : 'Não'}`);

      let cardioAdicionado = false;
      let alongamentoAdicionado = false;

      // Adicionar cardio se não tiver
      if (!temCardio) {
        try {
          const exercicioCardio = await selecionarExercicioAerobicoDoDia(new Date(treino.data));
          
          await prisma.exercicioTreino.create({
            data: {
              treinoId: treino.id,
              exercicioId: exercicioCardio.id,
              ordem: -1, // Temporário, será ajustado depois
              series: 1,
              repeticoes: '20-30 min',
              carga: null,
              rpe: 5,
              descanso: 0,
              concluido: false,
              observacoes: 'Aquecimento cardiovascular'
            }
          });

          cardioAdicionado = true;
          totalCardioAdicionados++;
          console.log(`  ✅ Cardio adicionado ao treino ${new Date(treino.data).toLocaleDateString('pt-BR')}`);
        } catch (error: any) {
          console.error(`  ❌ Erro ao adicionar cardio ao treino ${treino.id}:`, error.message);
          totalErros++;
        }
      }

      // Adicionar alongamento se não tiver
      if (!temAlongamento) {
        try {
          const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
          
          // Buscar ordem máxima atual
          const exerciciosAtualizados = await prisma.exercicioTreino.findMany({
            where: { treinoId: treino.id },
            orderBy: { ordem: 'asc' }
          });

          const ordemMaxima = exerciciosAtualizados.length > 0 
            ? Math.max(...exerciciosAtualizados.map((ex: any) => ex.ordem))
            : 0;
          
          await prisma.exercicioTreino.create({
            data: {
              treinoId: treino.id,
              exercicioId: exercicioAlongamento.id,
              ordem: ordemMaxima + 1, // Colocar depois de todos
              series: 1,
              repeticoes: '5-10 min',
              carga: null,
              rpe: 3,
              descanso: 0,
              concluido: false,
              observacoes: 'Alongamento geral de todos os grupos musculares'
            }
          });

          alongamentoAdicionado = true;
          totalAlongamentoAdicionados++;
          console.log(`  ✅ Alongamento adicionado ao treino ${new Date(treino.data).toLocaleDateString('pt-BR')}`);
        } catch (error: any) {
          console.error(`  ❌ Erro ao adicionar alongamento ao treino ${treino.id}:`, error.message);
          totalErros++;
        }
      }

      // Garantir ordem correta: cardio = 0, alongamento = último
      // Sempre reordenar para garantir ordem correta (mesmo se já existirem)
      try {
        // Buscar todos os exercícios atualizados
        const todosExercicios = await prisma.exercicioTreino.findMany({
          where: { treinoId: treino.id },
          include: { exercicio: true }
        });

        // Separar exercícios por tipo
        const cardio = todosExercicios.find((ex: any) => 
          ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
        );
        const alongamento = todosExercicios.find((ex: any) => 
          ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
        );
        const exerciciosForca = todosExercicios.filter((ex: any) => {
          const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
          return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
        });

        // Reordenar: cardio primeiro (0), força no meio, alongamento último
        if (cardio) {
          await prisma.exercicioTreino.update({
            where: { id: cardio.id },
            data: { ordem: 0 }
          });
        }

        // Atualizar exercícios de força (ordem 1, 2, 3...)
        let ordem = 1;
        for (const ex of exerciciosForca) {
          await prisma.exercicioTreino.update({
            where: { id: ex.id },
            data: { ordem: ordem++ }
          });
        }

        // Atualizar alongamento para última ordem
        if (alongamento) {
          await prisma.exercicioTreino.update({
            where: { id: alongamento.id },
            data: { ordem: ordem }
          });
        }
      } catch (error: any) {
        console.error(`  ⚠️ Erro ao reordenar exercícios do treino ${treino.id}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA ADIÇÃO:');
    console.log('='.repeat(60));
    console.log(`📅 Treinos processados: ${totalTreinosProcessados}`);
    console.log(`🏃 Cardios adicionados: ${totalCardioAdicionados}`);
    console.log(`🧘 Alongamentos adicionados: ${totalAlongamentoAdicionados}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('❌ Erro ao adicionar cardio e alongamento:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
adicionarCardioEAlongamento()
  .then(() => {
    console.log('\n✅ Adição de cardio e alongamento concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na adição:', error);
    process.exit(1);
  });

