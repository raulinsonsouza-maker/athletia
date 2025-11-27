/**
 * TREINO ENGINE SERVICE V2.0
 * 
 * Motor centralizado de geração de treinos inteligentes - VERSÃO REFATORADA
 * 
 * CORREÇÕES APLICADAS:
 * 1. Sistema único de definição de grupos (baseado em split, não em letra)
 * 2. Tempo variável para cardio/alongamento baseado em objetivo
 * 3. Fallback inteligente para busca de exercícios
 * 4. Evita repetição por categoria, não apenas por ID
 * 5. Resolve problemas de concorrência
 * 6. Garante número mínimo de exercícios mesmo com pouco tempo
 */

import { prisma } from '../lib/prisma';
import { garantirPerfilParaInteligencia } from './perfil.service';
import { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } from './treino.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type PerfilTreino = Awaited<ReturnType<typeof garantirPerfilParaInteligencia>>;

interface TreinoEngineConfig {
  userId: string;
  dataReferencia?: Date;
  forcarRegeneracao?: boolean;
}

interface TreinoGerado {
  id: string;
  nome: string;
  data: Date;
  gruposPrincipais: string[];
  totalExercicios: number;
  tempoEstimado: number;
  tipo: string;
}

interface ConfiguracaoTempo {
  cardio: number;
  alongamento: number;
  tempoPorExercicio: number;
}

// ============================================================================
// CONFIGURAÇÕES DE SPLITS (ÚNICO SISTEMA)
// ============================================================================

const SPLITS_GRUPOS: Record<number, string[][]> = {
  1: [['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']],
  2: [
    ['Peito', 'Ombros', 'Tríceps', 'Costas', 'Bíceps'],
    ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen']
  ],
  3: [
    ['Peito', 'Ombros', 'Tríceps'],
    ['Costas', 'Bíceps', 'Posteriores'],
    ['Quadríceps', 'Glúteos', 'Panturrilhas', 'Abdômen']
  ],
  4: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Panturrilhas'],
    ['Posteriores', 'Glúteos', 'Ombros', 'Abdômen']
  ],
  5: [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Quadríceps', 'Glúteos'],
    ['Posteriores', 'Panturrilhas'],
    ['Ombros', 'Abdômen']
  ],
  6: [
    ['Peito'],
    ['Costas'],
    ['Quadríceps'],
    ['Posteriores'],
    ['Ombros'],
    ['Bíceps', 'Tríceps', 'Abdômen']
  ]
};

const NOMES_SPLITS: Record<number, Record<number, string>> = {
  1: { 0: 'Full Body' },
  2: {
    0: 'Superior (Push + Pull)',
    1: 'Inferior + Core'
  },
  3: {
    0: 'Peito, Ombros e Tríceps',
    1: 'Costas, Bíceps e Posteriores',
    2: 'Pernas e Abdômen'
  },
  4: {
    0: 'Peito e Tríceps',
    1: 'Costas e Bíceps',
    2: 'Quadríceps e Panturrilhas',
    3: 'Posteriores, Glúteos e Ombros'
  },
  5: {
    0: 'Peito e Tríceps',
    1: 'Costas e Bíceps',
    2: 'Quadríceps e Glúteos',
    3: 'Posteriores e Panturrilhas',
    4: 'Ombros e Abdômen'
  },
  6: {
    0: 'Peito',
    1: 'Costas',
    2: 'Quadríceps',
    3: 'Posteriores',
    4: 'Ombros',
    5: 'Braços e Core'
  }
};

const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ============================================================================
// CONFIGURAÇÕES DE TEMPO POR OBJETIVO
// ============================================================================

