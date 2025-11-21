import { prisma } from '../lib/prisma';

/**
 * Calcula tempo estimado do treino baseado nos exercícios
 */
function calcularTempoEstimado(exercicios: any[]): number {
  let tempoTotal = 0;
  
  for (const ex of exercicios) {
    const tempoPorSerie = 30 + (ex.descanso || 90); // 30s execução + descanso
    const tempoExercicio = ex.series * tempoPorSerie;
    tempoTotal += tempoExercicio;
  }
  
  return Math.ceil(tempoTotal / 60) + 5; // Converter para minutos + 5min aquecimento
}

/**
 * Cria um treino personalizado
 */
export async function criarTreinoPersonalizado(
  userId: string,
  data: {
    data: Date;
    nome: string;
    exercicios: Array<{
      exercicioId: string;
      ordem: number;
      series: number;
      repeticoes: string;
      carga?: number;
      descanso?: number;
      observacoes?: string;
    }>;
    diaSemana?: number;
    recorrente?: boolean;
    letraTreino?: string;
  }
): Promise<any> {
  if (!data.nome || data.nome.trim() === '') {
    throw new Error('Nome do treino é obrigatório');
  }

  if (!data.exercicios || data.exercicios.length === 0) {
    throw new Error('Treino deve ter pelo menos um exercício');
  }

  // Validar letra do treino se for recorrente
  if (data.recorrente && data.letraTreino) {
    const letrasValidas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (!letrasValidas.includes(data.letraTreino.toUpperCase())) {
      throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G');
    }
  }

  // Validar dia da semana se for recorrente
  if (data.recorrente && data.diaSemana !== undefined) {
    if (data.diaSemana < 0 || data.diaSemana > 6) {
      throw new Error('Dia da semana deve ser entre 0 (domingo) e 6 (sábado)');
    }
  }

  // Preparar data
  const dataInicio = new Date(data.data);
  dataInicio.setHours(0, 0, 0, 0);

  // Calcular tempo estimado
  const tempoEstimado = calcularTempoEstimado(data.exercicios);

  // Criar treino
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: dataInicio,
      tipo: data.nome,
      nome: data.nome,
      criadoPor: 'USUARIO',
      tempoEstimado,
      concluido: false,
      diaSemana: data.diaSemana || null,
      recorrente: data.recorrente || false,
      letraTreino: data.letraTreino ? data.letraTreino.toUpperCase() : null
    }
  });

  // Criar exercícios do treino
  const exerciciosTreino = [];
  for (const ex of data.exercicios) {
    const exercicioTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: ex.exercicioId,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        carga: ex.carga || null,
        descanso: ex.descanso || null,
        observacoes: ex.observacoes || null,
        concluido: false
      },
      include: {
        exercicio: true
      }
    });
    exerciciosTreino.push(exercicioTreino);
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

  return treinoCompleto;
}

/**
 * Lista treinos personalizados do usuário
 */
export async function listarTreinosPersonalizados(
  userId: string,
  filtros?: {
    dataInicio?: Date;
    dataFim?: Date;
    concluido?: boolean;
  }
): Promise<any[]> {
  const where: any = {
    userId,
    criadoPor: 'USUARIO'
  };

  if (filtros?.dataInicio || filtros?.dataFim) {
    where.data = {};
    if (filtros.dataInicio) {
      where.data.gte = new Date(filtros.dataInicio);
      where.data.gte.setHours(0, 0, 0, 0);
    }
    if (filtros.dataFim) {
      where.data.lte = new Date(filtros.dataFim);
      where.data.lte.setHours(23, 59, 59, 999);
    }
  }

  if (filtros?.concluido !== undefined) {
    where.concluido = filtros.concluido;
  }

  const treinos = await prisma.treino.findMany({
    where,
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: {
      data: 'desc'
    }
  });

  return treinos;
}

/**
 * Busca treino personalizado específico
 */
