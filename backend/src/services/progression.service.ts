import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== Interfaces ==========

export interface EquipmentProfile {
  name: string;
  stepTotal: number; // incremento total (ex: 5kg para barra com 2.5kg por lado)
  singleSide?: boolean;
}

export interface ExerciseState {
  exerciseId: string;
  lastWeight: number | null;
  lastReps: number | null;
  lastRpe: number | null;
  sessionDate: Date;
}

export interface ProgressionDecision {
  action: 'increase' | 'decrease' | 'maintain' | 'progress_by_reps' | 'regress' | 'reduce_volume';
  reason: string;
  nextWeight: number | null;
}

export interface ExerciseCategory {
  category: 'compound' | 'isolation' | 'bodyweight' | 'cardio';
  targetReps: [number, number]; // [lower, upper]
}

export interface UserProfile {
  id: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  goal: string;
  bodyweight: number;
  availabilityDays: number;
}

// ========== Equipamentos Padrão ==========

const DEFAULT_EQUIPMENT_PROFILES: Record<string, EquipmentProfile> = {
  barbell: {
    name: 'barbell',
    stepTotal: 5.0, // 2.5kg por lado = 5kg total
    singleSide: false
  },
  dumbbell: {
    name: 'dumbbell',
    stepTotal: 2.0, // 1kg por halter = 2kg total
    singleSide: false
  },
  kettlebell: {
    name: 'kettlebell',
    stepTotal: 2.0,
    singleSide: true
  },
  machine: {
    name: 'machine',
    stepTotal: 5.0, // Máquinas geralmente têm incrementos de 5kg (mais comum em academias brasileiras)
    singleSide: false
  },
  bodyweight: {
    name: 'bodyweight',
    stepTotal: 0, // sem step - progressão por reps/dificuldade
    singleSide: false
  },
  micro: {
    name: 'micro',
    stepTotal: 1.0, // microplacas de 0.5kg por lado = 1kg total
    singleSide: false
  }
};

// ========== Funções Auxiliares ==========

/**
 * Mapeia uma carga alvo para o incremento viável mais próximo
 * Garante que a carga seja sempre um múltiplo válido do step do equipamento
 */
export function nearestAllowedWeight(target: number, allowedSteps: number[]): number {
  if (!allowedSteps || allowedSteps.length === 0 || target <= 0) {
    return Math.round(target);
  }

  // Escolher o menor step positivo
  const step = Math.min(...allowedSteps.filter(s => s > 0));
  if (step <= 0) {
    return Math.round(target);
  }
  
  // Arredondar para o múltiplo mais próximo (não sempre para cima)
  // Exemplo: 23kg com step 5kg → 20kg ou 25kg? Escolher o mais próximo (25kg)
  // Mas se for 22kg, escolher 20kg (mais próximo)
  const lowerMultiple = Math.floor(target / step) * step;
  const upperMultiple = Math.ceil(target / step) * step;
  
  // Escolher o múltiplo mais próximo
  const nearest = (target - lowerMultiple) < (upperMultiple - target) 
    ? lowerMultiple 
    : upperMultiple;
  
  // Garantir que não seja menor que o step mínimo (exceto se target for 0)
  const finalWeight = target > 0 ? Math.max(nearest, step) : nearest;
  
  return Math.round(finalWeight);
}

/**
 * Arredonda carga para múltiplo de 2.5kg e depois para inteiro
 * (mantido para compatibilidade, mas será substituído por nearestAllowedWeight)
 */
function arredondarCarga(carga: number): number {
  const cargaArredondada = Math.round(carga / 2.5) * 2.5;
  return Math.round(cargaArredondada);
}

/**
 * Mapeia strings de equipamentoNecessario para EquipmentProfile
 */
