import { prisma } from '../lib/prisma';
import { buscarTemplateAdequado, adaptarTemplate, criarTreinoDoTemplate } from './template.service';
import { progressionEngine, getEquipmentStep, nearestAllowedWeight } from './progression.service';
import {
  selecionarExercicioPrincipal,
  selecionarExercicioAcessorio,
  ordenarExerciciosPorPrioridade,
  calcularCargaExercicio as calcularCargaExercicioIntelligence,
  calcularParametrosTreino,
  validarTreinoCompleto,
  evitarRedundancia
} from './workout-intelligence.service';
import type { PerfilCompleto } from './treino-core.service';

import { logger } from '../lib/logger';

/**
 * Mapeamento de lesões para grupos musculares afetados
 */
const LESOES_PARA_GRUPOS: Record<string, string[]> = {
  'Joelho': ['Quadríceps', 'Posteriores', 'Panturrilhas'],
  'Ombro': ['Ombros', 'Peito', 'Tríceps'],
  'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
  'Pulso': ['Bíceps', 'Tríceps', 'Ombros'],
  'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores']
};

/**
 * Lista de nomes de exercícios aeróbicos para rotação
 */
const EXERCICIOS_AEROBICOS = [
  'Esteira',
  'Bicicleta Ergométrica',
  'Elíptico',
  'Escada'
];

/**
 * Busca ou cria exercício aeróbico no banco de dados
 */
export async function buscarOuCriarExercicioAerobico(nome: string): Promise<any> {
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: nome, mode: 'insensitive' },
      ativo: true
    }
  });

  if (!exercicio) {
    logger.debug(`📝 Criando exercício aeróbico: ${nome}`, 'treino.service');
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
 * Valida dados mínimos do perfil para geração de treinos
 */
function validarDadosMinimos(perfil: any): void {
  if (!perfil.objetivo) {
    throw new Error('Para gerar seu treino preciso de objetivo, experiência e frequência semanal.');
  }
  if (!perfil.experiencia) {
    throw new Error('Para gerar seu treino preciso de objetivo, experiência e frequência semanal.');
  }
  if (!perfil.frequenciaSemanal) {
    throw new Error('Para gerar seu treino preciso de objetivo, experiência e frequência semanal.');
  }
}

/**
 * Determina divisão de treino baseada na frequência semanal
 */
function determinarDivisaoTreino(frequenciaSemanal: number): string {
  if (frequenciaSemanal === 1) return 'A';
  if (frequenciaSemanal === 2) return 'A-B';
  if (frequenciaSemanal === 3) return 'A-B-C';
  if (frequenciaSemanal === 4) return 'A-B-C-D';
  if (frequenciaSemanal === 5) return 'A-B-C-D-E';
  if (frequenciaSemanal === 6) return 'A-B-C-D-E-F';
  return 'A-B-C'; // Default para 3x
}

/**
 * Filtra exercícios por local de treino
 */
function filtrarPorLocalTreino(exercicios: any[], localTreino?: string | null): any[] {
  if (!localTreino || localTreino === 'Academia') {
    return exercicios; // Academia permite todos
  }

  if (localTreino === 'Casa') {
    // Casa: apenas exercícios sem máquinas ou com halteres/peso corporal
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      if (equipamentos.length === 0) return true; // Sem equipamento necessário
      
      // Verificar se tem apenas equipamentos permitidos em casa
      const equipamentosPermitidos = ['Halteres', 'Peso Corporal'];
      return equipamentos.every((eq: string) => 
        equipamentosPermitidos.includes(eq) || 
        eq === 'Barra' || // Barra pode ser usada em casa se tiver
        eq === 'Banco'
      );
    });
  }

  // Misto: preferir livres, mas pode usar máquina se necessário
  return exercicios;
}


/**
 * Busca ou cria exercício de alongamento no banco de dados
 */
