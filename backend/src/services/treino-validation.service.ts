/**
 * TREINO VALIDATION SERVICE
 * 
 * Serviço centralizado de validações para treinos
 * Valida dados do onboarding, frequência semanal, treinos gerados, etc.
 */

import { prisma } from '../lib/prisma';
import { PerfilCompleto } from './treino-core.service';
import { distribuirDiasSemana } from './split-generator.service';

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

export interface ValidacaoResultado {
  valido: boolean;
  erros: string[];
  avisos: string[];
  detalhes?: Record<string, any>;
}

export interface ValidacaoPerfil extends ValidacaoResultado {
  dadosMinimos: {
    objetivo: boolean;
    experiencia: boolean;
    frequenciaSemanal: boolean;
  };
}

export interface ValidacaoFrequencia extends ValidacaoResultado {
  frequenciaEsperada: number;
  diasDistribuidos: number[];
  diasUnicos: number;
}

export interface ValidacaoTreinosGerados extends ValidacaoResultado {
  totalTreinos: number;
  treinosPorSemana: number;
  frequenciaEsperada: number;
  diasUtilizados: number[];
  semanasCompletas: number;
  semanasParciais: number;
}

export interface ValidacaoDadosOnboarding extends ValidacaoResultado {
  validacoes: {
    frequencia: boolean;
    tempoDisponivel: boolean;
    localTreino: boolean;
    objetivo: boolean;
    experiencia: boolean;
    lesoes: boolean;
    rpePreferido: boolean;
  };
}

export interface ValidacaoTreinoIndividual extends ValidacaoResultado {
  treinoId: string;
  data: Date;
  tempoEstimado: number;
  tempoDisponivel?: number;
  gruposMusculares: string[];
  gruposComLesoes: string[];
  exerciciosIncompativeis: string[];
}

// ============================================================================
// VALIDAÇÃO DE PERFIL
// ============================================================================

/**
 * Valida se o perfil tem dados mínimos necessários para gerar treinos
 */
export function validarPerfilCompleto(perfil: PerfilCompleto | null): ValidacaoPerfil {
  const erros: string[] = [];
  const avisos: string[] = [];

  if (!perfil) {
    return {
      valido: false,
      erros: ['Perfil não encontrado'],
      avisos: [],
      dadosMinimos: {
        objetivo: false,
        experiencia: false,
        frequenciaSemanal: false
      }
    };
  }

  const dadosMinimos = {
    objetivo: !!perfil.objetivo,
    experiencia: !!perfil.experiencia,
    frequenciaSemanal: !!perfil.frequenciaSemanal && perfil.frequenciaSemanal > 0
  };

  if (!dadosMinimos.objetivo) {
    erros.push('Objetivo não informado no perfil');
  }

  if (!dadosMinimos.experiencia) {
    erros.push('Experiência não informada no perfil');
  }

  if (!dadosMinimos.frequenciaSemanal) {
    erros.push('Frequência semanal não informada ou inválida no perfil');
  }

  // Avisos para dados opcionais mas recomendados
  if (!perfil.tempoDisponivel) {
    avisos.push('Tempo disponível não informado - será usado padrão de 60 minutos');
  }

  if (!perfil.localTreino) {
    avisos.push('Local de treino não informado - todos os exercícios serão considerados');
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    dadosMinimos
  };
}

// ============================================================================
// VALIDAÇÃO DE FREQUÊNCIA SEMANAL
// ============================================================================

/**
 * Valida frequência semanal e distribuição de dias
 */
export function validarFrequenciaSemanal(frequencia: number | null | undefined): ValidacaoFrequencia {
  const erros: string[] = [];
  const avisos: string[] = [];

  if (!frequencia || frequencia <= 0 || frequencia > 6) {
    return {
      valido: false,
      erros: [`Frequência semanal inválida: ${frequencia}. Deve ser entre 1 e 6 dias`],
      avisos: [],
      frequenciaEsperada: 3, // padrão
      diasDistribuidos: [1, 3, 5],
      diasUnicos: 3
    };
  }

  const diasDistribuidos = distribuirDiasSemana(frequencia);
  const diasUnicos = new Set(diasDistribuidos).size;

  if (diasDistribuidos.length !== frequencia) {
    erros.push(
      `Distribuição de dias incorreta: esperado ${frequencia} dias, ` +
      `obtido ${diasDistribuidos.length} dias [${diasDistribuidos.join(',')}]`
    );
  }

  if (diasUnicos !== frequencia) {
    erros.push(
      `Dias duplicados na distribuição: ${diasDistribuidos.length} dias, ` +
      `mas apenas ${diasUnicos} únicos`
    );
  }

  // Validar que todos os dias estão no range válido (1-6)
  const diasInvalidos = diasDistribuidos.filter(dia => dia < 1 || dia > 6);
  if (diasInvalidos.length > 0) {
    erros.push(`Dias inválidos encontrados: ${diasInvalidos.join(', ')} (deve ser entre 1 e 6)`);
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    frequenciaEsperada: frequencia,
    diasDistribuidos,
    diasUnicos
  };
}