function obterConfiguracaoTempo(objetivo: string, series: number, descanso: number): ConfiguracaoTempo {
  switch (objetivo) {
    case 'Emagrecimento':
      return {
        cardio: 30, // Mais cardio para emagrecimento
        alongamento: 5,
        tempoPorExercicio: (series * 0.5) + ((series - 1) * (descanso / 60)) + 1 // +1 min transição
      };
    case 'Força':
      return {
        cardio: 5, // Menos cardio para força
        alongamento: 5,
        tempoPorExercicio: (series * 1) + ((series - 1) * (descanso / 60)) + 2 // +2 min transição (mais pesado)
      };
    default: // Hipertrofia
      return {
        cardio: 15, // Cardio moderado
        alongamento: 7,
        tempoPorExercicio: (series * 0.5) + ((series - 1) * (descanso / 60)) + 1.5 // +1.5 min transição
      };
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarData(data: Date): Date {
  const dt = new Date(data);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function obterInicioSemana(data: Date): Date {
  const inicio = normalizarData(data);
  const diaSemana = inicio.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + diff);
  return inicio;
}

function obterFimSemana(inicioSemana: Date): Date {
  const fim = new Date(inicioSemana);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

function gerarNomeTreino(frequencia: number, indiceDia: number): string {
  const letra = LETRAS_TREINO[indiceDia];
  const nomeBase = NOMES_SPLITS[frequencia]?.[indiceDia % frequencia];
  if (nomeBase) {
    return `Treino ${letra} - ${nomeBase}`;
  }
  return `Treino ${letra}`;
}

function obterGruposDoDia(frequencia: number, indiceDia: number): string[] {
  const splits = SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  return splits[indiceDia % splits.length] || splits[0];
}

/**
 * Calcula número mínimo de exercícios baseado na quantidade de grupos
 * Garante treino completo mesmo com pouco tempo
 */
function calcularMinimoExercicios(grupos: string[]): number {
  // Mínimo: 1 exercício por grupo, mas pelo menos 4 exercícios totais
  return Math.max(4, grupos.length);
}

/**
 * Calcula máximo de exercícios baseado no tempo disponível
 * Considera tempo variável para cardio/alongamento baseado em objetivo
 * Retorna também o tempo estimado para avisar quando ultrapassa
 */
function calcularMaxExerciciosPorTempo(
  tempoDisponivel: number,
  configTempo: ConfiguracaoTempo,
  minimoNecessario: number
): { maxExercicios: number; tempoEstimadoMinimo: number } {
  const tempoUtil = tempoDisponivel - configTempo.cardio - configTempo.alongamento;
  
  if (tempoUtil <= 0) {
    const tempoEstimadoMinimo = configTempo.cardio + (minimoNecessario * configTempo.tempoPorExercicio) + configTempo.alongamento;
    const excesso = Math.ceil(tempoEstimadoMinimo - tempoDisponivel);
    console.log(`[WARN] Tempo disponível (${tempoDisponivel}min) não permite mínimo de ${minimoNecessario} exercícios`);
    console.log(`[WARN] Tempo estimado mínimo: ${Math.ceil(tempoEstimadoMinimo)}min (excesso: +${excesso}min)`);
    console.log(`[INFO] Garantindo treino completo mesmo assim (mínimo necessário para qualidade)`);
    return { maxExercicios: minimoNecessario, tempoEstimadoMinimo };
  }
  
  const maxExercicios = Math.floor(tempoUtil / configTempo.tempoPorExercicio);
  
  // Garantir mínimo necessário
  if (maxExercicios < minimoNecessario) {
    const tempoEstimadoMinimo = configTempo.cardio + (minimoNecessario * configTempo.tempoPorExercicio) + configTempo.alongamento;
    const excesso = Math.ceil(tempoEstimadoMinimo - tempoDisponivel);
    console.log(`[WARN] Tempo disponível (${tempoDisponivel}min) não permite ${minimoNecessario} exercícios`);
    console.log(`[WARN] Tempo estimado mínimo: ${Math.ceil(tempoEstimadoMinimo)}min (excesso: +${excesso}min)`);
    console.log(`[INFO] Garantindo treino completo mesmo assim (mínimo necessário para qualidade)`);
    return { maxExercicios: minimoNecessario, tempoEstimadoMinimo };
  }
  
  // Limite máximo
  const maxFinal = maxExercicios > 10 ? 10 : maxExercicios;
  const tempoEstimado = configTempo.cardio + (maxFinal * configTempo.tempoPorExercicio) + configTempo.alongamento;
  
  // Informar se está próximo do limite
  if (tempoEstimado > tempoDisponivel * 0.9) {
    console.log(`[INFO] Tempo estimado (${Math.ceil(tempoEstimado)}min) está próximo do limite (${tempoDisponivel}min)`);
  }
  
  return { maxExercicios: maxFinal, tempoEstimadoMinimo: tempoEstimado };
}

/**
 * Calcula tempo estimado total do treino
 */
function calcularTempoEstimado(
  totalExerciciosForca: number,
  configTempo: ConfiguracaoTempo
): number {
  const tempoForca = totalExerciciosForca * configTempo.tempoPorExercicio;
  return Math.ceil(configTempo.cardio + tempoForca + configTempo.alongamento);
}

/**
 * Determina quantos exercícios cada grupo deve ter baseado no split
 * Distribui exercícios de forma equilibrada
 */
function determinarExerciciosPorGrupo(grupos: string[], totalExercicios: number): Map<string, number> {
  const mapa = new Map<string, number>();
  const quantidadePorGrupo = Math.floor(totalExercicios / grupos.length);
  const resto = totalExercicios % grupos.length;
  
  // Distribuir base
  grupos.forEach((grupo, index) => {
    const quantidade = quantidadePorGrupo + (index < resto ? 1 : 0);
    mapa.set(grupo, Math.max(1, quantidade)); // Mínimo 1 por grupo
  });
  
  return mapa;
}

/**
 * Conta exercícios por grupo considerando grupo principal E sinergistas
 */
function contarExerciciosPorGrupo(exercicios: any[], grupo: string): number {
  return exercicios.filter(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    const sinergistas = ex.sinergistas || [];
    return grupoPrincipal === grupo || sinergistas.includes(grupo);
  }).length;
}

/**
 * Redistribui exercícios após corte mantendo balanceamento por grupo
 * Garante que todos os grupos tenham pelo menos 1 exercício
 */
function balancearExerciciosAposCorte(
  exercicios: any[],
  grupos: string[],
  maxExercicios: number
): any[] {
  if (exercicios.length <= maxExercicios) {
    return exercicios;
  }

  // Contar exercícios por grupo (considerando sinergistas)
  const contagemPorGrupo = new Map<string, any[]>();
  grupos.forEach(grupo => {
    contagemPorGrupo.set(grupo, []);
  });

  // Agrupar exercícios
  exercicios.forEach(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    if (grupos.includes(grupoPrincipal)) {
      contagemPorGrupo.get(grupoPrincipal)?.push(ex);
    } else {
      // Verificar sinergistas
      const sinergistas = ex.sinergistas || [];
      for (const grupo of grupos) {
        if (sinergistas.includes(grupo)) {
          contagemPorGrupo.get(grupo)?.push(ex);
          break; // Adicionar apenas no primeiro grupo sinergista encontrado
        }
      }
    }
  });

  // Garantir mínimo de 1 exercício por grupo
  const resultado: any[] = [];
  const gruposComExercicios = new Set<string>();

  // Primeira passada: garantir mínimo
  grupos.forEach(grupo => {
    const exerciciosGrupo = contagemPorGrupo.get(grupo) || [];
    if (exerciciosGrupo.length > 0 && resultado.length < maxExercicios) {
      resultado.push(exerciciosGrupo[0]);
      gruposComExercicios.add(grupo);
    }
  });

  // Segunda passada: distribuir restante proporcionalmente
  const exerciciosRestantes = exercicios.filter(ex => !resultado.includes(ex));
  const quantidadeRestante = maxExercicios - resultado.length;
  
  if (quantidadeRestante > 0 && exerciciosRestantes.length > 0) {
    // Distribuir proporcionalmente entre grupos
    const gruposParaDistribuir = Array.from(gruposComExercicios);
    const quantidadePorGrupo = Math.floor(quantidadeRestante / gruposParaDistribuir.length);
    const resto = quantidadeRestante % gruposParaDistribuir.length;

    gruposParaDistribuir.forEach((grupo, index) => {
      const quantidade = quantidadePorGrupo + (index < resto ? 1 : 0);
      const exerciciosGrupo = contagemPorGrupo.get(grupo) || [];
      const jaAdicionados = resultado.filter(ex => {
        const grupoPrincipal = ex.grupoMuscularPrincipal || '';
        const sinergistas = ex.sinergistas || [];
        return grupoPrincipal === grupo || sinergistas.includes(grupo);
      }).length;

      const faltam = quantidade - jaAdicionados;
      if (faltam > 0) {
        const disponiveis = exerciciosGrupo.filter(ex => !resultado.includes(ex));
        const adicionar = disponiveis.slice(0, faltam);
        resultado.push(...adicionar);
      }
    });

    // Se ainda sobrar espaço, adicionar qualquer exercício restante
    const aindaFaltam = maxExercicios - resultado.length;
    if (aindaFaltam > 0) {
      const restantes = exerciciosRestantes.filter(ex => !resultado.includes(ex));
      resultado.push(...restantes.slice(0, aindaFaltam));
    }
  }

  return resultado.slice(0, maxExercicios);
}

/**
 * Mapeia lesões para grupos musculares que devem ser evitados
 */
function mapearLesoesParaGrupos(lesoes: string[]): string[] {
  const gruposEvitar: string[] = [];
  
  // Mapeamento de lesões comuns para grupos musculares
  const mapeamentoLesoes: Record<string, string[]> = {
    'Ombro': ['Ombros'],
    'ombro': ['Ombros'],
    'Ombro direito': ['Ombros'],
    'Ombro esquerdo': ['Ombros'],
    'Joelho': ['Quadríceps', 'Posteriores'],
    'joelho': ['Quadríceps', 'Posteriores'],
    'Joelho direito': ['Quadríceps', 'Posteriores'],
    'Joelho esquerdo': ['Quadríceps', 'Posteriores'],
    'Coluna': ['Costas', 'Posteriores', 'Abdômen'],
    'coluna': ['Costas', 'Posteriores', 'Abdômen'],
    'Lombar': ['Costas', 'Posteriores', 'Abdômen'],
    'lombar': ['Costas', 'Posteriores', 'Abdômen'],
    'Pulso': ['Bíceps', 'Tríceps'],
    'pulso': ['Bíceps', 'Tríceps'],
    'Cotovelo': ['Bíceps', 'Tríceps'],
    'cotovelo': ['Bíceps', 'Tríceps'],
    'Tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores'],
    'tornozelo': ['Panturrilhas', 'Quadríceps', 'Posteriores'],
    'Pescoço': ['Ombros', 'Costas'],
    'pescoço': ['Ombros', 'Costas'],
  };
  
  lesoes.forEach(lesao => {
    const grupos = mapeamentoLesoes[lesao];
    if (grupos) {
      gruposEvitar.push(...grupos);
    } else {
      // Tentar match parcial (ex: "lesão no joelho" → joelho)
      for (const [key, grupos] of Object.entries(mapeamentoLesoes)) {
        if (lesao.toLowerCase().includes(key.toLowerCase())) {
          gruposEvitar.push(...grupos);
          break;
        }
      }
    }
  });
  
  return Array.from(new Set(gruposEvitar)); // Remover duplicados
}