export async function buscarOuCriarExercicioAlongamento(): Promise<any> {
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: 'Alongamento Geral', mode: 'insensitive' },
      ativo: true
    }
  });

  if (!exercicio) {
    logger.debug(`📝 Criando exercício de alongamento`, 'treino.service');
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
 * Seleciona exercício aeróbico variado baseado no dia
 */
export async function selecionarExercicioAerobicoDoDia(data: Date): Promise<any> {
  // Usar o dia do ano para garantir rotação consistente
  const diaDoAno = Math.floor((data.getTime() - new Date(data.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const indice = diaDoAno % EXERCICIOS_AEROBICOS.length;
  const nomeExercicio = EXERCICIOS_AEROBICOS[indice];
  
  logger.debug(`🏃 Selecionando exercício aeróbico para ${data.toLocaleDateString('pt-BR')}: ${nomeExercicio}`, 'treino.service');
  
  return await buscarOuCriarExercicioAerobico(nomeExercicio);
}

/**
 * Garante que um treino tenha exercícios de cardio e alongamento
 * Adiciona os exercícios faltantes se necessário
 */
export async function garantirCardioEAlongamento(treinoId: string, data: Date): Promise<{ cardioAdicionado: boolean; alongamentoAdicionado: boolean }> {
  logger.debug(`[INFO] Verificando cardio e alongamento para treino ${treinoId}...`, 'treino.service');
  
  // Buscar treino com exercícios
  const treino = await prisma.treino.findUnique({
    where: { id: treinoId },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treino) {
    console.error(`[ERROR] Treino ${treinoId} não encontrado`);
    return { cardioAdicionado: false, alongamentoAdicionado: false };
  }

  // Verificar se já tem cardio
  const temCardio = treino.exercicios.some((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );

  // Verificar se já tem alongamento
  const temAlongamento = treino.exercicios.some((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
  );

  let cardioAdicionado = false;
  let alongamentoAdicionado = false;

  // Adicionar cardio se não tiver (sempre primeiro - ordem 0)
  if (!temCardio) {
    try {
      const exercicioAerobico = await selecionarExercicioAerobicoDoDia(data);
      
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treino.id,
          exercicioId: exercicioAerobico.id,
          ordem: -1, // Temporário, será ajustado para 0 depois
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
      logger.debug(`[OK] Exercício de cardio adicionado: ${exercicioAerobico.nome}`, 'treino.service');
    } catch (error: any) {
      console.error(`[ERROR] Erro ao adicionar exercício de cardio:`, error.message);
    }
  } else {
    logger.debug(`[OK] Treino já possui exercício de cardio`, 'treino.service');
  }

  // Adicionar alongamento se não tiver (sempre último)
  if (!temAlongamento) {
    try {
      const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
      
      await prisma.exercicioTreino.create({
        data: {
          treinoId: treino.id,
          exercicioId: exercicioAlongamento.id,
          ordem: 999, // Temporário, será ajustado para último depois
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
      logger.debug(`[OK] Exercício de alongamento adicionado`, 'treino.service');
    } catch (error: any) {
      console.error(`[ERROR] Erro ao adicionar exercício de alongamento:`, error.message);
    }
  } else {
    logger.debug(`[OK] Treino já possui exercício de alongamento`, 'treino.service');
  }

  // Sempre reordenar exercícios: cardio = 0, força no meio, alongamento = último
  try {
    // Buscar todos os exercícios atualizados
    const todosExercicios = await prisma.exercicioTreino.findMany({
      where: { treinoId: treino.id },
      include: { exercicio: true }
    });

    // Separar por tipo
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
    console.error(`⚠️ Erro ao reordenar exercícios:`, error.message);
  }

  return { cardioAdicionado, alongamentoAdicionado };
}

/**
 * Gera treino A: Peito + Ombro + Tríceps
 */
async function gerarTreinoA(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  logger.debug(`[INFO] Gerando Treino A (Peito + Ombro + Tríceps)...`, 'treino.service');
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Peito: 1 principal + 1 acessório (usando serviço centralizado)
  const peitoPrincipal = await selecionarExercicioPrincipal('Peito', perfil, objetivo, experiencia, ciclo, exercicios);
  if (peitoPrincipal) {
    exercicios.push(peitoPrincipal);
    const peitoAcessorio = await selecionarExercicioAcessorio('Peito', peitoPrincipal, perfil, exercicios);
    if (peitoAcessorio) {
      exercicios.push(peitoAcessorio);
    }
  }

  // Ombro: 1 principal + 1 acessório (usando serviço centralizado)
  const ombroPrincipal = await selecionarExercicioPrincipal('Ombros', perfil, objetivo, experiencia, ciclo, exercicios);
  if (ombroPrincipal) {
    exercicios.push(ombroPrincipal);
    const ombroAcessorio = await selecionarExercicioAcessorio('Ombros', ombroPrincipal, perfil, exercicios);
    if (ombroAcessorio) {
      exercicios.push(ombroAcessorio);
    }
  }

  // Tríceps: 1 exercício (usando serviço centralizado)
  const triceps = await selecionarExercicioPrincipal('Tríceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (triceps) {
    exercicios.push(triceps);
  }

  logger.debug(`[OK] Treino A gerado com ${exercicios.length} exercícios`, 'treino.service');
  return exercicios;
}

/**
 * Gera treino B: Costas + Bíceps
 */
async function gerarTreinoB(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  logger.debug(`[INFO] Gerando Treino B (Costas + Bíceps)...`, 'treino.service');
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Costas: 1 principal + 1 acessório (usando serviço centralizado)
  const costasPrincipal = await selecionarExercicioPrincipal('Costas', perfil, objetivo, experiencia, ciclo, exercicios);
  if (costasPrincipal) {
    exercicios.push(costasPrincipal);
    const costasAcessorio = await selecionarExercicioAcessorio('Costas', costasPrincipal, perfil, exercicios);
    if (costasAcessorio) {
      exercicios.push(costasAcessorio);
    }
  }

  // Bíceps: 1 exercício (usando serviço centralizado)
  const biceps = await selecionarExercicioPrincipal('Bíceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (biceps) {
    exercicios.push(biceps);
  }

  console.log(`[OK] Treino B gerado com ${exercicios.length} exercícios`);
  return exercicios;
}

/**
 * Gera treino C: Pernas + Abdômen
 */
async function gerarTreinoC(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  console.log(`[INFO] Gerando Treino C (Pernas + Abdômen)...`);
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Quadríceps: 1 principal (usando serviço centralizado)
  const quadriceps = await selecionarExercicioPrincipal('Quadríceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (quadriceps) {
    exercicios.push(quadriceps);
  }

  // Posteriores: 1 exercício (usando serviço centralizado)
  const posteriores = await selecionarExercicioPrincipal('Posteriores', perfil, objetivo, experiencia, ciclo, exercicios);
  if (posteriores) {
    exercicios.push(posteriores);
  }

  // Panturrilha: 1 exercício (usando serviço centralizado)
  const panturrilha = await selecionarExercicioPrincipal('Panturrilhas', perfil, objetivo, experiencia, ciclo, exercicios);
  if (panturrilha) {
    exercicios.push(panturrilha);
  }

  // Abdômen: 1-2 exercícios (usando serviço centralizado)
  const abdomen1 = await selecionarExercicioPrincipal('Abdômen', perfil, objetivo, experiencia, ciclo, exercicios);
  if (abdomen1) {
    exercicios.push(abdomen1);
    // Tentar adicionar segundo exercício de abdômen se disponível
    const abdomen2 = await selecionarExercicioAcessorio('Abdômen', abdomen1, perfil, exercicios);
    if (abdomen2) {
      exercicios.push(abdomen2);
    }
  }

  console.log(`[OK] Treino C gerado com ${exercicios.length} exercícios`);
  return exercicios;
}

/**
 * Gera treino D: Inferiores completos (similar ao C, mas com mais volume)
 */
async function gerarTreinoD(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  console.log(`[INFO] Gerando Treino D (Inferiores Completos)...`);
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Quadríceps: 1 principal + 1 acessório (usando serviço centralizado)
  const quadricepsPrincipal = await selecionarExercicioPrincipal('Quadríceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (quadricepsPrincipal) {
    exercicios.push(quadricepsPrincipal);
    const quadricepsAcessorio = await selecionarExercicioAcessorio('Quadríceps', quadricepsPrincipal, perfil, exercicios);
    if (quadricepsAcessorio) {
      exercicios.push(quadricepsAcessorio);
    }
  }

  // Posteriores: 1 principal + 1 acessório (usando serviço centralizado)
  const posterioresPrincipal = await selecionarExercicioPrincipal('Posteriores', perfil, objetivo, experiencia, ciclo, exercicios);
  if (posterioresPrincipal) {
    exercicios.push(posterioresPrincipal);
    const posterioresAcessorio = await selecionarExercicioAcessorio('Posteriores', posterioresPrincipal, perfil, exercicios);
    if (posterioresAcessorio) {
      exercicios.push(posterioresAcessorio);
    }
  }

  // Panturrilha: 1 exercício (usando serviço centralizado)
  const panturrilha = await selecionarExercicioPrincipal('Panturrilhas', perfil, objetivo, experiencia, ciclo, exercicios);
  if (panturrilha) {
    exercicios.push(panturrilha);
  }

  // Abdômen: 1 exercício (usando serviço centralizado)
  const abdomen = await selecionarExercicioPrincipal('Abdômen', perfil, objetivo, experiencia, ciclo, exercicios);
  if (abdomen) {
    exercicios.push(abdomen);
  }

  console.log(`[OK] Treino D gerado com ${exercicios.length} exercícios`);
  return exercicios;
}

/**
 * Gera treino E: Superiores leves (ombros + braços)
 */
async function gerarTreinoE(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  console.log(`[INFO] Gerando Treino E (Superiores Leves)...`);
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Ombros: 1 principal (usando serviço centralizado)
  const ombro = await selecionarExercicioPrincipal('Ombros', perfil, objetivo, experiencia, ciclo, exercicios);
  if (ombro) {
    exercicios.push(ombro);
  }

  // Tríceps: 1 exercício (usando serviço centralizado)
  const triceps = await selecionarExercicioPrincipal('Tríceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (triceps) {
    exercicios.push(triceps);
  }

  // Bíceps: 1 exercício (usando serviço centralizado)
  const biceps = await selecionarExercicioPrincipal('Bíceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (biceps) {
    exercicios.push(biceps);
  }

  // Abdômen: 1 exercício (usando serviço centralizado)
  const abdomen = await selecionarExercicioPrincipal('Abdômen', perfil, objetivo, experiencia, ciclo, exercicios);
  if (abdomen) {
    exercicios.push(abdomen);
  }

  console.log(`[OK] Treino E gerado com ${exercicios.length} exercícios`);
  return exercicios;
}

/**
 * Gera treino F: Full Body leve (todos os grupos com menos volume)
 */
async function gerarTreinoF(perfil: any, ciclo: number, userId?: string): Promise<any[]> {
  console.log(`[INFO] Gerando Treino F (Full Body Leve)...`);
  
  const exercicios: any[] = [];
  const objetivo = perfil.objetivo || 'Hipertrofia';
  const experiencia = perfil.experiencia || 'Iniciante';

  // Peito: 1 exercício (usando serviço centralizado)
  const peito = await selecionarExercicioPrincipal('Peito', perfil, objetivo, experiencia, ciclo, exercicios);
  if (peito) {
    exercicios.push(peito);
  }

  // Costas: 1 exercício (usando serviço centralizado)
  const costas = await selecionarExercicioPrincipal('Costas', perfil, objetivo, experiencia, ciclo, exercicios);
  if (costas) {
    exercicios.push(costas);
  }

  // Quadríceps: 1 exercício (usando serviço centralizado)
  const quadriceps = await selecionarExercicioPrincipal('Quadríceps', perfil, objetivo, experiencia, ciclo, exercicios);
  if (quadriceps) {
    exercicios.push(quadriceps);
  }

  // Abdômen: 1 exercício (usando serviço centralizado)
  const abdomen = await selecionarExercicioPrincipal('Abdômen', perfil, objetivo, experiencia, ciclo, exercicios);
  if (abdomen) {
    exercicios.push(abdomen);
  }

  console.log(`[OK] Treino F gerado com ${exercicios.length} exercícios`);
  return exercicios;
}

/**
 * DEPRECATED: Esta função foi substituída pelo motor centralizado (treino-engine.service.ts)
 * Mantida apenas para compatibilidade, mas não deve ser usada
 * 
 * @deprecated Use garantirPlanoSemanal ou gerarTreinoDoDiaUnico do treino-engine.service.ts
 */
export async function gerarTreinoABC(
  userId: string,
  data: Date,
  tipoTreino: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
): Promise<any | null> {
  logger.debug(`[INFO] Gerando treino ${tipoTreino} para ${data.toLocaleDateString('pt-BR')}...`, 'treino.service');

  // 1. Buscar perfil
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  // 2. Validar dados mínimos
  validarDadosMinimos(perfil);

  // 3. Determinar divisão de treino
  const divisao = determinarDivisaoTreino(perfil.frequenciaSemanal || 3);

  // 4. Calcular ciclo (baseado em treinos existentes)
  const treinosExistentes = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    orderBy: { data: 'desc' },
    take: 30
  });

  const ciclo = treinosExistentes.length;

  // 5. Gerar exercícios conforme tipo
  let exerciciosForca: any[] = [];
  
  if (tipoTreino === 'A') {
    exerciciosForca = await gerarTreinoA(perfil, ciclo, userId);
  } else if (tipoTreino === 'B') {
    exerciciosForca = await gerarTreinoB(perfil, ciclo, userId);
  } else if (tipoTreino === 'C') {
    exerciciosForca = await gerarTreinoC(perfil, ciclo, userId);
  } else if (tipoTreino === 'D') {
    exerciciosForca = await gerarTreinoD(perfil, ciclo, userId);
  } else if (tipoTreino === 'E') {
    exerciciosForca = await gerarTreinoE(perfil, ciclo, userId);
  } else if (tipoTreino === 'F') {
    exerciciosForca = await gerarTreinoF(perfil, ciclo, userId);
  }

  if (exerciciosForca.length === 0) {
    console.error(`[ERROR] Nenhum exercício gerado para treino ${tipoTreino}`);
    return null;
  }

  // 6. Aplicar séries, reps e RPE (usando serviço centralizado)
  const { series, repeticoes, rpe, descanso } = calcularParametrosTreino(
    perfil.objetivo || 'Hipertrofia',
    perfil.experiencia || 'Iniciante',
    perfil.rpePreferido
  );
  
  // 6.1. Validar ordem e redundâncias dos exercícios
  const validacao = validarTreinoCompleto(exerciciosForca, series);
  if (!validacao.valido) {
    console.warn('⚠️ Validação do treino encontrou problemas:');
    validacao.erros.forEach(erro => console.warn(`  [ERROR] ${erro}`));
  }
  if (validacao.avisos.length > 0) {
    validacao.avisos.forEach(aviso => console.warn(`  ⚠️ ${aviso}`));
  }
  
  // 6.2. Ordenar exercícios garantindo compostos antes de isolados
  exerciciosForca = ordenarExerciciosPorPrioridade(exerciciosForca, perfil.objetivo || 'Hipertrofia');
  
  // 6.3. Evitar redundâncias
  exerciciosForca = evitarRedundancia(exerciciosForca, 0.7);

  // 7. Criar treino no banco
  const treino = await prisma.treino.create({
    data: {
      userId,
      data,
      tipo: tipoTreino,
      nome: `Treino ${tipoTreino}`, // Nome obrigatório do schema
      letraTreino: tipoTreino, // Letra do treino (A, B, C, D, E, F)
      tempoEstimado: 0 // Será recalculado depois
    }
  });

  // 8. Adicionar cardio primeiro (ordem 0)
  const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioCardio.id,
      ordem: 0, // Primeiro
      series: 1,
      repeticoes: '20-30 min',
      carga: null,
      rpe: 5,
      descanso: 0,
      concluido: false,
      observacoes: 'Exercício aeróbico - ritmo moderado'
    }
  });

  // 9. Adicionar exercícios de força ao treino (ordem 1, 2, 3...)
  let ordem = 1;
  const exerciciosTreino: any[] = [];

  for (const exercicio of exerciciosForca) {
    const carga = await calcularCargaExercicioIntelligence(
      userId,
      exercicio.id,
      perfil.pesoAtual || 70,
      exercicio.grupoMuscularPrincipal,
      perfil.experiencia || 'Iniciante',
      repeticoes,
      perfil.objetivo || undefined
    );

    const exercicioTreino = await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicio.id,
        ordem: ordem++,
        series,
        repeticoes,
        carga: (carga != null && carga > 0) ? carga : null,
        rpe,
        descanso,
        concluido: false
      }
    });

    exerciciosTreino.push(exercicioTreino);
  }

  // 10. Adicionar alongamento por último
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioAlongamento.id,
      ordem: ordem, // Último
      series: 1,
      repeticoes: '5-10 min',
      carga: null,
      rpe: 3,
      descanso: 0,
      concluido: false,
      observacoes: 'Alongamento geral de todos os grupos musculares'
    }
  });

  // 11. Calcular tempo estimado
  const numExerciciosForca = exerciciosForca.length;
  const tempoForca = calcularTempoEstimado(numExerciciosForca, series, descanso);
  const tempoTotal = tempoForca + 25 + 7; // Força + Cardio (25min) + Alongamento (7min)

  await prisma.treino.update({
    where: { id: treino.id },
    data: { tempoEstimado: tempoTotal }
  });

  // 12. Buscar treino completo
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  logger.debug(`[OK] Treino ${tipoTreino} criado: ${treinoCompleto?.exercicios.length} exercícios - ${tempoTotal} min`, 'treino.service');
  return treinoCompleto;
}

