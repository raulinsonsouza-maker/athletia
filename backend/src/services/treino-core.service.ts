/**
 * SERVIÇO CORE DE TREINOS
 * 
 * Este é o único ponto de entrada para toda a lógica de treinos.
 * Toda criação, geração e gerenciamento de treinos deve passar por aqui.
 * 
 * Arquitetura:
 * - Este serviço orquestra todas as operações
 * - workout-intelligence.service.ts é usado para todas as decisões inteligentes
 * - Outros serviços são usados apenas como helpers auxiliares
 */

import { prisma } from '../lib/prisma';
import * as workoutIntelligence from './workout-intelligence.service';
import { buscarTemplateAdequado, adaptarTemplate } from './template.service';
import { 
  buscarOuCriarExercicioAerobico, 
  buscarOuCriarExercicioAlongamento, 
  selecionarExercicioAerobicoDoDia 
} from './treino.service';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface ExercicioTreinoInput {
  exercicioId: string;
  ordem: number;
  series: number;
  repeticoes: string;
  carga?: number | null;
  rpe?: number | null;
  descanso?: number | null;
  observacoes?: string;
}

export interface CriarTreinoInput {
  userId: string;
  data: Date;
  nome: string;
  exercicios: ExercicioTreinoInput[];
  tipo?: string;
  letraTreino?: string;
  criadoPor?: 'IA' | 'USUARIO' | 'TEMPLATE' | 'RECORRENTE';
  diaSemana?: number;
  recorrente?: boolean;
}

export interface GerarTreinoIAResult {
  treinos: any[];
  removidos: number;
  mensagem: string;
}

export interface AplicarTemplateResult {
  treino: any;
  mensagem: string;
}

export interface AplicarRecorrenteResult {
  treino: any;
  mensagem: string;
}

// ============================================================================
// FUNÇÕES AUXILIARES INTERNAS
// ============================================================================

/**
 * Normaliza data para início do dia (UTC)
 */
function normalizarData(data: Date | string): Date {
  let dataTreino: Date;
  if (typeof data === 'string') {
    dataTreino = new Date(data + 'T00:00:00.000Z');
  } else {
    dataTreino = new Date(data);
  }
  dataTreino.setUTCHours(0, 0, 0, 0);
  return dataTreino;
}

/**
 * Remove treinos existentes para uma data específica
 */
async function removerTreinosPorData(userId: string, data: Date): Promise<number> {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const treinosParaRemover = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioDia,
        lte: fimDia
      }
    },
    select: { id: true }
  });

  if (treinosParaRemover.length > 0) {
    await prisma.treino.deleteMany({
      where: {
        userId,
        id: {
          in: treinosParaRemover.map(t => t.id)
        }
      }
    });
    console.log(`✅ [CORE] ${treinosParaRemover.length} treino(s) removido(s) para ${data.toLocaleDateString('pt-BR')}`);
  }

  return treinosParaRemover.length;
}

/**
 * Remove treinos existentes para um período
 */
async function removerTreinosPorPeriodo(
  userId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<number> {
  const inicio = new Date(dataInicio);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(dataFim);
  fim.setHours(23, 59, 59, 999);

  const treinosParaRemover = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicio,
        lte: fim
      }
    },
    select: { id: true }
  });

  if (treinosParaRemover.length > 0) {
    await prisma.treino.deleteMany({
      where: {
        userId,
        id: {
          in: treinosParaRemover.map(t => t.id)
        }
      }
    });
    console.log(`✅ [CORE] ${treinosParaRemover.length} treino(s) removido(s) para o período ${inicio.toLocaleDateString('pt-BR')} até ${fim.toLocaleDateString('pt-BR')}`);
  }

  return treinosParaRemover.length;
}

/**
 * Calcula período da semana (domingo a sábado)
 */
function calcularPeriodoSemana(data: Date = new Date()): { inicio: Date; fim: Date } {
  const hoje = new Date(data);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
  inicioSemana.setHours(0, 0, 0, 0);
  
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
  fimSemana.setHours(23, 59, 59, 999);

  return { inicio: inicioSemana, fim: fimSemana };
}

/**
 * Calcula tempo estimado do treino
 */
function calcularTempoEstimado(exercicios: ExercicioTreinoInput[]): number {
  let tempoTotal = 0;
  
  for (const ex of exercicios) {
    const tempoPorSerie = 30 + (ex.descanso || 90); // 30s execução + descanso
    const tempoExercicio = ex.series * tempoPorSerie;
    tempoTotal += tempoExercicio;
  }
  
  return Math.ceil(tempoTotal / 60) + 5; // Converter para minutos + 5min aquecimento
}

/**
 * Busca perfil do usuário e valida
 */