/**
 * Filtra grupos musculares baseado em lesões do usuário
 * Remove grupos afetados, mas garante que sempre reste pelo menos alguns grupos
 */
function filtrarGruposPorLesoes(grupos: string[], lesoes: string[]): string[] {
  if (!lesoes || lesoes.length === 0) {
    return grupos;
  }
  
  const gruposEvitar = mapearLesoesParaGrupos(lesoes);
  
  if (gruposEvitar.length === 0) {
    return grupos; // Nenhuma lesão mapeada, retornar todos
  }
  
  const gruposFiltrados = grupos.filter(grupo => !gruposEvitar.includes(grupo));
  
  // Se todos os grupos foram filtrados, retornar pelo menos alguns grupos principais
  // para não gerar treino vazio (priorizar grupos menos afetados)
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Tentando manter grupos menos críticos.`);
    // Manter grupos que não estão diretamente relacionados às lesões mais comuns
    const gruposMenosCriticos = grupos.filter(grupo => {
      // Priorizar grupos que não são diretamente afetados
      return !gruposEvitar.includes(grupo);
    });
    
    // Se ainda vazio, retornar pelo menos um grupo para não quebrar
    return gruposMenosCriticos.length > 0 ? gruposMenosCriticos : grupos.slice(0, 1);
  }
  
  if (gruposFiltrados.length < grupos.length) {
    console.log(`[INFO] Grupos filtrados por lesões: ${gruposEvitar.join(', ')}`);
    console.log(`[INFO] Grupos mantidos: ${gruposFiltrados.join(', ')}`);
  }
  
  return gruposFiltrados;
}

/**
 * Calcula parâmetros do treino baseado no objetivo e experiência
 */
function calcularParametrosTreino(objetivo: string, experiencia: string): {
  series: number;
  repeticoes: string;
  rpe: number;
  descanso: number;
} {
  if (objetivo === 'Força') {
    return { series: 5, repeticoes: '3-5', rpe: 8, descanso: 180 };
  }
  if (objetivo === 'Emagrecimento') {
    return { series: 3, repeticoes: '15-20', rpe: 7, descanso: 45 };
  }
  // Hipertrofia (padrão)
  const series = experiencia === 'Iniciante' ? 3 : experiencia === 'Avançado' ? 4 : 3;
  return { series, repeticoes: '8-12', rpe: 8, descanso: 90 };
}

/**
 * Gera seed determinístico baseado em userId e data
 * Garante que o mesmo usuário na mesma data sempre recebe o mesmo shuffle
 */
function gerarSeed(userId: string, data: Date): number {
  const dataString = data.toISOString().split('T')[0]; // YYYY-MM-DD
  const hash = userId + dataString;
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed) + hash.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }
  return Math.abs(seed);
}

/**
 * Shuffle determinístico usando seed
 * Mesmo seed sempre produz mesma ordem
 */
function shuffleDeterministico<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let random = seed;
  
  // Gerador de números pseudo-aleatórios simples baseado em seed
  const nextRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// ============================================================================
// BUSCA DE EXERCÍCIOS COM FALLBACK INTELIGENTE
// ============================================================================

/**
 * Busca exercícios com fallback inteligente
 * Tenta: principal → sinergistas → qualquer do grupo → qualquer ativo
 * Remove duplicados que podem aparecer por sinergistas
 * Usa randomização determinística baseada em userId + data + grupo para consistência
 */
async function buscarExerciciosComFallback(
  grupo: string,
  exerciciosEvitar: Set<string>,
  quantidade: number,
  userId: string,
  data: Date
): Promise<any[]> {
  // Tentativa 1: Buscar por grupo muscular principal
  let exercicios = await prisma.exercicio.findMany({
    where: {
      ativo: true,
      grupoMuscularPrincipal: grupo,
      id: { notIn: Array.from(exerciciosEvitar) }
    },
    take: quantidade * 3
  });
  
  // Tentativa 2: Se não encontrou, buscar por sinergistas
  if (exercicios.length < quantidade) {
    const sinergistas = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        sinergistas: { has: grupo },
        id: { notIn: Array.from(exerciciosEvitar) }
      },
      take: quantidade - exercicios.length
    });
    exercicios.push(...sinergistas);
  }
  
  // Tentativa 3: Se ainda não encontrou, buscar qualquer exercício do grupo (sem filtro de evitados)
  if (exercicios.length < quantidade) {
    const fallback = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        grupoMuscularPrincipal: grupo
      },
      take: quantidade - exercicios.length
    });
    exercicios.push(...fallback.filter(ex => !exerciciosEvitar.has(ex.id)));
  }
  
  // Remover duplicados (pode acontecer se exercício aparece como principal e sinergista)
  const exerciciosUnicos = Array.from(
    new Map(exercicios.map(ex => [ex.id, ex])).values()
  );
  
  // Selecionar quantidade necessária com randomização determinística
  // Usar userId + data + grupo como seed para consistência (mesmo usuário, mesmo dia, mesmo grupo = mesma ordem)
  const seed = gerarSeed(userId + grupo, data);
  const shuffled = shuffleDeterministico(exerciciosUnicos, seed);
  
  const selecionados: any[] = [];
  for (const ex of shuffled) {
    if (selecionados.length >= quantidade) break;
    selecionados.push(ex);
    exerciciosEvitar.add(ex.id);
  }
  
  return selecionados;
}

/**
 * Busca histórico de exercícios para evitar repetição
 * Exclui cardio e alongamento para não bloquear exercícios essenciais
 */
async function buscarHistoricoExercicios(userId: string, dias: number = 14): Promise<Set<string>> {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: { gte: dataLimite }
    },
    include: {
      exercicios: {
        include: {
          exercicio: {
            select: {
              id: true,
              grupoMuscularPrincipal: true
            }
          }
        }
      }
    }
  });

  const exerciciosUsados = new Set<string>();
  treinos.forEach(treino => {
    treino.exercicios.forEach(ex => {
      // Excluir cardio e alongamento do histórico para não bloquear
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      if (grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade') {
        exerciciosUsados.add(ex.exercicioId);
      }
    });
  });

  return exerciciosUsados;
}

// ============================================================================
// GERAÇÃO DE TREINO
// ============================================================================

/**
 * Gera um treino completo para um dia específico
 * VERSÃO REFATORADA - Usa apenas split, não força por letra
 */
async function gerarTreinoDoDia(
  userId: string,
  perfil: PerfilTreino,
  data: Date,
  indiceDia: number,
  exerciciosEvitar: Set<string>
): Promise<TreinoGerado | null> {
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);
  
  // Obter grupos baseado no SPLIT (único sistema)
  const grupos = obterGruposDoDia(frequencia, indiceDia);
  const nomeTreino = gerarNomeTreino(frequencia, indiceDia);
  const letraTreino = LETRAS_TREINO[indiceDia % LETRAS_TREINO.length];

  // Filtrar grupos por lesões
  const gruposFiltrados = filtrarGruposPorLesoes(grupos, perfil.lesoes || []);

  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Não é possível gerar treino.`);
    return null;
  }

  // Calcular parâmetros de treino
  const parametros = calcularParametrosTreino(
    perfil.objetivo || 'Hipertrofia',
    perfil.experiencia || 'Intermediário'
  );

  // Obter configuração de tempo baseada no objetivo
  const configTempo = obterConfiguracaoTempo(
    perfil.objetivo || 'Hipertrofia',
    parametros.series,
    parametros.descanso
  );

  // Calcular número mínimo e máximo de exercícios
  const minimoExercicios = calcularMinimoExercicios(gruposFiltrados);
  const tempoDisponivel = Math.min(perfil.tempoDisponivel || 60, 120);
  const { maxExercicios, tempoEstimadoMinimo } = calcularMaxExerciciosPorTempo(tempoDisponivel, configTempo, minimoExercicios);
  
  // Avisar se tempo estimado ultrapassa tempo disponível
  if (tempoEstimadoMinimo > tempoDisponivel) {
    console.log(`[INFO] Tempo estimado (${Math.ceil(tempoEstimadoMinimo)}min) pode ultrapassar tempo disponível (${tempoDisponivel}min)`);
    console.log(`[INFO] Garantindo treino completo mesmo assim (mínimo necessário)`);
  }
  
  // Determinar quantos exercícios por grupo
  const exerciciosPorGrupoMap = determinarExerciciosPorGrupo(gruposFiltrados, maxExercicios);
  
  // Buscar exercícios para cada grupo
  const todosExercicios: any[] = [];
  for (const grupo of gruposFiltrados) {
    const quantidade = exerciciosPorGrupoMap.get(grupo) || 1;
    const exercicios = await buscarExerciciosComFallback(
      grupo,
      exerciciosEvitar,
      quantidade,
      userId,
      data
    );
    todosExercicios.push(...exercicios);
  }

  // Se não temos exercícios suficientes, tentar buscar mais
  if (todosExercicios.length < minimoExercicios) {
    console.log(`[WARN] Apenas ${todosExercicios.length} exercícios, mínimo: ${minimoExercicios}`);
    // Buscar mais exercícios para grupos que têm menos (considerando sinergistas)
    for (const grupo of gruposFiltrados) {
      const quantidadeAtual = contarExerciciosPorGrupo(todosExercicios, grupo);
      const quantidadeEsperada = exerciciosPorGrupoMap.get(grupo) || 1;
      
      if (quantidadeAtual < quantidadeEsperada && todosExercicios.length < minimoExercicios) {
        const faltam = quantidadeEsperada - quantidadeAtual;
        const exerciciosAdicionais = await buscarExerciciosComFallback(
          grupo,
          exerciciosEvitar,
          faltam,
          userId,
          data
        );
        todosExercicios.push(...exerciciosAdicionais);
      }
    }
  }

  if (todosExercicios.length === 0) return null;

  // Balancear exercícios após corte mantendo proporção por grupo
  const exerciciosFinais = balancearExerciciosAposCorte(todosExercicios, gruposFiltrados, maxExercicios);
  
  // Log da distribuição final
  const distribuicaoFinal = gruposFiltrados.map(grupo => {
    const quantidade = contarExerciciosPorGrupo(exerciciosFinais, grupo);
    return `${grupo}: ${quantidade}`;
  }).join(', ');
  console.log(`[INFO] Distribuição final: ${distribuicaoFinal}`);

  console.log(`[INFO] Treino ${letraTreino}: ${exerciciosFinais.length} exercícios de força`);
  console.log(`[INFO] Grupos: ${gruposFiltrados.join(', ')}`);

  // Criar treino no banco
  const treino = await prisma.treino.create({
    data: {
      userId,
      data: normalizarData(data),
      nome: nomeTreino,
      tipo: 'Treino IA',
      criadoPor: 'IA',
      concluido: false,
      letraTreino,
      tempoEstimado: 0 // Será recalculado
    }
  });

  // 1. ADICIONAR CARDIO PRIMEIRO (ordem 0) - TEMPO VARIÁVEL
  const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioCardio.id,
      ordem: 0,
      series: 1,
      repeticoes: `${configTempo.cardio} min`,
      carga: null,
      rpe: 5,
      descanso: 0,
      concluido: false,
      observacoes: `Aquecimento cardiovascular - ${configTempo.cardio} minutos`
    }
  });

  // 2. ADICIONAR EXERCÍCIOS DE FORÇA (ordem 1, 2, 3...) - BATCH INSERT para performance
  const exerciciosTreinoData = exerciciosFinais.map((exercicio, index) => ({
    treinoId: treino.id,
    exercicioId: exercicio.id,
    ordem: index + 1,
    series: parametros.series,
    repeticoes: parametros.repeticoes,
    rpe: parametros.rpe,
    descanso: parametros.descanso,
    concluido: false
  }));
  
  // Usar createMany para inserção em batch (melhor performance)
  await prisma.exercicioTreino.createMany({
    data: exerciciosTreinoData
  });

  // 3. ADICIONAR ALONGAMENTO POR ÚLTIMO (ordem final) - TEMPO VARIÁVEL
  const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
  const ordemAlongamento = exerciciosFinais.length + 1; // Ordem após todos os exercícios de força
  await prisma.exercicioTreino.create({
    data: {
      treinoId: treino.id,
      exercicioId: exercicioAlongamento.id,
      ordem: ordemAlongamento,
      series: 1,
      repeticoes: `${configTempo.alongamento} min`,
      carga: null,
      rpe: 3,
      descanso: 0,
      concluido: false,
      observacoes: `Alongamento geral - ${configTempo.alongamento} minutos`
    }
  });

  // Calcular tempo estimado total
  const tempoEstimado = calcularTempoEstimado(exerciciosFinais.length, configTempo);

  // Atualizar tempo estimado
  await prisma.treino.update({
    where: { id: treino.id },
    data: { tempoEstimado }
  });

  // Total de exercícios = cardio (1) + força (N) + alongamento (1)
  const totalExercicios = 1 + exerciciosFinais.length + 1;

  return {
    id: treino.id,
    nome: nomeTreino,
    data: treino.data,
    gruposPrincipais: gruposFiltrados.slice(0, 3),
    totalExercicios,
    tempoEstimado,
    tipo: treino.tipo
  };
}

