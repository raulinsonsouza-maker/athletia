/**
 * SPLIT GENERATOR SERVICE
 * 
 * Gera splits inteligentes baseados em grupos do banco
 * Distribui grupos de forma balanceada e otimizada
 */

import { obterTodosGruposAtivos } from './grupo-muscular.service';

// ============================================================================
// SPLITS PADRÃO (FALLBACK)
// ============================================================================

const SPLITS_PADRAO: Record<number, string[][]> = {
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

export const NOMES_SPLITS: Record<number, Record<number, string>> = {
  1: { 0: 'Full Body' },
  2: { 0: 'Superior (Push + Pull)', 1: 'Inferior + Core' },
  3: { 0: 'Peito, Ombros e Tríceps', 1: 'Costas, Bíceps e Posteriores', 2: 'Pernas e Abdômen' },
  4: { 0: 'Peito e Tríceps', 1: 'Costas e Bíceps', 2: 'Quadríceps e Panturrilhas', 3: 'Posteriores, Glúteos e Ombros' },
  5: { 0: 'Peito e Tríceps', 1: 'Costas e Bíceps', 2: 'Quadríceps e Glúteos', 3: 'Posteriores e Panturrilhas', 4: 'Ombros e Abdômen' },
  6: { 0: 'Peito', 1: 'Costas', 2: 'Quadríceps', 3: 'Posteriores', 4: 'Ombros', 5: 'Braços e Core' }
};

export const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ============================================================================
// CATEGORIZAÇÃO DE GRUPOS
// ============================================================================

interface CategoriasGrupos {
  superiores: string[];
  inferiores: string[];
  core: string[];
  forca: string[];
}

function categorizarGrupos(grupos: string[]): CategoriasGrupos {
  const gruposForca = grupos.filter(g => 
    !['Cardio', 'Alongamento', 'Flexibilidade'].includes(g)
  );
  
  const superiores = gruposForca.filter(g => 
    ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Trapézio', 'Antebraços'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  const inferiores = gruposForca.filter(g => 
    ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Adutores', 'Abdutores'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  const core = gruposForca.filter(g => 
    ['Abdômen', 'Oblíquos', 'Lombar'].some(cat => 
      g.toLowerCase().includes(cat.toLowerCase())
    )
  );
  
  return { superiores, inferiores, core, forca: gruposForca };
}

// ============================================================================
// GERADORES DE SPLITS POR FREQUÊNCIA
// ============================================================================

function gerarSplit1Dia(grupos: CategoriasGrupos): string[][] {
  return [[...grupos.forca]];
}

function gerarSplit2Dias(grupos: CategoriasGrupos): string[][] {
  return [
    [...grupos.superiores],
    [...grupos.inferiores, ...grupos.core]
  ];
}

function gerarSplit3Dias(grupos: CategoriasGrupos): string[][] {
  const push = grupos.forca.filter(g => 
    ['Peito', 'Ombros', 'Tríceps'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
  );
  const pull = grupos.forca.filter(g => 
    ['Costas', 'Bíceps', 'Trapézio'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
  );
  
  return [
    push.length > 0 ? push : grupos.superiores.slice(0, 3),
    pull.length > 0 ? pull : grupos.superiores.slice(3),
    [...grupos.inferiores, ...grupos.core]
  ];
}

function gerarSplit4Dias(grupos: CategoriasGrupos): string[][] {
  const peito = grupos.forca.filter(g => g.toLowerCase().includes('peito'));
  const costas = grupos.forca.filter(g => g.toLowerCase().includes('costas'));
  const triceps = grupos.forca.filter(g => 
    g.toLowerCase().includes('tríceps') || g.toLowerCase().includes('triceps')
  );
  const biceps = grupos.forca.filter(g => 
    g.toLowerCase().includes('bíceps') || g.toLowerCase().includes('biceps')
  );
  const ombros = grupos.forca.filter(g => g.toLowerCase().includes('ombro'));
  
  return [
    [...peito, ...triceps].length > 0 ? [...peito, ...triceps] : grupos.superiores.slice(0, 2),
    [...costas, ...biceps].length > 0 ? [...costas, ...biceps] : grupos.superiores.slice(2, 4),
    grupos.inferiores.length > 0 ? grupos.inferiores : grupos.forca.slice(5, 8),
    [...ombros, ...grupos.core].length > 0 ? [...ombros, ...grupos.core] : grupos.forca.slice(8)
  ];
}

function gerarSplit5Dias(grupos: CategoriasGrupos): string[][] {
  const peito = grupos.forca.filter(g => g.toLowerCase().includes('peito'));
  const costas = grupos.forca.filter(g => g.toLowerCase().includes('costas'));
  const ombros = grupos.forca.filter(g => g.toLowerCase().includes('ombro'));
  const bracos = grupos.forca.filter(g => 
    ['Bíceps', 'Tríceps', 'Antebraços'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
  );
  
  return [
    peito.length > 0 ? peito : grupos.forca.slice(0, 1),
    costas.length > 0 ? costas : grupos.forca.slice(1, 2),
    grupos.inferiores.length > 0 ? grupos.inferiores : grupos.forca.slice(2, 5),
    ombros.length > 0 ? ombros : grupos.forca.slice(5, 6),
    [...bracos, ...grupos.core].length > 0 ? [...bracos, ...grupos.core] : grupos.forca.slice(6)
  ];
}

function gerarSplit6MaisDias(grupos: CategoriasGrupos, frequencia: number): string[][] {
  const gruposPrincipais = [
    ...grupos.forca.filter(g => g.toLowerCase().includes('peito')),
    ...grupos.forca.filter(g => g.toLowerCase().includes('costas')),
    ...grupos.forca.filter(g => 
      g.toLowerCase().includes('quadríceps') || g.toLowerCase().includes('quadriceps')
    ),
    ...grupos.forca.filter(g => g.toLowerCase().includes('posterior')),
    ...grupos.forca.filter(g => g.toLowerCase().includes('ombro')),
    ...grupos.forca.filter(g => 
      ['Bíceps', 'Tríceps', 'Abdômen'].some(cat => g.toLowerCase().includes(cat.toLowerCase()))
    )
  ];
  
  if (gruposPrincipais.length < frequencia) {
    const gruposPorDia = Math.ceil(grupos.forca.length / frequencia);
    const splits: string[][] = [];
    for (let i = 0; i < frequencia; i++) {
      const inicio = i * gruposPorDia;
      const fim = Math.min(inicio + gruposPorDia, grupos.forca.length);
      splits.push(grupos.forca.slice(inicio, fim));
    }
    return splits;
  }
  
  const gruposPorDia = Math.ceil(gruposPrincipais.length / frequencia);
  const splits: string[][] = [];
  for (let i = 0; i < frequencia; i++) {
    const inicio = i * gruposPorDia;
    const fim = Math.min(inicio + gruposPorDia, gruposPrincipais.length);
    splits.push(gruposPrincipais.slice(inicio, fim));
  }
  return splits;
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

/**
 * Gera splits inteligentes baseados nos grupos do banco
 */
export async function gerarSplitsInteligentes(frequencia: number): Promise<string[][]> {
  const gruposAtivos = await obterTodosGruposAtivos();
  
  if (gruposAtivos.length === 0) {
    return SPLITS_PADRAO[frequencia] || SPLITS_PADRAO[3];
  }
  
  const categorias = categorizarGrupos(gruposAtivos);
  
  if (categorias.forca.length === 0) {
    return SPLITS_PADRAO[frequencia] || SPLITS_PADRAO[3];
  }
  
  let splits: string[][];
  
  switch (frequencia) {
    case 1:
      splits = gerarSplit1Dia(categorias);
      break;
    case 2:
      splits = gerarSplit2Dias(categorias);
      break;
    case 3:
      splits = gerarSplit3Dias(categorias);
      break;
    case 4:
      splits = gerarSplit4Dias(categorias);
      break;
    case 5:
      splits = gerarSplit5Dias(categorias);
      break;
    default:
      splits = gerarSplit6MaisDias(categorias, frequencia);
  }
  
  // Garantir que todos os splits tenham pelo menos 1 grupo
  const splitsValidos = splits.filter(s => s.length > 0);
  
  return splitsValidos.length > 0 ? splitsValidos : (SPLITS_PADRAO[frequencia] || SPLITS_PADRAO[3]);
}

/**
 * Obtém grupos do dia baseado na frequência e índice
 */
export async function obterGruposDoDia(frequencia: number, indiceDia: number): Promise<string[]> {
  try {
    const splits = await gerarSplitsInteligentes(frequencia);
    return splits[indiceDia % splits.length] || splits[0] || [];
  } catch (error) {
    console.error('[ERROR] Erro ao obter grupos do dia:', error);
    const splits = SPLITS_PADRAO[frequencia] || SPLITS_PADRAO[3];
    return splits[indiceDia % splits.length] || splits[0] || [];
  }
}

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