async function buscarEValidarPerfil(userId: string) {
  const perfil = await prisma.perfil.findUnique({
    where: { userId }
  });

  if (!perfil) {
    throw new Error('Perfil não encontrado. Complete o onboarding primeiro.');
  }

  // Validar dados mínimos
  if (!perfil.objetivo || !perfil.experiencia || !perfil.frequenciaSemanal) {
    throw new Error('Perfil incompleto. Verifique objetivo, experiência e frequência semanal.');
  }

  return perfil;
}

/**
 * Cria treino no banco de dados com exercícios
 */
async function criarTreinoCompleto(input: CriarTreinoInput): Promise<any> {
  const tempoEstimado = calcularTempoEstimado(input.exercicios);

  // Criar treino
  const treino = await prisma.treino.create({
    data: {
      userId: input.userId,
      data: normalizarData(input.data),
      tipo: input.tipo || input.nome,
      nome: input.nome,
      criadoPor: input.criadoPor || 'USUARIO',
      tempoEstimado,
      concluido: false,
      diaSemana: input.diaSemana || null,
      recorrente: input.recorrente || false,
      letraTreino: input.letraTreino || null
    }
  });

  // Criar exercícios do treino
  for (const ex of input.exercicios) {
    await prisma.exercicioTreino.create({
      data: {
        treinoId: treino.id,
        exercicioId: ex.exercicioId,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        carga: ex.carga || null,
        rpe: ex.rpe || null,
        descanso: ex.descanso || null,
        observacoes: ex.observacoes || undefined,
        concluido: false
      }
    });
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

// ============================================================================
// GERAÇÃO AUTOMÁTICA COM IA
// ============================================================================

/**
 * Gera treino do dia usando inteligência artificial
 * Tenta usar templates primeiro, depois método ABC
 */
async function gerarTreinoDiaComIA(userId: string, data: Date): Promise<any> {
  console.log(`🔄 [CORE] Gerando treino do dia com IA para ${data.toLocaleDateString('pt-BR')}...`);

  const perfil = await buscarEValidarPerfil(userId);

  // 1. Tentar usar template pré-definido primeiro
  try {
    if (!perfil.objetivo || !perfil.experiencia) {
      throw new Error('Perfil incompleto. Objetivo e experiência são obrigatórios.');
    }
    
    const template = await buscarTemplateAdequado(
      perfil.objetivo,
      perfil.experiencia,
      perfil.frequenciaSemanal,
      data
    );

    if (template && template.exercicios && template.exercicios.length > 0) {
      console.log(`✅ [CORE] Template encontrado, adaptando...`);
      
      // Adaptar template ao perfil usando inteligência
      const exerciciosAdaptados = await adaptarTemplate(
        template,
        perfil.lesoes || [],
        perfil.equipamentos || [],
        perfil.pesoAtual || undefined,
        perfil.experiencia || undefined
      );

      if (exerciciosAdaptados && exerciciosAdaptados.length > 0) {
        // Criar treino do template usando inteligência para cargas
        const exerciciosTreino: ExercicioTreinoInput[] = [];
        
        // Adicionar cardio primeiro
        const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
        exerciciosTreino.push({
          exercicioId: exercicioCardio.id,
          ordem: 0,
          series: 1,
          repeticoes: '20-30 min',
          carga: null,
          rpe: 5,
          descanso: 0,
          observacoes: 'Exercício aeróbico - ritmo moderado'
        });

        // Adicionar exercícios adaptados
        let ordem = 1;
        for (const ex of exerciciosAdaptados) {
          // Calcular carga usando inteligência
          const carga = await workoutIntelligence.calcularCargaExercicio(
            userId,
            ex.exercicioId,
            perfil.pesoAtual || 70,
            ex.exercicio?.grupoMuscularPrincipal || '',
            perfil.experiencia || 'Iniciante',
            ex.repeticoes || '8-12',
            perfil.objetivo || 'Hipertrofia'
          );

          exerciciosTreino.push({
            exercicioId: ex.exercicioId,
            ordem: ordem++,
            series: ex.series,
            repeticoes: ex.repeticoes,
            carga: carga,
            rpe: ex.rpe,
            descanso: ex.descanso,
            observacoes: ex.observacoes
          });
        }

        // Adicionar alongamento
        const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
        exerciciosTreino.push({
          exercicioId: exercicioAlongamento.id,
          ordem: ordem,
          series: 1,
          repeticoes: '10-15 min',
          carga: null,
          rpe: 3,
          descanso: 0,
          observacoes: 'Alongamento final'
        });

        // Ordenar exercícios usando inteligência (antes de validar)
        const exerciciosOrdenados = workoutIntelligence.ordenarExerciciosPorPrioridade(
          exerciciosAdaptados,
          perfil.objetivo || 'Hipertrofia'
        );

        // Reorganizar exerciciosTreino conforme ordenação inteligente
        const exerciciosTreinoOrdenados: ExercicioTreinoInput[] = [];
        
        // Cardio primeiro (ordem 0) - sempre o primeiro item
        exerciciosTreinoOrdenados.push({
          ...exerciciosTreino[0],
          ordem: 0
        });
        
        // Criar mapa de exercícios para busca rápida
        const exerciciosMap = new Map<string, ExercicioTreinoInput>();
        for (let i = 1; i < exerciciosTreino.length - 1; i++) {
          const ex = exerciciosTreino[i];
          exerciciosMap.set(ex.exercicioId, ex);
        }
        
        // Reordenar exercícios de força conforme ordem inteligente
        let ordemForca = 1;
        for (const exOrdenado of exerciciosOrdenados) {
          // Buscar exercício correspondente pelo ID
          const exId = exOrdenado.exercicioId || exOrdenado.id;
          const exTreino = exerciciosMap.get(exId);
          
          if (exTreino) {
            exerciciosTreinoOrdenados.push({
              ...exTreino,
              ordem: ordemForca++
            });
            exerciciosMap.delete(exId); // Remover para evitar duplicatas
          }
        }
        
        // Incluir exercícios que não foram ordenados (caso falte algum)
        for (const [, exTreino] of exerciciosMap) {
          exerciciosTreinoOrdenados.push({
            ...exTreino,
            ordem: ordemForca++
          });
        }
        
        // Alongamento por último
        const ultimoIndex = exerciciosTreino.length - 1;
        exerciciosTreinoOrdenados.push({
          ...exerciciosTreino[ultimoIndex],
          ordem: ordemForca
        });

        // Validar treino usando inteligência
        const validacao = workoutIntelligence.validarTreinoCompleto(
          exerciciosOrdenados,
          exerciciosTreinoOrdenados[1]?.series || 3
        );

        if (!validacao.valido && validacao.erros.length > 0) {
          console.warn(`⚠️ [CORE] Validação encontrou problemas:`, validacao.erros);
        }

        // Criar treino com exercícios ordenados
        const treino = await criarTreinoCompleto({
          userId,
          data,
          nome: template.nome || `Treino ${template.divisaoTreino}`,
          exercicios: exerciciosTreinoOrdenados,
          tipo: template.divisaoTreino,
          criadoPor: 'IA'
        });

        console.log(`✅ [CORE] Treino criado a partir do template!`);
        return treino;
      }
    }
  } catch (error) {
    console.error(`⚠️ [CORE] Erro ao usar template, usando método ABC:`, error);
  }

  // 2. Fallback: Usar método ABC com inteligência
  console.log(`📋 [CORE] Usando método ABC com inteligência...`);
  return await gerarTreinoABCComIntelligence(userId, data, perfil);
}

/**
 * Gera treino usando método ABC com inteligência
 */
async function gerarTreinoABCComIntelligence(
  userId: string,
  data: Date,
  perfil: any
): Promise<any> {
  // Determinar divisão e tipo de treino
  const divisao = determinarDivisaoTreino(perfil.frequenciaSemanal || 3);
  
  // Calcular ciclo baseado em treinos existentes
  const treinosExistentes = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    orderBy: { data: 'desc' },
    take: 30
  });
  const ciclo = treinosExistentes.length;
  const tipoTreino = determinarTipoTreinoABC(divisao, ciclo);

  // Determinar grupos musculares do dia
  const gruposDoDia = determinarGruposMuscularesDoDia(
    perfil.experiencia || 'Iniciante',
    perfil.frequenciaSemanal || 3,
    data
  );

  // Filtrar grupos por lesões
  const gruposPermitidos = filtrarGruposPorLesoes(gruposDoDia, perfil.lesoes || []);

  if (gruposPermitidos.length === 0) {
    throw new Error('Não é possível gerar treino devido às limitações físicas. Consulte um profissional.');
  }

  // Selecionar exercícios usando inteligência
  const exerciciosForca: any[] = [];
  const exerciciosJaSelecionados: any[] = [];

  for (const grupoMuscular of gruposPermitidos) {
    // Selecionar exercício principal usando inteligência
    const exercicioPrincipal = await workoutIntelligence.selecionarExercicioPrincipal(
      grupoMuscular,
      perfil,
      perfil.objetivo,
      perfil.experiencia,
      ciclo,
      exerciciosJaSelecionados
    );

    if (exercicioPrincipal) {
      exerciciosForca.push(exercicioPrincipal);
      exerciciosJaSelecionados.push(exercicioPrincipal);

      // Selecionar exercício acessório se necessário
      if (perfil.objetivo === 'Hipertrofia' && exerciciosForca.length < 6) {
        const exercicioAcessorio = await workoutIntelligence.selecionarExercicioAcessorio(
          grupoMuscular,
          exercicioPrincipal,
          perfil,
          exerciciosJaSelecionados
        );

        if (exercicioAcessorio) {
          exerciciosForca.push(exercicioAcessorio);
          exerciciosJaSelecionados.push(exercicioAcessorio);
        }
      }
    }
  }

  if (exerciciosForca.length === 0) {
    throw new Error('Nenhum exercício encontrado para os grupos musculares selecionados.');
  }

  // Ordenar exercícios usando inteligência (compostos antes de isolados)
  const exerciciosOrdenados = workoutIntelligence.ordenarExerciciosPorPrioridade(
    exerciciosForca,
    perfil.objetivo
  );

  // Evitar redundâncias
  const exerciciosFinais = workoutIntelligence.evitarRedundancia(exerciciosOrdenados, 0.7);

  // Calcular parâmetros usando inteligência
  const { series, repeticoes, rpe, descanso } = workoutIntelligence.calcularParametrosTreino(
    perfil.objetivo,
    perfil.experiencia,
    perfil.rpePreferido
  );

  // Validar treino usando inteligência
  const validacao = workoutIntelligence.validarTreinoCompleto(exerciciosFinais, series);
  if (!validacao.valido && validacao.erros.length > 0) {
    console.warn(`⚠️ [CORE] Validação encontrou problemas:`, validacao.erros);
  }

  // Preparar exercícios para criação
  const exerciciosTreino: ExercicioTreinoInput[] = [];

  // Adicionar cardio primeiro
  const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
  exerciciosTreino.push({
    exercicioId: exercicioCardio.id,
    ordem: 0,
    series: 1,
    repeticoes: '20-30 min',
    carga: null,
    rpe: 5,
    descanso: 0,
    observacoes: 'Exercício aeróbico - ritmo moderado'
  });

  // Adicionar exercícios de força com cargas calculadas pela inteligência
  let ordem = 1;
  for (const exercicio of exerciciosFinais) {
    const carga = await workoutIntelligence.calcularCargaExercicio(
      userId,
      exercicio.id,
      perfil.pesoAtual || 70,
      exercicio.grupoMuscularPrincipal,
      perfil.experiencia,
      repeticoes,
      perfil.objetivo
    );

    exerciciosTreino.push({
      exercicioId: exercicio.id,
      ordem: ordem++,
      series,
      repeticoes,
      carga,
      rpe,
      descanso,
      observacoes: undefined
    });
  }

  // Adicionar alongamento
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
  exerciciosTreino.push({
    exercicioId: exercicioAlongamento.id,
    ordem: ordem,
    series: 1,
    repeticoes: '10-15 min',
    carga: null,
    rpe: 3,
    descanso: 0,
    observacoes: 'Alongamento final'
  });

  // Criar treino
  const treino = await criarTreinoCompleto({
    userId,
    data,
    nome: `Treino ${tipoTreino}`,
    exercicios: exerciciosTreino,
    tipo: tipoTreino,
    letraTreino: tipoTreino,
    criadoPor: 'IA'
  });

  console.log(`✅ [CORE] Treino ABC gerado com inteligência!`);
  return treino;
}

