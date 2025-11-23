/**
 * SERVIÇO SIMPLES DE TREINOS
 * 
 * Versão simplificada e funcional do sistema de treinos
 * Foco: Fazer funcionar de forma simples e direta
 */

import { prisma } from '../lib/prisma';

/**
 * Busca perfil do usuário validando se está completo
 */
async function validarPerfil(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  if (!perfil.objetivo || !perfil.experiencia || !perfil.frequenciaSemanal) {
    throw new Error('Perfil incompleto. Objetivo, experiência e frequência semanal são obrigatórios.');
  }

  return perfil;
}

/**
 * Normaliza data para início do dia
 */
function normalizarData(data?: Date | string): Date {
  let dataTreino: Date;
  if (typeof data === 'string') {
    dataTreino = new Date(data + 'T00:00:00.000Z');
  } else if (data) {
    dataTreino = new Date(data);
  } else {
    dataTreino = new Date();
  }
  dataTreino.setUTCHours(0, 0, 0, 0);
  return dataTreino;
}

/**
 * Remove treino existente para uma data
 */
async function removerTreinoExistente(userId: string, data: Date): Promise<void> {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  await prisma.treino.deleteMany({
    where: {
      userId,
      data: {
        gte: inicioDia,
        lte: fimDia
      }
    }
  });
}

/**
 * Busca exercícios disponíveis filtrados por perfil
 */
async function buscarExerciciosDisponiveis(perfil: any) {
  const where: any = {
    ativo: true
  };

  // Filtrar por nível de dificuldade
  if (perfil.experiencia === 'Iniciante') {
    where.nivelDificuldade = { in: ['Iniciante', 'Intermediário'] };
  } else if (perfil.experiencia === 'Intermediário') {
    where.nivelDificuldade = { in: ['Iniciante', 'Intermediário', 'Avançado'] };
  }

  // Filtrar por equipamentos se informado
  if (perfil.equipamentos && perfil.equipamentos.length > 0) {
    where.OR = [
      { equipamentoNecessario: { hasSome: perfil.equipamentos } },
      { equipamentoNecessario: { isEmpty: true } }
    ];
  }

  const exercicios = await prisma.exercicio.findMany({
    where,
    take: 50 // Limite para não retornar muitos
  });

  return exercicios;
}

/**
 * Determina grupos musculares do dia baseado na frequência e experiência
 */
function determinarGruposMuscularesDoDia(
  experiencia: string,
  frequenciaSemanal: number,
  data: Date
): string[] {
  const diaSemana = data.getDay(); // 0 = domingo, 1 = segunda, etc.
  
  // Para iniciantes: sempre full body
  if (experiencia === 'Iniciante') {
    return ['Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps'];
  }

  // Para 3x por semana: A-B-C (Push, Pull, Legs)
  if (frequenciaSemanal === 3) {
    if (diaSemana === 1 || diaSemana === 5) return ['Peito', 'Ombro', 'Tríceps']; // Push
    if (diaSemana === 3) return ['Costas', 'Bíceps']; // Pull
    if (diaSemana === 6) return ['Pernas']; // Legs
  }

  // Para 4x por semana: Upper/Lower
  if (frequenciaSemanal === 4) {
    if (diaSemana === 1 || diaSemana === 4) return ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps']; // Upper
    if (diaSemana === 2 || diaSemana === 5) return ['Pernas']; // Lower
  }

  // Padrão: Full body
  return ['Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps'];
}

/**
 * Calcula carga inicial baseada no peso e experiência
 */
function calcularCargaInicial(peso: number, experiencia: string, nomeExercicio: string): number {
  let multiplicador = 0.3; // 30% do peso corporal como padrão

  if (experiencia === 'Intermediário') multiplicador = 0.5;
  if (experiencia === 'Avançado') multiplicador = 0.7;

  // Ajustes por tipo de exercício
  const nomeLower = nomeExercicio.toLowerCase();
  if (nomeLower.includes('agachamento') || nomeLower.includes('leg press')) {
    multiplicador *= 2;
  } else if (nomeLower.includes('supino') || nomeLower.includes('desenvolvimento')) {
    multiplicador *= 0.8;
  } else if (nomeLower.includes('remo') || nomeLower.includes('puxada')) {
    multiplicador *= 0.9;
  }

  return Math.round(peso * multiplicador / 2.5) * 2.5; // Arredonda para múltiplo de 2.5
}

/**
 * Determina séries e repetições baseado no objetivo
 */
