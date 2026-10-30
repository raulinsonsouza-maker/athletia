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
  equipamentosDisponiveis?: string[];
  dificuldade?: string;
  historico?: Set<string>;
  problemasAnteriores?: string[];
  preferencias?: string[];
  evitarAltoImpacto?: boolean;
}

function normalizarTexto(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function ehPesoCorporal(nome: string): boolean {
  const texto = normalizarTexto(nome);
  return texto.includes('peso corporal') || texto.includes('corporal') || texto.includes('sem equipamento') || texto === 'corpo';
}

export function somentePesoCorporal(equipamentos?: string[]): boolean {
  return !!equipamentos?.length && equipamentos.every((item) => ehPesoCorporal(item));
}

function nomeExigeAcademia(nome: string): boolean {
  const texto = normalizarTexto(nome || '');
  if (!texto) return false;
  if (
    texto.includes('peso corporal')
    || texto.includes('sem equipamento')
    || texto.includes('no chao')
    || texto.includes('na parede')
    || texto.includes('no solo')
  ) {
    return false;
  }
  return /cabo|polia|maquina|halter|barra|smith|leg press|peck|pulley|banco|anilha|aparelho|crossover|scott|leg curl|remada|supino|rosca|puxada|crucifixo|desenvolvimento|mergulho|cadeira|extensora|flexora/.test(texto);
}

export function temEquipamentoDeAcademia(equipamentos?: string[]): boolean {
  return !!equipamentos?.some((item) => {
    const texto = normalizarTexto(item);
    return !ehPesoCorporal(texto) && !texto.includes('elast');
  });
}

function equipamentoAtendido(necessario: string, disponiveis: string[]): boolean {
  const pedido = normalizarTexto(necessario);
  if (ehPesoCorporal(pedido)) return true;
  return disponiveis.some((disponivel) => {
    const tem = normalizarTexto(disponivel);
    if (ehPesoCorporal(tem)) return false;
    return pedido.includes(tem) || tem.includes(pedido)
      || (tem.includes('halter') && pedido.includes('halter'))
      || (tem.includes('maquina') && (pedido.includes('maquina') || pedido.includes('aparelho')))
      || (tem.includes('elast') && (pedido.includes('elast') || pedido.includes('faixa')))
      || (tem.includes('kettle') && pedido.includes('kettle'))
      || (tem.includes('anilha') && pedido.includes('anilha'))
      || (tem.includes('cabo') && (pedido.includes('cabo') || pedido.includes('polia')))
      || (tem.includes('barra') && pedido.includes('barra'));
  });
}

export function exercicioCompativelComEquipamentos(exercicio: any, disponiveis?: string[]): boolean {
  if (!disponiveis || disponiveis.length === 0) return true;
  const necessarios: string[] = exercicio.equipamentoNecessario || [];
  const corporal = (
    exercicio.semEquipamento === true
    || necessarios.length === 0
    || necessarios.every((item) => ehPesoCorporal(item))
  ) && !nomeExigeAcademia(exercicio.nome || '');
  if (corporal) return true;
  if (!temEquipamentoDeAcademia(disponiveis)) {
    return necessarios.length > 0 && necessarios.every((item) => equipamentoAtendido(item, disponiveis));
  }
  return necessarios.every((item) => equipamentoAtendido(item, disponiveis));
}

export function filtrarPorEquipamentosDisponiveis(exercicios: any[], disponiveis?: string[]): any[] {
  if (!disponiveis || disponiveis.length === 0) return exercicios;
  return exercicios.filter((exercicio) => exercicioCompativelComEquipamentos(exercicio, disponiveis));
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
  if (localLower.includes('customizado') || localLower.includes('misto')) {
    return exercicios;
  }

  return exercicios;
}

function equipamentoBasico(exercicio: any): boolean {
  const itens: string[] = exercicio.equipamentoNecessario || [];
  if (exercicio.semEquipamento === true || itens.length === 0) return true;
  const texto = normalizarTexto(itens.join(' '));
  if (/maquina|cabo|polia|smith|kettle|elastico|faixa/.test(texto)) return false;
  return itens.every((item) => {
    const nome = normalizarTexto(item);
    return ehPesoCorporal(nome) || nome.includes('halter') || nome.includes('barra') || nome.includes('anilha');
  });
}

export function filtrarMistoBasico(exercicios: any[]): any[] {
  return exercicios.filter((exercicio) => equipamentoBasico(exercicio));
}

export function exercicioCabeNoLocal(exercicio: any, localTreino?: string | null, equipamentos?: string[]): boolean {
  const local = (localTreino || '').toLowerCase();
  const temLista = !!equipamentos?.length;
  if (!local || local.includes('academia') || local.includes('comercial')) {
    return exercicioCompativelComEquipamentos(exercicio, equipamentos);
  }
  if (local.includes('misto')) {
    return temLista ? exercicioCompativelComEquipamentos(exercicio, equipamentos) : equipamentoBasico(exercicio);
  }
  if (local.includes('casa') || local.includes('domic')) {
    if (temLista) return exercicioCompativelComEquipamentos(exercicio, equipamentos);
    return exercicio.semEquipamento === true || (exercicio.equipamentoNecessario || []).length === 0;
  }
  return true;
}

const PADROES_LESAO: Record<string, RegExp> = {
  joelho: /agachamento|afundo|leg press|hack|salto|passada|bulgaro/,
  ombro: /desenvolvimento|elevacao lateral|elevacao frontal|supino|remada vertical|mergulho/,
  coluna: /levantamento terra|stiff|bom dia|good morning|remada curvada|hiperextens|agachamento livre/,
  pulso: /rosca|flexao|barra fixa/,
  tornozelo: /panturrilha|salto|polichinelo|corrida|montanhista|escada|afundo/,
};

export function exercicioIncompativelComLesao(nome: string, lesoes?: string[]): boolean {
  if (!nome || !lesoes?.length) return false;
  const texto = normalizarTexto(nome);
  return lesoes.some((lesao) => {
    const chave = normalizarTexto(lesao);
    if (!chave || chave === 'nenhuma' || chave === 'outras') return false;
    const regra = PADROES_LESAO[chave] || Object.entries(PADROES_LESAO).find(([nomeLesao]) => chave.includes(nomeLesao))?.[1];
    return regra ? regra.test(texto) : false;
  });
}

export function ehAltoImpacto(nome: string): boolean {
  return /burpee|polichinelo|salto|jump|montanhista|pliometr/.test(normalizarTexto(nome || ''));
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
 * Frases do onboarding (treino duro, falta de tempo, motivação) não entram
 * nesta lista. Elas ajustam RPE, nível e duração.
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
  
  const local = (filtros.localTreino || '').toLowerCase();
  const temLista = (filtros.equipamentosDisponiveis || []).length > 0;
  if (local.includes('misto') && !temLista) {
    filtrados = filtrarMistoBasico(filtrados);
  } else if (local.includes('casa') && temLista) {
    // A lista do perfil decide o equipamento. Casa sozinha continua só peso corporal.
  } else if (filtros.localTreino) {
    filtrados = filtrarPorLocalTreino(filtrados, filtros.localTreino);
  }

  if (filtros.equipamentosDisponiveis && filtros.equipamentosDisponiveis.length > 0) {
    filtrados = filtrarPorEquipamentosDisponiveis(filtrados, filtros.equipamentosDisponiveis);
  }
  
  if (filtros.dificuldade) {
    filtrados = filtrarPorDificuldade(filtrados, filtros.dificuldade);
  }
  
  if (filtros.lesoes && filtros.lesoes.length > 0) {
    filtrados = filtrados.filter((exercicio) => !exercicioIncompativelComLesao(exercicio.nome || '', filtros.lesoes));
  }

  if (filtros.evitarAltoImpacto) {
    filtrados = filtrados.filter((exercicio) => !ehAltoImpacto(exercicio.nome || ''));
  }

  if (filtros.problemasAnteriores) {
    filtrados = filtrarPorProblemasAnteriores(filtrados, filtros.problemasAnteriores);
  }
  
  if (filtros.preferencias) {
    filtrados = aplicarPreferencias(filtrados, filtros.preferencias);
  }
  
  return filtrados;
}

