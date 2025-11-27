/**
 * TREINO ENGINE SERVICE V2.2
 * 
 * Motor centralizado de geração de treinos inteligentes - VERSÃO OTIMIZADA PARA PERFORMANCE
 * 
 * MELHORIAS V2.2:
 * 1. Redução de N+1 queries: busca todos exercícios de uma vez e filtra em memória
 * 2. Cache de exercícios por grupo para evitar queries repetidas
 * 3. Distribuição de exercícios simplificada (sem loops de ajuste)
 * 4. Distribuição de dias otimizada (evita duplicados com Math.floor)
 * 5. Fallback consolidado: 1 query por grupo (principal + sinergistas)
 * 6. Filtro de lesões simplificado (sem lógica redundante)
 * 7. Cálculo de máximo de exercícios simplificado (1 linha)
 * 8. ExtrairGruposPrincipais otimizado (itera apenas 1x)
 * 9. Seed unificado para semana inteira (consistência)
 * 10. Tempo disponível configurável (mínimo e máximo dinâmico)
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
  cardio?: CardioInfo;
}

interface ConfiguracaoTempo {
  cardio: number;
  alongamento: number;
  tempoPorExercicio: number;
}

interface CardioInfo {
  ativo: boolean;
  tipo?: string;
  tempoMinutos?: number;
  intensidade?: 'leve' | 'moderada' | 'alta';
  momento?: 'inicio' | 'final' | 'intercalado';
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
 * Distribui dias da semana uniformemente baseado na frequência
 * Versão otimizada: evita duplicados usando intervalos precisos
 * Retorna array com dias da semana (1=Segunda, 6=Sábado)
 */
function distribuirDiasSemana(frequencia: number): number[] {
  if (frequencia <= 0 || frequencia > 7) {
    return [1, 3, 5]; // Padrão: Segunda, Quarta, Sexta
  }

  if (frequencia === 1) {
    return [1]; // Segunda
  }

  const dias: number[] = [];
  const diasDisponiveis = 6; // Segunda (1) a Sábado (6)
  
  // Calcular intervalo uniforme sem duplicados
  const intervalo = (diasDisponiveis - 1) / (frequencia - 1);
  
  for (let i = 0; i < frequencia; i++) {
    // Usar Math.floor para evitar duplicados e garantir distribuição uniforme
    const posicao = 1 + (i * intervalo);
    const dia = Math.floor(posicao);
    dias.push(Math.min(Math.max(dia, 1), 6)); // Garantir entre 1 e 6
  }

  // Remover duplicados e ordenar (garantia extra)
  return Array.from(new Set(dias)).sort((a, b) => a - b);
}

/**
 * Calcula índice do dia baseado na frequência e data
 * Extraído para evitar código repetitivo
 * Retorna o índice do treino (0, 1, 2...) ou -1 se não é dia de treino
 */