export async function buscarTreinoPersonalizado(
  userId: string,
  treinoId: string
): Promise<any> {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId,
      criadoPor: 'USUARIO'
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treino) {
    throw new Error('Treino não encontrado');
  }

  return treino;
}

/**
 * Edita treino personalizado
 */
export async function editarTreinoPersonalizado(
  userId: string,
  treinoId: string,
  data: {
    nome?: string;
    data?: Date;
    exercicios?: Array<{
      exercicioId: string;
      ordem: number;
      series: number;
      repeticoes: string;
      carga?: number;
      descanso?: number;
      observacoes?: string;
    }>;
  }
): Promise<any> {
  // Verificar se o treino existe e pertence ao usuário
  const treinoExistente = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId,
      criadoPor: 'USUARIO'
    }
  });

  if (!treinoExistente) {
    throw new Error('Treino não encontrado');
  }

  // Atualizar dados do treino
  const updateData: any = {};
  
  // Preparar data se fornecida
  if (data.data) {
    const novaData = new Date(data.data);
    novaData.setHours(0, 0, 0, 0);
    updateData.data = novaData;
  }
  if (data.nome !== undefined) {
    if (!data.nome || data.nome.trim() === '') {
      throw new Error('Nome do treino é obrigatório');
    }
    updateData.nome = data.nome;
    updateData.tipo = data.nome; // Atualizar tipo também
  }

  // Se está editando exercícios, recalcular tempo estimado
  if (data.exercicios && data.exercicios.length > 0) {
    updateData.tempoEstimado = calcularTempoEstimado(data.exercicios);
  }

  await prisma.treino.update({
    where: { id: treinoId },
    data: updateData
  });

  // Se está editando exercícios, substituir todos
  if (data.exercicios && data.exercicios.length > 0) {
    // Deletar exercícios antigos
    await prisma.exercicioTreino.deleteMany({
      where: { treinoId }
    });

    // Criar novos exercícios
    for (const ex of data.exercicios) {
      await prisma.exercicioTreino.create({
        data: {
          treinoId,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null,
          concluido: false
        }
      });
    }
  }

  // Retornar treino atualizado
  return await buscarTreinoPersonalizado(userId, treinoId);
}

/**
 * Deleta treino personalizado
 */
export async function deletarTreinoPersonalizado(
  userId: string,
  treinoId: string
): Promise<void> {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId,
      criadoPor: 'USUARIO'
    }
  });

  if (!treino) {
    throw new Error('Treino não encontrado');
  }

  await prisma.treino.delete({
    where: { id: treinoId }
  });
}

/**
 * Duplica treino personalizado
 */
export async function duplicarTreinoPersonalizado(
  userId: string,
  treinoId: string,
  novaData: Date
): Promise<any> {
  const treinoOriginal = await buscarTreinoPersonalizado(userId, treinoId);

  const exercicios = treinoOriginal.exercicios.map((ex: any) => ({
    exercicioId: ex.exercicioId,
    ordem: ex.ordem,
    series: ex.series,
    repeticoes: ex.repeticoes,
    carga: ex.carga,
    descanso: ex.descanso,
    observacoes: ex.observacoes
  }));

  return await criarTreinoPersonalizado(userId, {
    data: novaData,
    nome: treinoOriginal.nome ? `${treinoOriginal.nome} (Cópia)` : `Treino Copiado - ${novaData.toLocaleDateString('pt-BR')}`,
    exercicios
  });
}

/**
 * Cria template de treino personalizado
 */