function determinarParametrosTreino(objetivo: string): { series: number; repeticoes: string; rpe: number; descanso: number } {
  if (objetivo === 'Força') {
    return { series: 4, repeticoes: '4-6', rpe: 8, descanso: 180 };
  }
  if (objetivo === 'Emagrecimento') {
    return { series: 3, repeticoes: '12-15', rpe: 7, descanso: 60 };
  }
  // Hipertrofia (padrão)
  return { series: 3, repeticoes: '8-12', rpe: 8, descanso: 90 };
}

/**
 * Gera treino simples para um dia
 */
export async function gerarTreinoSimples(userId: string, data?: Date | string) {
  console.log('[TREINO SIMPLES] Iniciando geração de treino...');
  
  // 1. Validar perfil
  const perfil = await validarPerfil(userId);
  console.log('[TREINO SIMPLES] Perfil validado:', { objetivo: perfil.objetivo, experiencia: perfil.experiencia });

  // 2. Normalizar data
  const dataTreino = normalizarData(data);
  console.log('[TREINO SIMPLES] Data normalizada:', dataTreino.toISOString());

  // 3. Remover treino existente se houver
  await removerTreinoExistente(userId, dataTreino);
  console.log('[TREINO SIMPLES] Treino existente removido (se houver)');

  // 4. Buscar exercícios disponíveis
  const exerciciosDisponiveis = await buscarExerciciosDisponiveis(perfil);
  console.log('[TREINO SIMPLES] Exercícios disponíveis:', exerciciosDisponiveis.length);

  // 5. Determinar grupos musculares do dia
  const gruposDoDia = determinarGruposMuscularesDoDia(
    perfil.experiencia || 'Iniciante',
    perfil.frequenciaSemanal || 3,
    dataTreino
  );
  console.log('[TREINO SIMPLES] Grupos musculares do dia:', gruposDoDia);

  // 6. Filtrar exercícios por grupos musculares
  const exerciciosFiltrados = exerciciosDisponiveis.filter(ex => {
    return gruposDoDia.includes(ex.grupoMuscularPrincipal) ||
           ex.sinergistas.some((grupo: string) => gruposDoDia.includes(grupo));
  });

  if (exerciciosFiltrados.length === 0) {
    throw new Error('Nenhum exercício disponível para os grupos musculares do dia.');
  }

  // 7. Selecionar exercícios (máximo 6)
  const exerciciosSelecionados = exerciciosFiltrados.slice(0, 6);
  console.log('[TREINO SIMPLES] Exercícios selecionados:', exerciciosSelecionados.length);

  // 8. Determinar parâmetros do treino
  const parametros = determinarParametrosTreino(perfil.objetivo || 'Hipertrofia');

  // 9. Criar treino no banco
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: dataTreino,
      tipo: 'Treino IA',
      nome: `Treino ${dataTreino.toLocaleDateString('pt-BR')}`,
      criadoPor: 'IA',
      concluido: false,
      tempoEstimado: exerciciosSelecionados.length * 10 // Estimativa simples
    }
  });
  console.log('[TREINO SIMPLES] Treino criado:', treino.id);

  // 10. Criar exercícios do treino
  const exerciciosTreino = [];
  for (let i = 0; i < exerciciosSelecionados.length; i++) {
    const exercicio = exerciciosSelecionados[i];
    const carga = calcularCargaInicial(
      perfil.pesoAtual || 70,
      perfil.experiencia || 'Iniciante',
      exercicio.nome
    );

    const exercicioTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.id,
        ordem: i,
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        carga: carga,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      }
    });

    exerciciosTreino.push(exercicioTreino);
  }

  console.log('[TREINO SIMPLES] Exercícios criados:', exerciciosTreino.length);

  // 11. Buscar treino completo
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: {
          ordem: 'asc'
        }
      }
    }
  });

  console.log('[TREINO SIMPLES] Treino gerado com sucesso!');
  return treinoCompleto;
}

/**
 * Busca treino do dia
 */
export async function buscarTreinoDoDiaSimples(userId: string, data?: Date | string) {
  const dataTreino = normalizarData(data);

  const inicioDia = new Date(dataTreino);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataTreino);
  fimDia.setHours(23, 59, 59, 999);

  const treino = await prisma.treino.findFirst({
    where: {
      userId,
      data: {
        gte: inicioDia,
        lte: fimDia
      }
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: {
          ordem: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return treino;
}

