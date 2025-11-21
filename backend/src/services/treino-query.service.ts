/**
 * Serviço centralizado para queries de treino
 * Unifica toda a lógica de busca de treinos
 */

import { prisma } from '../lib/prisma';
import { FiltrosTreino, IncludeOptions } from '../types/treino.types';

/**
 * Função base para buscar treinos com filtros flexíveis
 */
export async function buscarTreinosComFiltros(
  userId: string,
  filtros: FiltrosTreino = {},
  includeOptions: IncludeOptions = {}
): Promise<any[]> {
  const where: any = {
    userId
  };

  // Filtro por data
  if (filtros.dataInicio || filtros.dataFim) {
    where.data = {};
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      dataInicio.setHours(0, 0, 0, 0);
      where.data.gte = dataInicio;
    }
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      where.data.lte = dataFim;
    }
  }

  // Filtro por conclusão
  if (filtros.concluido !== undefined) {
    where.concluido = filtros.concluido;
  }

  // Filtro por tipo
  if (filtros.tipo) {
    where.tipo = filtros.tipo;
  }

  // Filtro por modo de treino
  if (filtros.modoTreino) {
    if (filtros.modoTreino === 'IA') {
      where.criadoPor = 'IA';
    } else if (filtros.modoTreino === 'MANUAL') {
      where.OR = [
        { criadoPor: 'USUARIO' },
        { templatePersonalizado: { isNot: null } }
      ];
    }
  }

  // Configurar includes
  const include: any = {};
  
  if (includeOptions.exercicios !== false) {
    include.exercicios = {
      include: includeOptions.exercicioDetalhes 
        ? { exercicio: true }
        : {
            exercicio: {
              select: {
                id: true,
                nome: true,
                grupoMuscularPrincipal: true
              }
            }
          },
      orderBy: { ordem: 'asc' }
    };

    // Filtrar apenas exercícios concluídos se solicitado
    if (includeOptions.apenasConcluidos) {
      include.exercicios.where = { concluido: true };
    }
  }

  // Buscar treinos
  const treinos = await prisma.treino.findMany({
    where,
    include,
    orderBy: {
      data: filtros.concluido ? 'desc' : 'asc'
    },
    take: filtros.limite
  });

  return treinos;
}

/**
 * Busca treino completo por ID
 */
export async function buscarTreinoCompleto(
  userId: string,
  treinoId: string
): Promise<any | null> {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: {
          ordem: 'asc'
        }
      },
      templatePersonalizado: true
    }
  });

  return treino;
}

/**
 * Busca treinos semanais (wrapper específico)
 */
export async function buscarTreinosSemanaisComFiltros(
  userId: string,
  dataInicio?: Date,
  modoTreino?: 'IA' | 'MANUAL'
): Promise<any[]> {
  const hoje = dataInicio || new Date();
  hoje.setHours(0, 0, 0, 0);

  // Calcular domingo da semana atual
  const diaSemana = hoje.getDay();
  const diasAteDomingo = diaSemana === 0 ? 0 : -diaSemana;
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() + diasAteDomingo);
  inicioSemana.setHours(0, 0, 0, 0);

  // Calcular fim da semana (sábado)
  const diasAteSabado = diaSemana === 0 ? 6 : 6 - diaSemana;
  const fimSemana = new Date(hoje);
  fimSemana.setDate(hoje.getDate() + diasAteSabado);
  fimSemana.setHours(23, 59, 59, 999);

  const filtros: FiltrosTreino = {
    dataInicio: inicioSemana,
    dataFim: fimSemana,
    modoTreino
  };

  return buscarTreinosComFiltros(userId, filtros, {
    exercicios: true,
    exercicioDetalhes: true
  });
}

/**
 * Busca histórico de treinos (wrapper específico)
 */
export async function buscarHistoricoTreinosComFiltros(
  userId: string,
  limite: number = 30,
  dataInicio?: Date
): Promise<any[]> {
  const filtros: FiltrosTreino = {
    limite,
    concluido: true
  };

  if (dataInicio) {
    filtros.dataInicio = dataInicio;
  }

  return buscarTreinosComFiltros(userId, filtros, {
    exercicios: true,
    exercicioDetalhes: false
  });
}

/**
 * Calcula estatísticas de um treino
 */
export function calcularEstatisticasTreino(treino: any): {
  totalExercicios: number;
  exerciciosConcluidos: number;
  volumeTotal: number;
  rpeMedio: number | null;
  gruposMusculares: string[];
} {
  const exercicios = treino.exercicios || [];
  const totalExercicios = exercicios.length;
  const exerciciosConcluidos = exercicios.filter((ex: any) => ex.concluido).length;

  // Calcular volume (séries × repetições × carga)
  let volumeTotal = 0;
  const rpes: number[] = [];
  const grupos = new Set<string>();

  exercicios.forEach((ex: any) => {
    if (ex.concluido && ex.carga) {
      // Calcular repetições médias
      let repeticoesMedias = 10; // default
      if (ex.repeticoes) {
        const parts = ex.repeticoes.split('-').map((s: string) => s.trim());
        if (parts.length === 1) {
          const num = parseInt(parts[0], 10);
          repeticoesMedias = isNaN(num) ? 10 : num;
        } else {
          const lower = parseInt(parts[0], 10);
          const upper = parseInt(parts[1], 10);
          if (!isNaN(lower) && !isNaN(upper)) {
            repeticoesMedias = (lower + upper) / 2;
          }
        }
      }

      volumeTotal += ex.series * repeticoesMedias * ex.carga;
    }

    if (ex.rpe !== null && ex.rpe !== undefined) {
      rpes.push(ex.rpe);
    }

    if (ex.exercicio?.grupoMuscularPrincipal) {
      grupos.add(ex.exercicio.grupoMuscularPrincipal);
    }
  });

  const rpeMedio = rpes.length > 0
    ? Math.round((rpes.reduce((acc, rpe) => acc + rpe, 0) / rpes.length) * 10) / 10
    : null;

  return {
    totalExercicios,
    exerciciosConcluidos,
    volumeTotal: Math.round(volumeTotal),
    rpeMedio,
    gruposMusculares: Array.from(grupos)
  };
}