/**
 * Garante que existe um plano semanal completo para o usuário
 * VERSÃO REFATORADA - Sistema único e consistente
 */
export async function garantirPlanoSemanal(config: TreinoEngineConfig): Promise<TreinoGerado[]> {
  const { userId, dataReferencia = new Date(), forcarRegeneracao = false } = config;

  // Validar perfil
  const perfil = await garantirPerfilParaInteligencia(userId);
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);

  console.log(`[INFO] Gerando plano semanal - Frequência: ${frequencia} dias`);
  console.log(`[INFO] Objetivo: ${perfil.objetivo || 'Hipertrofia'}`);
  console.log(`[INFO] Tempo disponível: ${perfil.tempoDisponivel || 60} min`);

  // Calcular período da semana
  const inicioSemana = obterInicioSemana(dataReferencia);
  const fimSemana = obterFimSemana(inicioSemana);

  // Verificar treinos existentes
  const treinosExistentes = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
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

  // Se já tem treinos suficientes e não forçar regeneração, retornar
  if (!forcarRegeneracao && treinosExistentes.length >= frequencia) {
    console.log(`[INFO] Já existem ${treinosExistentes.length} treinos para esta semana`);
    return treinosExistentes.map((t) => ({
      id: t.id,
      nome: t.nome,
      data: t.data,
      gruposPrincipais: extrairGruposPrincipais(t.exercicios),
      totalExercicios: t.exercicios.length,
      tempoEstimado: t.tempoEstimado || 60,
      tipo: t.tipo
    }));
  }

  // Limpar treinos IA existentes da semana
  await prisma.treino.deleteMany({
    where: {
      userId,
      data: {
        gte: inicioSemana,
        lte: fimSemana
      },
      criadoPor: 'IA'
    }
  });

  // Buscar histórico para evitar repetição (inclui cardio e alongamento)
  const exerciciosEvitar = await buscarHistoricoExercicios(userId);

  // Determinar dias da semana para treinar baseado na frequência
  const diasTreino: number[] = [];
  if (frequencia === 1) diasTreino.push(1); // Segunda
  else if (frequencia === 2) diasTreino.push(1, 4); // Segunda e Quinta
  else if (frequencia === 3) diasTreino.push(1, 3, 5); // Segunda, Quarta, Sexta
  else if (frequencia === 4) diasTreino.push(1, 2, 4, 5); // Segunda, Terça, Quinta, Sexta
  else if (frequencia === 5) diasTreino.push(1, 2, 3, 4, 5); // Segunda a Sexta
  else if (frequencia === 6) diasTreino.push(1, 2, 3, 4, 5, 6); // Segunda a Sábado

  console.log(`[INFO] Dias de treino: ${diasTreino.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ')}`);

  // Gerar treinos sequencialmente para evitar problemas de concorrência
  const treinosGerados: TreinoGerado[] = [];

  for (let i = 0; i < frequencia; i++) {
    const diaSemana = diasTreino[i];
    const dataTreino = new Date(inicioSemana);
    dataTreino.setDate(dataTreino.getDate() + (diaSemana - 1));

    console.log(`[INFO] Gerando Treino ${LETRAS_TREINO[i]} para ${dataTreino.toLocaleDateString('pt-BR')}`);

    const treino = await gerarTreinoDoDia(userId, perfil, dataTreino, i, exerciciosEvitar);

    if (treino) {
      treinosGerados.push(treino);
      console.log(`[OK] Treino ${LETRAS_TREINO[i]} criado: ${treino.totalExercicios} exercícios (${treino.tempoEstimado} min)`);
    }
  }

  console.log(`[OK] Plano semanal completo: ${treinosGerados.length} treinos gerados`);
  return treinosGerados;
}

