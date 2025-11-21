import { prisma } from '../lib/prisma';
import { nearestAllowedWeight, getEquipmentStep } from './progression.service';
import { 
  interpretarFeedback, 
  FeedbackSimples, 
  aplicarAjusteAutomatico,
  podeAplicarAjuste 
} from './feedback-profissional.service';

/**
 * Arredonda carga para múltiplo de 2.5kg e depois para inteiro
 * (Mantido para compatibilidade)
 */
function arredondarCarga(carga: number): number {
  const cargaArredondada = Math.round(carga / 2.5) * 2.5;
  return Math.round(cargaArredondada);
}

/**
 * Calcula o número médio de repetições de uma string de repetições
 * Ex: "8-12" retorna 10, "10" retorna 10, "15-20" retorna 17.5
 */
function calcularRepeticoesMedias(repeticoes: string | null): number {
  if (!repeticoes) return 10; // default
  
  const parts = repeticoes.split('-').map(s => s.trim());
  
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10);
    return isNaN(num) ? 10 : num;
  }
  
  const lower = parseInt(parts[0], 10);
  const upper = parseInt(parts[1], 10);
  
  if (isNaN(lower) || isNaN(upper)) {
    return 10; // default
  }
  
  // Retorna a média do range
  return (lower + upper) / 2;
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
 * Busca o último treino do mesmo tipo e aplica progressão baseada em feedback simples
 * (Compatível com RPE para treinos antigos)
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
        take: 1,
        include: {
          exercicio: true
        }
      },
      user: {
        select: {
          modoTreino: true
        }
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
  
  // Priorizar feedback simples (novo sistema)
  // Usar type assertion temporário até Prisma Client ser regenerado após migration
  const exercicioComFeedback = ultimoExercicio as any;
  if (exercicioComFeedback.feedbackSimples) {
    const perfil = await prisma.perfil.findUnique({
      where: { userId },
      select: { objetivo: true }
    });
    
    const interpretacao = interpretarFeedback(
      exercicioComFeedback.feedbackSimples as FeedbackSimples,
      ultimoExercicio.carga,
      ultimoExercicio.repeticoes,
      ultimoExercicio.series,
      exercicioId,
      perfil?.objetivo || 'Hipertrofia'
    );
    
    // Se tem ajuste de carga, aplicar
    if (interpretacao.ajuste && interpretacao.ajuste.tipo === 'CARGA') {
      return interpretacao.ajuste.valor as number;
    }
    
    // Se não tem ajuste ou ajuste não é de carga, manter carga atual
    return ultimoExercicio.carga;
  }
  
  // Fallback para RPE (sistema antigo)
  if (ultimoExercicio.carga && ultimoExercicio.rpe) {
    return calcularNovaCarga(ultimoExercicio.carga, ultimoExercicio.rpe);
  }
  
  // Se não tem nem feedback nem RPE, manter carga
  return ultimoExercicio.carga;
}

/**
 * Aplica progressão completa (carga, repetições, séries) baseada em feedback simples
 */
export async function aplicarProgressaoCompleta(
  userId: string,
  tipoTreino: string,
  exercicioId: string,
  exercicioAtual: any
): Promise<Partial<any> | null> {
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
          exercicioId: exercicioId,
          concluido: true
          // feedbackSimples será adicionado após migration
        },
        take: 1,
        include: {
          exercicio: true
        }
      },
      user: {
        select: {
          modoTreino: true
        }
      }
    },
    orderBy: {
      data: 'desc'
    }
  });

  if (!ultimoTreino || !ultimoTreino.exercicios || ultimoTreino.exercicios.length === 0) {
    return null; // Não há histórico com feedback
  }

  const ultimoExercicio = ultimoTreino.exercicios[0];
  
  // Usar type assertion temporário até Prisma Client ser regenerado após migration
  const exercicioComFeedback = ultimoExercicio as any;
  
  // Verificar se pode aplicar ajuste
  const proximoTreinoGerado = false; // TODO: verificar se próximo treino já foi gerado
  const podeAplicar = podeAplicarAjuste(
    ultimoExercicio.concluido,
    !!exercicioComFeedback.feedbackSimples,
    exercicioComFeedback.aceitouAjuste,
    proximoTreinoGerado,
    (ultimoTreino as any).user?.modoTreino === 'MANUAL'
  );
  
  if (!podeAplicar || !exercicioComFeedback.feedbackSimples) {
    return null;
  }
  
  // Buscar perfil para objetivo
  const perfil = await prisma.perfil.findUnique({
    where: { userId },
    select: { objetivo: true }
  });
  
  // Interpretar feedback
  const interpretacao = interpretarFeedback(
    exercicioComFeedback.feedbackSimples as FeedbackSimples,
    ultimoExercicio.carga,
    ultimoExercicio.repeticoes,
    ultimoExercicio.series,
    exercicioId,
    perfil?.objetivo || 'Hipertrofia'
  );
  
  // Aplicar ajuste se existir
  if (interpretacao.ajuste && interpretacao.ajuste.aplicavel) {
    return aplicarAjusteAutomatico(interpretacao.ajuste, ultimoExercicio);
  }
  
  return null;
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

  // Calcular volume total (séries × repetições × carga)
  let volumeTotal = 0;
  const cargasPorGrupo: Record<string, Array<{ carga: number; data: Date }>> = {};

  treinos.forEach((treino) => {
    treino.exercicios.forEach((ex) => {
      if (ex.carga) {
        // Calcular repetições médias da string (ex: "8-12" = 10)
        const repeticoesMedias = calcularRepeticoesMedias(ex.repeticoes);
        // Volume = séries × repetições × carga
        const volume = ex.series * repeticoesMedias * ex.carga;
        volumeTotal += volume;

        const grupo = ex.exercicio.grupoMuscularPrincipal;
        if (!cargasPorGrupo[grupo]) {
          cargasPorGrupo[grupo] = [];
        }
        // Armazenar carga com data para ordenação posterior
        cargasPorGrupo[grupo].push({ 
          carga: ex.carga, 
          data: treino.data 
        });
      }
    });
  });

  // Calcular progressão média por grupo muscular (ordenando por data)
  const progressaoPorGrupo: Record<string, number> = {};
  Object.keys(cargasPorGrupo).forEach((grupo) => {
    const cargasComData = cargasPorGrupo[grupo];
    if (cargasComData.length >= 2) {
      // Ordenar por data (mais antiga primeiro)
      const cargasOrdenadas = [...cargasComData].sort((a, b) => 
        a.data.getTime() - b.data.getTime()
      );
      const primeira = cargasOrdenadas[0].carga;
      const ultima = cargasOrdenadas[cargasOrdenadas.length - 1].carga;
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
    frequenciaSemanal: dias > 0 ? Math.round((totalTreinos / (dias / 7)) * 10) / 10 : 0
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

