import { prisma } from '../lib/prisma';
import { nearestAllowedWeight, getEquipmentStep } from './progression.service';

export interface PerfilUsuario {
  experiencia?: string;
  objetivo?: string;
  frequenciaSemanal?: number;
  tempoDisponivel?: number;
  lesoes?: string[];
  equipamentos?: string[];
}

export interface DivisaoTreino {
  tipo: string;
  gruposMusculares: string[];
  descricao: string;
}

/**
 * Determina a divisão de treino baseada no perfil do usuário
 */
export function determinarDivisaoTreino(perfil: PerfilUsuario): DivisaoTreino {
  const { experiencia, objetivo, frequenciaSemanal } = perfil;

  // Iniciantes: Full Body ou A-B
  if (experiencia === 'Iniciante') {
    if (frequenciaSemanal && frequenciaSemanal <= 3) {
      return {
        tipo: 'Full Body',
        gruposMusculares: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas'],
        descricao: 'Treino completo do corpo em uma sessão'
      };
    } else {
      return {
        tipo: 'A-B',
        gruposMusculares: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
        descricao: 'Dia A: Membros superiores | Dia B: Membros inferiores'
      };
    }
  }

  // Intermediários: A-B-C
  if (experiencia === 'Intermediário') {
    return {
      tipo: 'A-B-C',
      gruposMusculares: ['Quadríceps', 'Posteriores', 'Panturrilhas'],
      descricao: 'A: Pernas | B: Peito/Ombro/Tríceps | C: Costas/Bíceps/Abdômen'
    };
  }

  // Avançados: A-B-C-D ou Push Pull Legs
  if (experiencia === 'Avançado') {
    if (frequenciaSemanal && frequenciaSemanal >= 5) {
      return {
        tipo: 'A-B-C-D-E',
        gruposMusculares: ['Peito'],
        descricao: 'A: Peito | B: Costas | C: Pernas | D: Ombros | E: Braços'
      };
    } else if (frequenciaSemanal === 4) {
      return {
        tipo: 'A-B-C-D',
        gruposMusculares: ['Peito'],
        descricao: 'A: Peito | B: Costas | C: Pernas | D: Ombros'
      };
    } else {
      return {
        tipo: 'Push Pull Legs',
        gruposMusculares: ['Peito', 'Ombros', 'Tríceps'],
        descricao: 'Push: Peito/Ombro/Tríceps | Pull: Costas/Bíceps | Legs: Pernas'
      };
    }
  }

  // Default: A-B-C
  return {
    tipo: 'A-B-C',
    gruposMusculares: ['Quadríceps', 'Posteriores'],
    descricao: 'Divisão padrão intermediária'
  };
}

/**
 * Determina grupos musculares do dia baseado na divisão e dia da semana
 */
export function determinarGruposDoDia(
  divisao: DivisaoTreino,
  diaSemana: number, // 0-6 (domingo-sábado)
  frequenciaSemanal: number
): string[] {
  const { tipo } = divisao;
  
  // Ajustar dia da semana: 0=domingo, 1=segunda, etc.
  // Usar dia da semana atual para determinar o ciclo
  const diaAjustado = diaSemana === 0 ? 7 : diaSemana; // Domingo = 7 para facilitar cálculo

  switch (tipo) {
    case 'Full Body':
      return ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Quadríceps', 'Posteriores', 'Panturrilhas'];

    case 'A-B':
      // Alterna entre A e B baseado no dia da semana
      const cicloAB = Math.floor((diaAjustado - 1) / 2) % 2;
      return cicloAB === 0
        ? ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps']
        : ['Quadríceps', 'Posteriores', 'Panturrilhas'];

    case 'A-B-C':
      const cicloABC = (diaAjustado - 1) % 3;
      if (cicloABC === 0) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      if (cicloABC === 1) return ['Peito', 'Ombros', 'Tríceps'];
      return ['Costas', 'Bíceps', 'Abdômen'];

    case 'A-B-C-D':
      const cicloABCD = (diaAjustado - 1) % 4;
      if (cicloABCD === 0) return ['Peito'];
      if (cicloABCD === 1) return ['Costas'];
      if (cicloABCD === 2) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      return ['Ombros'];

    case 'A-B-C-D-E':
      const cicloABCDE = (diaAjustado - 1) % 5;
      if (cicloABCDE === 0) return ['Peito'];
      if (cicloABCDE === 1) return ['Costas'];
      if (cicloABCDE === 2) return ['Quadríceps', 'Posteriores', 'Panturrilhas'];
      if (cicloABCDE === 3) return ['Ombros'];
      return ['Bíceps', 'Tríceps'];

    case 'Push Pull Legs':
      const cicloPPL = (diaAjustado - 1) % 3;
      if (cicloPPL === 0) return ['Peito', 'Ombros', 'Tríceps'];
      if (cicloPPL === 1) return ['Costas', 'Bíceps'];
      return ['Quadríceps', 'Posteriores', 'Panturrilhas'];

    default:
      return ['Peito', 'Costas', 'Ombros'];
  }
}

