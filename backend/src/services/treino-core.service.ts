/**
 * TREINO CORE SERVICE
 * 
 * Motor centralizado e unificado para geração de treinos inteligentes
 * Utiliza TODOS os dados do onboarding para gerar treinos perfeitos
 * 
 * Este é o único ponto de verdade para toda lógica de geração de treinos
 */

import { prisma } from '../lib/prisma';
import { selecionarExercicioAerobicoDoDia, buscarOuCriarExercicioAlongamento } from './treino.service';
import { getObjectiveParameters } from './treino-knowledge.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface PerfilCompleto {
  // Dados físicos
  idade?: number | null;
  sexo?: string | null;
  altura?: number | null;
  pesoAtual?: number | null;
  percentualGordura?: number | null;
  tipoCorpo?: string | null;
  
  // Experiência
  experiencia: string | null;
  problemasAnteriores: string[];
  lesoes: string[];
  
  // Objetivo
  objetivo: string | null;
  objetivosAdicionais: string[];
  rpePreferido?: number | null;
  
  // Treino
  frequenciaSemanal: number | null;
  tempoDisponivel?: number | null;
  localTreino?: string | null;
  preferencias: string[];
  
  // Saúde
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
  
  // Opções de grupos
  gruposSelecionados?: string[];
  frequenciaSemanal?: number;
  indiceDia?: number;
  corpoTodo?: boolean;
  focoMuscular?: string[];
  
  // Opções de tempo
  tempoDisponivel?: number;
  duracao?: number;
  
  // Opções de dificuldade
  dificuldade?: 'Iniciante' | 'Intermediário' | 'Avançado';
  objetivo?: string;
  experiencia?: string;
  
  // Opções de local
  localTreino?: string;
  
  // Opções de estrutura
  incluirCardio?: boolean;
  incluirAlongamento?: boolean;
  
  // Opções de nome
  nome?: string;
  letraTreino?: string;
  
  // Perfil completo (para aplicar dados do onboarding)
  perfil?: PerfilCompleto;
  aplicarDadosOnboarding?: boolean;
}

export interface FiltrosExercicio {
  exerciciosEvitar?: Set<string>;
  lesoes?: string[];
  localTreino?: string;
  dificuldade?: string;
  historico?: Set<string>;
  problemasAnteriores?: string[];
  preferencias?: string[];
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
// CACHE DE GRUPOS MUSCULARES VISUAIS
// ============================================================================

let cacheGruposVisuais: Array<{ id: string; nome: string; slug: string }> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém grupos musculares visuais ativos do banco (com cache)
 */
async function obterGruposVisuaisAtivos(): Promise<Array<{ id: string; nome: string; slug: string }>> {
  const agora = Date.now();
  
  // Retornar cache se ainda válido
  if (cacheGruposVisuais && (agora - cacheTimestamp) < CACHE_DURATION) {
    return cacheGruposVisuais;
  }
  
  // Buscar do banco
  const grupos = await prisma.grupoMuscularVisual.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      slug: true
    },
    orderBy: [{ ordem: 'asc' }, { nome: 'asc' }]
  });
  
  // Atualizar cache
  cacheGruposVisuais = grupos;
  cacheTimestamp = agora;
  
  return grupos;
}

/**
 * Obtém todos os nomes dos grupos ativos
 */
async function obterTodosGruposAtivos(): Promise<string[]> {
  const grupos = await obterGruposVisuaisAtivos();
  return grupos.map(g => g.nome);
}

/**
 * Mapeia nome/slug para grupo visual válido
 */
async function mapearGrupoParaVisual(nomeOuSlug: string): Promise<string | null> {
  const grupos = await obterGruposVisuaisAtivos();
  
  // Buscar por nome exato
  const porNome = grupos.find(g => 
    g.nome.toLowerCase() === nomeOuSlug.toLowerCase()
  );
  if (porNome) return porNome.nome;
  
  // Buscar por slug
  const porSlug = grupos.find(g => 
    g.slug.toLowerCase() === nomeOuSlug.toLowerCase()
  );
  if (porSlug) return porSlug.nome;
  
  // Buscar por match parcial
  const porMatch = grupos.find(g => 
    g.nome.toLowerCase().includes(nomeOuSlug.toLowerCase()) ||
    nomeOuSlug.toLowerCase().includes(g.nome.toLowerCase())
  );
  if (porMatch) return porMatch.nome;
  
  return null;
}