function calcularIndiceDia(frequencia: number, data: Date, inicioSemana: Date): number {
  const diasTreino = distribuirDiasSemana(frequencia);
  const diaSemana = data.getDay() === 0 ? 7 : data.getDay();
  const indice = diasTreino.indexOf(diaSemana);
  
  // Se não encontrou, retornar -1 (não é dia de treino)
  return indice;
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
 * Versão simplificada e otimizada
 */
function calcularMaxExerciciosPorTempo(
  tempoDisponivel: number,
  configTempo: ConfiguracaoTempo,
  minimoNecessario: number
): { maxExercicios: number; tempoEstimadoMinimo: number } {
  const { cardio, alongamento, tempoPorExercicio } = configTempo;
  const tempoUtil = tempoDisponivel - cardio - alongamento;
  
  // Calcular máximo de exercícios (simplificado)
  const maxCalculado = tempoUtil > 0 
    ? Math.floor(tempoUtil / tempoPorExercicio)
    : 0;
  
  // Garantir mínimo e máximo (1 linha)
  const maxExercicios = Math.max(minimoNecessario, Math.min(10, maxCalculado));
  const tempoEstimadoMinimo = cardio + alongamento + (maxExercicios * tempoPorExercicio);
  
  // Log apenas se ultrapassar tempo disponível
  if (tempoEstimadoMinimo > tempoDisponivel) {
    const excesso = Math.ceil(tempoEstimadoMinimo - tempoDisponivel);
    console.log(`[WARN] Tempo disponível: ${tempoDisponivel}min | Estimado: ${Math.ceil(tempoEstimadoMinimo)}min (+${excesso}min)`);
  }
  
  return { maxExercicios, tempoEstimadoMinimo };
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
 * Versão otimizada: busca todos exercícios de uma vez e calcula pesos em memória
 */
async function determinarExerciciosPorGrupo(
  grupos: string[], 
  totalExercicios: number,
  cacheExercicios?: Map<string, any[]> // Cache opcional para evitar queries repetidas
): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  
  // Buscar todos exercícios ativos de uma vez (se não tiver cache)
  let exerciciosAtivos: any[] = [];
  if (!cacheExercicios) {
    exerciciosAtivos = await prisma.exercicio.findMany({
      where: { ativo: true },
      select: {
        id: true,
        grupoMuscularPrincipal: true,
        sinergistas: true
      }
    });
  }
  
  // Calcular peso relativo de cada grupo (em memória)
  const pesosGrupos = new Map<string, number>();
  let pesoTotal = 0;
  
  grupos.forEach(grupo => {
    const exerciciosGrupo = cacheExercicios 
      ? cacheExercicios.get(grupo) || []
      : exerciciosAtivos.filter(ex => 
          ex.grupoMuscularPrincipal === grupo || 
          (ex.sinergistas || []).includes(grupo)
        );
    
    const peso = Math.max(1, exerciciosGrupo.length);
    pesosGrupos.set(grupo, peso);
    pesoTotal += peso;
  });
  
  // Distribuir proporcionalmente (versão simplificada)
  let distribuidos = 0;
  grupos.forEach((grupo, index) => {
    const peso = pesosGrupos.get(grupo) || 1;
    const proporcao = peso / pesoTotal;
    
    // Último grupo recebe o resto para garantir total exato
    const quantidade = index === grupos.length - 1
      ? totalExercicios - distribuidos
      : Math.max(1, Math.round(totalExercicios * proporcao));
    
    mapa.set(grupo, quantidade);
    distribuidos += quantidade;
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
 * Versão simplificada e otimizada - garante todos os grupos incluídos
 */
function balancearExerciciosAposCorte(
  exercicios: any[],
  grupos: string[],
  maxExercicios: number
): any[] {
  if (exercicios.length <= maxExercicios) {
    return exercicios;
  }

  // Mapa de prioridade: grupo -> lista de exercícios
  const mapaGrupos = new Map<string, any[]>();
  grupos.forEach(grupo => mapaGrupos.set(grupo, []));

  // Agrupar exercícios por grupo principal ou sinergista
  exercicios.forEach(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    if (grupos.includes(grupoPrincipal)) {
      mapaGrupos.get(grupoPrincipal)?.push(ex);
    } else {
      // Verificar sinergistas - adicionar no primeiro grupo sinergista encontrado
      const sinergistas = ex.sinergistas || [];
      for (const grupo of grupos) {
        if (sinergistas.includes(grupo)) {
          mapaGrupos.get(grupo)?.push(ex);
          break;
        }
      }
    }
  });

  const resultado: any[] = [];
  const gruposProcessados = new Set<string>();

  // Passo 1: Garantir mínimo de 1 exercício por grupo (todos os grupos incluídos)
  grupos.forEach(grupo => {
    const exerciciosGrupo = mapaGrupos.get(grupo) || [];
    if (exerciciosGrupo.length > 0 && resultado.length < maxExercicios) {
      resultado.push(exerciciosGrupo[0]);
      gruposProcessados.add(grupo);
    }
  });

  // Passo 2: Distribuir restante proporcionalmente entre TODOS os grupos
  const quantidadeRestante = maxExercicios - resultado.length;
  if (quantidadeRestante > 0) {
    const quantidadePorGrupo = Math.floor(quantidadeRestante / grupos.length);
    const resto = quantidadeRestante % grupos.length;

    grupos.forEach((grupo, index) => {
      if (resultado.length >= maxExercicios) return;
      
      const exerciciosGrupo = mapaGrupos.get(grupo) || [];
      const jaAdicionados = resultado.filter(ex => {
        const gp = ex.grupoMuscularPrincipal || '';
        const sin = ex.sinergistas || [];
        return gp === grupo || sin.includes(grupo);
      }).length;

      const quantidade = quantidadePorGrupo + (index < resto ? 1 : 0);
      const faltam = Math.max(0, quantidade - jaAdicionados);
      
      if (faltam > 0) {
        const disponiveis = exerciciosGrupo.filter(ex => !resultado.includes(ex));
        const adicionar = disponiveis.slice(0, faltam);
        resultado.push(...adicionar);
      }
    });
  }

  // Passo 3: Se ainda sobrar espaço, preencher com qualquer exercício restante
  const aindaFaltam = maxExercicios - resultado.length;
  if (aindaFaltam > 0) {
    const restantes = exercicios.filter(ex => !resultado.includes(ex));
    resultado.push(...restantes.slice(0, aindaFaltam));
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
  
  // Se todos os grupos foram filtrados, garantir pelo menos 2 grupos para treino balanceado
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Selecionando grupos menos críticos.`);
    
    // Versão simplificada: filtrar grupos não afetados e garantir mínimo de 2
    const gruposPrioritarios = grupos.filter(grupo => !gruposEvitar.includes(grupo));
    return gruposPrioritarios.length >= 2 
      ? gruposPrioritarios.slice(0, 2) 
      : grupos.slice(0, Math.min(2, grupos.length));
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
 * Busca exercícios com fallback inteligente otimizado
 * Versão consolidada: busca todos exercícios possíveis de uma vez e filtra em memória
 * Reduz N+1 queries para 1 query por grupo
 */
async function buscarExerciciosComFallback(
  grupo: string,
  exerciciosEvitar: Set<string>,
  quantidade: number,
  userId: string,
  data: Date,
  cacheExercicios?: Map<string, any[]> // Cache opcional para evitar queries repetidas
): Promise<any[]> {
  const quantidadeMinima = Math.max(quantidade, 3);
  
  // Buscar todos exercícios possíveis de uma vez (principal + sinergistas)
  let exercicios: any[];
  
  if (cacheExercicios && cacheExercicios.has(grupo)) {
    // Usar cache se disponível
    exercicios = cacheExercicios.get(grupo) || [];
  } else {
    // Buscar principal e sinergistas em uma única query
    exercicios = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        OR: [
          { grupoMuscularPrincipal: grupo },
          { sinergistas: { has: grupo } }
        ]
      },
      take: quantidadeMinima * 5, // Buscar mais para ter opções
      distinct: ['id']
    });
    
    // Armazenar no cache se fornecido
    if (cacheExercicios) {
      cacheExercicios.set(grupo, exercicios);
    }
  }
  
  // Filtrar em memória: remover evitados e duplicados
  const exerciciosFiltrados = exercicios.filter(ex => !exerciciosEvitar.has(ex.id));
  
  // Se não tem suficientes, buscar qualquer exercício do grupo (fallback final)
  if (exerciciosFiltrados.length < quantidadeMinima) {
    const idsJaFiltrados = new Set(exerciciosFiltrados.map(ex => ex.id));
    const fallback = await prisma.exercicio.findMany({
      where: {
        ativo: true,
        grupoMuscularPrincipal: grupo,
        id: { notIn: Array.from(idsJaFiltrados) }
      },
      take: quantidadeMinima - exerciciosFiltrados.length
    });
    exerciciosFiltrados.push(...fallback);
  }
  
  // Remover duplicados (garantia extra)
  const exerciciosUnicos = Array.from(
    new Map(exerciciosFiltrados.map(ex => [ex.id, ex])).values()
  );
  
  // Selecionar quantidade necessária com randomização determinística
  // Seed unificado para semana inteira (consistência)
  const inicioSemana = obterInicioSemana(data);
  const semana = Math.floor((inicioSemana.getTime() - new Date(inicioSemana.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const seed = gerarSeed(userId + grupo + semana.toString(), inicioSemana);
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
 * Considera últimos 2 treinos do mesmo grupo para evitar repetição mais inteligente
 */
async function buscarHistoricoExercicios(
  userId: string, 
  dias: number = 14,
  grupoAtual?: string
): Promise<Set<string>> {
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
              grupoMuscularPrincipal: true,
              sinergistas: true
            }
          }
        }
      }
    },
    orderBy: { data: 'desc' }
  });

  const exerciciosUsados = new Set<string>();
  
  // Se grupo atual especificado, considerar apenas últimos 2 treinos desse grupo
  let treinosRelevantes = treinos;
  if (grupoAtual) {
    treinosRelevantes = treinos.filter(treino => {
      return treino.exercicios.some(ex => {
        const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
        const sinergistas = ex.exercicio?.sinergistas || [];
        return grupo === grupoAtual || sinergistas.includes(grupoAtual);
      });
    }).slice(0, 2); // Últimos 2 treinos do mesmo grupo
  }
  
  treinosRelevantes.forEach(treino => {
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
// APLICAÇÃO DE CARDIO ESTRUTURADO
// ============================================================================

/**
 * Garante que todo treino tenha campo cardio estruturado
 * Fallback estrutural obrigatório para evitar quebras na UI
 */
/**
 * Garante que todo treino tenha campo cardio estruturado
 * Fallback estrutural obrigatório para evitar quebras na UI
 * Esta função pode ser usada em qualquer lugar onde um treino é retornado
 */
export function aplicarCardioAoTreino(treino: any, objetivo: string): any {
  // Fallback estrutural obrigatório
  if (!treino.cardio) {
    treino.cardio = { ativo: false };
  }

  // Se já preenchido pela IA, não sobrescrever
  if (treino.cardio.ativo === true && treino.cardio.tempoMinutos) {
    return treino;
  }

  let tempo = 0;
  let intensidade: 'leve' | 'moderada' | 'alta' = 'leve';
  let tipo = 'esteira';
  let momento: 'inicio' | 'final' | 'intercalado' = 'final';

  // Configuração baseada no objetivo
  switch (objetivo) {
    case 'Hipertrofia':
      tempo = 8;
      intensidade = 'moderada';
      momento = 'final';
      break;
    case 'Emagrecimento':
      tempo = 20;
      intensidade = 'moderada';
      momento = 'final';
      break;
    case 'Força':
      tempo = 5;
      intensidade = 'leve';
      momento = 'final';
      break;
    case 'Resistência':
      tempo = 25;
      intensidade = 'moderada';
      momento = 'final';
      break;
    case 'Reabilitação':
      tempo = 5;
      intensidade = 'leve';
      momento = 'final';
      break;
    default:
      tempo = 10;
      intensidade = 'moderada';
      momento = 'final';
  }

  treino.cardio = {
    ativo: tempo > 0,
    tipo,
    tempoMinutos: tempo,
    intensidade,
    momento
  };

  return treino;
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
  // Tempo disponível configurável: mínimo 30min, máximo 120min
  const tempoDisponivel = Math.max(30, Math.min(perfil.tempoDisponivel || 60, 120));
  const { maxExercicios, tempoEstimadoMinimo } = calcularMaxExerciciosPorTempo(tempoDisponivel, configTempo, minimoExercicios);
  
  // Avisar se tempo estimado ultrapassa tempo disponível
  if (tempoEstimadoMinimo > tempoDisponivel) {
    console.log(`[INFO] Tempo estimado (${Math.ceil(tempoEstimadoMinimo)}min) pode ultrapassar tempo disponível (${tempoDisponivel}min)`);
    console.log(`[INFO] Garantindo treino completo mesmo assim (mínimo necessário)`);
  }
  
  // Buscar todos exercícios ativos de uma vez para cache (otimização de performance)
  const exerciciosAtivos = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: {
      id: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });
  
  // Criar cache de exercícios por grupo (em memória)
  const cacheExercicios = new Map<string, any[]>();
  gruposFiltrados.forEach(grupo => {
    const exerciciosGrupo = exerciciosAtivos.filter(ex => 
      ex.grupoMuscularPrincipal === grupo || 
      (ex.sinergistas || []).includes(grupo)
    );
    cacheExercicios.set(grupo, exerciciosGrupo);
  });
  
  // Determinar quantos exercícios por grupo (distribuição ponderada com cache)
  const exerciciosPorGrupoMap = await determinarExerciciosPorGrupo(
    gruposFiltrados, 
    maxExercicios,
    cacheExercicios
  );
  
  // Buscar exercícios para cada grupo (com histórico específico por grupo e cache)
  const todosExercicios: any[] = [];
  for (const grupo of gruposFiltrados) {
    const quantidade = exerciciosPorGrupoMap.get(grupo) || 1;
    // Buscar histórico específico para este grupo (últimos 2 treinos do mesmo grupo)
    const historicoGrupo = await buscarHistoricoExercicios(userId, 14, grupo);
    // Combinar com histórico geral
    const historicoCombinado = new Set([...exerciciosEvitar, ...historicoGrupo]);
    
    const exercicios = await buscarExerciciosComFallback(
      grupo,
      historicoCombinado,
      quantidade,
      userId,
      data,
      cacheExercicios
    );
    todosExercicios.push(...exercicios);
    // Adicionar ao set global para próximos grupos
    exercicios.forEach(ex => exerciciosEvitar.add(ex.id));
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
        // Buscar histórico específico para este grupo
        const historicoGrupo = await buscarHistoricoExercicios(userId, 14, grupo);
        const historicoCombinado = new Set([...exerciciosEvitar, ...historicoGrupo]);
        
        // Buscar cache de exercícios se disponível
        const cacheExercicios = new Map<string, any[]>();
        gruposFiltrados.forEach(g => {
          const exerciciosGrupo = todosExercicios.filter(ex => 
            ex.grupoMuscularPrincipal === g || 
            (ex.sinergistas || []).includes(g)
          );
          cacheExercicios.set(g, exerciciosGrupo);
        });
        
        const exerciciosAdicionais = await buscarExerciciosComFallback(
          grupo,
          historicoCombinado,
          faltam,
          userId,
          data,
          cacheExercicios
        );
        todosExercicios.push(...exerciciosAdicionais);
        exerciciosAdicionais.forEach(ex => exerciciosEvitar.add(ex.id));
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

  // Calcular tempo estimado antes de criar treino
  const tempoEstimado = calcularTempoEstimado(exerciciosFinais.length, configTempo);

  // Criar treino e todos os exercícios em uma única transaction
  const treino = await prisma.$transaction(async (tx) => {
    // Criar treino
    const treinoCriado = await tx.treino.create({
      data: {
        userId,
        data: normalizarData(data),
        nome: nomeTreino,
        tipo: 'Treino IA',
        criadoPor: 'IA',
        concluido: false,
        letraTreino,
        tempoEstimado
      }
    });

    // Preparar todos os exercícios para batch insert (cardio + força + alongamento)
    const exercicioCardio = await selecionarExercicioAerobicoDoDia(data);
    const exercicioAlongamento = await buscarOuCriarExercicioAlongamento();
    
    const todosExerciciosTreino = [
      // 1. Cardio primeiro (ordem 0)
      {
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
      },
      // 2. Exercícios de força (ordem 1, 2, 3...)
      ...exerciciosFinais.map((exercicio, index) => ({
        treinoId: treinoCriado.id,
        exercicioId: exercicio.id,
        ordem: index + 1,
        series: parametros.series,
        repeticoes: parametros.repeticoes,
        rpe: parametros.rpe,
        descanso: parametros.descanso,
        concluido: false
      })),
      // 3. Alongamento por último (ordem final)
      {
        treinoId: treinoCriado.id,
        exercicioId: exercicioAlongamento.id,
        ordem: exerciciosFinais.length + 1,
        series: 1,
        repeticoes: `${configTempo.alongamento} min`,
        carga: null,
        rpe: 3,
        descanso: 0,
        concluido: false,
        observacoes: `Alongamento geral - ${configTempo.alongamento} minutos`
      }
    ];

    // Inserir todos os exercícios em batch
    await tx.exercicioTreino.createMany({
      data: todosExerciciosTreino
    });

    return treinoCriado;
  });

  // Tempo estimado já foi calculado e salvo na transaction

  // Buscar treino completo do banco para incluir cardio estruturado
  const treinoCompleto = await prisma.treino.findUnique({
    where: { id: treino.id },
    include: {
      exercicios: {
        include: { exercicio: true },
        orderBy: { ordem: 'asc' }
      }
    }
  });

  // Extrair informações do cardio do exercício (se existir)
  const exercicioCardio = treinoCompleto?.exercicios.find(
    ex => ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
  );

  // Preparar objeto de retorno com cardio estruturado
  const treinoRetorno: any = {
    id: treino.id,
    nome: nomeTreino,
    data: treino.data,
    gruposPrincipais: gruposFiltrados.slice(0, 3),
    totalExercicios: 1 + exerciciosFinais.length + 1, // Total de exercícios = cardio (1) + força (N) + alongamento (1)
    tempoEstimado,
    tipo: treino.tipo
  };

  // Aplicar cardio estruturado
  if (exercicioCardio) {
    const tempoMatch = exercicioCardio.repeticoes?.match(/(\d+)/);
    const tempoMinutos = tempoMatch ? parseInt(tempoMatch[1], 10) : configTempo.cardio;
    
    const nomeCardio = exercicioCardio.exercicio?.nome?.toLowerCase() || '';
    let tipo = 'esteira';
    if (nomeCardio.includes('bicicleta')) tipo = 'bicicleta';
    else if (nomeCardio.includes('eliptico') || nomeCardio.includes('elíptico')) tipo = 'eliptico';
    else if (nomeCardio.includes('remada')) tipo = 'remada';
    
    treinoRetorno.cardio = {
      ativo: true,
      tipo,
      tempoMinutos,
      intensidade: 'moderada' as const,
      momento: 'inicio' as const
    };
  } else {
    // Aplicar função para garantir cardio estruturado mesmo sem exercício
    aplicarCardioAoTreino(treinoRetorno, perfil.objetivo || 'Hipertrofia');
  }

  return treinoRetorno;
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
    return treinosExistentes.map((t) => {
      // Extrair informações do cardio
      const exercicioCardio = t.exercicios.find(
        ex => ex.exercicio?.grupoMuscularPrincipal === 'Cardio'
      );
      
      let cardio: CardioInfo = { ativo: false };
      if (exercicioCardio) {
        const tempoMatch = exercicioCardio.repeticoes?.match(/(\d+)/);
        const tempoMinutos = tempoMatch ? parseInt(tempoMatch[1], 10) : 15;
        
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
          momento: exercicioCardio.ordem === 0 ? 'inicio' : 'final'
        };
      } else {
        // Aplicar função para garantir cardio estruturado
        const treinoTemp: any = {};
        aplicarCardioAoTreino(treinoTemp, perfil.objetivo || 'Hipertrofia');
        cardio = treinoTemp.cardio || { ativo: false };
      }
      
      return {
        id: t.id,
        nome: t.nome,
        data: t.data,
        gruposPrincipais: extrairGruposPrincipais(t.exercicios),
        totalExercicios: t.exercicios.length,
        tempoEstimado: t.tempoEstimado || 60,
        tipo: t.tipo,
        cardio
      };
    });
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

  // Buscar histórico geral para evitar repetição
  const exerciciosEvitar = await buscarHistoricoExercicios(userId);

  // Determinar dias da semana usando função automática
  const diasTreino = distribuirDiasSemana(frequencia);
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  console.log(`[INFO] Dias de treino: ${diasTreino.map(d => nomesDias[d] || `Dia${d}`).join(', ')}`);

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
 * Versão otimizada: itera apenas uma vez sobre os exercícios
 * Considera grupo principal e sinergistas para refletir o balanceamento real
 */
function extrairGruposPrincipais(exercicios: any[]): string[] {
  const gruposIgnorar = new Set(['Cardio', 'Alongamento', 'Flexibilidade']);
  const gruposPrincipais = new Set<string>();
  const gruposSinergistas = new Set<string>();

  // Iterar apenas uma vez
  exercicios.forEach(ex => {
    const exercicio = ex.exercicio || ex;
    const grupoPrincipal = exercicio.grupoMuscularPrincipal;
    const sinergistas = exercicio.sinergistas || [];
    
    // Adicionar grupo principal (prioridade)
    if (grupoPrincipal && !gruposIgnorar.has(grupoPrincipal)) {
      gruposPrincipais.add(grupoPrincipal);
    }
    
    // Adicionar sinergistas (sem duplicar principais)
    sinergistas.forEach((sinergista: string) => {
      if (sinergista && !gruposIgnorar.has(sinergista) && !gruposPrincipais.has(sinergista)) {
        gruposSinergistas.add(sinergista);
      }
    });
  });

  // Priorizar principais, depois sinergistas (até 3)
  const resultado = [
    ...Array.from(gruposPrincipais),
    ...Array.from(gruposSinergistas)
  ].slice(0, 3);
  
  return resultado;
}

/**
 * Gera um único treino para uma data específica
 * Usa o motor centralizado para garantir consistência
 */
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
  
  // Calcular índice do dia usando função utilitária
  const inicioSemana = obterInicioSemana(data);
  const indiceDia = calcularIndiceDia(frequencia, data, inicioSemana);
  
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