// ============================================================================
// FUNÇÕES DE APOIO (determinação de divisão, grupos, etc)
// ============================================================================

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
  return 'A-B-C'; // Padrão
}

/**
 * Determina tipo de treino ABC baseado na divisão e ciclo
 */
function determinarTipoTreinoABC(divisao: string, ciclo: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (divisao === 'A') return 'A';
  if (divisao === 'A-B') {
    return ciclo % 2 === 0 ? 'A' : 'B';
  }
  if (divisao === 'A-B-C') {
    const cicloMod = ciclo % 3;
    return cicloMod === 0 ? 'A' : cicloMod === 1 ? 'B' : 'C';
  }
  if (divisao === 'A-B-C-D') {
    const cicloMod = ciclo % 4;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    return 'D';
  }
  if (divisao === 'A-B-C-D-E') {
    const cicloMod = ciclo % 5;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    if (cicloMod === 3) return 'D';
    return 'E';
  }
  if (divisao === 'A-B-C-D-E-F') {
    const cicloMod = ciclo % 6;
    if (cicloMod === 0) return 'A';
    if (cicloMod === 1) return 'B';
    if (cicloMod === 2) return 'C';
    if (cicloMod === 3) return 'D';
    if (cicloMod === 4) return 'E';
    return 'F';
  }
  // Padrão A-B-C
  const cicloMod = ciclo % 3;
  return cicloMod === 0 ? 'A' : cicloMod === 1 ? 'B' : 'C';
}