// Função determinarGruposMuscularesSimples removida - não utilizada

function _determinarGruposMuscularesSimples_NAO_USADA(
  experiencia: string,
  frequenciaSemanal: number,
  data: Date
): string[] {
  let diaSemana = data.getDay(); // 0=domingo, 1=segunda, etc.
  
  // Ajustar domingo (0) para 7 para facilitar cálculos
  if (diaSemana === 0) diaSemana = 7;
  
  console.log(`📅 Dia da semana: ${diaSemana} (${data.toLocaleDateString('pt-BR', { weekday: 'long' })})`);
  console.log(`👤 Experiência: ${experiencia}, Frequência: ${frequenciaSemanal}x/semana`);
  
  // Iniciantes: Full Body ou A-B
  if (experiencia === 'Iniciante') {
    if (frequenciaSemanal <= 2) {
      console.log(`[OK] Full Body selecionado`);
      return ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas'];
    }
    // A-B: alterna entre superior e inferior
    const ciclo = Math.floor((diaSemana - 1) / 2) % 2;
    const grupos = ciclo === 0
      ? ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps']
      : ['Quadríceps', 'Posteriores', 'Panturrilhas'];
    console.log(`[OK] A-B selecionado: ${ciclo === 0 ? 'Superiores' : 'Inferiores'}`);
    return grupos;
  }

  // Intermediários: A-B-C
  if (experiencia === 'Intermediário') {
    const ciclo = (diaSemana - 1) % 3;
    let grupos: string[];
    if (ciclo === 0) grupos = ['Quadríceps', 'Posteriores', 'Panturrilhas'];
    else if (ciclo === 1) grupos = ['Peito', 'Ombros', 'Tríceps'];
    else grupos = ['Costas', 'Bíceps', 'Abdômen'];
    console.log(`[OK] A-B-C selecionado: Ciclo ${ciclo + 1}`);
    return grupos;
  }

  // Avançados: A-B-C-D ou mais específico
  if (experiencia === 'Avançado') {
    if (frequenciaSemanal >= 5) {
      const ciclo = (diaSemana - 1) % 5;
      let grupos: string[];
      if (ciclo === 0) grupos = ['Peito'];
      else if (ciclo === 1) grupos = ['Costas'];
      else if (ciclo === 2) grupos = ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      else if (ciclo === 3) grupos = ['Ombros'];
      else grupos = ['Bíceps', 'Tríceps'];
      console.log(`[OK] A-B-C-D-E selecionado: Ciclo ${ciclo + 1}`);
      return grupos;
    } else if (frequenciaSemanal === 4) {
      const ciclo = (diaSemana - 1) % 4;
      let grupos: string[];
      if (ciclo === 0) grupos = ['Peito'];
      else if (ciclo === 1) grupos = ['Costas'];
      else if (ciclo === 2) grupos = ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      else grupos = ['Ombros'];
      console.log(`[OK] A-B-C-D selecionado: Ciclo ${ciclo + 1}`);
      return grupos;
    } else {
      // Push Pull Legs
      const ciclo = (diaSemana - 1) % 3;
      let grupos: string[];
      if (ciclo === 0) grupos = ['Peito', 'Ombros', 'Tríceps'];
      else if (ciclo === 1) grupos = ['Costas', 'Bíceps'];
      else grupos = ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      console.log(`[OK] Push Pull Legs selecionado: Ciclo ${ciclo + 1}`);
      return grupos;
    }
  }

  // Default: A-B-C
  const ciclo = (diaSemana - 1) % 3;
  let grupos: string[];
  if (ciclo === 0) grupos = ['Quadríceps', 'Posteriores', 'Panturrilhas'];
  else if (ciclo === 1) grupos = ['Peito', 'Ombros', 'Tríceps'];
  else grupos = ['Costas', 'Bíceps', 'Abdômen'];
  console.log(`[OK] Default A-B-C selecionado: Ciclo ${ciclo + 1}`);
  return grupos;
}

/**
 * Busca exercícios de forma simples e funcional
 */
