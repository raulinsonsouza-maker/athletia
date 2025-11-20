import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TreinoContext {
  perfil: any;
  historico: any[];
  exerciciosDisponiveis: any[];
  objetivo: string;
  experiencia: string;
}

interface AISuggestion {
  exercicioId?: string;
  motivo: string;
  sugestao: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

/**
 * Gera sugestões de refinamento de treino usando IA
 * Pode usar OpenAI ou lógica baseada em regras
 */
export async function refinarTreinoComIA(
  treino: any,
  context: TreinoContext
): Promise<{
  sugestoes: AISuggestion[];
  analise: string;
  melhorias: string[];
}> {
  const sugestoes: AISuggestion[] = [];
  const melhorias: string[] = [];

  // Análise baseada em regras (pode ser substituída por LLM)
  const analise = await analisarTreino(treino, context);

  // Verificar volume total
  const volumeTotal = treino.exercicios.reduce((acc: number, ex: any) => {
    return acc + (ex.series * ex.repeticoes * (ex.carga || 0));
  }, 0);

  // Verificar se volume está adequado para o objetivo
  if (context.objetivo === 'Hipertrofia') {
    const volumeMinimo = context.experiencia === 'Iniciante' ? 10000 : 15000;
    if (volumeTotal < volumeMinimo) {
      sugestoes.push({
        motivo: 'Volume insuficiente para hipertrofia',
        sugestao: `Considere adicionar mais séries ou exercícios. Volume atual: ${volumeTotal.toFixed(0)}kg`,
        prioridade: 'alta'
      });
    }
  }

  // Verificar distribuição de grupos musculares
  const grupos = treino.exercicios.reduce((acc: any, ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || 'Desconhecido';
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  // Verificar se há desequilíbrio
  const gruposArray = Object.entries(grupos);
  const maxExercicios = Math.max(...gruposArray.map(([_, count]) => count as number));
  const minExercicios = Math.min(...gruposArray.map(([_, count]) => count as number));

  if (maxExercicios - minExercicios > 2) {
    sugestoes.push({
      motivo: 'Desequilíbrio na distribuição de grupos musculares',
      sugestao: 'Considere equilibrar melhor a distribuição entre os grupos',
      prioridade: 'media'
    });
  }

  // Verificar progressão baseada no histórico
  if (context.historico.length > 0) {
    const ultimoTreino = context.historico[0];
    const progressao = calcularProgressao(treino, ultimoTreino);
    
    if (progressao.volumeAumento < 0.05) {
      sugestoes.push({
        motivo: 'Progressão de volume baixa',
        sugestao: 'Considere aumentar o volume em 5-10% para continuar progredindo',
        prioridade: 'alta'
      });
    }
  }

  // Verificar tempo estimado vs tempo disponível
  const tempoEstimado = treino.tempoEstimado || 0;
  const tempoDisponivel = context.perfil.tempoDisponivel || 60;

  if (tempoEstimado > tempoDisponivel * 1.2) {
    sugestoes.push({
      motivo: 'Tempo estimado excede o disponível',
      sugestao: `Treino estimado: ${tempoEstimado}min, disponível: ${tempoDisponivel}min. Considere reduzir exercícios ou séries.`,
      prioridade: 'alta'
    });
  }

  // Melhorias baseadas em conhecimento
  if (context.objetivo === 'Força' && treino.exercicios.some((ex: any) => ex.repeticoes > 6)) {
    melhorias.push('Para força, considere reduzir repetições e aumentar carga');
  }

  if (context.objetivo === 'Emagrecimento' && treino.exercicios.length < 5) {
    melhorias.push('Para emagrecimento, considere adicionar mais exercícios para aumentar o gasto calórico');
  }

  return {
    sugestoes,
    analise,
    melhorias
  };
}

/**
 * Analisa o treino e retorna uma análise textual
 */
async function analisarTreino(treino: any, context: TreinoContext): Promise<string> {
  const partes: string[] = [];

  partes.push(`Treino gerado para ${context.perfil.objetivo || 'objetivo não definido'}.`);
  partes.push(`Nível de experiência: ${context.experiencia}.`);
  partes.push(`Total de exercícios: ${treino.exercicios.length}.`);

  const volumeTotal = treino.exercicios.reduce((acc: number, ex: any) => {
    return acc + (ex.series * ex.repeticoes * (ex.carga || 0));
  }, 0);
  partes.push(`Volume total: ${volumeTotal.toFixed(0)}kg.`);

  const grupos = treino.exercicios.reduce((acc: any, ex: any) => {
    const grupo = ex.exercicio?.grupoMuscularPrincipal || 'Desconhecido';
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  const gruposTexto = Object.entries(grupos)
    .map(([grupo, count]) => `${grupo}: ${count} exercício(s)`)
    .join(', ');
  partes.push(`Grupos musculares: ${gruposTexto}.`);

  return partes.join(' ');
}

/**
 * Calcula progressão entre dois treinos
 */
function calcularProgressao(treinoAtual: any, treinoAnterior: any): {
  volumeAumento: number;
  cargaAumento: number;
} {
  const volumeAtual = treinoAtual.exercicios.reduce((acc: number, ex: any) => {
    return acc + (ex.series * ex.repeticoes * (ex.carga || 0));
  }, 0);

  const volumeAnterior = treinoAnterior.exercicios?.reduce((acc: number, ex: any) => {
    return acc + (ex.series * ex.repeticoes * (ex.carga || 0));
  }, 0) || 0;

  const volumeAumento = volumeAnterior > 0 
    ? (volumeAtual - volumeAnterior) / volumeAnterior 
    : 0;

  return {
    volumeAumento,
    cargaAumento: 0 // Pode ser calculado comparando cargas individuais
  };
}

/**
 * Gera explicação para um exercício específico
 */
export async function explicarExercicio(
  exercicioId: string,
  contextoUsuario: any
): Promise<string> {
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId }
  });

  if (!exercicio) {
    return 'Exercício não encontrado.';
  }

  const explicacao: string[] = [];

  explicacao.push(`${exercicio.nome} é um exercício focado em ${exercicio.grupoMuscularPrincipal}.`);

  if (exercicio.descricao) {
    explicacao.push(exercicio.descricao);
  }

  if (exercicio.execucaoTecnica) {
    explicacao.push(`Execução: ${exercicio.execucaoTecnica}`);
  }

  if (contextoUsuario.experiencia === 'Iniciante' && exercicio.nivelDificuldade === 'Avançado') {
    explicacao.push('⚠️ Atenção: Este exercício é avançado. Considere começar com variações mais simples.');
  }

  return explicacao.join(' ');
}

/**
 * Sugere ajustes de carga baseado em feedback
 */
export function sugerirAjusteCarga(
  cargaAtual: number,
  rpe: number,
  objetivo: string
): {
  novaCarga: number;
  motivo: string;
} {
  let novaCarga = cargaAtual;
  let motivo = '';

  if (rpe <= 6) {
    // Muito fácil - aumentar carga
    const aumento = objetivo === 'Força' ? 0.10 : 0.05;
    novaCarga = cargaAtual * (1 + aumento);
    motivo = `RPE baixo (${rpe}). Aumente a carga em ${(aumento * 100).toFixed(0)}% para maior desafio.`;
  } else if (rpe >= 9) {
    // Muito difícil - reduzir carga
    const reducao = 0.05;
    novaCarga = cargaAtual * (1 - reducao);
    motivo = `RPE alto (${rpe}). Reduza a carga em ${(reducao * 100).toFixed(0)}% para manter a forma técnica.`;
  } else {
    motivo = `RPE adequado (${rpe}). Mantenha a carga atual.`;
  }

  return {
    novaCarga: Math.round(novaCarga * 10) / 10,
    motivo
  };
}