export function getEquipmentStep(equipamentoNecessario: string[]): EquipmentProfile {
  if (!equipamentoNecessario || equipamentoNecessario.length === 0) {
    return DEFAULT_EQUIPMENT_PROFILES.machine; // fallback
  }

  // Verificar se é peso corporal
  if (equipamentoNecessario.some(eq => 
    eq.toLowerCase().includes('peso corporal') || 
    eq.toLowerCase().includes('corpo') ||
    eq.toLowerCase() === 'peso corporal'
  )) {
    return DEFAULT_EQUIPMENT_PROFILES.bodyweight;
  }

  // Verificar se tem barra
  if (equipamentoNecessario.some(eq => 
    eq.toLowerCase().includes('barra') ||
    eq.toLowerCase().includes('barbell')
  )) {
    return DEFAULT_EQUIPMENT_PROFILES.barbell;
  }

  // Verificar se tem halteres
  if (equipamentoNecessario.some(eq => 
    eq.toLowerCase().includes('halter') ||
    eq.toLowerCase().includes('dumbbell')
  )) {
    return DEFAULT_EQUIPMENT_PROFILES.dumbbell;
  }

  // Verificar se tem kettlebell
  if (equipamentoNecessario.some(eq => 
    eq.toLowerCase().includes('kettlebell') ||
    eq.toLowerCase().includes('kettle')
  )) {
    return DEFAULT_EQUIPMENT_PROFILES.kettlebell;
  }

  // Verificar se tem máquina
  if (equipamentoNecessario.some(eq => 
    eq.toLowerCase().includes('máquina') ||
    eq.toLowerCase().includes('machine') ||
    eq.toLowerCase().includes('aparelho')
  )) {
    return DEFAULT_EQUIPMENT_PROFILES.machine;
  }

  // Fallback para step padrão
  return DEFAULT_EQUIPMENT_PROFILES.machine;
}

/**
 * Determina a categoria do exercício e parseia targetReps
 */
export function getExerciseCategory(
  exercicio: { equipamentoNecessario: string[]; grupoMuscularPrincipal: string },
  repeticoes: string
): ExerciseCategory {
  // Verificar se é peso corporal
  const isBodyweight = exercicio.equipamentoNecessario.some(eq =>
    eq.toLowerCase().includes('peso corporal') ||
    eq.toLowerCase().includes('corpo') ||
    eq.toLowerCase() === 'peso corporal'
  );

  if (isBodyweight) {
    const targetReps = parseRepRange(repeticoes);
    return { category: 'bodyweight', targetReps };
  }

  // Grupos musculares compostos principais
  const compoundGroups = ['Peito', 'Costas', 'Quadríceps', 'Posteriores'];
  const isCompound = compoundGroups.includes(exercicio.grupoMuscularPrincipal);

  const targetReps = parseRepRange(repeticoes);
  
  if (isCompound) {
    return { category: 'compound', targetReps };
  }

  return { category: 'isolation', targetReps };
}

/**
 * Parseia string de repetições (ex: "8-12" ou "10") para [lower, upper]
 */
function parseRepRange(repeticoes: string): [number, number] {
  if (!repeticoes) {
    return [8, 12]; // default
  }

  const parts = repeticoes.split('-').map(s => s.trim());
  
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10);
    if (isNaN(num)) {
      return [8, 12]; // default
    }
    return [num, num]; // faixa fixa
  }

  const lower = parseInt(parts[0], 10);
  const upper = parseInt(parts[1], 10);

  if (isNaN(lower) || isNaN(upper)) {
    return [8, 12]; // default
  }

  return [lower, upper];
}

/**
 * Busca histórico de sessões de um exercício
 */
export async function getExerciseHistory(
  userId: string,
  exercicioId: string,
  limit: number = 4
): Promise<ExerciseState[]> {
  const historico = await prisma.exercicioTreino.findMany({
    where: {
      exercicioId,
      concluido: true,
      treino: {
        userId,
        concluido: true
      }
    },
    orderBy: {
      treino: {
        data: 'desc'
      }
    },
    take: limit,
    include: {
      treino: {
        select: {
          data: true
        }
      }
    }
  });

  return historico.map(et => ({
    exerciseId: et.exercicioId,
    lastWeight: et.carga,
    lastReps: parseRepFromString(et.repeticoes),
    lastRpe: et.rpe,
    sessionDate: et.treino.data
  }));
}

/**
 * Extrai número de reps de uma string (pega o primeiro número ou média se for faixa)
 * Se for uma faixa, retorna o topo (upper) para avaliação de progressão
 */
function parseRepFromString(repeticoes: string): number | null {
  if (!repeticoes) return null;
  
  const parts = repeticoes.split('-').map(s => s.trim());
  const first = parseInt(parts[0], 10);
  
  if (isNaN(first)) return null;
  
  if (parts.length === 1) {
    return first;
  }
  
  const second = parseInt(parts[1], 10);
  if (isNaN(second)) return first;
  
  // Para avaliação de progressão, retornar o topo da faixa
  // (assumindo que o usuário completou o topo se fez todas as reps)
  return second;
}

/**
 * Estima 1RM baseado em carga e repetições usando fórmula de Epley
 * Fórmula: 1RM = peso × (1 + reps/30)
 */
