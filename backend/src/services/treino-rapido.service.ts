import { prisma } from '../lib/prisma';
import {
  selecionarExercicioPrincipal,
  selecionarExercicioAcessorio,
  ordenarExerciciosPorPrioridade,
  calcularCargaExercicio as calcularCargaExercicioIntelligence,
  evitarRedundancia
} from './workout-intelligence.service';
import { calcularParametrosTreino } from './workout-intelligence.service';
import { buscarOuCriarExercicioAerobico } from './treino.service';
import fs from 'fs';
import path from 'path';

/**
 * Mapeamento de grupos musculares específicos para grupos principais
 */
const MAPEAMENTO_GRUPOS_ESPECIFICOS: Record<string, string[]> = {
  'Glúteos': ['Glúteos', 'Quadríceps', 'Posteriores'],
  'Posteriores': ['Posteriores', 'Glúteos'],
  'Abdômen': ['Abdômen'],
  'Adutores': ['Adutores', 'Quadríceps'],
  'Trapézio': ['Trapézio', 'Costas', 'Ombros'],
  'Panturrilhas': ['Panturrilhas'],
  'Antebraços': ['Antebraços', 'Bíceps', 'Tríceps'],
  'Oblíquos': ['Oblíquos', 'Abdômen'],
  'Lombar': ['Lombar', 'Costas', 'Posteriores'],
  'Abdutores': ['Abdutores', 'Glúteos'],
  'Peito': ['Peito', 'Tríceps', 'Ombros'],
  'Costas': ['Costas', 'Bíceps', 'Trapézio'],
  'Ombros': ['Ombros', 'Tríceps'],
  'Bíceps': ['Bíceps'],
  'Tríceps': ['Tríceps'],
  'Quadríceps': ['Quadríceps'],
  'Panturrilhas': ['Panturrilhas']
};

/**
 * Mapeamento de duração para número máximo de exercícios
 */
const DURACAO_PARA_EXERCICIOS: Record<number, { min: number; max: number }> = {
  20: { min: 3, max: 5 },
  30: { min: 4, max: 6 },
  40: { min: 5, max: 8 },
  50: { min: 6, max: 10 },
  60: { min: 8, max: 12 }
};

/**
 * Mapeamento de local de treino
 */
const MAPEAMENTO_LOCAL: Record<string, string[]> = {
  'Academia comercial': ['Barra', 'Halteres', 'Máquinas', 'Polias', 'Smith', 'Leg Press', 'Esteira', 'Bicicleta Ergométrica', 'Elíptico'],
  'Academia Pequena': ['Halteres', 'Barra', 'Máquinas básicas', 'Esteira'],
  'Sem equipamento': ['Peso Corporal'],
  'Customizado': [] // Aceita todos
};

/**
 * Carrega conhecimento estruturado (se disponível)
 */
function carregarConhecimentoEstruturado(): any | null {
  try {
    const conhecimentoPath = path.join(__dirname, '../../../../ai/conhecimento_estruturado.json');
    if (fs.existsSync(conhecimentoPath)) {
      const conhecimento = JSON.parse(fs.readFileSync(conhecimentoPath, 'utf-8'));
      return conhecimento;
    }
  } catch (error) {
    console.warn('⚠️ Conhecimento estruturado não encontrado, usando lógica padrão');
  }
  return null;
}

/**
 * Gera treino rápido baseado em seleção de grupos musculares e configurações
 */