async function buscarExerciciosSimples(
  grupos: string[],
  experiencia: string,
  equipamentos: string[],
  lesoes: string[]
): Promise<any[]> {
  logger.debug(`[INFO] Buscando exercícios para grupos: ${grupos.join(', ')}`, 'treino.service');
  logger.debug(`📊 Experiência: ${experiencia}`, 'treino.service');
  logger.debug(`[INFO] Equipamentos: ${equipamentos.join(', ') || 'Nenhum'}`, 'treino.service');
  logger.debug(`⚠️ Lesões: ${lesoes.join(', ') || 'Nenhuma'}`, 'treino.service');

  const niveisPermitidos = experiencia === 'Iniciante' 
    ? ['Iniciante'] 
    : experiencia === 'Intermediário'
    ? ['Iniciante', 'Intermediário']
    : ['Iniciante', 'Intermediário', 'Avançado'];

  logger.debug(`[INFO] Níveis permitidos: ${niveisPermitidos.join(', ')}`, 'treino.service');

  // Otimização: Buscar todos os exercícios dos grupos de uma vez (evita queries N+1)
  // PRIMEIRA TENTATIVA: Buscar com todos os filtros
  let todosExercicios = await prisma.exercicio.findMany({
    where: {
      grupoMuscularPrincipal: { in: grupos },
      ativo: true,
      nivelDificuldade: { in: niveisPermitidos }
    },
    take: 100 // Buscar mais opções para todos os grupos
  });

  logger.debug(`📦 Encontrados ${todosExercicios.length} exercícios com filtro de nível`, 'treino.service');

  // Se não encontrou nada, tentar sem filtro de nível (mais flexível)
  if (todosExercicios.length === 0) {
    logger.debug(`⚠️ Nenhum exercício encontrado com nível ${niveisPermitidos.join(', ')}, buscando todos os níveis...`, 'treino.service');
    todosExercicios = await prisma.exercicio.findMany({
      where: {
        grupoMuscularPrincipal: { in: grupos },
        ativo: true
      },
      take: 100
    });
    logger.debug(`📦 Encontrados ${todosExercicios.length} exercícios (sem filtro de nível)`, 'treino.service');
  }

  // Agrupar exercícios por grupo muscular
  const exerciciosPorGrupo: Record<string, any[]> = {};
  grupos.forEach(grupo => {
    exerciciosPorGrupo[grupo] = todosExercicios.filter(ex => ex.grupoMuscularPrincipal === grupo);
  });

  const exercicios: any[] = [];

  // Processar cada grupo (agora em memória, sem queries)
  for (const grupo of grupos) {
    logger.debug(`\n🔎 Processando exercícios para: ${grupo}`, 'treino.service');
    let exerciciosGrupo = exerciciosPorGrupo[grupo] || [];
    
    logger.debug(`  📦 Encontrados ${exerciciosGrupo.length} exercícios inicialmente`, 'treino.service');

    // Se não encontrou nada para este grupo, tentar buscar sem filtros
    if (exerciciosGrupo.length === 0) {
      const exerciciosEmergencia = todosExercicios.filter(ex => 
        ex.grupoMuscularPrincipal === grupo
      );
      
      if (exerciciosEmergencia.length === 0) {
        // Última tentativa: buscar diretamente do banco
        exerciciosEmergencia.push(...await prisma.exercicio.findMany({
          where: {
            grupoMuscularPrincipal: grupo,
            ativo: true
          },
          take: 2
        }));
      }
      
      exerciciosGrupo = exerciciosEmergencia;
      logger.debug(`  🆘 MODO EMERGÊNCIA: Usando ${exerciciosGrupo.length} exercícios sem filtros`, 'treino.service');
    }

    // Se há equipamentos, tentar filtrar (mas não bloquear se não encontrar)
    if (equipamentos.length > 0 && exerciciosGrupo.length > 0) {
      const exerciciosComEquipamento = exerciciosGrupo.filter(ex => {
        // Verificar se o exercício usa algum dos equipamentos disponíveis
        // OU se não precisa de equipamento específico (array vazio)
        return ex.equipamentoNecessario.length === 0 || 
               equipamentos.some(eq => ex.equipamentoNecessario.includes(eq));
      });
      
      logger.debug(`  [INFO] Após filtro de equipamentos: ${exerciciosComEquipamento.length} exercícios`, 'treino.service');
      
      // Se encontrou exercícios com equipamentos, usar esses
      if (exerciciosComEquipamento.length > 0) {
        exerciciosGrupo = exerciciosComEquipamento;
      } else {
        logger.debug(`  ⚠️ Nenhum exercício com equipamentos disponíveis, usando todos (ignorando filtro de equipamento)`, 'treino.service');
      }
    }

    // Filtrar exercícios que mencionam lesões (mas não bloquear completamente)
    if (lesoes.length > 0 && exerciciosGrupo.length > 0) {
      const antesFiltroLesoes = exerciciosGrupo.length;
      const exerciciosSemLesao = exerciciosGrupo.filter(ex => {
        const texto = `${ex.descricao || ''} ${ex.execucaoTecnica || ''} ${ex.errosComuns.join(' ')}`.toLowerCase();
        return !lesoes.some(lesao => texto.includes(lesao.toLowerCase()));
      });
      
      // Se ainda tem exercícios após filtrar lesões, usar esses
      // Se não, usar os originais (melhor ter treino do que não ter)
      if (exerciciosSemLesao.length > 0) {
        exerciciosGrupo = exerciciosSemLesao;
        logger.debug(`  ⚠️ Após filtro de lesões: ${exerciciosGrupo.length} exercícios (${antesFiltroLesoes - exerciciosGrupo.length} removidos)`, 'treino.service');
      } else {
        logger.debug(`  ⚠️ Todos os exercícios foram removidos pelo filtro de lesões, mantendo todos (aviso: pode haver exercícios que mencionam lesões)`, 'treino.service');
      }
    }

    // Adicionar 1-2 exercícios por grupo
    if (exerciciosGrupo.length > 0) {
      const selecionados = exerciciosGrupo.slice(0, 2);
      logger.debug(`  [OK] Selecionados ${selecionados.length} exercícios: ${selecionados.map(e => e.nome).join(', ')}`, 'treino.service');
      exercicios.push(...selecionados);
    } else {
      logger.debug(`  [ERROR] Nenhum exercício disponível para ${grupo} após todos os filtros`, 'treino.service');
    }
  }

  // Remover duplicatas
  const unicos = exercicios.filter((ex, index, self) =>
    index === self.findIndex(e => e.id === ex.id)
  );

  logger.debug(`\n[OK] Total de exercícios únicos selecionados: ${unicos.length}`, 'treino.service');
  return unicos;
}

// calcularParametrosTreino removido - usar calcularParametrosTreino de workout-intelligence.service.ts

// Função calcularCargaExercicio removida - usar calcularCargaExercicio de workout-intelligence.service.ts

/**
 * Determina tipo de treino
 */
function determinarTipoTreino(experiencia: string, frequenciaSemanal: number): string {
  if (experiencia === 'Iniciante') {
    return frequenciaSemanal <= 2 ? 'Full Body' : 'A-B';
  }
  if (experiencia === 'Intermediário') {
    return 'A-B-C';
  }
  if (experiencia === 'Avançado') {
    return frequenciaSemanal >= 5 ? 'A-B-C-D-E' : frequenciaSemanal === 4 ? 'A-B-C-D' : 'Push Pull Legs';
  }
  return 'A-B-C';
}

// Função verificarPrimeiraSemana removida - não utilizada

async function _verificarPrimeiraSemana_NAO_USADA(userId: string): Promise<boolean> {
  // Buscar primeiro treino do usuário
  const primeiroTreino = await prisma.treino.findFirst({
    where: { userId },
    orderBy: { data: 'asc' },
    select: { data: true }
  });
  
  if (!primeiroTreino) {
    return true; // Se não tem treino, é primeira semana
  }
  
  // Calcular dias desde o primeiro treino
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const primeiroDia = new Date(primeiroTreino.data);
  primeiroDia.setHours(0, 0, 0, 0);
  
  const diasDesdePrimeiro = Math.floor((hoje.getTime() - primeiroDia.getTime()) / (1000 * 60 * 60 * 24));
  
  // Primeira semana = primeiros 7 dias
  return diasDesdePrimeiro < 7;
}

/**
 * Calcula tempo estimado
 */
function calcularTempoEstimado(numExercicios: number, series: number, descanso: number): number {
  const tempoPorSerie = 30 + descanso; // 30s execução + descanso
  const tempoTotal = (numExercicios * series * tempoPorSerie) / 60;
  return Math.ceil(tempoTotal + 5); // +5min aquecimento
}

/**
 * Calcula máximo de exercícios baseado no tempo disponível
 * Fórmula: (tempoDisponivel - 3min aquecimento) / (4min por exercício)
 * Garante que o treino seja viável dentro do tempo real
 */