/**
 * Valida e mapeia lista de grupos para grupos visuais válidos
 */
async function validarEMapearGrupos(grupos: string[]): Promise<string[]> {
  const gruposValidos: string[] = [];
  const gruposAtivos = await obterTodosGruposAtivos();
  
  for (const grupo of grupos) {
    const grupoMapeado = await mapearGrupoParaVisual(grupo);
    if (grupoMapeado && gruposAtivos.includes(grupoMapeado)) {
      gruposValidos.push(grupoMapeado);
    } else {
      console.log(`[WARN] Grupo "${grupo}" não encontrado ou inativo. Pulando.`);
    }
  }
  
  return gruposValidos;
}

// ============================================================================
// MAPEAMENTO DE LESÕES E PROBLEMAS
// ============================================================================

const MAPEAMENTO_LESOES: Record<string, string[]> = {
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

const MAPEAMENTO_PROBLEMAS: Record<string, string[]> = {
  'Lesão no ombro': ['Supino reto', 'Desenvolvimento', 'Elevação lateral'],
  'Problema de coluna': ['Agachamento livre', 'Levantamento terra', 'Stiff'],
  'Lesão no joelho': ['Agachamento', 'Leg press', 'Afundo'],
  'Problema de lombar': ['Levantamento terra', 'Stiff', 'Good morning'],
};

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Gera splits inteligentes baseados nos grupos do banco
 */
async function gerarSplitsInteligentes(frequencia: number): Promise<string[][]> {
  const gruposAtivos = await obterTodosGruposAtivos();
  
  if (gruposAtivos.length === 0) {
    console.warn('[WARN] Nenhum grupo ativo encontrado. Usando splits padrão.');
    return SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  }
  
  // Filtrar grupos especiais (Cardio, Alongamento, Flexibilidade)
  const gruposForca = gruposAtivos.filter(g => 
    !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
  );
  
  if (gruposForca.length === 0) {
    return SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  }
  
  // Categorizar grupos
  const gruposSuperiores = gruposForca.filter(g => 
    ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Trapézio', 'Antebraços'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  const gruposInferiores = gruposForca.filter(g => 
    ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Adutores', 'Abdutores'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  const gruposCore = gruposForca.filter(g => 
    ['Abdômen', 'Oblíquos', 'Lombar'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  // Gerar splits baseado na frequência
  const splits: string[][] = [];
  
  if (frequencia === 1) {
    // Full Body: todos os grupos
    splits.push([...gruposForca]);
  } else if (frequencia === 2) {
    // A: Superior | B: Inferior + Core
    splits.push([...gruposSuperiores]);
    splits.push([...gruposInferiores, ...gruposCore]);
  } else if (frequencia === 3) {
    // A: Push (Peito, Ombros, Tríceps) | B: Pull (Costas, Bíceps) | C: Pernas + Core
    const push = gruposForca.filter(g => 
      ['Peito', 'Ombros', 'Tríceps'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
    );
    const pull = gruposForca.filter(g => 
      ['Costas', 'Bíceps', 'Trapézio'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
    );
    splits.push(push.length > 0 ? push : gruposSuperiores.slice(0, 3));
    splits.push(pull.length > 0 ? pull : gruposSuperiores.slice(3));
    splits.push([...gruposInferiores, ...gruposCore]);
  } else if (frequencia === 4) {
    // A: Peito + Tríceps | B: Costas + Bíceps | C: Pernas | D: Ombros + Core
    const peito = gruposForca.filter(g => g.toLowerCase().includes('peito'));
    const costas = gruposForca.filter(g => g.toLowerCase().includes('costas'));
    const triceps = gruposForca.filter(g => g.toLowerCase().includes('tríceps') || g.toLowerCase().includes('triceps'));
    const biceps = gruposForca.filter(g => g.toLowerCase().includes('bíceps') || g.toLowerCase().includes('biceps'));
    const ombros = gruposForca.filter(g => g.toLowerCase().includes('ombro'));
    
    splits.push([...peito, ...triceps].length > 0 ? [...peito, ...triceps] : gruposSuperiores.slice(0, 2));
    splits.push([...costas, ...biceps].length > 0 ? [...costas, ...biceps] : gruposSuperiores.slice(2, 4));
    splits.push(gruposInferiores.length > 0 ? gruposInferiores : gruposForca.slice(5, 8));
    splits.push([...ombros, ...gruposCore].length > 0 ? [...ombros, ...gruposCore] : gruposForca.slice(8));
  } else if (frequencia === 5) {
    // A: Peito | B: Costas | C: Pernas | D: Ombros | E: Braços + Core
    const peito = gruposForca.filter(g => g.toLowerCase().includes('peito'));
    const costas = gruposForca.filter(g => g.toLowerCase().includes('costas'));
    const ombros = gruposForca.filter(g => g.toLowerCase().includes('ombro'));
    const bracos = gruposForca.filter(g => 
      ['Bíceps', 'Tríceps', 'Antebraços'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
    );
    
    splits.push(peito.length > 0 ? peito : gruposForca.slice(0, 1));
    splits.push(costas.length > 0 ? costas : gruposForca.slice(1, 2));
    splits.push(gruposInferiores.length > 0 ? gruposInferiores : gruposForca.slice(2, 5));
    splits.push(ombros.length > 0 ? ombros : gruposForca.slice(5, 6));
    splits.push([...bracos, ...gruposCore].length > 0 ? [...bracos, ...gruposCore] : gruposForca.slice(6));
  } else if (frequencia >= 6) {
    // Split avançado: um grupo principal por dia
    const gruposPrincipais = [
      ...gruposForca.filter(g => g.toLowerCase().includes('peito')),
      ...gruposForca.filter(g => g.toLowerCase().includes('costas')),
      ...gruposForca.filter(g => g.toLowerCase().includes('quadríceps') || g.toLowerCase().includes('quadriceps')),
      ...gruposForca.filter(g => g.toLowerCase().includes('posterior')),
      ...gruposForca.filter(g => g.toLowerCase().includes('ombro')),
      ...gruposForca.filter(g => 
        ['Bíceps', 'Tríceps', 'Abdômen'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
      )
    ];
    
    // Se não encontrou grupos específicos, distribuir uniformemente
    if (gruposPrincipais.length < frequencia) {
      const gruposPorDia = Math.ceil(gruposForca.length / frequencia);
      for (let i = 0; i < frequencia; i++) {
        const inicio = i * gruposPorDia;
        const fim = Math.min(inicio + gruposPorDia, gruposForca.length);
        splits.push(gruposForca.slice(inicio, fim));
      }
    } else {
      // Distribuir grupos principais
      const gruposPorDia = Math.ceil(gruposPrincipais.length / frequencia);
      for (let i = 0; i < frequencia; i++) {
        const inicio = i * gruposPorDia;
        const fim = Math.min(inicio + gruposPorDia, gruposPrincipais.length);
        splits.push(gruposPrincipais.slice(inicio, fim));
      }
    }
  }
  
  // Garantir que todos os splits tenham pelo menos 1 grupo
  const splitsValidos = splits.filter(s => s.length > 0);
  
  if (splitsValidos.length === 0) {
    console.warn('[WARN] Nenhum split válido gerado. Usando padrão.');
    return SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  }
  
  return splitsValidos;
}

/**
 * Obtém splits por frequência semanal (usa grupos do banco)
 */
export async function obterSplitsPorFrequencia(frequencia: number): Promise<string[][]> {
  try {
    return await gerarSplitsInteligentes(frequencia);
  } catch (error) {
    console.error('[ERROR] Erro ao gerar splits dinâmicos. Usando padrão:', error);
    return SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
  }
}

/**
 * Calcula parâmetros do treino baseado no objetivo e experiência
 * Aplica ajustes por idade, sexo e RPE preferido
 */
export function calcularParametrosTreino(
  objetivo: string,
  experiencia: string,
  idade?: number | null,
  sexo?: string | null,
  rpePreferido?: number | null
): ParametrosTreino {
  // Usar função do treino-knowledge.service.ts
  let parametros = getObjectiveParameters(objetivo, experiencia || 'Intermediário', rpePreferido);
  
  // Ajustar por idade
  if (idade) {
    if (idade > 50) {
      // Reduzir intensidade e aumentar descanso para +50
      parametros.rpe = Math.max(6, parametros.rpe - 1);
      parametros.descanso = Math.min(180, parametros.descanso + 30);
    } else if (idade < 18) {
      // Ajustar para adolescentes
      parametros.rpe = Math.min(7, parametros.rpe);
      parametros.descanso = Math.max(60, parametros.descanso - 15);
    }
  }
  
  // Ajustar por sexo (diferenças hormonais)
  if (sexo === 'Feminino') {
    // Mulheres podem se recuperar mais rápido
    parametros.descanso = Math.max(60, parametros.descanso - 15);
  }
  
  return parametros;
}

/**
 * Obtém configuração de tempo baseada no objetivo
 */
export function calcularConfiguracaoTempo(
  objetivo: string,
  parametros: ParametrosTreino
): ConfiguracaoTempo {
  const { series, descanso } = parametros;
  
  switch (objetivo) {
    case 'Emagrecimento':
      return {
        cardio: 30, // Mais cardio para emagrecimento
        alongamento: 5,
        tempoPorExercicio: (series * 0.5) + ((series - 1) * (descanso / 60)) + 1
      };
    case 'Força':
      return {
        cardio: 5, // Menos cardio para força
        alongamento: 5,
        tempoPorExercicio: (series * 1) + ((series - 1) * (descanso / 60)) + 2
      };
    default: // Hipertrofia
      return {
        cardio: 15, // Cardio moderado
        alongamento: 7,
        tempoPorExercicio: (series * 0.5) + ((series - 1) * (descanso / 60)) + 1.5
      };
  }
}

/**
 * Calcula tempo estimado total do treino
 */
export function calcularTempoEstimado(
  totalExerciciosForca: number,
  configTempo: ConfiguracaoTempo
): number {
  const tempoForca = totalExerciciosForca * configTempo.tempoPorExercicio;
  return Math.ceil(configTempo.cardio + tempoForca + configTempo.alongamento);
}

// ============================================================================
// FUNÇÕES DE SELEÇÃO DE GRUPOS
// ============================================================================

/**
 * Distribui dias da semana uniformemente baseado na frequência
 */
export function distribuirDiasSemana(frequencia: number): number[] {
  if (frequencia <= 0 || frequencia > 7) {
    return [1, 3, 5]; // Padrão: Segunda, Quarta, Sexta
  }

  if (frequencia === 1) {
    return [1]; // Segunda
  }

  const dias: number[] = [];
  const diasDisponiveis = 6; // Segunda (1) a Sábado (6)
  
  const intervalo = (diasDisponiveis - 1) / (frequencia - 1);
  
  for (let i = 0; i < frequencia; i++) {
    const posicao = 1 + (i * intervalo);
    const dia = Math.floor(posicao);
    dias.push(Math.min(Math.max(dia, 1), 6));
  }

  return Array.from(new Set(dias)).sort((a, b) => a - b);
}

/**
 * Obtém grupos do dia baseado na frequência e índice (usa grupos do banco)
 */
export async function obterGruposDoDia(frequencia: number, indiceDia: number): Promise<string[]> {
  try {
    const splits = await obterSplitsPorFrequencia(frequencia);
    return splits[indiceDia % splits.length] || splits[0] || [];
  } catch (error) {
    console.error('[ERROR] Erro ao obter grupos do dia. Usando padrão:', error);
    const splits = SPLITS_GRUPOS[frequencia] || SPLITS_GRUPOS[3];
    return splits[indiceDia % splits.length] || splits[0] || [];
  }
}

/**
 * Mapeia lesões para grupos musculares que devem ser evitados
 */
export function mapearLesoesParaGrupos(lesoes: string[]): string[] {
  const gruposEvitar: string[] = [];
  
  lesoes.forEach(lesao => {
    const grupos = MAPEAMENTO_LESOES[lesao];
    if (grupos) {
      gruposEvitar.push(...grupos);
    } else {
      // Tentar match parcial
      for (const [key, grupos] of Object.entries(MAPEAMENTO_LESOES)) {
        if (lesao.toLowerCase().includes(key.toLowerCase())) {
          gruposEvitar.push(...grupos);
          break;
        }
      }
    }
  });
  
  return Array.from(new Set(gruposEvitar));
}

/**
 * Filtra grupos musculares baseado em lesões do usuário
 */
export function filtrarGruposPorLesoes(grupos: string[], lesoes: string[]): string[] {
  if (!lesoes || lesoes.length === 0) {
    return grupos;
  }
  
  const gruposEvitar = mapearLesoesParaGrupos(lesoes);
  
  if (gruposEvitar.length === 0) {
    return grupos;
  }
  
  const gruposFiltrados = grupos.filter(grupo => !gruposEvitar.includes(grupo));
  
  // Se todos os grupos foram filtrados, garantir pelo menos 2 grupos
  if (gruposFiltrados.length === 0) {
    console.log(`[WARN] Todos os grupos foram filtrados por lesões. Selecionando grupos menos críticos.`);
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
// FUNÇÕES DE FILTROS
// ============================================================================

/**
 * Filtra exercícios por local de treino
 */
export function filtrarPorLocalTreino(exercicios: any[], localTreino?: string | null): any[] {
  if (!localTreino) {
    return exercicios;
  }

  const localLower = localTreino.toLowerCase();
  
  // Academia comercial: permite todos os equipamentos
  if (localLower.includes('comercial') || localLower === 'academia') {
    return exercicios;
  }

  // Academia Pequena: permite halteres, barras e máquinas básicas
  if (localLower.includes('pequena')) {
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      const temEquipamentoBasico = equipamentos.some((eq: string) => {
        const eqLower = eq.toLowerCase();
        return eqLower.includes('halter') || 
               eqLower.includes('dumbbell') ||
               eqLower.includes('barra') ||
               eqLower.includes('peso corporal') ||
               eqLower.includes('corpo') ||
               eqLower.includes('máquina básica') ||
               eqLower.includes('esteira');
      });
      return temEquipamentoBasico || equipamentos.length === 0;
    });
  }

  // Sem equipamento: apenas peso corporal
  if (localLower.includes('sem equipamento')) {
    return exercicios.filter(ex => {
      const equipamentos = ex.equipamentoNecessario || [];
      const temPesoCorporal = equipamentos.some((eq: string) => 
        eq.toLowerCase().includes('peso corporal') || 
        eq.toLowerCase().includes('corpo')
      );
      return temPesoCorporal || equipamentos.length === 0;
    });
  }

  // Customizado: sem filtro
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
  if (!dificuldade) {
    return exercicios;
  }

  return exercicios.filter(ex => {
    const nivelEx = ex.nivelDificuldade || 'Intermediário';
    
    if (dificuldade === 'Iniciante') {
      return nivelEx === 'Iniciante';
    } else if (dificuldade === 'Intermediário') {
      return nivelEx === 'Iniciante' || nivelEx === 'Intermediário';
    }
    // Avançado aceita todos
    return true;
  });
}

/**
 * Filtra exercícios por histórico
 */
export function filtrarPorHistorico(
  exercicios: any[],
  historico?: Set<string>
): any[] {
  if (!historico || historico.size === 0) {
    return exercicios;
  }
  
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
  
  if (exerciciosEvitar.size === 0) {
    return exercicios;
  }
  
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
  if (!preferencias || preferencias.length === 0) {
    return exercicios;
  }
  
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
  
  // Retornar preferidos primeiro, depois outros
  return [...preferidos, ...outros];
}

/**
 * Aplica todos os filtros de exercícios
 */
export function aplicarFiltrosExercicios(
  exercicios: any[],
  filtros: FiltrosExercicio
): any[] {
  let filtrados = [...exercicios];
  
  // Filtrar por histórico
  if (filtros.historico) {
    filtrados = filtrarPorHistorico(filtrados, filtros.historico);
  }
  
  // Filtrar por exercícios a evitar
  if (filtros.exerciciosEvitar) {
    filtrados = filtrados.filter(ex => !filtros.exerciciosEvitar!.has(ex.id));
  }
  
  // Filtrar por local de treino
  if (filtros.localTreino) {
    filtrados = filtrarPorLocalTreino(filtrados, filtros.localTreino);
  }
  
  // Filtrar por dificuldade
  if (filtros.dificuldade) {
    filtrados = filtrarPorDificuldade(filtrados, filtros.dificuldade);
  }
  
  // Filtrar por problemas anteriores
  if (filtros.problemasAnteriores) {
    filtrados = filtrarPorProblemasAnteriores(filtrados, filtros.problemasAnteriores);
  }
  
  // Aplicar preferências (priorizar)
  if (filtros.preferencias) {
    filtrados = aplicarPreferencias(filtrados, filtros.preferencias);
  }
  
  return filtrados;
}

// ============================================================================
// FUNÇÕES DE HISTÓRICO
// ============================================================================

/**
 * Busca histórico de exercícios para evitar repetição
 */
export async function buscarHistoricoExercicios(
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
    }).slice(0, 2);
  }
  
  treinosRelevantes.forEach(treino => {
    treino.exercicios.forEach(ex => {
      const grupo = ex.exercicio?.grupoMuscularPrincipal || '';
      if (grupo !== 'Cardio' && grupo !== 'Alongamento' && grupo !== 'Flexibilidade') {
        exerciciosUsados.add(ex.exercicioId);
      }
    });
  });

  return exerciciosUsados;
}

// ============================================================================
// FUNÇÕES DE SELEÇÃO DE EXERCÍCIOS
// ============================================================================

/**
 * Busca exercícios com fallback inteligente (usa ExercicioGrupoMuscular primeiro)
 */
export async function buscarExerciciosComFallback(
  grupo: string,
  quantidade: number,
  filtros: FiltrosExercicio,
  userId: string,
  data: Date,
  cacheExercicios?: Map<string, any[]>
): Promise<any[]> {
  const quantidadeMinima = Math.max(quantidade, 3);
  
  // Buscar exercícios
  let exercicios: any[];
  
  if (cacheExercicios && cacheExercicios.has(grupo)) {
    exercicios = cacheExercicios.get(grupo) || [];
  } else {
    // Primeiro: buscar por grupo visual (ExercicioGrupoMuscular)
    const grupoVisual = await mapearGrupoParaVisual(grupo);
    
    if (grupoVisual) {
      // Buscar grupo visual no banco
      const grupoDb = await prisma.grupoMuscularVisual.findFirst({
        where: {
          nome: grupoVisual,
          ativo: true
        }
      });
      
      if (grupoDb) {
        // Buscar exercícios pela relação ExercicioGrupoMuscular
        const exerciciosComGrupo = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: {
                grupoVisualId: grupoDb.id,
                papel: 'PRINCIPAL'
              }
            }
          },
          include: {
            gruposMusculares: {
              include: {
                grupo: true
              }
            }
          },
          take: quantidadeMinima * 5,
          distinct: ['id']
        });
        
        // Também buscar sinergistas
        const exerciciosSinergistas = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: {
                grupoVisualId: grupoDb.id,
                papel: 'SINERGISTA'
              }
            },
            id: { notIn: exerciciosComGrupo.map(ex => ex.id) }
          },
          include: {
            gruposMusculares: {
              include: {
                grupo: true
              }
            }
          },
          take: quantidadeMinima * 2,
          distinct: ['id']
        });
        
        exercicios = [...exerciciosComGrupo, ...exerciciosSinergistas];
      }
    }
    
    // Fallback: usar grupoMuscularPrincipal se não encontrou por grupo visual
    if (!exercicios || exercicios.length === 0) {
      exercicios = await prisma.exercicio.findMany({
        where: {
          ativo: true,
          OR: [
            { grupoMuscularPrincipal: grupo },
            { sinergistas: { has: grupo } }
          ]
        },
        take: quantidadeMinima * 5,
        distinct: ['id']
      });
    }
    
    if (cacheExercicios) {
      cacheExercicios.set(grupo, exercicios);
    }
  }
  
  // Aplicar filtros
  exercicios = aplicarFiltrosExercicios(exercicios, filtros);
  
  // Se não tem suficientes, buscar qualquer exercício do grupo (fallback)
  if (exercicios.length < quantidadeMinima) {
    const idsJaFiltrados = new Set(exercicios.map(ex => ex.id));
    
    // Tentar por grupo visual primeiro
    const grupoVisual = await mapearGrupoParaVisual(grupo);
    if (grupoVisual) {
      const grupoDb = await prisma.grupoMuscularVisual.findFirst({
        where: { nome: grupoVisual, ativo: true }
      });
      
      if (grupoDb) {
        const fallback = await prisma.exercicio.findMany({
          where: {
            ativo: true,
            gruposMusculares: {
              some: {
                grupoVisualId: grupoDb.id
              }
            },
            id: { notIn: Array.from(idsJaFiltrados) }
          },
          take: quantidadeMinima - exercicios.length
        });
        exercicios.push(...fallback);
      }
    }
    
    // Fallback final: grupoMuscularPrincipal
    if (exercicios.length < quantidadeMinima) {
      const idsAtuais = new Set(exercicios.map(ex => ex.id));
      const fallback = await prisma.exercicio.findMany({
        where: {
          ativo: true,
          grupoMuscularPrincipal: grupo,
          id: { notIn: Array.from(idsAtuais) }
        },
        take: quantidadeMinima - exercicios.length
      });
      exercicios.push(...fallback);
    }
  }
  
  // Remover duplicados
  const exerciciosUnicos = Array.from(
    new Map(exercicios.map(ex => [ex.id, ex])).values()
  );
  
  // Selecionar quantidade necessária com randomização determinística
  const inicioSemana = obterInicioSemana(data);
  const semana = Math.floor((inicioSemana.getTime() - new Date(inicioSemana.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const seed = gerarSeed(userId + grupo + semana.toString(), inicioSemana);
  const shuffled = shuffleDeterministico(exerciciosUnicos, seed);
  
  const selecionados: any[] = [];
  for (const ex of shuffled) {
    if (selecionados.length >= quantidade) break;
    selecionados.push(ex);
  }
  
  return selecionados;
}

/**
 * Seleciona exercícios para múltiplos grupos
 */
export async function selecionarExerciciosParaGrupos(
  grupos: string[],
  quantidadeTotal: number,
  filtros: FiltrosExercicio,
  userId: string,
  data: Date
): Promise<any[]> {
  // Criar cache de exercícios
  const cacheExercicios = new Map<string, any[]>();
  const todosExerciciosAtivos = await prisma.exercicio.findMany({
    where: { ativo: true },
    select: {
      id: true,
      grupoMuscularPrincipal: true,
      sinergistas: true
    }
  });
  
  grupos.forEach(grupo => {
    const exerciciosGrupo = todosExerciciosAtivos.filter(ex => 
      ex.grupoMuscularPrincipal === grupo || 
      (ex.sinergistas || []).includes(grupo)
    );
    cacheExercicios.set(grupo, exerciciosGrupo);
  });
  
  // Determinar quantos exercícios por grupo
  const exerciciosPorGrupo = Math.max(1, Math.floor(quantidadeTotal / grupos.length));
  const exerciciosRestantes = quantidadeTotal - (exerciciosPorGrupo * grupos.length);
  
  const todosExercicios: any[] = [];
  
  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    const quantidade = exerciciosPorGrupo + (i < exerciciosRestantes ? 1 : 0);
    
    // Buscar histórico específico para este grupo
    const historicoGrupo = await buscarHistoricoExercicios(userId, 14, grupo);
    const historicoCombinado = new Set([
      ...(filtros.historico || []),
      ...historicoGrupo
    ]);
    
    const filtrosGrupo = {
      ...filtros,
      historico: historicoCombinado
    };
    
    const exercicios = await buscarExerciciosComFallback(
      grupo,
      quantidade,
      filtrosGrupo,
      userId,
      data,
      cacheExercicios
    );
    
    todosExercicios.push(...exercicios);
    
    // Adicionar ao histórico para próximos grupos
    exercicios.forEach(ex => {
      if (!filtros.historico) {
        filtros.historico = new Set();
      }
      filtros.historico.add(ex.id);
    });
  }
  
  return todosExercicios;
}

/**
 * Balanceia exercícios por grupo após corte
 */
export function balancearExerciciosPorGrupo(
  exercicios: any[],
  grupos: string[],
  maxExercicios: number
): any[] {
  if (exercicios.length <= maxExercicios) {
    return exercicios;
  }

  const mapaGrupos = new Map<string, any[]>();
  grupos.forEach(grupo => mapaGrupos.set(grupo, []));

  exercicios.forEach(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    if (grupos.includes(grupoPrincipal)) {
      mapaGrupos.get(grupoPrincipal)?.push(ex);
    } else {
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
  
  // Passo 1: Garantir mínimo de 1 exercício por grupo
  grupos.forEach(grupo => {
    const exerciciosGrupo = mapaGrupos.get(grupo) || [];
    if (exerciciosGrupo.length > 0 && resultado.length < maxExercicios) {
      resultado.push(exerciciosGrupo[0]);
    }
  });

  // Passo 2: Distribuir restante proporcionalmente
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

  // Passo 3: Preencher com qualquer exercício restante
  const aindaFaltam = maxExercicios - resultado.length;
  if (aindaFaltam > 0) {
    const restantes = exercicios.filter(ex => !resultado.includes(ex));
    resultado.push(...restantes.slice(0, aindaFaltam));
  }

  return resultado.slice(0, maxExercicios);
}

// ============================================================================
// FUNÇÕES DE APLICAÇÃO DE DADOS DO ONBOARDING
// ============================================================================

/**
 * Ajusta objetivo baseado em composição corporal
 */
function ajustarObjetivoPorGordura(
  objetivo: string,
  percentualGordura?: number | null,
  sexo?: string | null
): string {
  if (!percentualGordura) return objetivo;
  
  const limites = sexo === 'Feminino' 
    ? { alto: 30, baixo: 18 }
    : { alto: 20, baixo: 10 };
  
  if (percentualGordura > limites.alto && objetivo !== 'Emagrecimento') {
    return 'Emagrecimento';
  }
  
  if (percentualGordura < limites.baixo && objetivo === 'Emagrecimento') {
    return 'Hipertrofia';
  }
  
  return objetivo;
}

/**
 * Ajusta tempo baseado em tipo de corpo e objetivo
 */
function ajustarTempoPorTipoCorpo(
  tempoDisponivel?: number | null,
  tipoCorpo?: string | null,
  objetivo?: string | null
): number {
  if (!tempoDisponivel) return 60;
  
  // Ajustar baseado em tipo de corpo
  if (tipoCorpo) {
    const tipoLower = tipoCorpo.toLowerCase();
    if (tipoLower.includes('ectomorfo') || tipoLower.includes('magro')) {
      // Ectomorfo pode precisar de mais tempo para recuperação
      return Math.min(90, tempoDisponivel + 10);
    } else if (tipoLower.includes('endomorfo') || tipoLower.includes('sobrepeso')) {
      // Endomorfo pode se beneficiar de mais cardio
      return Math.max(45, tempoDisponivel);
    }
  }
  
  return tempoDisponivel;
}

/**
 * Aplica todos os dados do onboarding nas opções de treino
 */
export function aplicarDadosOnboarding(
  perfil: PerfilCompleto,
  opcoesTreino: TreinoOptions
): TreinoOptions {
  // Ajustar objetivo baseado em percentual de gordura
  const objetivoAjustado = ajustarObjetivoPorGordura(
    perfil.objetivo || opcoesTreino.objetivo || 'Hipertrofia',
    perfil.percentualGordura,
    perfil.sexo
  );
  
  // Ajustar tempo baseado em tipo de corpo
  const tempoAjustado = ajustarTempoPorTipoCorpo(
    perfil.tempoDisponivel || opcoesTreino.tempoDisponivel,
    perfil.tipoCorpo,
    objetivoAjustado
  );
  
  return {
    ...opcoesTreino,
    objetivo: objetivoAjustado,
    experiencia: perfil.experiencia || opcoesTreino.experiencia,
    tempoDisponivel: tempoAjustado,
    localTreino: perfil.localTreino || opcoesTreino.localTreino,
    frequenciaSemanal: perfil.frequenciaSemanal || opcoesTreino.frequenciaSemanal,
    perfil
  };
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarData(data: Date): Date {
  const dt = new Date(data);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function obterInicioSemana(data: Date): Date {
  const inicio = normalizarData(data);
  const diaSemana = inicio.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + diff);
  return inicio;
}

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

function calcularMaxExerciciosPorTempo(
  tempoDisponivel: number,
  configTempo: ConfiguracaoTempo,
  minimoNecessario: number
): { maxExercicios: number; tempoEstimadoMinimo: number } {
  const { cardio, alongamento, tempoPorExercicio } = configTempo;
  const tempoUtil = tempoDisponivel - cardio - alongamento;
  
  const maxCalculado = tempoUtil > 0 
    ? Math.floor(tempoUtil / tempoPorExercicio)
    : 0;
  
  const maxExercicios = Math.max(minimoNecessario, Math.min(10, maxCalculado));
  const tempoEstimadoMinimo = cardio + alongamento + (maxExercicios * tempoPorExercicio);
  
  if (tempoEstimadoMinimo > tempoDisponivel) {
    const excesso = Math.ceil(tempoEstimadoMinimo - tempoDisponivel);
    console.log(`[WARN] Tempo disponível: ${tempoDisponivel}min | Estimado: ${Math.ceil(tempoEstimadoMinimo)}min (+${excesso}min)`);
  }
  
  return { maxExercicios, tempoEstimadoMinimo };
}

function contarExerciciosPorGrupo(exercicios: any[], grupo: string): number {
  return exercicios.filter(ex => {
    const grupoPrincipal = ex.grupoMuscularPrincipal || '';
    const sinergistas = ex.sinergistas || [];
    return grupoPrincipal === grupo || sinergistas.includes(grupo);
  }).length;
}

function gerarSeed(userId: string, data: Date): number {
  const dataString = data.toISOString().split('T')[0];
  const hash = userId + dataString;
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed) + hash.charCodeAt(i);
    seed = seed & seed;
  }
  return Math.abs(seed);
}

function shuffleDeterministico<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let random = seed;
  
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