export async function criarTemplatePersonalizado(
  userId: string,
  data: {
    nome: string;
    descricao?: string;
    exercicios: Array<{
      exercicioId: string;
      ordem: number;
      series: number;
      repeticoes: string;
      carga?: number;
      descanso?: number;
      observacoes?: string;
    }>;
  }
): Promise<any> {
  if (!data.exercicios || data.exercicios.length === 0) {
    throw new Error('Template deve ter pelo menos um exercício');
  }

  const template = await prisma.treinoPersonalizadoTemplate.create({
    data: {
      userId,
      nome: data.nome,
      descricao: data.descricao || null
    }
  });

  // Criar exercícios do template
  for (const ex of data.exercicios) {
    await prisma.treinoPersonalizadoTemplateExercicio.create({
      data: {
        templateId: template.id,
        exercicioId: ex.exercicioId,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        carga: ex.carga || null,
        descanso: ex.descanso || null,
        observacoes: ex.observacoes || null
      }
    });
  }

  return await buscarTemplatePersonalizado(userId, template.id);
}

/**
 * Lista templates personalizados do usuário
 */
export async function listarTemplatesPersonalizados(userId: string): Promise<any[]> {
  const templates = await prisma.treinoPersonalizadoTemplate.findMany({
    where: { userId },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return templates;
}

/**
 * Busca template personalizado específico
 */
export async function buscarTemplatePersonalizado(
  userId: string,
  templateId: string
): Promise<any> {
  const template = await prisma.treinoPersonalizadoTemplate.findFirst({
    where: {
      id: templateId,
      userId
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!template) {
    throw new Error('Template não encontrado');
  }

  return template;
}

/**
 * Edita template personalizado
 */
export async function editarTemplatePersonalizado(
  userId: string,
  templateId: string,
  data: {
    nome?: string;
    descricao?: string;
    exercicios?: Array<{
      exercicioId: string;
      ordem: number;
      series: number;
      repeticoes: string;
      carga?: number;
      descanso?: number;
      observacoes?: string;
    }>;
  }
): Promise<any> {
  const templateExistente = await prisma.treinoPersonalizadoTemplate.findFirst({
    where: {
      id: templateId,
      userId
    }
  });

  if (!templateExistente) {
    throw new Error('Template não encontrado');
  }

  const updateData: any = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.descricao !== undefined) updateData.descricao = data.descricao;

  await prisma.treinoPersonalizadoTemplate.update({
    where: { id: templateId },
    data: updateData
  });

  // Se está editando exercícios, substituir todos
  if (data.exercicios && data.exercicios.length > 0) {
    // Deletar exercícios antigos
    await prisma.treinoPersonalizadoTemplateExercicio.deleteMany({
      where: { templateId }
    });

    // Criar novos exercícios
    for (const ex of data.exercicios) {
      await prisma.treinoPersonalizadoTemplateExercicio.create({
        data: {
          templateId,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null
        }
      });
    }
  }

  return await buscarTemplatePersonalizado(userId, templateId);
}

/**
 * Deleta template personalizado
 */
export async function deletarTemplatePersonalizado(
  userId: string,
  templateId: string
): Promise<void> {
  const template = await prisma.treinoPersonalizadoTemplate.findFirst({
    where: {
      id: templateId,
      userId
    }
  });

  if (!template) {
    throw new Error('Template não encontrado');
  }

  await prisma.treinoPersonalizadoTemplate.delete({
    where: { id: templateId }
  });
}

/**
 * Aplica template para criar treino em data específica
 */
export async function aplicarTemplatePersonalizado(
  userId: string,
  templateId: string,
  data: Date
): Promise<any> {
  const template = await buscarTemplatePersonalizado(userId, templateId);

  const exercicios = template.exercicios.map((ex: any) => ({
    exercicioId: ex.exercicioId,
    ordem: ex.ordem,
    series: ex.series,
    repeticoes: ex.repeticoes,
    carga: ex.carga,
    descanso: ex.descanso,
    observacoes: ex.observacoes
  }));

  const treino = await criarTreinoPersonalizado(userId, {
    data,
    nome: template.nome,
    exercicios
  });

  // Associar template ao treino
  await prisma.treino.update({
    where: { id: treino.id },
    data: { templateId: template.id }
  });

  return await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });
}

/**
 * Lista treinos recorrentes do usuário (A-G)
 */
export async function listarTreinosRecorrentes(userId: string): Promise<any[]> {
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      criadoPor: 'USUARIO',
      recorrente: true
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: {
      letraTreino: 'asc'
    }
  });

  // Garantir que retorna array com 7 posições (A-G)
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const treinosMap = new Map(treinos.map(t => [t.letraTreino, t]));
  
  return letras.map(letra => treinosMap.get(letra) || null);
}