/**
 * Determina grupos musculares do dia baseado na experiência e frequência
 * Usa lógica similar ao treino.service.ts mas simplificada
 */
function determinarGruposMuscularesDoDia(
  experiencia: string,
  frequenciaSemanal: number,
  data: Date
): string[] {
  let diaSemana = data.getDay(); // 0=domingo, 1=segunda, etc.
  
  // Ajustar domingo (0) para 7 para facilitar cálculos
  if (diaSemana === 0) diaSemana = 7;

  // Iniciantes: Full Body ou A-B
  if (experiencia === 'Iniciante') {
    if (frequenciaSemanal <= 2) {
      return ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas'];
    }
    // A-B: alterna entre superior e inferior
    const ciclo = Math.floor((diaSemana - 1) / 2) % 2;
    return ciclo === 0
      ? ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps']
      : ['Quadríceps', 'Posteriores', 'Panturrilhas'];
  }

  // Intermediários: A-B-C
  if (experiencia === 'Intermediário') {
    const ciclo = (diaSemana - 1) % 3;
    if (ciclo === 0) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
    else if (ciclo === 1) return ['Peito', 'Ombros', 'Tríceps'];
    else return ['Costas', 'Bíceps', 'Abdômen'];
  }

  // Avançados: A-B-C-D ou mais específico
  if (experiencia === 'Avançado') {
    if (frequenciaSemanal >= 5) {
      const ciclo = (diaSemana - 1) % 5;
      if (ciclo === 0) return ['Peito'];
      else if (ciclo === 1) return ['Costas'];
      else if (ciclo === 2) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      else if (ciclo === 3) return ['Ombros'];
      else return ['Bíceps', 'Tríceps'];
    } else if (frequenciaSemanal === 4) {
      const ciclo = (diaSemana - 1) % 4;
      if (ciclo === 0) return ['Peito'];
      else if (ciclo === 1) return ['Costas'];
      else if (ciclo === 2) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      else return ['Ombros'];
    } else {
      // Push Pull Legs
      const ciclo = (diaSemana - 1) % 3;
      if (ciclo === 0) return ['Peito', 'Ombros', 'Tríceps'];
      else if (ciclo === 1) return ['Costas', 'Bíceps'];
      else return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
    }
  }

  // Default: A-B-C
  const ciclo = (diaSemana - 1) % 3;
  if (ciclo === 0) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
  else if (ciclo === 1) return ['Peito', 'Ombros', 'Tríceps'];
  else return ['Costas', 'Bíceps', 'Abdômen'];
}

