/**
 * EXERCICIO FILTERS SERVICE
 * 
 * Aplica filtros inteligentes em exercícios baseado em:
 * - Local de treino
 * - Dificuldade
 * - Histórico
 * - Lesões e problemas anteriores
 * - Preferências do usuário
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface FiltrosExercicio {
  exerciciosEvitar?: Set<string>;
  lesoes?: string[];
  localTreino?: string;
  dificuldade?: string;
  historico?: Set<string>;
  problemasAnteriores?: string[];
  preferencias?: string[];
}

const MAPEAMENTO_PROBLEMAS: Record<string, string[]> = {
  'Lesão no ombro': ['Supino reto', 'Desenvolvimento', 'Elevação lateral'],
  'Problema de coluna': ['Agachamento livre', 'Levantamento terra', 'Stiff'],
  'Lesão no joelho': ['Agachamento', 'Leg press', 'Afundo'],
  'Problema de lombar': ['Levantamento terra', 'Stiff', 'Good morning'],
};

// ============================================================================
// FILTROS INDIVIDUAIS
// ============================================================================

/**
 * Filtra exercícios por local de treino
 * 
 * Regras:
 * - Academia Comercial: permite todos os equipamentos
 * - Academia Pequena: permite halteres, barras, máquinas básicas e peso corporal
 * - Sem Equipamento: APENAS peso corporal ou sem equipamentos listados
 */
export function filtrarPorLocalTreino(exercicios: any[], localTreino?: string | null): any[] {
  if (!localTreino) return exercicios;

  const localLower = localTreino.toLowerCase().trim();
  
  // Academia comercial: permite todos os equipamentos
  if (localLower.includes('comercial') || localLower === 'academia') {
    return exercicios;
  }

  // Academia Pequena: permite halteres, barras, máquinas básicas e peso corporal
  if (localLower.includes('pequena')) {
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      
      // Se não tem equipamentos listados, permitir (assumir peso corporal)
      if (equipamentos.length === 0) {
        return true;
      }
      
      // Verificar se tem equipamento básico permitido
      return equipamentos.some((eq: string) => {
        const eqLower = eq.toLowerCase().trim();
        return eqLower.includes('halter') || 
               eqLower.includes('dumbbell') ||
               eqLower.includes('barra') ||
               eqLower.includes('peso corporal') ||
               eqLower.includes('corpo') ||
               eqLower.includes('máquina básica') ||
               eqLower.includes('esteira');
      });
    });
  }

  // Sem equipamento: usar campo explícito semEquipamento
  if (localLower.includes('sem equipamento') || localLower.includes('casa') || localLower.includes('domicílio')) {
    return exercicios.filter(ex => {
      // Usar campo explícito semEquipamento se disponível
      if (ex.semEquipamento !== undefined) {
        return ex.semEquipamento === true;
      }
      
      // Fallback para exercícios antigos: verificar se equipamentoNecessario está vazio
      // (mantido para compatibilidade durante migração)
      const equipamentos = ex.equipamentoNecessario || [];
      return equipamentos.length === 0;
    });
  }

  // Customizado: sem filtro (usuário escolhe)
  if (localLower.includes('customizado')) {
    return exercicios;
  }

  return exercicios;
}

/**
 * Filtra exercícios por dificuldade
 */
export function filtrarPorDificuldade(
  exercicios: any[],
  dificuldade?: string
): any[] {
  if (!dificuldade) return exercicios;

  return exercicios.filter(ex => {
    const nivelEx = ex.nivelDificuldade || 'Intermediário';
    
    if (dificuldade === 'Iniciante') {
      return nivelEx === 'Iniciante';
    } else if (dificuldade === 'Intermediário') {
      return nivelEx === 'Iniciante' || nivelEx === 'Intermediário';
    }
    return true; // Avançado aceita todos
  });
}

/**
 * Filtra exercícios por histórico
 */
export function filtrarPorHistorico(
  exercicios: any[],
  historico?: Set<string>
): any[] {
  if (!historico || historico.size === 0) return exercicios;
  return exercicios.filter(ex => !historico.has(ex.id));
}

/**
 * Filtra exercícios por problemas anteriores
 */
export function filtrarPorProblemasAnteriores(
  exercicios: any[],
  problemasAnteriores?: string[]
): any[] {
  if (!problemasAnteriores || problemasAnteriores.length === 0) {
    return exercicios;
  }
  
  const exerciciosEvitar = new Set<string>();
  problemasAnteriores.forEach(problema => {
    const exercicios = MAPEAMENTO_PROBLEMAS[problema] || [];
    exercicios.forEach(ex => exerciciosEvitar.add(ex));
  });
  
  if (exerciciosEvitar.size === 0) return exercicios;
  
  return exercicios.filter(ex => {
    const nomeEx = (ex.nome || '').toLowerCase();
    return !Array.from(exerciciosEvitar).some(evitar => 
      nomeEx.includes(evitar.toLowerCase())
    );
  });
}

/**
 * Aplica preferências do usuário (prioriza exercícios preferidos)
 */
export function aplicarPreferencias(
  exercicios: any[],
  preferencias?: string[]
): any[] {
  if (!preferencias || preferencias.length === 0) return exercicios;
  
  const preferidos: any[] = [];
  const outros: any[] = [];
  
  exercicios.forEach(ex => {
    const nomeEx = (ex.nome || '').toLowerCase();
    const temPreferencia = preferencias.some(pref => 
      nomeEx.includes(pref.toLowerCase())
    );
    
    if (temPreferencia) {
      preferidos.push(ex);
    } else {
      outros.push(ex);
    }
  });
  
  return [...preferidos, ...outros];
}

// ============================================================================
// FILTRO COMPLETO
// ============================================================================

/**
 * Aplica todos os filtros de exercícios
 */
export function aplicarFiltrosExercicios(
  exercicios: any[],
  filtros: FiltrosExercicio
): any[] {
  let filtrados = [...exercicios];
  
  if (filtros.historico) {
    filtrados = filtrarPorHistorico(filtrados, filtros.historico);
  }
  
  if (filtros.exerciciosEvitar) {
    filtrados = filtrados.filter(ex => !filtros.exerciciosEvitar!.has(ex.id));
  }
  
  if (filtros.localTreino) {
    filtrados = filtrarPorLocalTreino(filtrados, filtros.localTreino);
  }
  
  if (filtros.dificuldade) {
    filtrados = filtrarPorDificuldade(filtrados, filtros.dificuldade);
  }
  
  if (filtros.problemasAnteriores) {
    filtrados = filtrarPorProblemasAnteriores(filtrados, filtros.problemasAnteriores);
  }
  
  if (filtros.preferencias) {
    filtrados = aplicarPreferencias(filtrados, filtros.preferencias);
  }
  
  return filtrados;
}