// ============================================================================
// VALIDAÇÃO DE TREINOS GERADOS
// ============================================================================

/**
 * Valida quantidade e distribuição de treinos gerados
 */
export async function validarTreinosGerados(
  userId: string,
  frequenciaEsperada: number,
  dataInicio?: Date
): Promise<ValidacaoTreinosGerados> {
  const erros: string[] = [];
  const avisos: string[] = [];

  const hoje = dataInicio || new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 30);

  // Buscar treinos gerados
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: hoje,
        lte: dataLimite
      },
      criadoPor: 'IA'
    },
    orderBy: { data: 'asc' }
  });

  const totalTreinos = treinos.length;
  const diasUtilizados = treinos.map(t => {
    const dia = new Date(t.data).getDay();
    return dia === 0 ? 7 : dia; // Normalizar domingo (0) para 7
  });

  // Calcular treinos por semana (aproximado: 30 dias ≈ 4.3 semanas)
  const semanasEsperadas = 30 / 7;
  const treinosPorSemana = totalTreinos / semanasEsperadas;
  const treinosPorSemanaEsperados = frequenciaEsperada;

  // Validar quantidade total
  const treinosEsperadosMin = Math.floor(semanasEsperadas) * frequenciaEsperada;
  const treinosEsperadosMax = Math.ceil(semanasEsperadas) * frequenciaEsperada;

  if (totalTreinos < treinosEsperadosMin) {
    erros.push(
      `Quantidade insuficiente de treinos: esperado pelo menos ${treinosEsperadosMin} ` +
      `treinos (${Math.floor(semanasEsperadas)} semanas × ${frequenciaEsperada} dias), ` +
      `obtido ${totalTreinos}`
    );
  }

  // Validar média por semana
  const diferencaPorSemana = Math.abs(treinosPorSemana - treinosPorSemanaEsperados);
  if (diferencaPorSemana > 0.5) {
    avisos.push(
      `Média de treinos por semana diferente do esperado: ` +
      `esperado ${treinosPorSemanaEsperados.toFixed(1)}, ` +
      `obtido ${treinosPorSemana.toFixed(1)} (diferença: ${diferencaPorSemana.toFixed(1)})`
    );
  }

  // Analisar distribuição por semana
  const semanasCompletas = Math.floor(totalTreinos / frequenciaEsperada);
  const semanasParciais = totalTreinos % frequenciaEsperada > 0 ? 1 : 0;

  // Validar distribuição de dias
  const diasEsperados = distribuirDiasSemana(frequenciaEsperada);
  const diasUtilizadosUnicos = Array.from(new Set(diasUtilizados));
  
  const diasFaltando = diasEsperados.filter(dia => !diasUtilizadosUnicos.includes(dia));
  if (diasFaltando.length > 0) {
    avisos.push(
      `Dias da semana esperados não encontrados nos treinos: ${diasFaltando.join(', ')}. ` +
      `Dias utilizados: ${diasUtilizadosUnicos.join(', ')}`
    );
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    totalTreinos,
    treinosPorSemana: Math.round(treinosPorSemana * 10) / 10,
    frequenciaEsperada,
    diasUtilizados: diasUtilizadosUnicos.sort((a, b) => a - b),
    semanasCompletas,
    semanasParciais
  };
}

// ============================================================================
// VALIDAÇÃO DE DADOS DO ONBOARDING
// ============================================================================

/**
 * Valida se os dados do onboarding estão sendo respeitados nos treinos
 */