/**
 * Filtra grupos musculares baseado em lesões
 */
function filtrarGruposPorLesoes(grupos: string[], lesoes: string[]): string[] {
  const LESOES_PARA_GRUPOS: Record<string, string[]> = {
    'Joelho': ['Quadríceps', 'Posteriores', 'Panturrilhas'],
    'Ombro': ['Ombros', 'Peito', 'Tríceps'],
    'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
    'Pulso': ['Bíceps', 'Tríceps', 'Ombros'],
    'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores']
  };

  const gruposEvitar = new Set<string>();
  lesoes.forEach(lesao => {
    const gruposAfetados = LESOES_PARA_GRUPOS[lesao] || [];
    gruposAfetados.forEach(grupo => gruposEvitar.add(grupo));
  });

  return grupos.filter(grupo => !gruposEvitar.has(grupo));
}

// ============================================================================
// EXPORTS PRINCIPAIS - API PÚBLICA DO CORE
// ============================================================================

/**
 * GERAÇÃO AUTOMÁTICA COM IA
 * Gera treino(s) usando inteligência artificial
 */
export async function gerarTreinoComIA(
  userId: string,
  data?: Date | string,
  gerarSemana: boolean = false
): Promise<GerarTreinoIAResult> {
  console.log(`🔄 [CORE] Iniciando geração de treino(s) com IA...`);
  console.log(`   - UserId: ${userId}`);
  console.log(`   - Gerar Semana: ${gerarSemana}`);

  const dataTreino = data ? normalizarData(data) : normalizarData(new Date());
  console.log(`   - Data: ${dataTreino.toISOString()}`);

  let treinosRemovidos = 0;
  let treinosGerados: any[] = [];

  try {
    if (gerarSemana) {
      // GERAÇÃO DA SEMANA COMPLETA
      console.log(`📅 [CORE] Modo: Semana Completa`);
      
      const { inicio, fim } = calcularPeriodoSemana(dataTreino);
      console.log(`   - Período: ${inicio.toLocaleDateString('pt-BR')} até ${fim.toLocaleDateString('pt-BR')}`);

      // 1. Remover todos os treinos da semana
      console.log(`🗑️ [CORE] Removendo treinos existentes da semana...`);
      treinosRemovidos = await removerTreinosPorPeriodo(userId, inicio, fim);
      
      // 2. Gerar treinos para cada dia da semana que é dia de treino
      const perfil = await buscarEValidarPerfil(userId);
      const frequenciaSemanal = perfil.frequenciaSemanal || 3;
      
      // Determinar dias de treino
      const diasTreino: number[] = [];
      if (frequenciaSemanal === 1) diasTreino.push(1); // Segunda
      else if (frequenciaSemanal === 2) diasTreino.push(1, 4); // Segunda e Quinta
      else if (frequenciaSemanal === 3) diasTreino.push(1, 3, 5); // Segunda, Quarta, Sexta
      else if (frequenciaSemanal === 4) diasTreino.push(1, 2, 4, 5); // Segunda, Terça, Quinta, Sexta
      else if (frequenciaSemanal === 5) diasTreino.push(1, 2, 3, 4, 5); // Segunda a Sexta
      else if (frequenciaSemanal === 6) diasTreino.push(1, 2, 3, 4, 5, 6); // Segunda a Sábado

      // Gerar treino para cada dia
      for (let i = 0; i < 7; i++) {
        const dataAtual = new Date(inicio);
        dataAtual.setDate(inicio.getDate() + i);
        let diaSemana = dataAtual.getDay();
        if (diaSemana === 0) diaSemana = 7; // Ajustar domingo

        if (diasTreino.includes(diaSemana)) {
          try {
            const treino = await gerarTreinoDiaComIA(userId, dataAtual);
            if (treino) {
              treinosGerados.push(treino);
            }
          } catch (error: any) {
            console.error(`❌ [CORE] Erro ao gerar treino para ${dataAtual.toLocaleDateString('pt-BR')}:`, error.message);
          }
        }
      }

      // Filtrar apenas os treinos da semana atual
      treinosGerados = treinosGerados.filter((t: any) => {
        const dataT = new Date(t.data);
        return dataT >= inicio && dataT <= fim;
      });

      console.log(`✅ [CORE] Semana gerada com sucesso!`);
      console.log(`   - Treinos removidos: ${treinosRemovidos}`);
      console.log(`   - Treinos gerados: ${treinosGerados.length}`);

      return {
        treinos: treinosGerados,
        removidos: treinosRemovidos,
        mensagem: `${treinosGerados.length} treino(s) da semana gerado(s) com sucesso`
      };
    } else {
      // GERAÇÃO DE UM DIA ESPECÍFICO
      console.log(`📅 [CORE] Modo: Dia Específico`);
      console.log(`   - Data: ${dataTreino.toLocaleDateString('pt-BR')}`);

      // 1. Remover treino existente para esta data
      console.log(`🗑️ [CORE] Removendo treino existente para esta data...`);
      treinosRemovidos = await removerTreinosPorData(userId, dataTreino);
      
      // 2. Gerar novo treino para esta data
      console.log(`🚀 [CORE] Gerando novo treino com IA...`);
      const treino = await gerarTreinoDiaComIA(userId, dataTreino);

      if (!treino) {
        throw new Error('Falha ao gerar treino. Nenhum treino foi criado.');
      }

      treinosGerados = [treino];

      console.log(`✅ [CORE] Treino do dia gerado com sucesso!`);
      console.log(`   - Treinos removidos: ${treinosRemovidos}`);
      console.log(`   - Exercícios no treino: ${treino.exercicios?.length || 0}`);

      return {
        treinos: treinosGerados,
        removidos: treinosRemovidos,
        mensagem: 'Treino do dia gerado com sucesso'
      };
    }
  } catch (error: any) {
    console.error(`❌ [CORE] Erro ao gerar treino(s):`, error);
    console.error(`   - Mensagem: ${error.message}`);
    console.error(`   - Stack: ${error.stack}`);
    
    throw error;
  }
}