export function estimar1RM(carga: number, repeticoes: number): number {
  if (repeticoes <= 0 || carga <= 0) return carga;
  if (repeticoes === 1) return carga;
  if (repeticoes > 30) return carga; // Para repetições muito altas, considerar como carga máxima
  
  // Fórmula de Epley: 1RM = peso × (1 + reps/30)
  const umRM = carga * (1 + repeticoes / 30);
  return Math.round(umRM);
}

/**
 * Calcula carga baseada em %1RM desejado
 * Base de conhecimento:
 * - Hipertrofia: 60-70% de 1RM
 * - Força: 80-90% de 1RM
 * - Resistência: 50-60% de 1RM
 */
export function calcularCargaPorPercentual1RM(
  umRM: number,
  objetivo: string,
  repeticoes: string
): number {
  // Determinar faixa de %1RM baseado no objetivo
  let percentualMinimo = 0.5;
  let percentualMaximo = 0.7;
  
  if (objetivo === 'Força') {
    percentualMinimo = 0.8;
    percentualMaximo = 0.9;
  } else if (objetivo === 'Hipertrofia') {
    percentualMinimo = 0.6;
    percentualMaximo = 0.7;
  } else if (objetivo === 'Resistência' || objetivo === 'Emagrecimento') {
    percentualMinimo = 0.5;
    percentualMaximo = 0.6;
  }
  
  // Ajustar baseado na faixa de repetições
  const reps = parseRepFromString(repeticoes) || 10;
  if (reps <= 5) {
    // Poucas reps = maior %1RM (força)
    percentualMinimo = Math.max(percentualMinimo, 0.8);
    percentualMaximo = Math.max(percentualMaximo, 0.9);
  } else if (reps >= 15) {
    // Muitas reps = menor %1RM (resistência)
    percentualMinimo = Math.min(percentualMinimo, 0.5);
    percentualMaximo = Math.min(percentualMaximo, 0.6);
  }
  
  // Usar média da faixa
  const percentual = (percentualMinimo + percentualMaximo) / 2;
  const carga = umRM * percentual;
  
  return Math.round(carga);
}

/**
 * Ajusta carga para estar na faixa ideal de %1RM baseado no objetivo
 * Se a carga atual não estiver na faixa, ajusta para o meio da faixa ideal
 */
export function ajustarCargaParaPercentual1RMIdeal(
  cargaAtual: number,
  repeticoes: string,
  objetivo: string,
  equipamentoNecessario: string[]
): number {
  // Estimar 1RM baseado na carga atual e repetições
  const reps = parseRepFromString(repeticoes) || 10;
  const umRM = estimar1RM(cargaAtual, reps);
  
  // Calcular carga ideal baseada em %1RM
  const cargaIdeal = calcularCargaPorPercentual1RM(umRM, objetivo, repeticoes);
  
  // Ajustar para step do equipamento
  const equipment = getEquipmentStep(equipamentoNecessario);
  if (equipment.stepTotal > 0) {
    return nearestAllowedWeight(cargaIdeal, [equipment.stepTotal]);
  }
  
  return Math.round(cargaIdeal);
}

// ========== Engine de Progressão ==========

export class ProgressionEngine {
  private equipmentProfiles: Record<string, EquipmentProfile>;

  constructor(equipmentProfiles?: Record<string, EquipmentProfile>) {
    this.equipmentProfiles = equipmentProfiles || DEFAULT_EQUIPMENT_PROFILES;
  }