/**
 * Função local para calcular parâmetros de treino (evita dependência circular)
 */
function calcularParametrosTreinoLocal(
  objetivo: string,
  experiencia: string
): { series: number; repeticoes: string; rpe: number; descanso: number } {
  let series = 3;
  let repeticoes = '10-12';
  let rpe = 7;
  let descanso = 90;

  if (objetivo === 'Força') {
    series = experiencia === 'Avançado' ? 5 : 4;
    repeticoes = '3-5';
    rpe = 8;
    descanso = 180;
  } else if (objetivo === 'Hipertrofia') {
    series = experiencia === 'Iniciante' ? 3 : 4;
    repeticoes = experiencia === 'Iniciante' ? '10-12' : '8-12';
    rpe = 7;
    descanso = 90;
  } else if (objetivo === 'Emagrecimento') {
    series = 3;
    repeticoes = '12-15';
    rpe = 6;
    descanso = 60;
  }

  return { series, repeticoes, rpe, descanso };
}

/**
 * Calcula séries e repetições baseado no objetivo
 * @deprecated Use calcularParametrosTreino de workout-intelligence.service.ts
 */
export function calcularSeriesRepeticoes(
  objetivo?: string,
  experiencia?: string
): { series: number; repeticoes: string; rpe: number; descanso: number } {
  // Usar função local para evitar dependência circular
  return calcularParametrosTreinoLocal(objetivo || 'Hipertrofia', experiencia || 'Iniciante');
}

/**
 * Calcula carga inicial baseada no peso do usuário e experiência
 * (Mantida para compatibilidade, mas agora usa o novo engine internamente)
 */
export function calcularCargaInicial(
  pesoUsuario: number,
  grupoMuscular: string,
  experiencia?: string,
  equipamentoNecessario?: string[]
): number {
  // Percentuais aproximados de 1RM baseado no grupo muscular e experiência
  const percentuais: Record<string, Record<string, number>> = {
    'Iniciante': {
      'Peito': 0.35,
      'Costas': 0.30,
      'Ombros': 0.25,
      'Bíceps': 0.20,
      'Tríceps': 0.20,
      'Quadríceps': 0.50,
      'Posteriores': 0.40,
      'Panturrilhas': 0.60,
      'Abdômen': 0.10
    },
    'Intermediário': {
      'Peito': 0.50,
      'Costas': 0.45,
      'Ombros': 0.35,
      'Bíceps': 0.30,
      'Tríceps': 0.30,
      'Quadríceps': 0.70,
      'Posteriores': 0.55,
      'Panturrilhas': 0.80,
      'Abdômen': 0.15
    },
    'Avançado': {
      'Peito': 0.65,
      'Costas': 0.60,
      'Ombros': 0.45,
      'Bíceps': 0.40,
      'Tríceps': 0.40,
      'Quadríceps': 0.90,
      'Posteriores': 0.75,
      'Panturrilhas': 1.00,
      'Abdômen': 0.20
    }
  };

  const exp = experiencia || 'Iniciante';
  const percentual = percentuais[exp]?.[grupoMuscular] || 0.30;
  const cargaInicial = pesoUsuario * percentual;
  
  // Mapear para step do equipamento se disponível
  if (equipamentoNecessario && equipamentoNecessario.length > 0) {
    const equipment = getEquipmentStep(equipamentoNecessario);
    if (equipment.stepTotal > 0) {
      return nearestAllowedWeight(cargaInicial, [equipment.stepTotal]);
    }
  }
  
  // Fallback: arredondar para múltiplo de 2.5kg e depois inteiro
  const cargaArredondada = Math.round(cargaInicial / 2.5) * 2.5;
  return Math.round(cargaArredondada);
}

/**
 * Calcula tempo estimado do treino
 */
export function calcularTempoEstimado(
  numExercicios: number,
  series: number,
  descanso: number
): number {
  // Tempo por série: ~30 segundos de execução + descanso
  const tempoPorSerie = 30 + descanso;
  const tempoTotal = (numExercicios * series * tempoPorSerie) / 60; // em minutos
  const tempoAquecimento = 5; // 5 minutos de aquecimento
  
  return Math.ceil(tempoTotal + tempoAquecimento);
}

