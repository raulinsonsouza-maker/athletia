/**
 * TREINO CORE SERVICE
 * 
 * Motor centralizado e unificado para geração de treinos inteligentes
 * Orquestra todos os módulos especializados para gerar treinos perfeitos
 * 
 * Este é o único ponto de verdade para toda lógica de geração de treinos
 */

import { prisma } from '../lib/prisma';
import { selecionarExercicioAerobicoDoDia } from './treino.service';
import { obterTodosGruposAtivos, validarEMapearGrupos, normalizarGrupoParaCanonico } from './grupo-muscular.service';
import { obterGruposDoDia, distribuirDiasSemana, NOMES_SPLITS, LETRAS_TREINO, gerarSplitsInteligentes } from './split-generator.service';
import { calcularParametrosTreino, calcularConfiguracaoTempo, calcularTempoEstimado, calcularMaxExerciciosPorTempo } from './treino-parameters.service';
import { FiltrosExercicio } from './exercicio-filters.service';
import { selecionarExerciciosParaGrupos, balancearExerciciosPorGrupo, buscarHistoricoExercicios, selecionar4ExerciciosPorGrupo } from './exercicio-selector.service';
import { aplicarDadosOnboarding, filtrarGruposPorLesoes } from './onboarding-adapter.service';
import { obterGruposCanonicosDoDia } from './canonical-workout-generator.service';
import { validarTreinoCanonico } from './canonical-workout-validator.service';
import { GrupoCanonico } from './muscle-group-canonical.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PerfilCompleto {
  idade?: number | null;
  sexo?: string | null;
  altura?: number | null;
  pesoAtual?: number | null;
  percentualGordura?: number | null;
  tipoCorpo?: string | null;
  experiencia: string | null;
  problemasAnteriores: string[];
  lesoes: string[];
  objetivo: string | null;
  objetivosAdicionais: string[];
  rpePreferido?: number | null;
  frequenciaSemanal: number | null;
  tempoDisponivel?: number | null;
  localTreino?: string | null;
  preferencias: string[];
  aguaDiaria?: string | null;
}

export interface ParametrosTreino {
  series: number;
  repeticoes: string;
  rpe: number;
  descanso: number;
}

export interface ConfiguracaoTempo {
  cardio: number;
  alongamento: number;
  tempoPorExercicio: number;
}

export interface CardioInfo {
  ativo: boolean;
  tipo?: string;
  tempoMinutos?: number;
  intensidade?: 'leve' | 'moderada' | 'alta';
  momento?: 'inicio' | 'final' | 'intercalado';
}

export interface TreinoGerado {
  id: string;
  nome: string;
  data: Date;
  gruposPrincipais: string[];
  totalExercicios: number;
  tempoEstimado: number;
  tipo: string;
  cardio?: CardioInfo;
}

export interface TreinoOptions {
  userId: string;
  data: Date;
  tipo: 'IA' | 'RAPIDO' | 'PERSONALIZADO' | 'MANUAL';
  gruposSelecionados?: string[];
  frequenciaSemanal?: number;
  indiceDia?: number;
  corpoTodo?: boolean;
  focoMuscular?: string[];
  tempoDisponivel?: number;
  duracao?: number;
  dificuldade?: 'Iniciante' | 'Intermediário' | 'Avançado';
  objetivo?: string;
  experiencia?: string;
  localTreino?: string;
  incluirCardio?: boolean;
  incluirAlongamento?: boolean;
  nome?: string;
  letraTreino?: string;
  perfil?: PerfilCompleto;
  aplicarDadosOnboarding?: boolean;
}

// Re-exportar tipos usados por outros serviços
export type { FiltrosExercicio } from './exercicio-filters.service';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

import { normalizarData, obterInicioSemana } from './treino-utils.service';
import { filtrarPorLocalTreino } from './exercicio-filters.service';

/**
 * Valida e filtra exercícios por equipamento de forma centralizada
 * Garante que apenas exercícios compatíveis com o local de treino sejam selecionados
 */
export function validarFiltrosEquipamento(
  exercicios: any[],
  localTreino?: string | null
): any[] {
  if (!localTreino || exercicios.length === 0) {
    return exercicios;
  }
  
  const exerciciosAntes = exercicios.length;
  const exerciciosFiltrados = filtrarPorLocalTreino(exercicios, localTreino);
  const exerciciosDepois = exerciciosFiltrados.length;
  
  if (exerciciosAntes !== exerciciosDepois) {
    console.log(
      `[TREINO-CORE] Filtro de equipamento aplicado: ${exerciciosAntes} → ${exerciciosDepois} exercícios ` +
      `(local: "${localTreino}")`
    );
  }
  
  return exerciciosFiltrados;
}

