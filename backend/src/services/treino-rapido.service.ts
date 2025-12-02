import { prisma } from '../lib/prisma'
import { GRUPOS_ESPECIFICOS_LISTA } from './inteligencia-treinos.service'
import { buscarVisuaisAtivos, gerarSlugGrupo } from './grupo-muscular-visual.service'
import { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } from './treino.service'
import { calcularParametrosTreino } from './workout-intelligence.service'
import { calcularCargaExercicio } from './workout-intelligence.service'

/**
 * Gera treino rápido baseado nas escolhas do usuário
 * Respeita grupos musculares, duração, dificuldade e local de treino selecionados
 */
export async function gerarTreinoRapido(
  userId: string,
  data: {
    gruposMusculares: string[]
    duracao: number
    dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado'
    localTreino: string
    focoMuscular?: string[]
    corpoTodo?: boolean
    data?: Date
  }
) {
  const dataTreino = data.data || new Date();
  const gruposSelecionados = data.corpoTodo 
    ? ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']
    : data.gruposMusculares || [];

  if (gruposSelecionados.length === 0) {
    throw new Error('Selecione ao menos um grupo muscular ou ative "Corpo todo"');
  }

  console.log(`[TREINO RÁPIDO] Grupos selecionados: ${gruposSelecionados.join(', ')}`);
  console.log(`[TREINO RÁPIDO] Duração: ${data.duracao}min, Dificuldade: ${data.dificuldade}, Local: ${data.localTreino}`);

  // Buscar perfil do usuário
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  // Calcular parâmetros baseados na dificuldade escolhida
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const { series, repeticoes, rpe, descanso } = calcularParametrosTreino(objetivo, data.dificuldade);

  // Calcular quantos exercícios cabem no tempo disponível
  // Tempo por exercício: séries * (tempo execução + descanso) + tempo de transição
  const tempoPorExercicio = series * (30 + descanso) / 60; // em minutos (30s execução + descanso)
  const tempoCardio = objetivo === 'Emagrecimento' ? 15 : objetivo === 'Força' ? 5 : 10;
  const tempoAlongamento = 5;
  const tempoUtil = data.duracao - tempoCardio - tempoAlongamento;
  const maxExercicios = Math.max(3, Math.floor(tempoUtil / tempoPorExercicio));

  console.log(`[TREINO RÁPIDO] Máximo de exercícios: ${maxExercicios} (tempo útil: ${tempoUtil}min)`);

  // Distribuir exercícios entre os grupos selecionados
  const exerciciosPorGrupo = Math.max(1, Math.floor(maxExercicios / gruposSelecionados.length));
  const exerciciosRestantes = maxExercicios - (exerciciosPorGrupo * gruposSelecionados.length);

  // Buscar exercícios para cada grupo
  const todosExercicios: any[] = [];
  const exerciciosEvitar = new Set<string>();

  for (let i = 0; i < gruposSelecionados.length; i++) {
    const grupo = gruposSelecionados[i];
    const quantidade = exerciciosPorGrupo + (i < exerciciosRestantes ? 1 : 0);

    // Construir filtro de dificuldade
    const filtroDificuldade: any = {};
    if (data.dificuldade === 'Iniciante') {
      filtroDificuldade.nivelDificuldade = 'Iniciante';
    } else if (data.dificuldade === 'Intermediário') {
      filtroDificuldade.nivelDificuldade = { in: ['Iniciante', 'Intermediário'] };
    }
    // Avançado aceita todos os níveis (não filtra)

    // Buscar exercícios do grupo
    const exerciciosGrupo = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        OR: [
          { grupoMuscularPrincipal: grupo },
          { sinergistas: { has: grupo } }
        ],
        ...filtroDificuldade
      },
      take: quantidade * 3, // Buscar mais para ter opções
      distinct: ['id']
    });

    // Filtrar por local de treino
    let exerciciosFiltrados = exerciciosGrupo.filter(ex => {
      if (!ex.equipamentoNecessario || ex.equipamentoNecessario.length === 0) {
        // Exercícios sem equipamento específico são aceitos em todos os locais
        return true;
      }
      
      const equipamentos = ex.equipamentoNecessario.map((eq: string) => eq.toLowerCase());
      
      if (data.localTreino === 'Sem equipamento') {
        // Aceitar apenas exercícios que não precisam de equipamento específico
        // ou que usam apenas peso corporal/halteres simples
        const equipamentosPermitidos = ['corpo', 'peso corporal', 'halter', 'halteres', 'peso livre'];
        return equipamentos.some(eq => equipamentosPermitidos.some(perm => eq.includes(perm))) ||
               equipamentos.length === 0;
      } else if (data.localTreino === 'Academia Pequena') {
        // Excluir máquinas grandes e aparelhos específicos
        const equipamentosExcluidos = ['máquina', 'aparelho', 'smith', 'leg press', 'hack squat'];
        return !equipamentos.some(eq => equipamentosExcluidos.some(exc => eq.includes(exc)));
      }
      // Academia comercial aceita tudo
      return true;
    });

    // Remover exercícios já selecionados
    exerciciosFiltrados = exerciciosFiltrados.filter(ex => !exerciciosEvitar.has(ex.id));

    // Selecionar quantidade necessária
    const selecionados = exerciciosFiltrados.slice(0, quantidade);
    
    if (selecionados.length === 0) {
      console.warn(`[TREINO RÁPIDO] Nenhum exercício encontrado para ${grupo}, tentando fallback...`);
      // Fallback: buscar qualquer exercício do grupo
      const fallbackExercicios = await prisma.exercicio.findMany({
        where: {
          ativo: true,
          grupoMuscularPrincipal: grupo,
          id: { notIn: Array.from(exerciciosEvitar) }
        },
        take: quantidade
      });
      selecionados.push(...fallbackExercicios);
    }

    todosExercicios.push(...selecionados);
    selecionados.forEach(ex => exerciciosEvitar.add(ex.id));
  }

  if (todosExercicios.length === 0) {
    throw new Error('Não foi possível encontrar exercícios para os grupos selecionados.');
  }

  // Limitar ao máximo calculado
  const exerciciosFinais = todosExercicios.slice(0, maxExercicios);

  console.log(`[TREINO RÁPIDO] ${exerciciosFinais.length} exercícios selecionados`);

  // Criar treino no banco
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: dataTreino,
      nome: `Treino Rápido - ${gruposSelecionados.slice(0, 3).join(', ')}`,
      tipo: 'Treino Rápido',
      criadoPor: 'USUARIO',
      concluido: false,
      tempoEstimado: data.duracao
    }
  });

  // Preparar exercícios para inserção em batch
  const exercicioCardio = await selecionarExercicioAerobicoDoDia(dataTreino);
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();

  const exerciciosTreino = [
    // Cardio primeiro
    {
      treinoId: treino.id,
      exercicioId: exercicioCardio.id,
      ordem: 0,
      series: 1,
      repeticoes: `${tempoCardio} min`,
      carga: null,
      rpe: 5,
      descanso: 0,
      concluido: false,
      observacoes: `Aquecimento cardiovascular - ${tempoCardio} minutos`
    },
    // Exercícios de força
    ...exerciciosFinais.map((exercicio, index) => ({
      treinoId: treino.id,
      exercicioId: exercicio.id,
      ordem: index + 1,
      series,
      repeticoes,
      carga: null, // Será calculada depois se necessário
      rpe,
      descanso,
      concluido: false
    })),
    // Alongamento por último
    {
      treinoId: treino.id,
      exercicioId: exercicioAlongamento.id,
      ordem: exerciciosFinais.length + 1,
      series: 1,
      repeticoes: `${tempoAlongamento} min`,
      carga: null,
      rpe: 3,
      descanso: 0,
      concluido: false,
      observacoes: `Alongamento geral - ${tempoAlongamento} minutos`
    }
  ];

  // Inserir todos os exercícios em batch
  await prisma.exercicioTreino.createMany({
    data: exerciciosTreino
  });

  // Calcular e atualizar cargas dos exercícios de força
  const exerciciosTreinoCriados = await prisma.exercicioTreino.findMany({
    where: {
      treinoId: treino.id,
      ordem: { gte: 1, lte: exerciciosFinais.length }
    },
    include: { exercicio: true }
  });

  for (const exercicioTreino of exerciciosTreinoCriados) {
    if (exercicioTreino.exercicio.grupoMuscularPrincipal !== 'Cardio' && 
        exercicioTreino.exercicio.grupoMuscularPrincipal !== 'Flexibilidade') {
      try {
        const carga = await calcularCargaExercicio(
          userId,
          exercicioTreino.exercicio.id,
          perfil.pesoAtual || 70,
          exercicioTreino.exercicio.grupoMuscularPrincipal || '',
          data.dificuldade || 'Iniciante',
          repeticoes
        );

        if (carga > 0) {
          await prisma.exercicioTreino.update({
            where: { id: exercicioTreino.id },
            data: { carga }
          });
        }
      } catch (error) {
        console.warn(`[TREINO RÁPIDO] Erro ao calcular carga para ${exercicioTreino.exercicio.nome}:`, error);
      }
    }
  }

  // Buscar treino completo
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treinoCompleto) {
    throw new Error('Erro ao buscar treino criado');
  }

  console.log(`[TREINO RÁPIDO] Treino criado com sucesso! ID: ${treino.id}`);

  return treinoCompleto;
}

type VisualItem = Awaited<ReturnType<typeof buscarVisuaisAtivos>>[number]

export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: Array<{ nome: string; slug: string; imagemUrl: string | null; descricao?: string | null }>
  gruposEspecificos: string[]
}> {
  // Buscar apenas grupos visuais ativos (mesma fonte do painel admin)
  const visuais = await buscarVisuaisAtivos()

  // Mapear para o formato esperado pelo frontend
  const gruposPrincipais = visuais.map((visual) => ({
    nome: visual.nome,
    slug: visual.slug,
    imagemUrl: visual.imagemUrl || null,
    descricao: visual.descricao ?? null
  }))

  return {
    gruposPrincipais,
    gruposEspecificos: GRUPOS_ESPECIFICOS_LISTA
  }
}