export async function gerarTreinoRapido(
  userId: string,
  data: {
    gruposMusculares: string[]; // Grupos específicos selecionados
    duracao: number; // em minutos (20, 30, 40, 50, 60)
    dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado';
    localTreino: string; // 'Academia comercial', 'Academia Pequena', 'Sem equipamento', 'Customizado'
    focoMuscular?: string[]; // ['Peito', 'Costas', 'Ombros'] ou null se corpo todo
    corpoTodo?: boolean; // Se true, ignora gruposMusculares e focoMuscular
    data?: Date;
  }
): Promise<any> {
  console.log(`🔄 Gerando Treino Rápido para ${userId}...`);
  console.log(`📋 Configurações:`, data);

  // 1. Buscar perfil do usuário
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  // 2. Carregar conhecimento estruturado (se disponível)
  const conhecimento = carregarConhecimentoEstruturado();

  // 3. Determinar grupos musculares a trabalhar
  let gruposParaTrabalhar: string[] = [];

  if (data.corpoTodo) {
    // Corpo todo: usar todos os grupos principais
    gruposParaTrabalhar = [
      'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps',
      'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen'
    ];
  } else if (data.focoMuscular && data.focoMuscular.length > 0) {
    // Foco muscular específico
    gruposParaTrabalhar = data.focoMuscular;
  } else if (data.gruposMusculares && data.gruposMusculares.length > 0) {
    // Grupos específicos selecionados - mapear para grupos principais
    const gruposMapeados = new Set<string>();
    data.gruposMusculares.forEach(grupo => {
      const gruposPrincipais = MAPEAMENTO_GRUPOS_ESPECIFICOS[grupo] || [grupo];
      gruposPrincipais.forEach(gp => gruposMapeados.add(gp));
    });
    gruposParaTrabalhar = Array.from(gruposMapeados);
  } else {
    // Fallback: usar grupos do perfil ou padrão
    gruposParaTrabalhar = ['Peito', 'Costas', 'Ombros', 'Quadríceps', 'Posteriores'];
  }

  console.log(`💪 Grupos musculares a trabalhar: ${gruposParaTrabalhar.join(', ')}`);

  // 4. Determinar número de exercícios baseado na duração
  const limitesExercicios = DURACAO_PARA_EXERCICIOS[data.duracao] || { min: 5, max: 8 };
  const numExercicios = Math.floor((limitesExercicios.min + limitesExercicios.max) / 2);

  // 5. Filtrar grupos por lesões do perfil
  const gruposEvitar = new Set<string>();
  (perfil.lesoes || []).forEach((lesao: string) => {
    const grupos = {
      'Joelho': ['Quadríceps', 'Posteriores', 'Panturrilhas'],
      'Ombro': ['Ombros', 'Peito', 'Tríceps'],
      'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
      'Pulso': ['Bíceps', 'Tríceps', 'Ombros'],
      'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores']
    }[lesao] || [];
    grupos.forEach(grupo => gruposEvitar.add(grupo));
  });

  gruposParaTrabalhar = gruposParaTrabalhar.filter(grupo => !gruposEvitar.has(grupo));

  if (gruposParaTrabalhar.length === 0) {
    throw new Error('Não é possível gerar treino devido às limitações físicas. Consulte um profissional.');
  }

  // 6. Selecionar exercícios para cada grupo
  const exerciciosSelecionados: any[] = [];
  const exerciciosPorGrupo = Math.ceil(numExercicios / gruposParaTrabalhar.length);

  for (const grupo of gruposParaTrabalhar) {
    // Buscar exercícios do grupo
    let exercicios = await prisma.exercicio.findMany({
      where: {
        grupoMuscularPrincipal: grupo,
        ativo: true
      },
      take: 50
    });

    // Filtrar por local de treino
    const equipamentosPermitidos = MAPEAMENTO_LOCAL[data.localTreino] || [];
    if (equipamentosPermitidos.length > 0 && data.localTreino !== 'Customizado') {
      exercicios = exercicios.filter(ex => {
        const equipamentos = ex.equipamentoNecessario || [];
        return equipamentos.some(eq => equipamentosPermitidos.includes(eq));
      });
    }

    // Filtrar por nível de dificuldade
    if (data.dificuldade === 'Iniciante') {
      exercicios = exercicios.filter(ex => ex.nivelDificuldade !== 'Avançado');
    } else if (data.dificuldade === 'Intermediário') {
      exercicios = exercicios.filter(ex => ex.nivelDificuldade !== 'Avançado' || ex.nivelDificuldade === 'Intermediário');
    }

    // Ordenar por prioridade (compostos primeiro)
    exercicios = ordenarExerciciosPorPrioridade(exercicios, perfil.objetivo || 'Hipertrofia');

    // Selecionar exercício principal do grupo
    const exercicioPrincipal = await selecionarExercicioPrincipal(
      grupo,
      perfil,
      perfil.objetivo || 'Hipertrofia',
      data.dificuldade,
      0,
      exerciciosSelecionados
    );

    if (exercicioPrincipal) {
      exerciciosSelecionados.push(exercicioPrincipal);
    }

    // Se ainda precisar de mais exercícios para este grupo
    if (exerciciosSelecionados.length < numExercicios && exerciciosPorGrupo > 1) {
      const exercicioAcessorio = await selecionarExercicioAcessorio(
        grupo,
        exercicioPrincipal || exercicios[0],
        perfil,
        exerciciosSelecionados
      );

      if (exercicioAcessorio) {
        exerciciosSelecionados.push(exercicioAcessorio);
      }
    }

    // Limitar número total de exercícios
    if (exerciciosSelecionados.length >= numExercicios) {
      break;
    }
  }

  // Limitar ao número máximo
  const exerciciosFinais = exerciciosSelecionados.slice(0, numExercicios);

  if (exerciciosFinais.length === 0) {
    throw new Error('Nenhum exercício encontrado para os grupos selecionados. Tente ajustar as configurações.');
  }

  console.log(`✅ ${exerciciosFinais.length} exercícios selecionados`);

  // 7. Calcular parâmetros de treino
  const { series, repeticoes, rpe, descanso } = calcularParametrosTreino(
    perfil.objetivo || 'Hipertrofia',
    data.dificuldade,
    perfil.rpePreferido
  );

  // 8. Criar treino no banco
  const dataTreino = data.data || new Date();
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: dataTreino,
      tipo: 'Treino Rápido',
      nome: `Treino Rápido - ${gruposParaTrabalhar.slice(0, 3).join(', ')}`,
      criadoPor: 'USUARIO',
      tempoEstimado: data.duracao,
      concluido: false
    }
  });

  // 9. Adicionar exercícios ao treino
  const pesoUsuario = perfil.pesoAtual || 70;
  const exerciciosTreino = [];

  for (let i = 0; i < exerciciosFinais.length; i++) {
    const exercicio = exerciciosFinais[i];

    // Calcular carga
    const carga = await calcularCargaExercicioIntelligence(
      userId,
      exercicio.id,
      pesoUsuario,
      exercicio.grupoMuscularPrincipal,
      data.dificuldade,
      repeticoes,
      perfil.objetivo || 'Hipertrofia'
    );

    const exercicioTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.id,
        ordem: i + 1,
        series,
        repeticoes,
        carga: carga || null,
        rpe: rpe,
        descanso,
        concluido: false
      }
    });

    exerciciosTreino.push(exercicioTreino);
  }

  // 10. Buscar treino completo
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  console.log(`✅ Treino Rápido criado com sucesso!`);

  return treinoCompleto;
}

/**
 * Lista grupos musculares disponíveis para seleção
 */
export async function listarGruposMuscularesDisponiveis(): Promise<{
  gruposPrincipais: string[];
  gruposEspecificos: string[];
}> {
  const gruposPrincipais = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: { grupoMuscularPrincipal: true },
    distinct: ['grupoMuscularPrincipal']
  });

  const gruposPrincipaisList = gruposPrincipais
    .map(g => g.grupoMuscularPrincipal)
    .filter(g => g && g !== 'Cardio')
    .sort();

  const gruposEspecificos = [
    'Glúteos', 'Posteriores', 'Abdômen', 'Adutores', 'Trapézio',
    'Panturrilhas', 'Antebraços', 'Oblíquos', 'Lombar', 'Abdutores',
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps'
  ];

  return {
    gruposPrincipais: gruposPrincipaisList,
    gruposEspecificos
  };
}