/**
 * Extrai grupos musculares principais de um treino baseado nos exercícios
 * Filtra Cardio, Alongamento e Flexibilidade
 * Retorna array ordenado de grupos únicos
 */
export function extrairGruposMuscularesDeTreino(treino: any): string[] {
  if (!treino || !treino.exercicios || !Array.isArray(treino.exercicios)) {
    return [];
  }
  
  const grupos = new Set<string>();
  
  treino.exercicios.forEach((exercicioTreino: any) => {
    const exercicio = exercicioTreino.exercicio || exercicioTreino;
    const grupoPrincipal = exercicio?.grupoMuscularPrincipal;
    
    // Filtrar grupos de força (excluir Cardio, Alongamento, Flexibilidade)
    if (grupoPrincipal && 
        grupoPrincipal !== 'Cardio' && 
        grupoPrincipal !== 'Alongamento' && 
        grupoPrincipal !== 'Flexibilidade') {
      grupos.add(grupoPrincipal);
    }
  });
  
  // Retornar array ordenado
  return Array.from(grupos).sort();
}

/**
 * Gera nome de treino baseado em grupos musculares reais
 * Prioriza grupos musculares dos exercícios sobre nomes padrão de splits
 */
function gerarNomeTreino(
  frequencia: number, 
  indiceDia: number, 
  gruposMusculares?: string[]
): string {
  const letra = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
  
  // Se temos grupos musculares reais, usar eles para gerar nome descritivo
  if (gruposMusculares && gruposMusculares.length > 0) {
    // Filtrar apenas grupos de força (excluir Cardio, Alongamento, etc)
    const gruposForca = gruposMusculares.filter(g => 
      !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
    );
    
    if (gruposForca.length > 0) {
      // Limitar a 2-3 grupos principais para nome não ficar muito longo
      const gruposPrincipais = gruposForca.slice(0, 3);
      
      // Formatar nome baseado nos grupos
      if (gruposPrincipais.length === 1) {
        return `Treino ${letra} - ${gruposPrincipais[0]}`;
      } else if (gruposPrincipais.length === 2) {
        return `Treino ${letra} - ${gruposPrincipais[0]} e ${gruposPrincipais[1]}`;
      } else {
        // 3 ou mais grupos: usar os 2 primeiros + "e mais"
        return `Treino ${letra} - ${gruposPrincipais[0]}, ${gruposPrincipais[1]} e mais`;
      }
    }
  }
  
  // Fallback: usar nome padrão do split se grupos não disponíveis
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia % frequencia];
  if (nomeBase) {
    return `Treino ${letra} - ${nomeBase}`;
  }
  
  return `Treino ${letra}`;
}

function calcularMinimoExercicios(grupos: string[]): number {
  return Math.max(4, grupos.length);
}

/**
 * Intercala exercícios de diferentes grupos musculares
 * Permite descanso entre exercícios do mesmo grupo
 * 
 * @param grupos Array de arrays, onde cada sub-array contém exercícios de um grupo
 * @returns Array intercalado de exercícios
 * 
 * Exemplo:
 * grupos = [[ex1, ex2, ex3, ex4], [ex5, ex6, ex7, ex8]]
 * retorna [ex1, ex5, ex2, ex6, ex3, ex7, ex4, ex8]
 */
export function intercalarExerciciosPorGrupo(grupos: any[][]): any[] {
  const resultado: any[] = [];
  const maxLength = Math.max(...grupos.map(g => g.length));
  
  for (let i = 0; i < maxLength; i++) {
    grupos.forEach(grupo => {
      if (i < grupo.length) {
        resultado.push(grupo[i]);
      }
    });
  }
  
  return resultado;
}

// ============================================================================
// DETERMINAÇÃO DE GRUPOS
// ============================================================================

/**
 * Determina grupos para treino baseado nas opções (valida e mapeia para grupos visuais)
 * 
 * NOVO: Usa motor canônico quando possível (tipo IA com frequência definida)
 */