/**
 * CRIAÇÃO MANUAL DE TREINO
 * Cria treino personalizado usando inteligência para validação e cálculos
 */
export async function criarTreinoPersonalizado(
  userId: string,
  input: Omit<CriarTreinoInput, 'userId'>
): Promise<any> {
  console.log(`🔄 [CORE] Criando treino personalizado...`);

  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome do treino é obrigatório');
  }

  if (!input.exercicios || input.exercicios.length === 0) {
    throw new Error('Treino deve ter pelo menos um exercício');
  }

  // Buscar perfil para usar inteligência
  const perfil = await buscarEValidarPerfil(userId);

  // Preparar exercícios com validação e cálculos usando inteligência
  const exerciciosPreparados: ExercicioTreinoInput[] = [];
  
  for (const ex of input.exercicios) {
    // Se não tiver carga, calcular usando inteligência
    let carga = ex.carga;
    if (!carga || carga === 0) {
      const exercicioDB = await prisma.exercicio.findUnique({
        where: { id: ex.exercicioId }
      });
      
      if (exercicioDB) {
        carga = await workoutIntelligence.calcularCargaExercicio(
          userId,
          ex.exercicioId,
          perfil.pesoAtual || 70,
          exercicioDB.grupoMuscularPrincipal,
          perfil.experiencia || 'Iniciante',
          ex.repeticoes || '8-12',
          perfil.objetivo || 'Hipertrofia'
        ) || null;
      }
    }

    // Calcular parâmetros se não fornecidos
    let rpe = ex.rpe;
    let descanso = ex.descanso;
    if (!rpe || !descanso) {
      const parametros = workoutIntelligence.calcularParametrosTreino(
        perfil.objetivo || 'Hipertrofia',
        perfil.experiencia || 'Iniciante',
        perfil.rpePreferido
      );
      rpe = ex.rpe || parametros.rpe;
      descanso = ex.descanso || parametros.descanso;
    }

    exerciciosPreparados.push({
      ...ex,
      carga,
      rpe,
      descanso
    });
  }

  // Validar treino usando inteligência
  const exerciciosCompletos = await Promise.all(
    exerciciosPreparados.map(async ex => ({
      exercicioId: ex.exercicioId,
      exercicio: await prisma.exercicio.findUnique({
        where: { id: ex.exercicioId }
      })
    }))
  );

  const validacao = workoutIntelligence.validarTreinoCompleto(
    exerciciosCompletos.map(e => ({ exercicio: e.exercicio })),
    exerciciosPreparados[0]?.series || 3
  );

  if (!validacao.valido && validacao.erros.length > 0) {
    console.warn(`⚠️ [CORE] Validação encontrou problemas:`, validacao.erros);
    // Avisar mas não bloquear criação manual
  }

  // Remover treino existente para esta data se houver
  await removerTreinosPorData(userId, input.data);

  // Criar treino
  const treino = await criarTreinoCompleto({
    userId,
    ...input,
    exercicios: exerciciosPreparados,
    criadoPor: input.criadoPor || 'USUARIO'
  });

  console.log(`✅ [CORE] Treino personalizado criado!`);
  return treino;
}