function calcularMaxExerciciosPorTempo(tempoDisponivel: number, series: number, descanso: number): number {
  const tempoAquecimento = 3; // 3 minutos de aquecimento
  const tempoUtil = tempoDisponivel - tempoAquecimento;
  
  if (tempoUtil <= 0) {
    return 2; // Mínimo 2 exercícios mesmo com pouco tempo
  }
  
  // Tempo por exercício: ~4 minutos (execução + descanso entre séries)
  // Considerando: 3 séries × (30s execução + descanso) + tempo de transição
  const tempoPorExercicio = 4; // minutos
  const maxExercicios = Math.floor(tempoUtil / tempoPorExercicio);
  
  // Limites razoáveis
  if (maxExercicios < 2) return 2;
  if (maxExercicios > 10) return 10; // Máximo 10 exercícios
  
  return maxExercicios;
}

/**
 * Determina tipo de treino (A, B ou C) baseado na divisão e ciclo
 */
function determinarTipoTreinoABC(divisao: string, ciclo: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  console.log(`[INFO] determinarTipoTreinoABC: divisao="${divisao}", ciclo=${ciclo}`);
  
  if (divisao === 'A') {
    console.log(`  -> A: sempre tipo A`);
    return 'A';
  } else if (divisao === 'A-B') {
    const cicloMod = ciclo % 2;
    const tipo = cicloMod === 0 ? 'A' : 'B';
    console.log(`  -> A-B: cicloMod=${cicloMod}, tipo=${tipo}`);
    return tipo;
  } else if (divisao === 'A-B-C') {
    const cicloMod = ciclo % 3;
    const tipo = cicloMod === 0 ? 'A' : cicloMod === 1 ? 'B' : 'C';
    console.log(`  -> A-B-C: cicloMod=${cicloMod}, tipo=${tipo}`);
    return tipo;
  } else if (divisao === 'A-B-C-D') {
    const cicloMod = ciclo % 4;
    let tipo: 'A' | 'B' | 'C' | 'D';
    if (cicloMod === 0) tipo = 'A';
    else if (cicloMod === 1) tipo = 'B';
    else if (cicloMod === 2) tipo = 'C';
    else tipo = 'D';
    console.log(`  -> A-B-C-D: cicloMod=${cicloMod}, tipo=${tipo}`);
    return tipo;
  } else if (divisao === 'A-B-C-D-E') {
    const cicloMod = ciclo % 5;
    let tipo: 'A' | 'B' | 'C' | 'D' | 'E';
    if (cicloMod === 0) tipo = 'A';
    else if (cicloMod === 1) tipo = 'B';
    else if (cicloMod === 2) tipo = 'C';
    else if (cicloMod === 3) tipo = 'D';
    else tipo = 'E';
    console.log(`  -> A-B-C-D-E: cicloMod=${cicloMod}, tipo=${tipo}`);
    return tipo;
  } else if (divisao === 'A-B-C-D-E-F') {
    const cicloMod = ciclo % 6;
    let tipo: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    if (cicloMod === 0) tipo = 'A';
    else if (cicloMod === 1) tipo = 'B';
    else if (cicloMod === 2) tipo = 'C';
    else if (cicloMod === 3) tipo = 'D';
    else if (cicloMod === 4) tipo = 'E';
    else tipo = 'F';
    console.log(`  -> A-B-C-D-E-F: cicloMod=${cicloMod}, tipo=${tipo}`);
    return tipo;
  }
  
  // Default: A-B-C
  const cicloMod = ciclo % 3;
  const tipo = cicloMod === 0 ? 'A' : cicloMod === 1 ? 'B' : 'C';
  console.log(`  -> Padrão (A-B-C): cicloMod=${cicloMod}, tipo=${tipo}`);
  return tipo;
}

/**
 * Gera treinos para os próximos 30 dias usando lógica ABC determinística
 */
/**
 * Gera treinos para os próximos 30 dias usando o motor centralizado
 * VERSÃO ATUALIZADA - Usa garantirPlanoSemanal do treino-engine.service.ts
 */
export async function gerarTreinos30Dias(userId: string): Promise<any[]> {
  console.log(`[INFO] Gerando treinos para 30 dias usando motor centralizado - UserId: ${userId}`);
  
  const perfil = await prisma.perfil.findUnique({ where: { userId } });
  if (!perfil) {
    throw new Error('Perfil não encontrado.');
  }

  // Validar dados mínimos
  validarDadosMinimos(perfil);

  // Importar função do core
  const { regenerarTreinos30Dias } = await import('./treino-core.service');
  
  // Converter perfil para formato completo
  const perfilCompleto: PerfilCompleto = {
    idade: perfil.idade,
    sexo: perfil.sexo,
    altura: perfil.altura,
    pesoAtual: perfil.pesoAtual,
    percentualGordura: perfil.percentualGordura,
    tipoCorpo: perfil.tipoCorpo,
    experiencia: perfil.experiencia,
    problemasAnteriores: perfil.problemasAnteriores || [],
    lesoes: perfil.lesoes || [],
    objetivo: perfil.objetivo,
    objetivosAdicionais: perfil.objetivosAdicionais || [],
    rpePreferido: perfil.rpePreferido,
    frequenciaSemanal: perfil.frequenciaSemanal,
    tempoDisponivel: perfil.tempoDisponivel,
    localTreino: perfil.localTreino,
    preferencias: perfil.preferencias || [],
    aguaDiaria: perfil.aguaDiaria
  };

  // Regenerar treinos usando core
  await regenerarTreinos30Dias(userId, perfilCompleto);

  // Buscar treinos gerados
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataLimite = new Date(hoje);
  dataLimite.setDate(hoje.getDate() + 30);

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
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { data: 'asc' }
  });

  console.log(`[OK] Total de ${treinos.length} treinos gerados para os próximos 30 dias`);
  
  // Resumo final
  if (treinos.length > 0) {
    const totalExercicios = treinos.reduce((sum, t) => sum + (t.exercicios?.length || 0), 0);
    const totalForca = treinos.reduce((sum, t) => {
      return sum + (t.exercicios?.filter((ex: any) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        return grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade';
      }).length || 0);
    }, 0);
    
    console.log(`📊 RESUMO: ${treinos.length} treinos, ${totalExercicios} exercícios (${totalForca} força + cardio + alongamento)`);
    console.log(`📊 Média: ${(totalExercicios / treinos.length).toFixed(1)} exercícios por treino`);
  }
  
  return treinos;
}


// Função gerarTreinos30DiasFallback removida - não utilizada (substituída por gerarTreinos30Dias)

