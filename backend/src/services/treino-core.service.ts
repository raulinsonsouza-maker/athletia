/**
 * TREINO CORE SERVICE
 * 
 * Motor centralizado e unificado para geração de treinos inteligentes
 * Orquestra todos os módulos especializados para gerar treinos perfeitos
 * 
 * Este é o único ponto de verdade para toda lógica de geração de treinos
 */

import { prisma } from '../lib/prisma';
import { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } from './treino.service';
import { obterTodosGruposAtivos, validarEMapearGrupos } from './grupo-muscular.service';
import { obterGruposDoDia, distribuirDiasSemana, NOMES_SPLITS, LETRAS_TREINO } from './split-generator.service';
import { calcularParametrosTreino, calcularConfiguracaoTempo, calcularTempoEstimado, calcularMaxExerciciosPorTempo } from './treino-parameters.service';
import { FiltrosExercicio } from './exercicio-filters.service';
import { selecionarExerciciosParaGrupos, balancearExerciciosPorGrupo, buscarHistoricoExercicios } from './exercicio-selector.service';
import { aplicarDadosOnboarding, filtrarGruposPorLesoes } from './onboarding-adapter.service';

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

function gerarNomeTreino(frequencia: number, indiceDia: number): string {
  const letra = LETRAS_TREINO[indiceDia];
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia % frequencia];
  if (nomeBase) {
    return `Treino ${letra} - ${nomeBase}`;
  }
  return `Treino ${letra}`;
}

function calcularMinimoExercicios(grupos: string[]): number {
  return Math.max(4, grupos.length);
}

// ============================================================================
// DETERMINAÇÃO DE GRUPOS
// ============================================================================

/**
 * Determina grupos para treino baseado nas opções (valida e mapeia para grupos visuais)
 */
export async function determinarGruposParaTreino(
  options: TreinoOptions,
  perfil?: PerfilCompleto
): Promise<string[]> {
  // Se grupos selecionados explicitamente
  if (options.gruposSelecionados && options.gruposSelecionados.length > 0) {
    const gruposValidados = await validarEMapearGrupos(options.gruposSelecionados);
    if (gruposValidados.length > 0) {
      return gruposValidados;
    }
    console.warn('[WARN] Nenhum grupo válido encontrado nos selecionados. Usando padrão.');
  }
  
  // Se corpo todo
  if (options.corpoTodo) {
    const todosGrupos = await obterTodosGruposAtivos();
    const gruposForca = todosGrupos.filter(g => 
      !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
    );
    return gruposForca.length > 0 ? gruposForca : todosGrupos;
  }
  
  // Se foco muscular
  if (options.focoMuscular && options.focoMuscular.length > 0) {
    const gruposValidados = await validarEMapearGrupos(options.focoMuscular);
    if (gruposValidados.length > 0) {
      return gruposValidados;
    }
  }
  
  // Se tem frequência e índice do dia, usar split
  if (options.frequenciaSemanal && options.indiceDia !== undefined) {
    return await obterGruposDoDia(options.frequenciaSemanal, options.indiceDia);
  }
  
  // Se tem perfil, usar frequência do perfil
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
  
  // Filtrar grupos por lesões
  const lesoes = perfil?.lesoes || opcoesAjustadas.perfil?.lesoes || [];
  const gruposFiltrados = filtrarGruposPorLesoes(grupos, lesoes);
  
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Não é possível gerar treino.`);
    return null;
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
  const minimoExercicios = calcularMinimoExercicios(gruposFiltrados);
  const tempoDisponivel = Math.max(30, Math.min(
    perfil?.tempoDisponivel || opcoesAjustadas.tempoDisponivel || 60,
    120
  ));
  const { maxExercicios } = calcularMaxExerciciosPorTempo(
    tempoDisponivel,
    configTempo,
    minimoExercicios
  );
  
  // Preparar filtros
  const historicoGeral = await buscarHistoricoExercicios(opcoesAjustadas.userId);
  const filtros: FiltrosExercicio = {
    historico: historicoGeral,
    localTreino: perfil?.localTreino || opcoesAjustadas.localTreino,
    dificuldade: opcoesAjustadas.dificuldade || experiencia,
    problemasAnteriores: perfil?.problemasAnteriores,
    preferencias: perfil?.preferencias
  };
  
  // Selecionar exercícios
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
  const exerciciosFinais = balancearExerciciosPorGrupo(
    todosExercicios,
    gruposFiltrados,
    maxExercicios
  );
  
  // Calcular tempo estimado
  const tempoEstimado = calcularTempoEstimado(exerciciosFinais.length, configTempo);
  
  // Determinar frequência e índice do dia
  const frequencia = perfil?.frequenciaSemanal || opcoesAjustadas.frequenciaSemanal || 3;
  const indiceDia = opcoesAjustadas.indiceDia ?? 0;
  const nomeTreino = opcoesAjustadas.nome || gerarNomeTreino(frequencia, indiceDia);
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
    const exercicioCardio = await selecionarExercicioAerobicoDoDia(opcoesAjustadas.data);
    const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
    
    const incluirCardio = opcoesAjustadas.incluirCardio !== false;
    const incluirAlongamento = opcoesAjustadas.incluirAlongamento !== false;
    
    const todosExerciciosTreino = [
      // Cardio
      ...(incluirCardio ? [{
        treinoId: treinoCriado.id,
        exercicioId: exercicioCardio.id,
        ordem: 0,
        series: 1,
        repeticoes: `${configTempo.cardio} min`,
        carga: null,
        rpe: 5,
        descanso: 0,
        concluido: false,
        observacoes: `Aquecimento cardiovascular - ${configTempo.cardio} minutos`
      }] : []),
      // Exercícios de força
      ...exerciciosFinais.map((exercicio, index) => ({
        treinoId: treinoCriado.id,
        exercicioId: exercicio.id,
        ordem: (incluirCardio ? 1 : 0) + index,
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      })),
      // Alongamento
      ...(incluirAlongamento ? [{
        treinoId: treinoCriado.id,
        exercicioId: exercicioAlongamento.id,
        ordem: (incluirCardio ? 1 : 0) + exerciciosFinais.length,
        series: 1,
        repeticoes: `${configTempo.alongamento} min`,
        carga: null,
        rpe: 3,
        descanso: 0,
        concluido: false,
        observacoes: `Alongamento geral - ${configTempo.alongamento} minutos`
      }] : [])
    ];
    
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
  
  // Extrair grupos principais
  const gruposPrincipais = gruposFiltrados.slice(0, 3);
  
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
      momento: 'inicio'
    };
  }
  
  return {
    id: treino.id,
    nome: nomeTreino,
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

// Re-exportar funções usadas por outros serviços
export { gerarSplitsInteligentes as obterSplitsPorFrequencia } from './split-generator.service';