  /**
   * Recomenda carga inicial se não houver histórico
   * Ajustado para iniciantes terem cargas menores e mais realistas
   */
  recommendStartingWeight(
    exercicio: { 
      equipamentoNecessario: string[];
      grupoMuscularPrincipal: string;
      cargaInicialSugerida?: number | null;
    },
    user: UserProfile
  ): number | null {
    const category = getExerciseCategory(exercicio, '8-12'); // default rep range
    
    // Se for peso corporal, retornar null
    if (category.category === 'bodyweight') {
      return null;
    }

    // Se tiver carga inicial sugerida, aplicar ajuste baseado no nível
    if (exercicio.cargaInicialSugerida && exercicio.cargaInicialSugerida > 0) {
      const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
      let adjustedCarga = exercicio.cargaInicialSugerida;
      
      // Ajustar carga sugerida baseado no nível do usuário
      if (user.level === 'Iniciante') {
        adjustedCarga = adjustedCarga * 0.3; // Reduzir para 30% para iniciantes
      } else if (user.level === 'Intermediário') {
        adjustedCarga = adjustedCarga * 0.6; // 60% para intermediários
      }
      // Avançado mantém 100%
      
      return nearestAllowedWeight(adjustedCarga, [equipment.stepTotal]);
    }

    // Calcular baseado em heurísticas específicas por equipamento e nível
    const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
    let base: number;

    // Valores base por nível e tipo de equipamento
    if (user.level === 'Iniciante') {
      // Iniciantes: valores menores e mais seguros
      if (equipment.name === 'dumbbell') {
        // Halteres: 1-5kg por haltere (2-10kg total)
        if (category.category === 'isolation') {
          // Isolamento: 1-3kg por haltere (2-6kg total)
          base = 4; // 2kg por haltere = 4kg total
        } else {
          // Composto: 2-5kg por haltere (4-10kg total)
          base = 6; // 3kg por haltere = 6kg total
        }
      } else if (equipment.name === 'barbell') {
        // Barra: 5-15kg total (barra vazia + pequenas placas)
        base = 10; // Barra vazia (20kg) seria muito, então sugerir 10kg de placas
      } else if (equipment.name === 'machine') {
        // Máquinas: 5-15kg
        base = 10;
      } else {
        // Outros equipamentos: valores conservadores
        base = 5;
      }
    } else if (user.level === 'Intermediário') {
      // Intermediários: valores médios
      if (equipment.name === 'dumbbell') {
        if (category.category === 'isolation') {
          base = user.bodyweight * 0.08; // 8% do peso corporal
        } else {
          base = user.bodyweight * 0.15; // 15% do peso corporal
        }
      } else if (equipment.name === 'barbell') {
        base = user.bodyweight * 0.4; // 40% do peso corporal
      } else if (equipment.name === 'machine') {
        base = user.bodyweight * 0.3; // 30% do peso corporal
      } else {
        base = user.bodyweight * 0.2;
      }
    } else {
      // Avançados: valores altos (lógica original)
      const multiplier = 1.0;
      if (category.category === 'compound') {
        base = user.bodyweight * multiplier;
      } else if (category.category === 'isolation') {
        base = Math.max(5.0, user.bodyweight * 0.1);
      } else {
        base = user.bodyweight * 0.2;
      }
    }

    // Garantir valores mínimos por equipamento
    if (equipment.name === 'dumbbell') {
      base = Math.max(2, base); // Mínimo 2kg total (1kg por haltere)
    } else if (equipment.name === 'barbell') {
      base = Math.max(5, base); // Mínimo 5kg
    } else if (equipment.name === 'machine') {
      base = Math.max(5, base); // Mínimo 5kg
    }

    // Mapear para step do equipamento
    if (equipment.stepTotal > 0) {
      return nearestAllowedWeight(base, [equipment.stepTotal]);
    }

    return Math.round(base);
  }