async function _gerarTreinos30DiasFallback_NAO_USADA(userId: string): Promise<any[]> {
  console.log(`[INFO] Usando método fallback (geração dinâmica)...`);
  
  const perfil = await prisma.perfil.findUnique({ where: { userId } });
  if (!perfil) {
    throw new Error('Perfil não encontrado.');
  }

  const frequenciaSemanal = perfil.frequenciaSemanal || 3;
  const treinos: any[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Determinar dias de treino
  const diasTreino: number[] = [];
  if (frequenciaSemanal === 2) diasTreino.push(1, 4);
  else if (frequenciaSemanal === 3) diasTreino.push(1, 3, 5);
  else if (frequenciaSemanal === 4) diasTreino.push(1, 2, 4, 5);
  else if (frequenciaSemanal === 5) diasTreino.push(1, 2, 3, 4, 5);
  else if (frequenciaSemanal === 6) diasTreino.push(1, 2, 3, 4, 5, 6);
  else diasTreino.push(1, 3, 5);

  // Gerar treinos
  let treinosGerados = 0;
  for (let i = 0; i < 30 && treinosGerados < (frequenciaSemanal * 4); i++) {
    const dataTreino = new Date(hoje);
    dataTreino.setDate(hoje.getDate() + i);
    const diaSemana = dataTreino.getDay();

    if (diasTreino.includes(diaSemana)) {
      try {
        const inicioDia = new Date(dataTreino);
        inicioDia.setHours(0, 0, 0, 0);
        const fimDia = new Date(dataTreino);
        fimDia.setHours(23, 59, 59, 999);
        
        const existe = await prisma.treino.findFirst({
          where: { userId, data: { gte: inicioDia, lte: fimDia } }
        });

        if (!existe) {
          // Usar motor centralizado para gerar treino
          const { gerarTreinoDoDiaUnico } = await import('./treino-engine.service');
          const treinoGerado = await gerarTreinoDoDiaUnico(userId, dataTreino);
          if (treinoGerado) {
            const treinoCompleto = await prisma.treino.findUnique({
              where: { id: treinoGerado.id },
              include: {
                exercicios: {
                  include: { exercicio: true },
                  orderBy: { ordem: 'asc' }
                }
              }
            });
            if (treinoCompleto) {
              treinos.push(treinoCompleto);
              treinosGerados++;
            }
          }
        }
      } catch (error: any) {
        console.error(`[ERROR] Erro ao gerar treino para ${dataTreino.toLocaleDateString('pt-BR')}:`, error.message);
      }
    }
  }

  console.log(`[OK] Gerados ${treinosGerados} treinos (fallback)`);
  return treinos;
}

/**
 * Busca treinos semanais (semana completa: domingo a domingo)
 */
export async function buscarTreinosSemanais(userId: string): Promise<any[]> {
  console.log(`[INFO] Buscando treinos semanais - UserId: ${userId}`);
  
  const perfil = await prisma.perfil.findUnique({ where: { userId } });
  if (!perfil) {
    throw new Error('Perfil não encontrado.');
  }

  // Buscar modo de treino do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { modoTreino: true }
  });

  // Se modoTreino for null, usar "IA" como padrão
  const modoTreino = user?.modoTreino || 'IA';
  console.log(`[INFO] Modo de treino do usuário: ${modoTreino}`);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  // Calcular domingo da semana atual (semana começa no domingo)
  const diaSemana = hoje.getDay(); // 0=domingo, 1=segunda...
  const diasAteDomingo = diaSemana === 0 ? 0 : -diaSemana; // Voltar até o domingo
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() + diasAteDomingo);
  inicioSemana.setHours(0, 0, 0, 0);
  
  // Calcular domingo da semana (fim da semana)
  const diasAteDomingoFim = diaSemana === 0 ? 7 : 7 - diaSemana;
  const fimSemana = new Date(hoje);
  fimSemana.setDate(hoje.getDate() + diasAteDomingoFim);
  fimSemana.setHours(23, 59, 59, 999);
  
  console.log(`📅 Semana completa: ${inicioSemana.toLocaleDateString('pt-BR')} até ${fimSemana.toLocaleDateString('pt-BR')} (domingo a domingo)`);

  // Buscar treinos com filtro baseado no modo
  let treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      }
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      },
      templatePersonalizado: true
    },
    orderBy: {
      data: 'asc'
    }
  });

  // Filtrar treinos baseado no modoTreino do usuário
  if (modoTreino === 'IA') {
    // Mostrar apenas treinos gerados pela IA
    treinos = treinos.filter(t => t.criadoPor === 'IA');
    console.log(`[OK] Filtrado para modo IA: ${treinos.length} treinos`);
  } else if (modoTreino === 'MANUAL') {
    // Mostrar apenas treinos manuais (criados pelo usuário ou vinculados a templates personalizados)
    treinos = treinos.filter(t => 
      t.criadoPor === 'USUARIO' || 
      t.templatePersonalizado !== null
    );
    console.log(`[OK] Filtrado para modo MANUAL: ${treinos.length} treinos`);
  }

  console.log(`[OK] Encontrados ${treinos.length} treinos para a semana`);
  
  // Validar e corrigir cada treino: garantir cardio e alongamento e ordem correta
  let treinosCorrigidos = 0;
  for (const treino of treinos) {
    const exerciciosForca = treino.exercicios?.filter((ex: any) => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
    }) || [];
    
    const temCardio = treino.exercicios?.some((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
    ) || false;
    
    const temAlongamento = treino.exercicios?.some((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
    ) || false;
    
    // Se tem exercícios de força mas não tem cardio/alongamento, adicionar
    // OU sempre garantir ordem correta mesmo que já existam
    if (exerciciosForca.length > 0) {
      if (!temCardio || !temAlongamento) {
        console.log(`🔧 Corrigindo treino ${new Date(treino.data).toLocaleDateString('pt-BR')}: faltando ${!temCardio ? 'cardio' : ''} ${!temAlongamento ? 'alongamento' : ''}`);
        const resultado = await garantirCardioEAlongamento(treino.id, new Date(treino.data));
        if (resultado.cardioAdicionado || resultado.alongamentoAdicionado) {
          treinosCorrigidos++;
        }
      } else {
        // Mesmo que já existam, garantir ordem correta
        await garantirCardioEAlongamento(treino.id, new Date(treino.data));
      }
    }
  }
  
  if (treinosCorrigidos > 0) {
    console.log(`[OK] ${treinosCorrigidos} treinos corrigidos com cardio/alongamento`);
    
    // Buscar treinos novamente após correções
    let treinosAtualizados = await prisma.treino.findMany({
      where: {
        userId,
        data: {
          gte: hoje,
          lte: fimSemana
        }
      },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        },
        templatePersonalizado: true
      },
      orderBy: {
        data: 'asc'
      }
    });

    // Aplicar filtro do modo novamente após buscar treinos atualizados
    if (modoTreino === 'IA') {
      treinosAtualizados = treinosAtualizados.filter(t => t.criadoPor === 'IA');
    } else if (modoTreino === 'MANUAL') {
      treinosAtualizados = treinosAtualizados.filter(t => 
        t.criadoPor === 'USUARIO' || 
        t.templatePersonalizado !== null
      );
    }
    
    // Log detalhado de cada treino com validação
    treinosAtualizados.forEach((treino, index) => {
      const exerciciosForca = treino.exercicios?.filter((ex: any) => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
      }) || [];
      const exerciciosCardio = treino.exercicios?.filter((ex: any) => 
        ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
      ) || [];
      const exerciciosAlongamento = treino.exercicios?.filter((ex: any) => 
        ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
      ) || [];
      
      console.log(`   Treino ${index + 1}: ${new Date(treino.data).toLocaleDateString('pt-BR')} - ${treino.exercicios?.length || 0} exercícios (${exerciciosForca.length} força, ${exerciciosCardio.length} cardio, ${exerciciosAlongamento.length} alongamento)`);
    });
    
    // Validar que treinos consecutivos têm grupos diferentes
    for (let i = 1; i < treinosAtualizados.length; i++) {
      const treinoAnterior = treinosAtualizados[i - 1];
      const treinoAtual = treinosAtualizados[i];
      
      const gruposAnterior = new Set(
        (treinoAnterior.exercicios || [])
          .map((ex: any) => ex.exercicio?.grupoMuscularPrincipal)
          .filter((g: string) => g && g !== 'Cardio' && g !== 'Flexibilidade')
      );
      
      const gruposAtual = new Set(
        (treinoAtual.exercicios || [])
          .map((ex: any) => ex.exercicio?.grupoMuscularPrincipal)
          .filter((g: string) => g && g !== 'Cardio' && g !== 'Flexibilidade')
      );
      
      const sobreposicao = [...gruposAtual].filter(g => gruposAnterior.has(g));
      if (sobreposicao.length >= gruposAtual.size * 0.8 && gruposAtual.size > 0) {
        console.warn(`⚠️ Treinos consecutivos muito similares: ${new Date(treinoAnterior.data).toLocaleDateString('pt-BR')} e ${new Date(treinoAtual.data).toLocaleDateString('pt-BR')} têm ${sobreposicao.length}/${gruposAtual.size} grupos iguais`);
      }
    }
    
    return treinosAtualizados;
  }
  
  // Log detalhado de cada treino
  treinos.forEach((treino, index) => {
    const exerciciosForca = treino.exercicios?.filter((ex: any) => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      return grupo !== 'Cardio' && grupo !== 'Flexibilidade';
    }) || [];
    const exerciciosCardio = treino.exercicios?.filter((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
    ) || [];
    const exerciciosAlongamento = treino.exercicios?.filter((ex: any) => 
      ex.exercicio?.grupoMuscularPrincipal === 'Flexibilidade'
    ) || [];
    
    console.log(`   Treino ${index + 1}: ${new Date(treino.data).toLocaleDateString('pt-BR')} - ${treino.exercicios?.length || 0} exercícios (${exerciciosForca.length} força, ${exerciciosCardio.length} cardio, ${exerciciosAlongamento.length} alongamento)`);
  });

  return treinos;
}

/**
 * Busca treino do dia
 */
/**
 * Define o treino ativo para o usuário
 */
export async function definirTreinoAtivo(userId: string, treinoId: string): Promise<void> {
  // Validar que o treino existe e pertence ao usuário
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    select: {
      criadoPor: true
    }
  });

  if (!treino) {
    throw new Error('Treino não encontrado ou não pertence ao usuário');
  }

  // Buscar modo de treino do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { modoTreino: true }
  });

  const modoTreino = user?.modoTreino || 'IA';

  // Buscar treino completo para verificar template personalizado
  const treinoCompleto = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    select: {
      criadoPor: true,
      templatePersonalizado: true
    }
  });

  if (!treinoCompleto) {
    throw new Error('Treino não encontrado ou não pertence ao usuário');
  }

  // Validar que o treino corresponde ao modo selecionado
  const sourceEsperado = modoTreino === 'IA' ? 'IA' : 'USUARIO';
  const isValidForMode = treinoCompleto.criadoPor === sourceEsperado || 
    (modoTreino === 'MANUAL' && (treinoCompleto.criadoPor === 'USUARIO' || treinoCompleto.templatePersonalizado !== null));

  if (!isValidForMode) {
    throw new Error('Treino não corresponde ao modo selecionado');
  }

  // Determinar source baseado no criadoPor ou template
  const currentTrainingSource = treinoCompleto.criadoPor === 'IA' ? 'IA' : 'MANUAL';

  // Atualizar usuário
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentTrainingId: treinoId,
      currentTrainingSource
    }
  });
}