/**
 * APLICAR TEMPLATE PERSONALIZADO
 * Aplica template do usuário em uma data específica usando inteligência
 */
export async function aplicarTemplatePersonalizado(
  userId: string,
  templateId: string,
  data: Date
): Promise<AplicarTemplateResult> {
  console.log(`🔄 [CORE] Aplicando template personalizado...`);

  // Buscar template
  const template = await prisma.treinoPersonalizadoTemplate.findFirst({
    where: {
      id: templateId,
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
      }
    }
  });

  if (!template) {
    throw new Error('Template não encontrado');
  }

  // Buscar perfil para usar inteligência
  const perfil = await buscarEValidarPerfil(userId);

  // Preparar exercícios adaptando ao perfil usando inteligência
  const exerciciosTreino: ExercicioTreinoInput[] = [];
  
  for (const templateEx of template.exercicios) {
    // Calcular carga usando inteligência se necessário
    let carga = templateEx.carga;
    if (!carga || carga === 0) {
      carga = await workoutIntelligence.calcularCargaExercicio(
        userId,
        templateEx.exercicioId,
        perfil.pesoAtual || 70,
        templateEx.exercicio?.grupoMuscularPrincipal || '',
        perfil.experiencia || 'Iniciante',
        templateEx.repeticoes || '8-12',
        perfil.objetivo || 'Hipertrofia'
      ) || null;
    }

    exerciciosTreino.push({
      exercicioId: templateEx.exercicioId,
      ordem: templateEx.ordem,
      series: templateEx.series,
      repeticoes: templateEx.repeticoes,
      carga,
      rpe: (templateEx as any).rpe || undefined,
      descanso: templateEx.descanso || undefined,
      observacoes: templateEx.observacoes || undefined
    });
  }

  // Validar usando inteligência
  const validacao = workoutIntelligence.validarTreinoCompleto(
    template.exercicios.map((ex: any) => ({ exercicio: ex.exercicio })),
    exerciciosTreino[0]?.series || 3
  );

  if (!validacao.valido && validacao.erros.length > 0) {
    console.warn(`⚠️ [CORE] Validação do template encontrou problemas:`, validacao.erros);
  }

  // Remover treino existente para esta data
  await removerTreinosPorData(userId, data);

  // Criar treino
  const treino = await criarTreinoCompleto({
    userId,
    data,
    nome: template.nome,
    exercicios: exerciciosTreino,
    criadoPor: 'TEMPLATE'
  });

  // Associar template ao treino
  await prisma.treino.update({
    where: { id: treino.id },
    data: { templateId: template.id }
  });

  console.log(`✅ [CORE] Template aplicado com sucesso!`);
  return {
    treino: await prisma.treino.findUnique({
      where: { id: treino.id },
      include: {
        exercicios: {
          include: { exercicio: true },
          orderBy: { ordem: 'asc' }
        }
      }
    }),
    mensagem: 'Template aplicado com sucesso'
  };
}

/**
 * APLICAR TREINO RECORRENTE
 * Aplica treino recorrente (A-G) em data específica usando inteligência
 */
