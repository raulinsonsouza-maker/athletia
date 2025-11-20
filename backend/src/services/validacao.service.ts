import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidacaoTreino {
  valido: boolean;
  erros: string[];
  avisos: string[];
  sugestoes: string[];
}

/**
 * Valida um treino gerado antes de salvar
 */
export async function validarTreino(
  userId: string,
  exercicios: any[],
  tipoTreino: string
): Promise<ValidacaoTreino> {
  const erros: string[] = [];
  const avisos: string[] = [];
  const sugestoes: string[] = [];

  // Buscar perfil do usuário
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    return {
      valido: false,
      erros: ['Perfil não encontrado'],
      avisos: [],
      sugestoes: []
    };
  }

  // Validação 1: Número mínimo de exercícios
  if (exercicios.length < 3) {
    erros.push('Treino deve ter pelo menos 3 exercícios');
  }

  // Validação 2: Número máximo de exercícios (baseado no tempo disponível)
  const tempoDisponivel = perfil.tempoDisponivel || 60;
  const maxExercicios = tempoDisponivel <= 45 ? 4 : tempoDisponivel <= 60 ? 6 : 8;
  
  if (exercicios.length > maxExercicios) {
    avisos.push(`Treino tem ${exercicios.length} exercícios, mas tempo disponível sugere máximo de ${maxExercicios}`);
  }

  // Validação 3: Verificar grupos musculares repetidos excessivamente
  const gruposMusculares: Record<string, number> = {};
  exercicios.forEach(ex => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || 'Desconhecido';
    gruposMusculares[grupo] = (gruposMusculares[grupo] || 0) + 1;
  });

  Object.entries(gruposMusculares).forEach(([grupo, count]) => {
    if (count > 3) {
      avisos.push(`Grupo muscular "${grupo}" aparece ${count} vezes. Considere variar mais.`);
    }
  });

  // Validação 4: Verificar se há exercícios muito difíceis para o nível
  exercicios.forEach(ex => {
    const nivelExercicio = ex.exercicio?.nivelDificuldade;
    const nivelUsuario = perfil.experiencia;

    if (nivelUsuario === 'Iniciante' && nivelExercicio === 'Avançado') {
      avisos.push(`Exercício "${ex.exercicio?.nome}" pode ser muito difícil para iniciantes`);
    }
  });

  // Validação 5: Verificar se há exercícios que requerem equipamentos não disponíveis
  if (perfil.equipamentos && perfil.equipamentos.length > 0) {
    exercicios.forEach(ex => {
      const equipamentosNecessarios = ex.exercicio?.equipamentoNecessario || [];
      const equipamentosFaltando = equipamentosNecessarios.filter(
        (eq: string) => !perfil.equipamentos?.includes(eq)
      );

      if (equipamentosFaltando.length > 0) {
        avisos.push(
          `Exercício "${ex.exercicio?.nome}" requer ${equipamentosFaltando.join(', ')} que pode não estar disponível`
        );
      }
    });
  }

  // Validação 6: Verificar lesões
  if (perfil.lesoes && perfil.lesoes.length > 0) {
    // Esta validação pode ser expandida com um mapeamento de lesões para grupos musculares
    avisos.push('Verifique se os exercícios são compatíveis com suas limitações');
  }

  // Validação 7: Verificar volume total
  const volumeTotal = exercicios.reduce((acc, ex) => {
    return acc + (ex.series * (ex.carga || 0));
  }, 0);

  if (volumeTotal === 0) {
    avisos.push('Volume total do treino é zero. Verifique as cargas dos exercícios.');
  }

  // Sugestões baseadas no objetivo
  if (perfil.objetivo === 'Hipertrofia') {
    const totalSeries = exercicios.reduce((acc, ex) => acc + ex.series, 0);
    if (totalSeries < 12) {
      sugestoes.push('Para hipertrofia, considere aumentar o volume total (mais séries)');
    }
  }

  if (perfil.objetivo === 'Força') {
    const exerciciosComCargaBaixa = exercicios.filter(ex => ex.carga && ex.carga < 20);
    if (exerciciosComCargaBaixa.length > exercicios.length / 2) {
      sugestoes.push('Para força, considere aumentar as cargas e reduzir repetições');
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    sugestoes
  };
}

/**
 * Valida volume mínimo semanal por grupo muscular
 * Base de conhecimento: Mínimo 10 séries por músculo/semana
 */
export async function validarVolumeMinimoSemanal(
  userId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<{ valido: boolean; gruposAbaixoMinimo: Record<string, number>; sugestoes: string[] }> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: dataInicio,
        lte: dataFim
      }
    },
    include: {
      exercicios: {
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

  // Calcular séries por grupo muscular (excluindo Cardio e Flexibilidade)
  const seriesPorGrupo: Record<string, number> = {};
  
  treinos.forEach(treino => {
    treino.exercicios.forEach(ex => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      // Ignorar Cardio e Flexibilidade
      if (grupo !== 'Cardio' && grupo !== 'Flexibilidade' && grupo !== '') {
        seriesPorGrupo[grupo] = (seriesPorGrupo[grupo] || 0) + ex.series;
      }
    });
  });

  // Verificar quais grupos estão abaixo do mínimo (10 séries/semana)
  const gruposAbaixoMinimo: Record<string, number> = {};
  const sugestoes: string[] = [];

  Object.entries(seriesPorGrupo).forEach(([grupo, series]) => {
    if (series < 10) {
      gruposAbaixoMinimo[grupo] = series;
      sugestoes.push(
        `Grupo "${grupo}" tem apenas ${series} séries/semana. Mínimo recomendado: 10 séries/semana (faltam ${10 - series} séries)`
      );
    }
  });

  // Verificar grupos que não aparecem na semana
  const gruposEsperados = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas', 'Abdômen'];
  gruposEsperados.forEach(grupo => {
    if (!seriesPorGrupo[grupo] && !gruposAbaixoMinimo[grupo]) {
      gruposAbaixoMinimo[grupo] = 0;
      sugestoes.push(`Grupo "${grupo}" não está sendo treinado esta semana. Considere adicionar exercícios para este grupo.`);
    }
  });

  return {
    valido: Object.keys(gruposAbaixoMinimo).length === 0,
    gruposAbaixoMinimo,
    sugestoes
  };
}

