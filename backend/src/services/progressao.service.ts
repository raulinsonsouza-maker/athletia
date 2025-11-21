import { prisma } from '../lib/prisma';
import { nearestAllowedWeight, getEquipmentStep } from './progression.service';

/**
 * Arredonda carga para múltiplo de 2.5kg e depois para inteiro
 * (Mantido para compatibilidade)
 */
function arredondarCarga(carga: number): number {
  const cargaArredondada = Math.round(carga / 2.5) * 2.5;
  return Math.round(cargaArredondada);
}

/**
 * Calcula nova carga baseada no RPE realizado
 * Agora usa step do equipamento quando disponível
 */
export function calcularNovaCarga(
  cargaAtual: number,
  rpeRealizado: number,
  equipamentoNecessario?: string[]
): number {
  // Primeiro, validar e normalizar a carga atual para garantir que seja um múltiplo válido
  let cargaNormalizada = cargaAtual;
  if (equipamentoNecessario && equipamentoNecessario.length > 0) {
    const equipment = getEquipmentStep(equipamentoNecessario);
    if (equipment.stepTotal > 0) {
      cargaNormalizada = nearestAllowedWeight(cargaAtual, [equipment.stepTotal]);
    }
  }

  // Determinar step do equipamento se disponível
  let step = 2.5; // default
  if (equipamentoNecessario && equipamentoNecessario.length > 0) {
    const equipment = getEquipmentStep(equipamentoNecessario);
    if (equipment.stepTotal > 0) {
      step = equipment.stepTotal;
    }
  }

  if (rpeRealizado < 7) {
    // Fácil: aumentar carga entre 5% e 10%
    const aumento = cargaNormalizada * 0.075; // 7.5% (média entre 5% e 10%)
    const target = cargaNormalizada + aumento;
    return nearestAllowedWeight(target, [step]);
  } else if (rpeRealizado >= 7 && rpeRealizado <= 8) {
    // Médio: manter carga (já normalizada)
    return cargaNormalizada;
  } else {
    // Difícil (9-10): reduzir 5% ou manter (não reduzir abaixo de 80% da carga atual)
    const reducao = cargaNormalizada * 0.05;
    const novaCarga = cargaNormalizada - reducao;
    const cargaMinima = cargaNormalizada * 0.8; // Não reduzir mais que 20%
    const target = Math.max(novaCarga, cargaMinima);
    return nearestAllowedWeight(target, [step]);
  }
}

/**
 * Busca exercícios alternativos para um exercício
 * Baseado em: mesmo grupo muscular, equipamento disponível, nível similar
 */
export async function buscarAlternativas(
  exercicioId: string,
  equipamentosDisponiveis?: string[]
): Promise<any[]> {
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId }
  });

  if (!exercicio) {
    return [];
  }

  // Buscar exercícios alternativos
  const alternativas = await prisma.exercicio.findMany({
    where: {
      AND: [
        { id: { not: exercicioId } }, // Não o mesmo exercício
        { grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal }, // Mesmo grupo muscular
        { ativo: true },
        { nivelDificuldade: exercicio.nivelDificuldade }, // Mesmo nível
        // Se equipamentos disponíveis, filtrar por eles
        ...(equipamentosDisponiveis && equipamentosDisponiveis.length > 0
          ? [
              {
                OR: equipamentosDisponiveis.map((eq) => ({
                  equipamentoNecessario: { has: eq }
                }))
              }
            ]
          : [])
      ]
    },
    take: 3 // Máximo 3 alternativas
  });

  return alternativas;
}

/**
 * Aplica progressão de carga para o próximo treino
 * Busca o último treino do mesmo tipo e aplica progressão baseada em RPE
 */
export async function aplicarProgressao(
  userId: string,
  tipoTreino: string,
  exercicioId: string
): Promise<number | null> {
  // Buscar último treino concluído do mesmo tipo
  const ultimoTreino = await prisma.treino.findFirst({
    where: {
      userId,
      tipo: tipoTreino,
      concluido: true
    },
    include: {
      exercicios: {
        where: {
          exercicioId: exercicioId
        },
        take: 1
      }
    },
    orderBy: {
      data: 'desc'
    }
  });

  if (!ultimoTreino || !ultimoTreino.exercicios || ultimoTreino.exercicios.length === 0) {
    return null; // Não há histórico, usar carga inicial
  }

  const ultimoExercicio = ultimoTreino.exercicios[0];
  
  if (!ultimoExercicio.carga || !ultimoExercicio.rpe) {
    return ultimoExercicio.carga; // Se não tem RPE, manter carga
  }

  // Calcular nova carga baseada no RPE
  return calcularNovaCarga(ultimoExercicio.carga, ultimoExercicio.rpe);
}

/**
 * Busca histórico de treinos do usuário
 */
export async function buscarHistoricoTreinos(
  userId: string,
  limite: number = 30
): Promise<any[]> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId
    },
    include: {
      exercicios: {
        include: {
          exercicio: {
            select: {
              id: true,
              nome: true,
              grupoMuscularPrincipal: true
            }
          }
        },
        orderBy: {
          ordem: 'asc'
        }
      }
    },
    orderBy: {
      data: 'desc'
    },
    take: limite
  });

  return treinos;
}

/**
 * Calcula estatísticas de progresso do usuário
 */