/**
 * Busca treino recorrente específico por letra
 */
export async function buscarTreinoRecorrente(
  userId: string,
  letraTreino: string
): Promise<any | null> {
  const letra = letraTreino.toUpperCase();
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(letra)) {
    throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G');
  }

  const treino = await prisma.treino.findFirst({
    where: {
      userId,
      criadoPor: 'USUARIO',
      recorrente: true,
      letraTreino: letra
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  return treino;
}

/**
 * Cria ou edita treino recorrente (A-G)
 */
export async function criarOuEditarTreinoRecorrente(
  userId: string,
  data: {
    letraTreino: string;
    nome: string;
    diaSemana: number;
    exercicios: Array<{
      exercicioId: string;
      ordem: number;
      series: number;
      repeticoes: string;
      carga?: number;
      descanso?: number;
      observacoes?: string;
    }>;
  }
): Promise<any> {
  const letra = data.letraTreino.toUpperCase();
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(letra)) {
    throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G');
  }

  if (!data.nome || data.nome.trim() === '') {
    throw new Error('Nome do treino é obrigatório');
  }

  if (data.diaSemana < 0 || data.diaSemana > 6) {
    throw new Error('Dia da semana deve ser entre 0 (domingo) e 6 (sábado)');
  }

  if (!data.exercicios || data.exercicios.length === 0) {
    throw new Error('Treino deve ter pelo menos um exercício');
  }

  // Verificar se já existe treino recorrente com esta letra
  const treinoExistente = await prisma.treino.findFirst({
    where: {
      userId,
      criadoPor: 'USUARIO',
      recorrente: true,
      letraTreino: letra
    }
  });

  const tempoEstimado = calcularTempoEstimado(data.exercicios);

  if (treinoExistente) {
    // Atualizar treino existente
    await prisma.treino.update({
      where: { id: treinoExistente.id },
      data: {
        nome: data.nome,
        tipo: data.nome,
        diaSemana: data.diaSemana,
        tempoEstimado
      }
    });

    // Deletar exercícios antigos
    await prisma.exercicioTreino.deleteMany({
      where: { treinoId: treinoExistente.id }
    });

    // Criar novos exercícios
    for (const ex of data.exercicios) {
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treinoExistente.id,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null,
          concluido: false
        }
      });
    }

    return await buscarTreinoRecorrente(userId, letra);
  } else {
    // Criar novo treino recorrente (usar data atual como referência)
    const dataReferencia = new Date();
    dataReferencia.setHours(0, 0, 0, 0);

    const treino = await prisma.treino.create({
      data: {
        userId,
        data: dataReferencia,
        tipo: data.nome,
        nome: data.nome,
        criadoPor: 'USUARIO',
        tempoEstimado,
        concluido: false,
        diaSemana: data.diaSemana,
        recorrente: true,
        letraTreino: letra
      }
    });

    // Criar exercícios
    for (const ex of data.exercicios) {
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treino.id,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null,
          concluido: false
        }
      });
    }

    return await buscarTreinoRecorrente(userId, letra);
  }
}

/**
 * Aplica treino recorrente em uma data específica
 */