  /**
   * Avalia progressão e decide se aumentar, diminuir ou manter carga
   */
  async evaluateProgression(
    exercicio: {
      id: string;
      equipamentoNecessario: string[];
      grupoMuscularPrincipal: string;
    },
    userId: string,
    currentReps: number,
    currentWeight: number | null,
    currentRpe: number | null,
    repeticoes: string
  ): Promise<ProgressionDecision> {
    const category = getExerciseCategory(exercicio, repeticoes);
    const [lower, upper] = category.targetReps;

    // Buscar histórico
    const history = await getExerciseHistory(userId, exercicio.id, 2);
    
    if (history.length === 0) {
      // Sem histórico - manter ou usar carga inicial
      return {
        action: 'maintain',
        reason: 'Sem histórico suficiente para avaliar progressão',
        nextWeight: currentWeight
      };
    }

    const lastState = history[0];
    const secondLastState = history.length > 1 ? history[1] : null;

    // Se for peso corporal
    if (category.category === 'bodyweight') {
      if (currentReps >= upper) {
        return {
          action: 'progress_by_reps',
          reason: `Fez ${currentReps} >= topo da faixa (${upper}). Sugerir variação mais difícil ou adicionar carga.`,
          nextWeight: null
        };
      } else if (currentReps < lower) {
        return {
          action: 'regress',
          reason: `Fez ${currentReps} < mínimo (${lower}). Sugerir regressão ou reduzir volume.`,
          nextWeight: null
        };
      } else {
        return {
          action: 'maintain',
          reason: 'Manter e trabalhar forma/tempo.',
          nextWeight: null
        };
      }
    }

    // Para exercícios com peso
    const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
    const step = equipment.stepTotal;

    // Regra: 2 sessões consecutivas com reps >= upper → aumentar
    if (currentReps >= upper && lastState.lastReps !== null && lastState.lastReps >= upper) {
      if (secondLastState && secondLastState.lastReps !== null && secondLastState.lastReps >= upper) {
        // 2 sessões seguidas confirmadas
        const target = (currentWeight || lastState.lastWeight || 0) + step;
        const nextWeight = step > 0 ? nearestAllowedWeight(target, [step]) : target;
        
        return {
          action: 'increase',
          reason: `2 sessões consecutivas com reps >= ${upper}: aumentar ${step}kg (total).`,
          nextWeight
        };
      } else {
        // Primeira vez no topo - manter e observar
        return {
          action: 'maintain',
          reason: `Primeira sessão no topo da faixa. Manter e confirmar na próxima sessão.`,
          nextWeight: currentWeight
        };
      }
    }

    // Regra: 2 sessões consecutivas com reps < lower → reduzir
    if (currentReps < lower && lastState.lastReps !== null && lastState.lastReps < lower) {
      if (secondLastState && secondLastState.lastReps !== null && secondLastState.lastReps < lower) {
        // 2 sessões seguidas abaixo do mínimo
        const lastWeight = currentWeight || lastState.lastWeight || 0;
        const target = Math.max(0, lastWeight - step);
        const nextWeight = step > 0 ? nearestAllowedWeight(target, [step]) : target;
        
        return {
          action: 'decrease',
          reason: `2 sessões consecutivas com reps < ${lower}: reduzir ${step}kg (total) ou reavaliar técnica.`,
          nextWeight
        };
      }
    }

    // Regra: RPE muito alto (>= 9) → reduzir
    if (currentRpe !== null && currentRpe >= 9) {
      const lastWeight = currentWeight || lastState.lastWeight || 0;
      const target = Math.max(0, lastWeight - step);
      const nextWeight = step > 0 ? nearestAllowedWeight(target, [step]) : lastWeight;
      
      return {
        action: 'decrease',
        reason: `Alto RPE (${currentRpe}). Sugerir reduzir ${step}kg ou 1 step.`,
        nextWeight
      };
    }

    // Caso padrão: manter
    return {
      action: 'maintain',
      reason: 'Manter carga; observar próxima sessão para confirmar progressão.',
      nextWeight: currentWeight
    };
  }

  /**
   * Calcula carga recomendada para uma sessão baseada no histórico
   * Garante que a carga seja sempre um múltiplo válido do step do equipamento
   */
  async calculateRecommendedWeight(
    exercicio: {
      id: string;
      equipamentoNecessario: string[];
      grupoMuscularPrincipal: string;
      cargaInicialSugerida?: number | null;
    },
    userId: string,
    userProfile: UserProfile,
    repeticoes: string
  ): Promise<number | null> {
    const history = await getExerciseHistory(userId, exercicio.id, 1);
    
    // Se não tem histórico, usar carga inicial
    if (history.length === 0 || !history[0].lastWeight) {
      const startingWeight = this.recommendStartingWeight(exercicio, userProfile);
      // Garantir validação final mesmo para carga inicial
      if (startingWeight !== null && startingWeight > 0) {
        const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
        if (equipment.stepTotal > 0) {
          return nearestAllowedWeight(startingWeight, [equipment.stepTotal]);
        }
        return Math.round(startingWeight);
      }
      return startingWeight;
    }

    // Usar última carga como base, mas validar primeiro
    const lastWeight = history[0].lastWeight;
    if (lastWeight === null || lastWeight <= 0) {
      return this.recommendStartingWeight(exercicio, userProfile);
    }

    // Ajustar carga para faixa ideal de %1RM baseado no objetivo
    // Base de conhecimento: Hipertrofia 60-70%, Força 80-90%, Resistência 50-60%
    let cargaAjustada = lastWeight;
    
    // Se temos histórico com repetições, podemos estimar 1RM e ajustar
    if (history[0].lastReps && history[0].lastReps > 0) {
      try {
        cargaAjustada = ajustarCargaParaPercentual1RMIdeal(
          lastWeight,
          repeticoes,
          userProfile.goal || 'Hipertrofia',
          exercicio.equipamentoNecessario
        );
      } catch (error) {
        // Se houver erro no cálculo, usar carga original
        console.warn('Erro ao ajustar carga por %1RM, usando carga original:', error);
        cargaAjustada = lastWeight;
      }
    }

    const equipment = getEquipmentStep(exercicio.equipamentoNecessario);
    
    // Mapear para step do equipamento e garantir que seja válido
    if (equipment.stepTotal > 0) {
      return nearestAllowedWeight(cargaAjustada, [equipment.stepTotal]);
    }

    return Math.round(cargaAjustada);
  }
}

// ========== Exportar instância padrão ==========

export const progressionEngine = new ProgressionEngine();