export async function buscarTreinoDoDia(userId: string, data?: Date): Promise<any> {
  const dataBusca = data || new Date();
  const inicioDia = new Date(dataBusca);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(dataBusca);
  fimDia.setHours(23, 59, 59, 999);

  // Obter dia da semana (0=domingo, 1=segunda, etc.)
  const diaSemana = dataBusca.getDay();

  // Buscar usuário com currentTrainingId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      modoTreino: true,
      currentTrainingId: true,
      currentTrainingSource: true
    }
  });

  // Se modoTreino for null, usar "IA" como padrão
  const modoTreino = user?.modoTreino || 'IA';

  // Primeiro, verificar se há currentTrainingId
  if (user?.currentTrainingId) {
    try {
      const treinoAtivo = await prisma.treino.findFirst({
        where: {
          id: user.currentTrainingId,
          userId
        },
        include: {
          exercicios: {
            include: { exercicio: true },
            orderBy: { ordem: 'asc' }
          },
          templatePersonalizado: true
        }
      });

      // Se o treino ativo existe e é válido, retornar
      if (treinoAtivo) {
        // Validar que ainda corresponde ao modo
        const sourceEsperado = modoTreino === 'IA' ? 'IA' : 'USUARIO';
        const isValidSource = treinoAtivo.criadoPor === sourceEsperado || 
          (modoTreino === 'MANUAL' && (treinoAtivo.criadoPor === 'USUARIO' || treinoAtivo.templatePersonalizado !== null));

        if (isValidSource) {
          return treinoAtivo;
        }
      }
    } catch (error) {
      // Se houver erro ao buscar treino ativo, continuar com lógica normal
      console.error('Erro ao buscar treino ativo:', error);
    }
  }

  // Buscar configuração padrão para este dia da semana
  const configuracao = await prisma.configuracaoTreinoUsuario.findUnique({
    where: {
      userId_diaSemana: {
        userId,
        diaSemana
      }
    }
  });

  // Buscar todos os treinos da data (IA + personalizados)
  let treinos = await prisma.treino.findMany({
    where: { userId, data: { gte: inicioDia, lte: fimDia } },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      },
      templatePersonalizado: true
    },
    orderBy: [
      { criadoPor: 'asc' }, // Personalizados primeiro
      { createdAt: 'desc' } // Mais recentes primeiro
    ]
  });

  // Filtrar treinos baseado no modoTreino do usuário
  if (modoTreino === 'IA') {
    // Mostrar apenas treinos gerados pela IA
    treinos = treinos.filter(t => t.criadoPor === 'IA');
  } else if (modoTreino === 'MANUAL') {
    // Mostrar apenas treinos manuais (criados pelo usuário ou vinculados a templates personalizados)
    treinos = treinos.filter(t => 
      t.criadoPor === 'USUARIO' || 
      t.templatePersonalizado !== null
    );
  }

  // Se houver configuração padrão, filtrar treinos (compatibilidade com sistema antigo)
  if (configuracao && treinos.length > 0) {
    let treinoFiltrado = null;

    if (configuracao.tipoTreino === 'IA') {
      // Buscar treino gerado pela IA
      treinoFiltrado = treinos.find(t => t.criadoPor === 'IA');
    } else if (configuracao.tipoTreino === 'RECORRENTE' && configuracao.letraTreino) {
      // Buscar treino recorrente com a letra configurada
      treinoFiltrado = treinos.find(t => 
        t.letraTreino === configuracao.letraTreino && 
        (t.criadoPor === 'USUARIO' || t.recorrente === true)
      );
    }

    // Se encontrou treino configurado, retornar apenas ele
    if (treinoFiltrado) {
      return treinoFiltrado;
    }
  }

  // Se houver apenas um treino, retornar diretamente e atualizar currentTrainingId
  if (treinos.length === 1) {
    const treinoEncontrado = treinos[0];
    // Atualizar currentTrainingId se ainda não estiver definido ou se for diferente
    if (user?.currentTrainingId !== treinoEncontrado.id) {
      try {
        await definirTreinoAtivo(userId, treinoEncontrado.id);
      } catch (error) {
        // Se falhar, continuar mesmo assim
        console.error('Erro ao atualizar treino ativo:', error);
      }
    }
    return treinoEncontrado;
  }

  // Se houver múltiplos treinos, retornar array para escolha
  if (treinos.length > 1) {
    return treinos;
  }

  // Se não houver treinos, limpar currentTrainingId e retornar null
  if (user?.currentTrainingId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentTrainingId: null,
          currentTrainingSource: null
        }
      });
    } catch (error) {
      console.error('Erro ao limpar treino ativo:', error);
    }
  }
  return null;
}

/**
 * Marca exercício como concluído ou desmarca
 * Agora suporta feedback simples (novo sistema) e RPE (sistema antigo)
 */
export async function concluirExercicio(
  exercicioTreinoId: string, 
  userId?: string,
  rpeRealizado?: number,
  feedbackSimples?: string,
  aceitouAjuste?: boolean | null,
  concluido: boolean = true
): Promise<any> {
  const logContext = {
    exercicioTreinoId,
    userId,
    concluido,
    rpeRealizado,
    feedbackSimples,
    aceitouAjuste
  };

  console.log('[concluirExercicio Service] Iniciando processamento:', logContext);

  try {
    // Validações iniciais
    if (!exercicioTreinoId || typeof exercicioTreinoId !== 'string') {
      console.error('[concluirExercicio Service] ID do exercício inválido:', exercicioTreinoId);
      throw new Error('ID do exercício é obrigatório e deve ser uma string válida');
    }

    if (userId && typeof userId !== 'string') {
      console.error('[concluirExercicio Service] userId inválido:', userId);
      throw new Error('userId deve ser uma string válida');
    }

    // Validar RPE se fornecido
    if (rpeRealizado !== undefined) {
      if (typeof rpeRealizado !== 'number' || rpeRealizado < 1 || rpeRealizado > 10) {
        console.error('[concluirExercicio Service] RPE inválido:', rpeRealizado);
        throw new Error('RPE deve ser um número entre 1 e 10');
      }
    }

    // Validar feedbackSimples se fornecido
    const feedbackValidos = ['MUITO_FACIL', 'NO_PONTO', 'PESADO_DEMAIS'];
    if (feedbackSimples !== undefined && feedbackSimples !== null) {
      if (typeof feedbackSimples !== 'string' || !feedbackValidos.includes(feedbackSimples)) {
        console.error('[concluirExercicio Service] feedbackSimples inválido:', feedbackSimples);
        throw new Error(`feedbackSimples deve ser um dos valores: ${feedbackValidos.join(', ')}`);
      }
    }

    // Validar que não temos RPE e feedbackSimples ao mesmo tempo
    if (concluido && rpeRealizado !== undefined && feedbackSimples) {
      console.error('[concluirExercicio Service] RPE e feedbackSimples não podem ser fornecidos simultaneamente');
      throw new Error('Não é possível fornecer RPE e feedbackSimples simultaneamente');
    }

    console.log('[concluirExercicio Service] Validações iniciais passaram');

    // Usar transação para garantir atomicidade
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar exercício e treino em uma única query
      const exercicioComTreino = await tx.exercicioTreino.findUnique({
        where: { id: exercicioTreinoId },
        select: {
          id: true,
          treinoId: true,
          treino: {
            select: {
              id: true,
              userId: true
            }
          }
        }
      });

      if (!exercicioComTreino) {
        console.error('[concluirExercicio Service] Exercício não encontrado:', exercicioTreinoId);
        const error = new Error('Exercício não encontrado');
        (error as any).code = 'P2025';
        throw error;
      }

      const treinoId = exercicioComTreino.treinoId;
      const treinoUserId = exercicioComTreino.treino.userId;

      console.log('[concluirExercicio Service] Exercício encontrado:', {
        exercicioTreinoId,
        treinoId,
        treinoUserId
      });

      // Validar permissão se userId fornecido
      if (userId) {
        if (treinoUserId !== userId) {
          console.error('[concluirExercicio Service] Permissão negada:', {
            treinoUserId,
            userId
          });
          throw new Error('Sem permissão para modificar este exercício');
        }
        console.log('[concluirExercicio Service] Permissão validada com sucesso');
      }

      // Preparar dados de atualização
      const updateData: any = { concluido };
      
      if (concluido) {
        if (feedbackSimples) {
          updateData.feedbackSimples = feedbackSimples;
          updateData.rpe = null;
        } else if (rpeRealizado !== undefined) {
          updateData.rpe = rpeRealizado;
          updateData.feedbackSimples = null;
        }
        if (aceitouAjuste !== undefined && aceitouAjuste !== null) {
          updateData.aceitouAjuste = aceitouAjuste;
        }
      } else {
        // Ao desmarcar, limpar todos os dados relacionados
        updateData.rpe = null;
        updateData.feedbackSimples = null;
        updateData.aceitouAjuste = null;
      }

      console.log('[concluirExercicio Service] Dados de atualização preparados:', updateData);

      // Atualizar exercício
      await tx.exercicioTreino.update({
        where: { id: exercicioTreinoId },
        data: updateData
      });

      console.log('[concluirExercicio Service] Exercício atualizado com sucesso');

      // Buscar todos os exercícios do treino para verificar se todos estão concluídos
      const treinoCompleto = await tx.treino.findUnique({
        where: { id: treinoId },
        select: {
          id: true,
          exercicios: {
            select: { concluido: true }
          }
        }
      });

      if (!treinoCompleto) {
        console.warn('[concluirExercicio Service] Treino não encontrado após atualização do exercício:', treinoId);
      } else {
        // Atualizar status do treino baseado em todos os exercícios
        const todosConcluidos = treinoCompleto.exercicios.length > 0 && 
                                treinoCompleto.exercicios.every(ex => ex.concluido);
        
        await tx.treino.update({
          where: { id: treinoId },
          data: { concluido: todosConcluidos }
        });

        console.log('[concluirExercicio Service] Status do treino atualizado:', {
          treinoId,
          todosConcluidos,
          totalExercicios: treinoCompleto.exercicios.length
        });
      }

      // Buscar exercício atualizado com relacionamento
      const exercicioAtualizado = await tx.exercicioTreino.findUnique({
        where: { id: exercicioTreinoId },
        include: {
          exercicio: true
        }
      });

      if (!exercicioAtualizado) {
        console.error('[concluirExercicio Service] Exercício não encontrado após atualização');
        throw new Error('Exercício não encontrado após atualização');
      }

      console.log('[concluirExercicio Service] Processamento concluído com sucesso');
      return exercicioAtualizado;
    }, {
      timeout: 10000, // 10 segundos de timeout
      isolationLevel: 'ReadCommitted'
    });

    return resultado;
  } catch (error: any) {
    // Tratamento específico de erros do Prisma
    if (error.code === 'P2025') {
      console.error('[concluirExercicio Service] Registro não encontrado (P2025):', logContext);
      const notFoundError = new Error('Exercício não encontrado');
      (notFoundError as any).code = 'P2025';
      throw notFoundError;
    }

    if (error.code === 'P2002') {
      console.error('[concluirExercicio Service] Violação de constraint única (P2002):', logContext);
      throw new Error('Violação de constraint única no banco de dados');
    }

    if (error.code === 'P2003') {
      console.error('[concluirExercicio Service] Violação de foreign key (P2003):', logContext);
      throw new Error('Referência inválida no banco de dados');
    }

    // Log detalhado do erro
    console.error('[concluirExercicio Service] Erro completo:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
      context: logContext
    });

    // Re-throw com contexto adicional se necessário
    if (error.message && !error.code) {
      throw error;
    }

    // Se for um erro conhecido, manter a mensagem original
    if (error.message.includes('permissão') || 
        error.message.includes('não encontrado') ||
        error.message.includes('inválido')) {
      throw error;
    }

    // Erro genérico do banco de dados
    const dbError = new Error('Erro ao processar conclusão do exercício no banco de dados');
    (dbError as any).code = error.code || 'DATABASE_ERROR';
    (dbError as any).originalError = error.message;
    throw dbError;
  }
}