export async function aplicarTreinoRecorrente(
  userId: string,
  letraTreino: string,
  data: Date
): Promise<AplicarRecorrenteResult> {
  console.log(`🔄 [CORE] Aplicando treino recorrente ${letraTreino}...`);

  const letra = letraTreino.toUpperCase();
  if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(letra)) {
    throw new Error('Letra do treino deve ser A, B, C, D, E, F ou G');
  }

  // Buscar treino recorrente
  const treinoRecorrente = await prisma.treino.findFirst({
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

  if (!treinoRecorrente) {
    throw new Error(`Treino recorrente ${letra} não encontrado`);
  }

  // Buscar perfil para usar inteligência
  const perfil = await buscarEValidarPerfil(userId);

  // Preparar exercícios adaptando cargas usando inteligência
  const exerciciosTreino: ExercicioTreinoInput[] = [];
  
  for (const ex of treinoRecorrente.exercicios) {
    // Recalcular cargas usando inteligência para adaptar ao progresso
    let carga = ex.carga;
    if (carga && ex.exercicio) {
      // Recalcular baseado no progresso atual
      const cargaCalculada = await workoutIntelligence.calcularCargaExercicio(
        userId,
        ex.exercicioId,
        perfil.pesoAtual || 70,
        ex.exercicio.grupoMuscularPrincipal,
        perfil.experiencia || 'Iniciante',
        ex.repeticoes,
        perfil.objetivo || 'Hipertrofia'
      );
      
      // Usar a maior entre a carga original e a calculada (progressão)
      if (cargaCalculada && cargaCalculada > (carga || 0)) {
        carga = cargaCalculada;
      }
    }

    exerciciosTreino.push({
      exercicioId: ex.exercicioId,
      ordem: ex.ordem,
      series: ex.series,
      repeticoes: ex.repeticoes,
      carga,
      rpe: ex.rpe,
      descanso: ex.descanso,
      observacoes: ex.observacoes || undefined
    });
  }

  // Validar usando inteligência
  const validacao = workoutIntelligence.validarTreinoCompleto(
    treinoRecorrente.exercicios.map((ex: any) => ({ exercicio: ex.exercicio })),
    exerciciosTreino[0]?.series || 3
  );

  if (!validacao.valido && validacao.erros.length > 0) {
    console.warn(`⚠️ [CORE] Validação do treino recorrente encontrou problemas:`, validacao.erros);
  }

  // Remover treino existente para esta data
  await removerTreinosPorData(userId, data);

  // Criar treino
  const treino = await criarTreinoCompleto({
    userId,
    data,
    nome: treinoRecorrente.nome,
    exercicios: exerciciosTreino,
    tipo: treinoRecorrente.tipo,
    letraTreino: letra,
    criadoPor: 'RECORRENTE'
  });

  console.log(`✅ [CORE] Treino recorrente aplicado com sucesso!`);
  return {
    treino,
    mensagem: `Treino recorrente ${letra} aplicado com sucesso`
  };
}

/**
 * REMOVER TREINO
 * Remove treino de uma data específica
 */
export async function removerTreino(userId: string, data: Date | string): Promise<number> {
  const dataTreino = normalizarData(data);
  return await removerTreinosPorData(userId, dataTreino);
}

/**
 * DUPLICAR TREINO
 * Duplica um treino existente para outra data usando inteligência para adaptar cargas
 */
export async function duplicarTreino(
  userId: string,
  treinoId: string,
  novaData: Date | string
): Promise<any> {
  console.log(`🔄 [CORE] Duplicando treino...`);

  // Buscar treino original
  const treinoOriginal = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treinoOriginal) {
    throw new Error('Treino não encontrado');
  }

  const dataTreino = normalizarData(novaData);
  const perfil = await buscarEValidarPerfil(userId);

  // Preparar exercícios adaptando cargas usando inteligência
  const exerciciosTreino: ExercicioTreinoInput[] = [];
  
  for (const ex of treinoOriginal.exercicios) {
    // Recalcular cargas usando inteligência
    let carga = ex.carga;
    if (carga && ex.exercicio) {
      const cargaCalculada = await workoutIntelligence.calcularCargaExercicio(
        userId,
        ex.exercicioId,
        perfil.pesoAtual || 70,
        ex.exercicio.grupoMuscularPrincipal,
        perfil.experiencia || 'Iniciante',
        ex.repeticoes,
        perfil.objetivo || 'Hipertrofia'
      );
      
      // Usar carga calculada se disponível
      if (cargaCalculada) {
        carga = cargaCalculada;
      }
    }

    exerciciosTreino.push({
      exercicioId: ex.exercicioId,
      ordem: ex.ordem,
      series: ex.series,
      repeticoes: ex.repeticoes,
      carga,
      rpe: ex.rpe,
      descanso: ex.descanso,
      observacoes: ex.observacoes || undefined
    });
  }

  // Remover treino existente para a nova data
  await removerTreinosPorData(userId, dataTreino);

  // Criar treino duplicado
  const treino = await criarTreinoCompleto({
    userId,
    data: dataTreino,
    nome: treinoOriginal.nome,
    exercicios: exerciciosTreino,
    tipo: treinoOriginal.tipo,
    letraTreino: treinoOriginal.letraTreino || undefined,
    criadoPor: (treinoOriginal.criadoPor as 'IA' | 'USUARIO' | 'TEMPLATE' | 'RECORRENTE') || 'USUARIO'
  });

  console.log(`✅ [CORE] Treino duplicado com sucesso!`);
  return treino;
}