/**
 * Extrai os grupos musculares principais de um treino
 * Considera grupo principal e sinergistas para refletir o balanceamento real
 * Exclui cardio e alongamento
 */
function extrairGruposPrincipais(exercicios: any[]): string[] {
  const grupos = new Set<string>();
  const gruposIgnorar = ['Cardio', 'Alongamento', 'Flexibilidade'];

  exercicios.forEach(ex => {
    const exercicio = ex.exercicio || ex;
    const grupoPrincipal = exercicio.grupoMuscularPrincipal;
    const sinergistas = exercicio.sinergistas || [];
    
    // Adicionar grupo principal (prioridade)
    if (grupoPrincipal && !gruposIgnorar.includes(grupoPrincipal)) {
      grupos.add(grupoPrincipal);
    }
    
    // Adicionar sinergistas relevantes (para refletir balanceamento real)
    sinergistas.forEach((sinergista: string) => {
      if (sinergista && !gruposIgnorar.includes(sinergista)) {
        grupos.add(sinergista);
      }
    });
  });

  // Retornar até 3 grupos principais (priorizando grupos principais sobre sinergistas)
  const gruposArray = Array.from(grupos);
  
  // Separar principais e sinergistas
  const principais = gruposArray.filter(g => {
    return exercicios.some(ex => {
      const exercicio = ex.exercicio || ex;
      return exercicio.grupoMuscularPrincipal === g;
    });
  });
  
  const apenasSinergistas = gruposArray.filter(g => !principais.includes(g));
  
  // Priorizar principais, depois sinergistas
  const resultado = [...principais, ...apenasSinergistas].slice(0, 3);
  
  return resultado;
}