export async function determinarGruposParaTreino(
  options: TreinoOptions,
  perfil?: PerfilCompleto
): Promise<string[]> {
  // Se grupos selecionados explicitamente, normalizar para canônicos
  if (options.gruposSelecionados && options.gruposSelecionados.length > 0) {
    const gruposCanonicos = options.gruposSelecionados
      .map(g => normalizarGrupoParaCanonico(g))
      .filter((g): g is GrupoCanonico => g !== null);
    
    if (gruposCanonicos.length >= 2) {
      // Se tem exatamente 2 grupos canônicos, usar eles
      return gruposCanonicos.slice(0, 2);
    }
    
    // Fallback para validação antiga
    const gruposValidados = await validarEMapearGrupos(options.gruposSelecionados);
    if (gruposValidados.length > 0) {
      return gruposValidados;
    }
    console.warn('[WARN] Nenhum grupo válido encontrado nos selecionados. Usando padrão.');
  }
  
  // Se corpo todo (modo legado - não usa canônico)
  if (options.corpoTodo) {
    const todosGrupos = await obterTodosGruposAtivos();
    const gruposForca = todosGrupos.filter(g => 
      !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
    );
    return gruposForca.length > 0 ? gruposForca : todosGrupos;
  }
  
  // Se foco muscular (modo legado)
  if (options.focoMuscular && options.focoMuscular.length > 0) {
    const gruposValidados = await validarEMapearGrupos(options.focoMuscular);
    if (gruposValidados.length > 0) {
      return gruposValidados;
    }
  }
  
  // MODO CANÔNICO: Se tem frequência e índice do dia (tipo IA), usar motor canônico
  if (options.tipo === 'IA' && options.frequenciaSemanal && options.indiceDia !== undefined) {
    const gruposCanonicos = await obterGruposCanonicosDoDia(
      options.frequenciaSemanal,
      options.indiceDia,
      options.userId,
      options.data
    );
    
    if (gruposCanonicos) {
      return gruposCanonicos;
    }
    // Fallback para split antigo se motor canônico falhar
  }
  
  // Se tem perfil e frequência, usar motor canônico
  if (options.tipo === 'IA' && perfil?.frequenciaSemanal && options.indiceDia !== undefined) {
    const gruposCanonicos = await obterGruposCanonicosDoDia(
      perfil.frequenciaSemanal,
      options.indiceDia,
      options.userId,
      options.data
    );
    
    if (gruposCanonicos) {
      return gruposCanonicos;
    }
  }
  
  // Se tem frequência e índice do dia (modo legado)
  if (options.frequenciaSemanal && options.indiceDia !== undefined) {
    return await obterGruposDoDia(options.frequenciaSemanal, options.indiceDia);
  }
  
  // Se tem perfil, usar frequência do perfil (modo legado)
  if (perfil?.frequenciaSemanal && options.indiceDia !== undefined) {
    return await obterGruposDoDia(perfil.frequenciaSemanal, options.indiceDia);
  }
  
  // Padrão: split 3 dias
  return await obterGruposDoDia(3, 0);
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO DE TREINO
// ============================================================================

/**
 * Gera treino unificado usando toda a lógica centralizada
 * Aplica TODOS os dados do onboarding quando disponível
 */
export async function gerarTreinoUnificado(
  options: TreinoOptions
): Promise<TreinoGerado | null> {
  // Aplicar dados do onboarding se disponível
  let opcoesAjustadas = options;
  if (options.aplicarDadosOnboarding && options.perfil) {
    opcoesAjustadas = aplicarDadosOnboarding(options.perfil, options);
  }
  
  // Obter perfil completo se não foi passado
  let perfil: PerfilCompleto | undefined = opcoesAjustadas.perfil;
  if (!perfil) {
    const perfilDb = await prisma.perfil.findUnique({
      where: { userId: opcoesAjustadas.userId }
    });
    if (perfilDb) {
      perfil = perfilDb as PerfilCompleto;
      opcoesAjustadas.perfil = perfil;
    }
  }
  
  // Determinar grupos musculares
  const grupos = await determinarGruposParaTreino(opcoesAjustadas, perfil);
  
  // Verificar se estamos em modo canônico (exatamente 2 grupos canônicos)
  const gruposCanonicos: (GrupoCanonico | null)[] = grupos.map(g => normalizarGrupoParaCanonico(g));
  const isModoCanonico = gruposCanonicos.length === 2 && 
                         gruposCanonicos.every(g => g !== null) &&
                         opcoesAjustadas.tipo === 'IA';
  
  // Filtrar grupos por lesões
  const lesoes = perfil?.lesoes || opcoesAjustadas.perfil?.lesoes || [];
  const gruposFiltrados = filtrarGruposPorLesoes(grupos, lesoes);
  
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Não é possível gerar treino.`);
    return null;
  }
  
  // Em modo canônico, garantir exatamente 2 grupos
  if (isModoCanonico && gruposFiltrados.length !== 2) {
    console.log(`[WARN] Modo canônico requer exatamente 2 grupos, encontrado ${gruposFiltrados.length}. Ajustando...`);
    // Não ajustar, deixar falhar para evitar treino inválido
    if (gruposFiltrados.length < 2) {
      return null;
    }
    gruposFiltrados.splice(2); // Manter apenas os 2 primeiros
  }
  
  // Calcular parâmetros de treino
  const objetivo = perfil?.objetivo || opcoesAjustadas.objetivo || 'Hipertrofia';
  const experiencia = perfil?.experiencia || opcoesAjustadas.experiencia || 'Intermediário';
  const parametros = calcularParametrosTreino(
    objetivo,
    experiencia,
    perfil?.idade,
    perfil?.sexo,
    perfil?.rpePreferido
  );
  
  // Obter configuração de tempo
  const configTempo = calcularConfiguracaoTempo(objetivo, parametros);
  
  // Calcular número de exercícios
  // Em modo canônico: exatamente 8 exercícios (4 por grupo)
  let maxExercicios: number;
  if (isModoCanonico) {
    maxExercicios = 8; // 4 por grupo, 2 grupos
  } else {
    const minimoExercicios = calcularMinimoExercicios(gruposFiltrados);
    const tempoDisponivel = Math.max(30, Math.min(
      perfil?.tempoDisponivel || opcoesAjustadas.tempoDisponivel || 60,
      120
    ));
    const calculado = calcularMaxExerciciosPorTempo(
      tempoDisponivel,
      configTempo,
      minimoExercicios
    );
    maxExercicios = calculado.maxExercicios;
  }
  
  // Preparar filtros
  const historicoGeral = await buscarHistoricoExercicios(opcoesAjustadas.userId);
  const localTreino = perfil?.localTreino || opcoesAjustadas.localTreino;
  
  // Log de debug para rastrear filtros de equipamento
  if (localTreino) {
    console.log(`[TREINO-CORE] Aplicando filtro de local de treino: "${localTreino}"`);
  }
  
  const filtros: FiltrosExercicio = {
    historico: historicoGeral,
    localTreino: localTreino,
    dificuldade: opcoesAjustadas.dificuldade || experiencia,
    problemasAnteriores: perfil?.problemasAnteriores,
    preferencias: perfil?.preferencias
  };
  
  // Selecionar exercícios (modo canônico vs legado)
  let exerciciosFinais: any[];
  // No modo canônico, manter grupos separados para intercalação
  let exerciciosPorGrupoCanonico: any[][] | null = null;
  
  if (isModoCanonico && gruposFiltrados.length === 2) {
    // MODO CANÔNICO: Selecionar exatamente 4 exercícios por grupo
    const [grupo1, grupo2] = gruposFiltrados;
    const exerciciosJaUsadosNoTreino = new Set<string>();
    
    // Buscar exercícios do grupo 1 (4 exercícios)
    // Passar grupo2 como outroGrupoDoPar para excluir exercícios onde grupo2 é principal
    const exerciciosGrupo1 = await selecionar4ExerciciosPorGrupo(
      grupo1,
      opcoesAjustadas.userId,
      opcoesAjustadas.data,
      exerciciosJaUsadosNoTreino,
      new Set<string>(), // Histórico adicional vazio (função busca internamente)
      filtros,
      grupo2 // Excluir exercícios onde grupo2 é principal
    );
    
    // Adicionar exercícios do grupo 1 aos usados para evitar duplicação no mesmo treino
    exerciciosGrupo1.forEach(ex => exerciciosJaUsadosNoTreino.add(ex.id));
    
    // Buscar exercícios do grupo 2 (4 exercícios)
    // Passar grupo1 como outroGrupoDoPar para excluir exercícios onde grupo1 é principal
    const exerciciosGrupo2 = await selecionar4ExerciciosPorGrupo(
      grupo2,
      opcoesAjustadas.userId,
      opcoesAjustadas.data,
      exerciciosJaUsadosNoTreino,
      new Set<string>(), // Histórico adicional vazio (função busca internamente)
      filtros,
      grupo1 // Excluir exercícios onde grupo1 é principal
    );
    
    // Remover duplicatas de cada grupo individualmente
    const idsJaAdicionados = new Set<string>();
    const exerciciosGrupo1Limpos: any[] = [];
    const exerciciosGrupo2Limpos: any[] = [];
    
    // Limpar grupo1
    for (const ex of exerciciosGrupo1) {
      if (!idsJaAdicionados.has(ex.id)) {
        exerciciosGrupo1Limpos.push(ex);
        idsJaAdicionados.add(ex.id);
      } else {
        console.warn(`[WARN] Exercício duplicado detectado no grupo1: ${ex.id} (${ex.nome || 'sem nome'})`);
      }
    }
    
    // Limpar grupo2
    for (const ex of exerciciosGrupo2) {
      if (!idsJaAdicionados.has(ex.id)) {
        exerciciosGrupo2Limpos.push(ex);
        idsJaAdicionados.add(ex.id);
      } else {
        console.warn(`[WARN] Exercício duplicado detectado no grupo2: ${ex.id} (${ex.nome || 'sem nome'}). Já foi adicionado pelo grupo1.`);
      }
    }
    
    // Se temos menos de 8 devido a duplicatas, tentar buscar mais exercícios para o grupo2
    if (exerciciosGrupo1Limpos.length + exerciciosGrupo2Limpos.length < 8 && exerciciosGrupo2Limpos.length < 4) {
      const faltam = 8 - (exerciciosGrupo1Limpos.length + exerciciosGrupo2Limpos.length);
      console.warn(`[WARN] Tentando buscar mais ${faltam} exercício(s) para completar o treino...`);
      
      // Buscar exercícios adicionais para o grupo2 (já excluindo os já usados)
      const exerciciosAdicionais = await selecionar4ExerciciosPorGrupo(
        grupo2,
        opcoesAjustadas.userId,
        opcoesAjustadas.data,
        idsJaAdicionados, // Usar IDs já adicionados como histórico
        new Set<string>(),
        filtros,
        grupo1
      );
      
      // Adicionar apenas os que faltam
      for (const ex of exerciciosAdicionais.slice(0, faltam)) {
        if (!idsJaAdicionados.has(ex.id) && exerciciosGrupo2Limpos.length < 4) {
          exerciciosGrupo2Limpos.push(ex);
          idsJaAdicionados.add(ex.id);
        }
      }
    }
    
    // Manter grupos separados para intercalação posterior
    exerciciosPorGrupoCanonico = [exerciciosGrupo1Limpos, exerciciosGrupo2Limpos];
    
    // Para compatibilidade com código existente, também criar exerciciosFinais combinado
    exerciciosFinais = [...exerciciosGrupo1Limpos, ...exerciciosGrupo2Limpos];
    
    // Verificação final de integridade
    if (exerciciosFinais.length !== 8) {
      console.warn(
        `[WARN] Treino canônico tem ${exerciciosFinais.length} exercícios ao invés de 8. ` +
        `Grupo1: ${exerciciosGrupo1Limpos.length}, Grupo2: ${exerciciosGrupo2Limpos.length}. ` +
        `Duplicatas removidas: ${exerciciosGrupo1.length + exerciciosGrupo2.length - exerciciosFinais.length}`
      );
    }
  } else {
    // MODO LEGADO: Seleção antiga
    const todosExercicios = await selecionarExerciciosParaGrupos(
      gruposFiltrados,
      maxExercicios,
      filtros,
      opcoesAjustadas.userId,
      opcoesAjustadas.data
    );
    
    if (todosExercicios.length === 0) {
      return null;
    }
    
    // Balancear exercícios
    exerciciosFinais = balancearExerciciosPorGrupo(
      todosExercicios,
      gruposFiltrados,
      maxExercicios
    );
  }
  
  if (exerciciosFinais.length === 0) {
    return null;
  }
  
  // Calcular tempo estimado
  const tempoEstimado = calcularTempoEstimado(exerciciosFinais.length, configTempo);
  
  // Determinar frequência e índice do dia
  const frequencia = perfil?.frequenciaSemanal || opcoesAjustadas.frequenciaSemanal || 3;
  const indiceDia = opcoesAjustadas.indiceDia ?? 0;
  
  // Gerar nome baseado nos grupos musculares reais (se disponível)
  // Usar gruposFiltrados que já foram determinados
  const nomeTreino = opcoesAjustadas.nome || gerarNomeTreino(frequencia, indiceDia, gruposFiltrados);
  const letraTreino = opcoesAjustadas.letraTreino || LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];
  
  // Criar treino no banco
  const treino = await prisma.$transaction(async (tx) => {
    const treinoCriado = await tx.treino.create({
      data: {
        userId: opcoesAjustadas.userId,
        data: normalizarData(opcoesAjustadas.data),
        nome: nomeTreino,
        tipo: opcoesAjustadas.tipo === 'IA' ? 'Treino IA' : opcoesAjustadas.tipo,
        criadoPor: opcoesAjustadas.tipo === 'IA' ? 'IA' : 'USUARIO',
        concluido: false,
        letraTreino,
        tempoEstimado
      }
    });
    
    // Preparar exercícios
    // REGRA DEFINITIVA: Cardio SEMPRE no final, Flexibilidade/Alongamento REMOVIDO completamente
    const exercicioCardio = await selecionarExercicioAerobicoDoDia(opcoesAjustadas.data);
    
    // SEMPRE incluir cardio (padrão), mas pode ser desabilitado explicitamente
    const incluirCardio = opcoesAjustadas.incluirCardio !== false;
    // SEMPRE desabilitar alongamento/flexibilidade
    const incluirAlongamento = false;
    
    // ORDEM UNIFICADA: Exercícios de força primeiro → Cardio no final
    // Aplicar intercalação se temos grupos separados (modo canônico)
    let exerciciosParaTreino: any[];
    if (isModoCanonico && exerciciosPorGrupoCanonico && exerciciosPorGrupoCanonico.length === 2) {
      exerciciosParaTreino = intercalarExerciciosPorGrupo(exerciciosPorGrupoCanonico);
    } else {
      exerciciosParaTreino = exerciciosFinais;
    }
    
    // Construir lista de exercícios: força primeiro, cardio no final
    const todosExerciciosTreino: any[] = [
      // Exercícios de força (ordem 0, 1, 2...)
      ...exerciciosParaTreino.map((exercicio, index) => ({
        treinoId: treinoCriado.id,
        exercicioId: exercicio.id,
        ordem: index, // Começa em 0
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      })),
      // Cardio SEMPRE no final (última ordem)
      ...(incluirCardio ? [{
        treinoId: treinoCriado.id,
        exercicioId: exercicioCardio.id,
        ordem: exerciciosParaTreino.length, // Sempre após todos os exercícios de força
        series: 1,
        repeticoes: `${configTempo.cardio} min`,
        carga: null,
        rpe: 5,
        descanso: 0,
        concluido: false,
        observacoes: `Cardio - ${configTempo.cardio} minutos`
      }] : [])
    ];
    
    // NÃO ADICIONAR ALONGAMENTO/FLEXIBILIDADE - REMOVIDO COMPLETAMENTE
    
    await tx.exercicioTreino.createMany({
      data: todosExerciciosTreino
    });
    
    return treinoCriado;
  });
  
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
  
  if (!treinoCompleto) {
    return null;
  }
  
  // Extrair grupos musculares reais dos exercícios selecionados
  const gruposReais = Array.from(new Set(
    treinoCompleto.exercicios
      .map(ex => ex.exercicio?.grupoMuscularPrincipal)
      .filter((g): g is string => !!g && g !== 'Cardio' && g !== 'Alongamento' && g !== 'Flexibilidade')
  ));
  
  // Atualizar nome do treino se não foi fornecido explicitamente e temos grupos reais
  // Isso garante que o nome sempre reflita os exercícios realmente selecionados
  if (!opcoesAjustadas.nome && gruposReais.length > 0) {
    const nomeAtualizado = gerarNomeTreino(frequencia, indiceDia, gruposReais);
    
    // Atualizar no banco apenas se o nome mudou
    if (nomeAtualizado !== treinoCompleto.nome) {
      await prisma.treino.update({
        where: { id: treinoCompleto.id },
        data: { nome: nomeAtualizado }
      });
      treinoCompleto.nome = nomeAtualizado;
      console.log(`[TREINO-CORE] Nome do treino atualizado: "${nomeAtualizado}" (grupos: ${gruposReais.join(', ')})`);
    }
  }
  
  // Validar treino canônico se aplicável
  if (isModoCanonico && gruposFiltrados.length === 2) {
    // Buscar grupos do dia anterior para validação de descanso
    const dataAnterior = new Date(opcoesAjustadas.data);
    dataAnterior.setDate(dataAnterior.getDate() - 1);
    const treinoAnterior = await prisma.treino.findFirst({
      where: {
        userId: opcoesAjustadas.userId,
        data: normalizarData(dataAnterior),
        criadoPor: 'IA'
      },
      include: {
        exercicios: {
          include: { exercicio: true }
        }
      }
    });
    
    const gruposDiaAnterior = treinoAnterior
      ? Array.from(new Set(
          treinoAnterior.exercicios
            .map(ex => ex.exercicio?.grupoMuscularPrincipal)
            .filter((g): g is string => !!g && g !== 'Cardio' && g !== 'Alongamento')
        ))
      : undefined;
    
    const exercicioCardio = treinoCompleto.exercicios.find(
      ex => ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
    );
    
    const validacao = validarTreinoCanonico({
      gruposPrincipais: gruposFiltrados,
      exercicios: treinoCompleto.exercicios,
      temCardio: !!exercicioCardio,
      posicaoCardio: exercicioCardio?.ordem
    }, gruposDiaAnterior);
    
    // Logar apenas erros críticos (não avisos sobre falta de exercícios)
    const errosCriticos = validacao.erros.filter(erro => 
      !erro.includes('deve ter exatamente 4 exercícios') && 
      !erro.includes('deve ter exatamente 8 exercícios')
    );
    
    if (errosCriticos.length > 0) {
      console.error(`[ERROR] Treino canônico inválido: ${errosCriticos.join('; ')}`);
    }
    
    if (validacao.avisos.length > 0) {
      // Logar avisos apenas se for importante (não sobre quantidade de exercícios se já temos algum)
      const avisosImportantes = validacao.avisos.filter(aviso => 
        !aviso.includes('pode indicar falta de exercícios disponíveis')
      );
      if (avisosImportantes.length > 0) {
        console.warn(`[WARN] Avisos no treino canônico: ${avisosImportantes.join('; ')}`);
      }
    }
  }
  
  // Extrair grupos principais
  const gruposPrincipais = gruposFiltrados.slice(0, isModoCanonico ? 2 : 3);
  
  // Preparar cardio estruturado
  const exercicioCardio = treinoCompleto.exercicios.find(
    ex => ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );
  
  let cardio: CardioInfo = { ativo: false };
  if (exercicioCardio) {
    const tempoMatch = exercicioCardio.repeticoes?.match(/(\d+)/);
    const tempoMinutos = tempoMatch ? parseInt(tempoMatch[1], 10) : configTempo.cardio;
    
    const nomeCardio = exercicioCardio.exercicio?.nome?.toLowerCase() || '';
    let tipo = 'esteira';
    if (nomeCardio.includes('bicicleta')) tipo = 'bicicleta';
    else if (nomeCardio.includes('eliptico') || nomeCardio.includes('elíptico')) tipo = 'eliptico';
    else if (nomeCardio.includes('remada')) tipo = 'remada';
    
    cardio = {
      ativo: true,
      tipo,
      tempoMinutos,
      intensidade: 'moderada',
      momento: 'final' // SEMPRE no final - regra unificada
    };
  }
  
  return {
    id: treino.id,
    nome: treinoCompleto.nome, // Usar nome atualizado (pode ter sido modificado após seleção de exercícios)
    data: treino.data,
    gruposPrincipais,
    totalExercicios: treinoCompleto.exercicios.length,
    tempoEstimado,
    tipo: treino.tipo,
    cardio
  };
}

/**
 * Regenera treinos para 30 dias usando nova lógica
 */
export async function regenerarTreinos30Dias(
  userId: string,
  perfil: PerfilCompleto
): Promise<void> {
  // Apagar treinos IA futuros (não concluídos)
  await prisma.treino.deleteMany({
    where: {
      userId,
      criadoPor: 'IA',
      concluido: false,
      data: { gte: new Date() }
    }
  });
  
  // Calcular dias de treino
  const frequencia = perfil.frequenciaSemanal || 3;
  const diasTreino = distribuirDiasSemana(frequencia);
  
  // Gerar treinos para próximos 30 dias
  const hoje = new Date();
  const treinosGerados: TreinoGerado[] = [];
  
  for (let dia = 0; dia < 30; dia++) {
    const dataTreino = new Date(hoje);
    dataTreino.setDate(hoje.getDate() + dia);
    
    const diaSemana = dataTreino.getDay();
    const diaSemanaNormalizado = diaSemana === 0 ? 7 : diaSemana;
    const indiceDia = diasTreino.indexOf(diaSemanaNormalizado);
    
    // Se é dia de treino
    if (indiceDia !== -1) {
      const treino = await gerarTreinoUnificado({
        userId,
        data: dataTreino,
        tipo: 'IA',
        indiceDia,
        perfil,
        aplicarDadosOnboarding: true
      });
      
      if (treino) {
        treinosGerados.push(treino);
      }
    }
  }
  
  console.log(`[REGENERAÇÃO] ${treinosGerados.length} treinos gerados para usuário ${userId}`);
}

// ============================================================================
// VALIDAÇÃO E CORREÇÃO DE TREINOS
// ============================================================================

/**
 * Valida estrutura de um treino
 * Verifica ordem de exercícios, ausência de flexibilidade, grupos corretos, etc.
 */
export async function validarEstruturaTreino(treino: any): Promise<{
  valido: boolean;
  problemas: string[];
  detalhes: {
    temCardio: boolean;
    cardioNoFinal: boolean;
    temFlexibilidade: boolean;
    quantidadeExerciciosForca: number;
    gruposMusculares: string[];
  };
}> {
  const problemas: string[] = [];
  
  if (!treino || !treino.exercicios || !Array.isArray(treino.exercicios)) {
    return {
      valido: false,
      problemas: ['Treino sem exercícios'],
      detalhes: {
        temCardio: false,
        cardioNoFinal: false,
        temFlexibilidade: false,
        quantidadeExerciciosForca: 0,
        gruposMusculares: []
      }
    };
  }
  
  const exercicios = treino.exercicios.sort((a: any, b: any) => a.ordem - b.ordem);
  const exerciciosForca = exercicios.filter((ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
    return grupo !== 'Cardio' && grupo !== 'Flexibilidade' && grupo !== 'Alongamento';
  });
  
  const exercicioCardio = exercicios.find((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );
  
  const exerciciosFlexibilidade = exercicios.filter((ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
    return grupo === 'Flexibilidade' || grupo === 'Alongamento';
  });
  
  // Validar quantidade mínima de exercícios de força
  if (exerciciosForca.length < 4) {
    problemas.push(`Treino tem apenas ${exerciciosForca.length} exercícios de força (mínimo: 4)`);
  }
  
  // Validar presença de cardio
  const temCardio = !!exercicioCardio;
  if (!temCardio) {
    problemas.push('Treino não possui exercício de cardio');
  }
  
  // Validar posição do cardio (deve estar no final)
  let cardioNoFinal = false;
  if (exercicioCardio) {
    const ultimaOrdem = Math.max(...exercicios.map((ex: any) => ex.ordem));
    cardioNoFinal = exercicioCardio.ordem === ultimaOrdem;
    
    if (!cardioNoFinal) {
      problemas.push(`Cardio está na ordem ${exercicioCardio.ordem}, mas deveria estar na ordem ${ultimaOrdem} (final)`);
    }
  }
  
  // Validar ausência de flexibilidade/alongamento
  const temFlexibilidade = exerciciosFlexibilidade.length > 0;
  if (temFlexibilidade) {
    problemas.push(`Treino possui ${exerciciosFlexibilidade.length} exercício(s) de flexibilidade/alongamento (deve ser removido)`);
  }
  
  // Extrair grupos musculares
  const gruposMusculares: string[] = Array.from(new Set(
    exerciciosForca.map((ex: any) => ex.exercicio?.grupoMuscularPrincipal).filter(Boolean) as string[]
  ));
  
  return {
    valido: problemas.length === 0,
    problemas,
    detalhes: {
      temCardio,
      cardioNoFinal,
      temFlexibilidade,
      quantidadeExerciciosForca: exerciciosForca.length,
      gruposMusculares
    }
  };
}

/**
 * Corrige estrutura de um treino
 * Move cardio para o final, remove flexibilidade, reordena exercícios
 */
export async function corrigirEstruturaTreino(treinoId: string): Promise<{
  corrigido: boolean;
  alteracoes: string[];
}> {
  const alteracoes: string[] = [];
  
  // Buscar treino completo
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
    throw new Error(`Treino ${treinoId} não encontrado`);
  }
  
  // Separar exercícios
  const exerciciosForca = treino.exercicios.filter((ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
    return grupo !== 'Cardio' && grupo !== 'Flexibilidade' && grupo !== 'Alongamento';
  });
  
  const exercicioCardio = treino.exercicios.find((ex: any) => 
    ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );
  
  const exerciciosFlexibilidade = treino.exercicios.filter((ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
    return grupo === 'Flexibilidade' || grupo === 'Alongamento';
  });
  
  // Remover exercícios de flexibilidade/alongamento
  if (exerciciosFlexibilidade.length > 0) {
    await prisma.exercicioTreino.deleteMany({
      where: {
        id: { in: exerciciosFlexibilidade.map((ex: any) => ex.id) }
      }
    });
    alteracoes.push(`Removidos ${exerciciosFlexibilidade.length} exercício(s) de flexibilidade/alongamento`);
  }
  
  // Reordenar exercícios: força primeiro, cardio no final
  let ordem = 0;
  
  // Atualizar ordem dos exercícios de força
  for (const ex of exerciciosForca) {
    await prisma.exercicioTreino.update({
      where: { id: ex.id },
      data: { ordem: ordem++ }
    });
  }
  
  // Mover cardio para o final (se existir)
  if (exercicioCardio) {
    const ordemAnterior = exercicioCardio.ordem;
    await prisma.exercicioTreino.update({
      where: { id: exercicioCardio.id },
      data: { ordem: ordem }
    });
    
    if (ordemAnterior !== ordem) {
      alteracoes.push(`Cardio movido da ordem ${ordemAnterior} para ordem ${ordem} (final)`);
    }
  } else {
    // Se não tem cardio, adicionar no final
    const exercicioCardioNovo = await selecionarExercicioAerobicoDoDia(treino.data);
    const configTempo = calcularConfiguracaoTempo('Hipertrofia', {
      series: 3,
      repeticoes: '8-12',
      rpe: 8,
      descanso: 60
    });
    
    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: exercicioCardioNovo.id,
        ordem: ordem,
        series: 1,
        repeticoes: `${configTempo.cardio} min`,
        carga: null,
        rpe: 5,
        descanso: 0,
        concluido: false,
        observacoes: `Cardio - ${configTempo.cardio} minutos`
      }
    });
    alteracoes.push(`Cardio adicionado no final (ordem ${ordem})`);
  }
  
  return {
    corrigido: alteracoes.length > 0,
    alteracoes
  };
}

// Re-exportar funções usadas por outros serviços (fachada única)
export {
  gerarSplitsInteligentes as obterSplitsPorFrequencia,
  distribuirDiasSemana
} from './split-generator.service';
export { obterInicioSemana } from './treino-utils.service';