/**
 * Valida frequência mínima por grupo muscular
 * Base de conhecimento: Mínimo 2x/semana por grupo muscular
 */
export async function validarFrequenciaMinimaSemanal(
  userId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<{ valido: boolean; gruposAbaixoFrequencia: Record<string, number>; sugestoes: string[] }> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: dataInicio,
        lte: dataFim
      }
    },
    include: {
      exercicios: {
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

  // Calcular frequência (quantas vezes cada grupo aparece na semana)
  const frequenciaPorGrupo: Record<string, Set<string>> = {};
  
  treinos.forEach(treino => {
    const treinoId = treino.id;
    treino.exercicios.forEach(ex => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      // Ignorar Cardio e Flexibilidade
      if (grupo !== 'Cardio' && grupo !== 'Flexibilidade' && grupo !== '') {
        if (!frequenciaPorGrupo[grupo]) {
          frequenciaPorGrupo[grupo] = new Set();
        }
        frequenciaPorGrupo[grupo].add(treinoId);
      }
    });
  });

  // Verificar quais grupos estão abaixo da frequência mínima (2x/semana)
  const gruposAbaixoFrequencia: Record<string, number> = {};
  const sugestoes: string[] = [];

  Object.entries(frequenciaPorGrupo).forEach(([grupo, treinosSet]) => {
    const frequencia = treinosSet.size;
    if (frequencia < 2) {
      gruposAbaixoFrequencia[grupo] = frequencia;
      sugestoes.push(
        `Grupo "${grupo}" está sendo treinado apenas ${frequencia}x/semana. Mínimo recomendado: 2x/semana para maximizar hipertrofia`
      );
    }
  });

  return {
    valido: Object.keys(gruposAbaixoFrequencia).length === 0,
    gruposAbaixoFrequencia,
    sugestoes
  };
}

/**
 * Valida treino semanal completo (volume + frequência)
 * Esta função deve ser chamada após gerar todos os treinos da semana
 */
export async function validarTreinoSemanalCompleto(
  userId: string
): Promise<{
  valido: boolean;
  erros: string[];
  avisos: string[];
  sugestoes: string[];
  volume: { gruposAbaixoMinimo: Record<string, number> };
  frequencia: { gruposAbaixoFrequencia: Record<string, number> };
}> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Calcular domingo da semana atual
  const diaSemana = hoje.getDay();
  const diasAteDomingo = diaSemana === 0 ? 0 : 7 - diaSemana;
  const fimSemana = new Date(hoje);
  fimSemana.setDate(hoje.getDate() + diasAteDomingo);
  fimSemana.setHours(23, 59, 59, 999);

  const erros: string[] = [];
  const avisos: string[] = [];
  const sugestoes: string[] = [];

  // Validar volume mínimo
  const validacaoVolume = await validarVolumeMinimoSemanal(userId, hoje, fimSemana);
  if (!validacaoVolume.valido) {
    avisos.push(...validacaoVolume.sugestoes);
  }

  // Validar frequência mínima
  const validacaoFrequencia = await validarFrequenciaMinimaSemanal(userId, hoje, fimSemana);
  if (!validacaoFrequencia.valido) {
    avisos.push(...validacaoFrequencia.sugestoes);
  }

  return {
    valido: validacaoVolume.valido && validacaoFrequencia.valido,
    erros,
    avisos,
    sugestoes,
    volume: {
      gruposAbaixoMinimo: validacaoVolume.gruposAbaixoMinimo
    },
    frequencia: {
      gruposAbaixoFrequencia: validacaoFrequencia.gruposAbaixoFrequencia
    }
  };
}

/**
 * Valida se um exercício é adequado para substituição
 */
export function validarSubstituicao(
  exercicioOriginal: any,
  exercicioAlternativo: any
): { valido: boolean; motivo?: string } {
  // Mesmo grupo muscular
  if (exercicioOriginal.grupoMuscularPrincipal !== exercicioAlternativo.grupoMuscularPrincipal) {
    return {
      valido: false,
      motivo: 'Exercícios devem ter o mesmo grupo muscular principal'
    };
  }

  // Nível de dificuldade compatível
  const niveis = ['Iniciante', 'Intermediário', 'Avançado'];
  const nivelOriginal = niveis.indexOf(exercicioOriginal.nivelDificuldade);
  const nivelAlternativo = niveis.indexOf(exercicioAlternativo.nivelDificuldade);

  if (Math.abs(nivelOriginal - nivelAlternativo) > 1) {
    return {
      valido: false,
      motivo: 'Nível de dificuldade muito diferente'
    };
  }

  return { valido: true };
}