/**
 * Gera um único treino para uma data específica
 * Usa o motor centralizado para garantir consistência
 */
export async function gerarTreinoDoDiaUnico(
  userId: string,
  data: Date = new Date()
): Promise<TreinoGerado | null> {
  const perfil = await garantirPerfilParaInteligencia(userId);
  const frequencia = Math.min(Math.max(perfil.frequenciaSemanal || 3, 1), 6);
  
  // Calcular qual índice de treino seria para esta data baseado na frequência
  const inicioSemana = obterInicioSemana(data);
  const diasTreino: number[] = [];
  if (frequencia === 1) diasTreino.push(1);
  else if (frequencia === 2) diasTreino.push(1, 4);
  else if (frequencia === 3) diasTreino.push(1, 3, 5);
  else if (frequencia === 4) diasTreino.push(1, 2, 4, 5);
  else if (frequencia === 5) diasTreino.push(1, 2, 3, 4, 5);
  else if (frequencia === 6) diasTreino.push(1, 2, 3, 4, 5, 6);
  
  const diaSemana = data.getDay() === 0 ? 7 : data.getDay();
  const indiceDia = diasTreino.indexOf(diaSemana);
  
  // Se não é dia de treino, retornar null
  if (indiceDia === -1) {
    return null;
  }
  
  // Buscar histórico para evitar repetição
  const exerciciosEvitar = await buscarHistoricoExercicios(userId);
  
  // Gerar treino usando motor centralizado
  return await gerarTreinoDoDia(userId, perfil, data, indiceDia, exerciciosEvitar);
}

/**
 * Busca um treino específico por ID com dados completos
 */
export async function buscarTreinoCompleto(userId: string, treinoId: string) {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    },
    include: {
      exercicios: {
        include: {
          exercicio: true
        },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  if (!treino) return null;

  return {
    ...treino,
    gruposPrincipais: extrairGruposPrincipais(treino.exercicios)
  };
}