export async function aplicarTreinoRecorrente(
  userId: string,
  letraTreino: string,
  data: Date
): Promise<any> {
  const treinoRecorrente = await buscarTreinoRecorrente(userId, letraTreino);

  if (!treinoRecorrente) {
    throw new Error(`Treino recorrente ${letraTreino} não encontrado`);
  }

  // Preparar data
  const dataInicio = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  const dataFim = new Date(data);
  dataFim.setHours(23, 59, 59, 999);

  // Verificar se já existe treino aplicado nesta data com a mesma letra
  const treinoExistente = await prisma.treino.findFirst({
    where: {
      userId,
      data: {
        gte: dataInicio,
        lte: dataFim
      },
      letraTreino: treinoRecorrente.letraTreino,
      recorrente: false // Treino aplicado não é recorrente
    }
  });

  if (treinoExistente) {
    // Atualizar treino existente
    await prisma.treino.update({
      where: { id: treinoExistente.id },
      data: {
        data: dataInicio,
        nome: treinoRecorrente.nome,
        tipo: treinoRecorrente.nome,
        tempoEstimado: treinoRecorrente.tempoEstimado
      }
    });

    // Deletar exercícios antigos
    await prisma.exercicioTreino.deleteMany({
      where: { treinoId: treinoExistente.id }
    });

    // Criar novos exercícios baseados no treino recorrente
    for (const ex of treinoRecorrente.exercicios) {
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treinoExistente.id,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null,
          concluido: false
        }
      });
    }

    return await prisma.treino.findUnique({
      where: { id: treinoExistente.id },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
  } else {
    // Criar novo treino aplicado
    const treino = await prisma.treino.create({
      data: {
        userId,
        data: dataInicio,
        tipo: treinoRecorrente.nome,
        nome: treinoRecorrente.nome,
        criadoPor: 'USUARIO',
        tempoEstimado: treinoRecorrente.tempoEstimado,
        concluido: false,
        recorrente: false,
        letraTreino: treinoRecorrente.letraTreino
      }
    });

    // Criar exercícios
    for (const ex of treinoRecorrente.exercicios) {
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treino.id,
          exercicioId: ex.exercicioId,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          carga: ex.carga || null,
          descanso: ex.descanso || null,
          observacoes: ex.observacoes || null,
          concluido: false
        }
      });
    }

    return await prisma.treino.findUnique({
      where: { id: treino.id },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
  }
}

/**
 * Busca configuração de treino padrão do usuário
 */
export async function buscarConfiguracaoTreinoPadrao(userId: string): Promise<any[]> {
  const configuracoes = await prisma.configuracaoTreinoUsuario.findMany({
    where: { userId },
    orderBy: { diaSemana: 'asc' }
  });

  return configuracoes;
}

/**
 * Salva ou atualiza configuração de treino padrão para um dia da semana
 */
export async function configurarTreinoPadrao(
  userId: string,
  data: {
    diaSemana: number;
    tipoTreino: 'IA' | 'RECORRENTE';
    letraTreino?: string;
  }
): Promise<any> {
  if (data.diaSemana < 0 || data.diaSemana > 6) {
    throw new Error('Dia da semana deve ser entre 0 (domingo) e 6 (sábado)');
  }

  if (data.tipoTreino === 'RECORRENTE' && !data.letraTreino) {
    throw new Error('Letra do treino é obrigatória para treinos recorrentes');
  }

  if (data.letraTreino) {
    const letra = data.letraTreino.toUpperCase();
    if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(letra)) {
      throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G');
    }
  }

  const configuracao = await prisma.configuracaoTreinoUsuario.upsert({
    where: {
      userId_diaSemana: {
        userId,
        diaSemana: data.diaSemana
      }
    },
    update: {
      tipoTreino: data.tipoTreino,
      letraTreino: data.letraTreino || null
    },
    create: {
      userId,
      diaSemana: data.diaSemana,
      tipoTreino: data.tipoTreino,
      letraTreino: data.letraTreino ? data.letraTreino.toUpperCase() : null
    }
  });

  return configuracao;
}

/**
 * Remove configuração de treino padrão para um dia da semana
 */
export async function removerConfiguracaoTreinoPadrao(
  userId: string,
  diaSemana: number
): Promise<void> {
  await prisma.configuracaoTreinoUsuario.deleteMany({
    where: {
      userId,
      diaSemana
    }
  });
}

