/**
 * TREINO PARAMETERS SERVICE
 * 
 * Calcula parâmetros de treino (séries, repetições, RPE, descanso)
 * e configurações de tempo baseadas em objetivo e perfil
 */

import { getObjectiveParameters } from './treino-knowledge.service';

// ============================================================================
// TIPOS
// ============================================================================

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

// ============================================================================
// CÁLCULO DE PARÂMETROS
// ============================================================================

/**
 * Calcula parâmetros do treino baseado no objetivo e experiência
 * Aplica ajustes por idade, sexo e RPE preferido
 */
export function calcularParametrosTreino(
  objetivo: string,
  experiencia: string,
  idade?: number | null,
  sexo?: string | null,
  rpePreferido?: number | null,
  ajustes?: { delta?: number; teto?: number }
): ParametrosTreino {
  let parametros = getObjectiveParameters(objetivo, experiencia || 'Intermediário', rpePreferido);
  
  // Ajustar por idade
  if (idade) {
    if (idade > 50) {
      parametros.rpe = Math.max(6, parametros.rpe - 1);
      parametros.descanso = Math.min(180, parametros.descanso + 30);
    } else if (idade < 18) {
      parametros.rpe = Math.min(7, parametros.rpe);
      parametros.descanso = Math.max(60, parametros.descanso - 15);
    }
  }
  
  // Ajustar por sexo (diferenças hormonais)
  if (sexo === 'Feminino') {
    parametros.descanso = Math.max(60, parametros.descanso - 15);
  }

  if (ajustes?.delta) {
    parametros.rpe = Math.max(5, parametros.rpe + ajustes.delta);
  }
  if (ajustes?.teto) {
    parametros.rpe = Math.min(ajustes.teto, parametros.rpe);
  }
  
  return parametros;
}

/**
 * Encaixa a força no tempo marcado. O cardio permanece, no mínimo 5 minutos.
 */
export function caberTreinoNoTempo(opcoes: {
  tempoDisponivel: number;
  tempoPorExercicio: number;
  cardioDesejado: number;
  cardioCurto?: boolean;
  reduzirVolume?: boolean;
}): { exerciciosForca: number; cardioMinutos: number } {
  const teto = Math.max(20, opcoes.tempoDisponivel || 45);
  const tempoEx = Math.max(1, opcoes.tempoPorExercicio || 4);
  let cardio = opcoes.cardioCurto ? Math.min(opcoes.cardioDesejado, 10) : opcoes.cardioDesejado;
  cardio = Math.max(5, cardio);
  let forca = Math.min(8, Math.floor((teto - 5) / tempoEx));
  if (opcoes.reduzirVolume) forca -= 2;
  forca = Math.max(2, forca);
  while (forca * tempoEx + cardio > teto && forca > 2) forca -= 1;
  const restante = teto - forca * tempoEx;
  cardio = Math.max(5, Math.min(cardio, Math.floor(restante)));
  return { exerciciosForca: forca, cardioMinutos: cardio };
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
        cardio: 30,
        alongamento: 5,
        tempoPorExercicio: (series * 0.5) + ((series - 1) * (descanso / 60)) + 1
      };
    case 'Força':
      return {
        cardio: 5,
        alongamento: 5,
        tempoPorExercicio: (series * 1) + ((series - 1) * (descanso / 60)) + 2
      };
    default: // Hipertrofia
      return {
        cardio: 15,
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

/**
 * Calcula número máximo de exercícios baseado no tempo disponível
 */
export function calcularMaxExerciciosPorTempo(
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