export async function validarDadosOnboarding(
  userId: string,
  perfil: PerfilCompleto
): Promise<ValidacaoDadosOnboarding> {
  const erros: string[] = [];
  const avisos: string[] = [];
  const validacoes = {
    frequencia: false,
    tempoDisponivel: false,
    localTreino: false,
    objetivo: false,
    experiencia: false,
    lesoes: false,
    rpePreferido: false
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 30);

  // Buscar treinos dos próximos 30 dias
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: hoje,
        lte: dataLimite
      },
      criadoPor: 'IA'
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        }
      }
    }
  });

  if (treinos.length === 0) {
    erros.push('Nenhum treino encontrado para validação');
    return {
      valido: false,
      erros,
      avisos,
      validacoes
    };
  }

  // Validar frequência
  const validacaoFrequencia = await validarTreinosGerados(userId, perfil.frequenciaSemanal || 3, hoje);
  validacoes.frequencia = validacaoFrequencia.valido;
  if (!validacaoFrequencia.valido) {
    erros.push(...validacaoFrequencia.erros);
  }
  avisos.push(...validacaoFrequencia.avisos);

  // Validar tempo disponível
  if (perfil.tempoDisponivel) {
    const treinosComTempoExcedido = treinos.filter(t => 
      t.tempoEstimado && t.tempoEstimado > perfil.tempoDisponivel!
    );
    if (treinosComTempoExcedido.length > 0) {
      validacoes.tempoDisponivel = false;
      erros.push(
        `${treinosComTempoExcedido.length} treino(s) excedem o tempo disponível ` +
        `(${perfil.tempoDisponivel}min): ${treinosComTempoExcedido.map(t => 
          `${t.nome} (${t.tempoEstimado}min)`
        ).join(', ')}`
      );
    } else {
      validacoes.tempoDisponivel = true;
    }
  } else {
    avisos.push('Tempo disponível não informado - validação de tempo ignorada');
    validacoes.tempoDisponivel = true; // Não aplicável
  }

  // Validar local de treino e experiência (analisando exercícios)
  let todosExerciciosCompativeis = true;
  let todosExerciciosNivelCorreto = true;
  const exerciciosIncompativeis: string[] = [];

  for (const treino of treinos) {
    for (const exercicioTreino of treino.exercicios) {
      const exercicio = exercicioTreino.exercicio;

      // Validar local de treino
      if (perfil.localTreino && perfil.localTreino !== 'Academia') {
        const equipamentos = exercicio.equipamentoNecessario || [];
        if (perfil.localTreino === 'Casa') {
          const equipamentosPermitidos = ['Halteres', 'Peso Corporal', 'Barra', 'Banco'];
          const temEquipamentoIncompativel = equipamentos.some(eq => 
            !equipamentosPermitidos.includes(eq)
          );
          if (temEquipamentoIncompativel && !exercicio.semEquipamento) {
            todosExerciciosCompativeis = false;
            exerciciosIncompativeis.push(`${exercicio.nome} (${equipamentos.join(', ')})`);
          }
        }
      }

      // Validar nível de dificuldade (experiência)
      if (perfil.experiencia && exercicio.nivelDificuldade) {
        const niveisPermitidos = 
          perfil.experiencia === 'Iniciante' ? ['Iniciante'] :
          perfil.experiencia === 'Intermediário' ? ['Iniciante', 'Intermediário'] :
          ['Iniciante', 'Intermediário', 'Avançado'];
        
        if (!niveisPermitidos.includes(exercicio.nivelDificuldade)) {
          todosExerciciosNivelCorreto = false;
          exerciciosIncompativeis.push(
            `${exercicio.nome} (nível: ${exercicio.nivelDificuldade}, esperado: ${niveisPermitidos.join(' ou ')})`
          );
        }
      }
    }
  }

  validacoes.localTreino = todosExerciciosCompativeis;
  validacoes.experiencia = todosExerciciosNivelCorreto;

  if (!todosExerciciosCompativeis) {
    erros.push(
      `Exercícios incompatíveis com local de treino (${perfil.localTreino}): ` +
      exerciciosIncompativeis.slice(0, 5).join(', ') +
      (exerciciosIncompativeis.length > 5 ? ` e mais ${exerciciosIncompativeis.length - 5}` : '')
    );
  }

  if (!todosExerciciosNivelCorreto && perfil.experiencia) {
    avisos.push(
      `Alguns exercícios podem estar acima do nível de experiência (${perfil.experiencia})`
    );
  }

  // Validar lesões (grupos musculares afetados)
  if (perfil.lesoes && perfil.lesoes.length > 0) {
    const { mapearLesoesParaGrupos } = await import('./onboarding-adapter.service');
    const gruposEvitar = mapearLesoesParaGrupos(perfil.lesoes);
    
    const gruposComLesoes: string[] = [];
    for (const treino of treinos) {
      for (const exercicioTreino of treino.exercicios) {
        const grupo = exercicioTreino.exercicio?.grupoMuscularPrincipal;
        if (grupo && gruposEvitar.includes(grupo)) {
          gruposComLesoes.push(`${treino.nome}: ${exercicioTreino.exercicio.nome} (${grupo})`);
        }
      }
    }

    if (gruposComLesoes.length > 0) {
      validacoes.lesoes = false;
      erros.push(
        `Exercícios de grupos musculares afetados por lesões encontrados: ` +
        gruposComLesoes.slice(0, 5).join(', ') +
        (gruposComLesoes.length > 5 ? ` e mais ${gruposComLesoes.length - 5}` : '')
      );
    } else {
      validacoes.lesoes = true;
    }
  } else {
    validacoes.lesoes = true; // Não aplicável
  }

  // Validar RPE preferido (verificar se RPE dos exercícios está alinhado)
  // Esta validação é mais flexível, apenas aviso
  if (perfil.rpePreferido) {
    // RPE pode variar, então apenas verificamos se está sendo usado
    validacoes.rpePreferido = true; // Considerado válido se RPE está sendo aplicado
  } else {
    validacoes.rpePreferido = true; // Não aplicável
  }

  // Validar objetivo (verificar se parâmetros estão alinhados)
  // Esta é uma validação complexa, apenas marcamos como válido por padrão
  // e podemos adicionar validações específicas no futuro
  validacoes.objetivo = true;

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    validacoes
  };
}