export async function calcularEstatisticasProgresso(
  userId: string,
  dias: number = 30
): Promise<any> {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: dataInicio
      },
      concluido: true
    },
    include: {
      exercicios: {
        where: {
          concluido: true
        },
        include: {
          exercicio: {
            select: {
              grupoMuscularPrincipal: true
            }
          }
        }
      }
    }
  });

  const totalTreinos = treinos.length;
  const totalExercicios = treinos.reduce(
    (acc, treino) => acc + treino.exercicios.length,
    0
  );

  // Calcular volume total (séries × carga)
  let volumeTotal = 0;
  const cargasPorGrupo: Record<string, number[]> = {};

  treinos.forEach((treino) => {
    treino.exercicios.forEach((ex) => {
      if (ex.carga) {
        const volume = ex.series * ex.carga;
        volumeTotal += volume;

        const grupo = ex.exercicio.grupoMuscularPrincipal;
        if (!cargasPorGrupo[grupo]) {
          cargasPorGrupo[grupo] = [];
        }
        cargasPorGrupo[grupo].push(ex.carga);
      }
    });
  });

  // Calcular progressão média por grupo muscular
  const progressaoPorGrupo: Record<string, number> = {};
  Object.keys(cargasPorGrupo).forEach((grupo) => {
    const cargas = cargasPorGrupo[grupo];
    if (cargas.length >= 2) {
      const primeira = cargas[0];
      const ultima = cargas[cargas.length - 1];
      progressaoPorGrupo[grupo] = ((ultima - primeira) / primeira) * 100;
    }
  });

  // Calcular RPE médio
  const rpes = treinos
    .flatMap((t) => t.exercicios.map((ex) => ex.rpe))
    .filter((rpe): rpe is number => rpe !== null);

  const rpeMedio = rpes.length > 0
    ? rpes.reduce((acc, rpe) => acc + rpe, 0) / rpes.length
    : null;

  return {
    periodo: dias,
    totalTreinos,
    totalExercicios,
    volumeTotal: Math.round(volumeTotal),
    rpeMedio: rpeMedio ? Math.round(rpeMedio * 10) / 10 : null,
    progressaoPorGrupo,
    frequenciaSemanal: totalTreinos / (dias / 7)
  };
}

/**
 * Calcula evolução de peso (primeiro vs último)
 */
export async function calcularEvolucaoPeso(userId: string): Promise<{ primeiro: number | null; atual: number | null; diferenca: number | null }> {
  const historico = await prisma.historicoPeso.findMany({
    where: { userId },
    orderBy: { data: 'asc' }
  });

  if (historico.length === 0) {
    return { primeiro: null, atual: null, diferenca: null };
  }

  const primeiro = historico[0].peso;
  const atual = historico[historico.length - 1].peso;
  const diferenca = atual - primeiro;

  return { primeiro, atual, diferenca };
}

/**
 * Calcula sequência atual de dias consecutivos
 */
export async function calcularSequenciaAtual(userId: string): Promise<number> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      concluido: true
    },
    orderBy: { data: 'desc' },
    take: 30 // Verificar últimos 30 dias
  });

  if (treinos.length === 0) return 0;

  let sequencia = 0;
  let dataEsperada = new Date(hoje);

  for (const treino of treinos) {
    const dataTreino = new Date(treino.data);
    dataTreino.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((dataEsperada.getTime() - dataTreino.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0 || diffDias === 1) {
      sequencia++;
      dataEsperada = new Date(dataTreino);
      dataEsperada.setDate(dataEsperada.getDate() - 1);
    } else {
      break;
    }
  }

  return sequencia;
}

/**
 * Calcula melhor sequência histórica
 */
export async function calcularMelhorSequencia(userId: string): Promise<number> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      concluido: true
    },
    orderBy: { data: 'desc' },
    take: 365 // Verificar último ano
  });

  if (treinos.length === 0) return 0;

  let melhorSequencia = 0;
  let sequenciaAtual = 0;
  let dataAnterior: Date | null = null;

  for (const treino of treinos) {
    const dataTreino = new Date(treino.data);
    dataTreino.setHours(0, 0, 0, 0);

    if (dataAnterior === null) {
      sequenciaAtual = 1;
      dataAnterior = dataTreino;
    } else {
      const diffDias = Math.floor((dataAnterior.getTime() - dataTreino.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias === 1) {
        sequenciaAtual++;
      } else {
        melhorSequencia = Math.max(melhorSequencia, sequenciaAtual);
        sequenciaAtual = 1;
      }
      dataAnterior = dataTreino;
    }
  }

  melhorSequencia = Math.max(melhorSequencia, sequenciaAtual);
  return melhorSequencia;
}

/**
 * Calcula progressão de força por grupo muscular
 */
export async function calcularProgressaoForca(userId: string, dias: number = 30): Promise<Record<string, number>> {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: dataInicio },
      concluido: true
    },
    include: {
      exercicios: {
        where: { concluido: true },
        include: {
          exercicio: {
            select: { grupoMuscularPrincipal: true }
          }
        }
      }
    },
    orderBy: { data: 'asc' }
  });

  const cargasPorGrupo: Record<string, number[]> = {};

  treinos.forEach((treino) => {
    treino.exercicios.forEach((ex) => {
      if (ex.carga && ex.exercicio) {
        const grupo = ex.exercicio.grupoMuscularPrincipal;
        if (!cargasPorGrupo[grupo]) {
          cargasPorGrupo[grupo] = [];
        }
        cargasPorGrupo[grupo].push(ex.carga);
      }
    });
  });

  const progressaoPorGrupo: Record<string, number> = {};

  Object.keys(cargasPorGrupo).forEach((grupo) => {
    const cargas = cargasPorGrupo[grupo];
    if (cargas.length >= 2) {
      const primeira = cargas[0];
      const ultima = cargas[cargas.length - 1];
      progressaoPorGrupo[grupo] = ((ultima - primeira) / primeira) * 100;
    }
  });

  return progressaoPorGrupo;
}