/**
 * Conclui um treino inteiro garantindo que todos os exercícios estejam marcados
 */
export async function concluirTreino(treinoId: string, userId: string) {
  if (!treinoId) {
    throw new Error('ID do treino é obrigatório')
  }

  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    include: {
      exercicios: true
    }
  })

  if (!treino) {
    throw new Error('Treino não encontrado')
  }

  await prisma.$transaction(async (tx) => {
    if (treino.exercicios.some((ex) => !ex.concluido)) {
      await tx.exercicioTreino.updateMany({
        where: {
          treinoId,
          concluido: false
        },
        data: {
          concluido: true
        }
      })
    }

    await tx.treino.update({
      where: { id: treinoId },
      data: {
        concluido: true
      }
    })
  })

  return prisma.treino.findUnique({
    where: { id: treinoId },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    }
  })
}

/**
 * Busca alternativas para um exercício
 */
export async function obterAlternativas(exercicioTreinoId: string, equipamentosDisponiveis?: string[]): Promise<any> {
  const exercicioTreino = await prisma.exercicioTreino.findUnique({
    where: { id: exercicioTreinoId },
    include: { exercicio: true }
  });

  if (!exercicioTreino) {
    throw new Error('Exercício não encontrado');
  }

  // Buscar exercícios do mesmo grupo muscular
  const alternativas = await prisma.exercicio.findMany({
    where: {
      grupoMuscularPrincipal: exercicioTreino.exercicio.grupoMuscularPrincipal,
      ativo: true,
      id: { not: exercicioTreino.exercicioId }
    },
    take: 5
  });

  return {
    exercicioAtual: exercicioTreino.exercicio,
    alternativas
  };
}

/**
 * Substitui exercício por alternativa
 */
export async function substituirExercicio(exercicioTreinoId: string, exercicioAlternativoId: string): Promise<any> {
  const exercicioTreino = await prisma.exercicioTreino.findUnique({
    where: { id: exercicioTreinoId },
    include: { treino: true, exercicio: true }
  });

  if (!exercicioTreino) {
    throw new Error('Exercício não encontrado');
  }

  const exercicioAlternativo = await prisma.exercicio.findUnique({
    where: { id: exercicioAlternativoId }
  });

  if (!exercicioAlternativo) {
    throw new Error('Exercício alternativo não encontrado');
  }

  return await prisma.exercicioTreino.update({
    where: { id: exercicioTreinoId },
    data: {
      exercicioId: exercicioAlternativoId,
      observacoes: `Substituído de: ${exercicioTreino.exercicio.nome}`
    },
    include: { exercicio: true }
  });
}

/**
 * Gera versão alternativa do treino usando apenas peso corporal
 */
export async function gerarVersaoAlternativa(treinoId: string, userId: string): Promise<any> {
  // Buscar treino atual
  const treino = await prisma.treino.findUnique({
    where: { id: treinoId },
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

  if (treino.userId !== userId) {
    throw new Error('Você não tem permissão para modificar este treino');
  }

  // Buscar perfil do usuário para calcular cargas
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado');
  }

  // Para cada exercício, verificar se precisa de equipamento
  const substituicoes: Array<{ exercicioTreinoId: string; novoExercicioId: string }> = [];

  for (const exercicioTreino of treino.exercicios) {
    const exercicio = exercicioTreino.exercicio;
    const equipamentos = exercicio.equipamentoNecessario || [];
    
    // Verificar se tem equipamento além de peso corporal
    const temEquipamento = equipamentos.some((eq: string) => {
      const eqLower = eq.toLowerCase();
      return !eqLower.includes('peso corporal') && 
             !eqLower.includes('corpo') &&
             eqLower !== 'peso corporal';
    });

    // Se tem equipamento, buscar alternativa de peso corporal
    if (temEquipamento) {
      const alternativa = await prisma.exercicio.findFirst({
        where: {
          grupoMuscularPrincipal: exercicio.grupoMuscularPrincipal,
          ativo: true,
          id: { not: exercicio.id },
          OR: [
            { equipamentoNecessario: { isEmpty: true } },
            { 
              equipamentoNecessario: { 
                hasSome: ['Peso Corporal', 'peso corporal', 'Corpo'] 
              } 
            }
          ]
        },
        orderBy: { nome: 'asc' }
      });

      if (alternativa) {
        substituicoes.push({
          exercicioTreinoId: exercicioTreino.id,
          novoExercicioId: alternativa.id
        });
      }
    }
  }

  // Aplicar substituições
  for (const substituicao of substituicoes) {
    const exercicioTreino = treino.exercicios.find(ex => ex.id === substituicao.exercicioTreinoId);
    if (exercicioTreino) {
      // Calcular nova carga (peso corporal = null ou 0)
      const novaCarga = null; // Peso corporal não tem carga

      await prisma.exercicioTreino.update({
        where: { id: substituicao.exercicioTreinoId },
        data: {
          exercicioId: substituicao.novoExercicioId,
          carga: novaCarga,
          observacoes: `Versão alternativa (peso corporal)`
        }
      });
    }
  }

  // Buscar treino atualizado
  const treinoAtualizado = await prisma.treino.findUnique({
    where: { id: treinoId },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  return treinoAtualizado;
}