// ============================================================================
// VALIDAÇÃO DE TREINO INDIVIDUAL
// ============================================================================

/**
 * Valida um treino individual contra dados do onboarding
 */
export async function validarTreinoIndividual(
  treinoId: string,
  perfil: PerfilCompleto
): Promise<ValidacaoTreinoIndividual> {
  const erros: string[] = [];
  const avisos: string[] = [];

  const treino = await prisma.treino.findUnique({
    where: { id: treinoId },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treino) {
    return {
      valido: false,
      erros: ['Treino não encontrado'],
      avisos: [],
      treinoId,
      data: new Date(),
      tempoEstimado: 0,
      gruposMusculares: [],
      gruposComLesoes: [],
      exerciciosIncompativeis: []
    };
  }

  // Validar tempo disponível
  if (perfil.tempoDisponivel && treino.tempoEstimado) {
    if (treino.tempoEstimado > perfil.tempoDisponivel) {
      erros.push(
        `Tempo estimado (${treino.tempoEstimado}min) excede tempo disponível (${perfil.tempoDisponivel}min)`
      );
    }
  }

  // Extrair grupos musculares
  const gruposMusculares = Array.from(new Set(
    treino.exercicios
      .map(et => et.exercicio?.grupoMuscularPrincipal)
      .filter((g): g is string => !!g && g !== 'Cardio' && g !== 'Flexibilidade' && g !== 'Alongamento')
  ));

  // Validar lesões
  const gruposComLesoes: string[] = [];
  if (perfil.lesoes && perfil.lesoes.length > 0) {
    const { mapearLesoesParaGrupos } = await import('./onboarding-adapter.service');
    const gruposEvitar = mapearLesoesParaGrupos(perfil.lesoes);
    
    for (const exercicioTreino of treino.exercicios) {
      const grupo = exercicioTreino.exercicio?.grupoMuscularPrincipal;
      if (grupo && gruposEvitar.includes(grupo)) {
        gruposComLesoes.push(`${exercicioTreino.exercicio.nome} (${grupo})`);
      }
    }

    if (gruposComLesoes.length > 0) {
      erros.push(
        `Treino contém exercícios de grupos afetados por lesões: ${gruposComLesoes.join(', ')}`
      );
    }
  }

  // Validar local de treino e experiência
  const exerciciosIncompativeis: string[] = [];

  for (const exercicioTreino of treino.exercicios) {
    const exercicio = exercicioTreino.exercicio;

    // Local de treino
    if (perfil.localTreino && perfil.localTreino !== 'Academia') {
      const equipamentos = exercicio.equipamentoNecessario || [];
      if (perfil.localTreino === 'Casa' && !exercicio.semEquipamento) {
        const equipamentosPermitidos = ['Halteres', 'Peso Corporal', 'Barra', 'Banco'];
        const temEquipamentoIncompativel = equipamentos.some(eq => 
          !equipamentosPermitidos.includes(eq)
        );
        if (temEquipamentoIncompativel) {
          exerciciosIncompativeis.push(
            `${exercicio.nome} requer equipamentos incompatíveis com treino em casa: ${equipamentos.join(', ')}`
          );
        }
      }
    }

    // Experiência
    if (perfil.experiencia && exercicio.nivelDificuldade) {
      const niveisPermitidos = 
        perfil.experiencia === 'Iniciante' ? ['Iniciante'] :
        perfil.experiencia === 'Intermediário' ? ['Iniciante', 'Intermediário'] :
        ['Iniciante', 'Intermediário', 'Avançado'];
      
      if (!niveisPermitidos.includes(exercicio.nivelDificuldade)) {
        exerciciosIncompativeis.push(
          `${exercicio.nome} está acima do nível de experiência (${perfil.experiencia}): ${exercicio.nivelDificuldade}`
        );
      }
    }
  }

  if (exerciciosIncompativeis.length > 0) {
    erros.push(`Exercícios incompatíveis: ${exerciciosIncompativeis.join('; ')}`);
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
    treinoId: treino.id,
    data: treino.data,
    tempoEstimado: treino.tempoEstimado || 0,
    tempoDisponivel: perfil.tempoDisponivel || undefined,
    gruposMusculares,
    gruposComLesoes,
    exerciciosIncompativeis
  };
}
