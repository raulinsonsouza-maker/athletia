/**
 * Serviço de Feedback Profissional
 * 
 * Interpreta feedback simples do usuário (Muito fácil / No ponto / Pesado demais)
 * e calcula ajustes automáticos profissionais baseados em metodologias de treinamento
 * de alto nível (Mike Israetel, Eric Helms, Renaissance Periodization)
 */

export type FeedbackSimples = 'MUITO_FACIL' | 'NO_PONTO' | 'PESADO_DEMAIS';

export interface AjusteAutomatico {
  tipo: 'CARGA' | 'REPETICOES' | 'SERIES' | 'VARIACAO';
  valor: number | string; // Nova carga, novas reps, ou ID de variação
  motivo: string;
  aplicavel: boolean;
}

export interface InterpretacaoFeedback {
  feedback: FeedbackSimples;
  ajuste: AjusteAutomatico | null;
  mensagem: string;
}

/**
 * Interpreta feedback simples e retorna ajuste profissional
 */
export function interpretarFeedback(
  feedback: FeedbackSimples,
  cargaAtual: number | null,
  repeticoes: string,
  series: number,
  exercicioId: string,
  objetivo: string = 'Hipertrofia'
): InterpretacaoFeedback {
  switch (feedback) {
    case 'MUITO_FACIL':
      return interpretarMuitoFacil(cargaAtual, repeticoes, series, objetivo);
    
    case 'NO_PONTO':
      return {
        feedback: 'NO_PONTO',
        ajuste: null,
        mensagem: 'Estímulo ideal. Mantenha os mesmos parâmetros na próxima vez.'
      };
    
    case 'PESADO_DEMAIS':
      return interpretarPesadoDemais(cargaAtual, repeticoes, series, objetivo);
    
    default:
      return {
        feedback: 'NO_PONTO',
        ajuste: null,
        mensagem: 'Mantenha os mesmos parâmetros.'
      };
  }
}

/**
 * Interpreta "Muito fácil" - corpo consegue mais, aumentar estímulo
 */
function interpretarMuitoFacil(
  cargaAtual: number | null,
  repeticoes: string,
  series: number,
  objetivo: string
): InterpretacaoFeedback {
  // Se tem carga (exercício com peso)
  if (cargaAtual && cargaAtual > 0) {
    // Calcular aumento baseado no objetivo
    const aumentoPercentual = objetivo === 'Força' ? 0.05 : 0.025; // 5% para força, 2.5% para hipertrofia
    const novaCarga = cargaAtual * (1 + aumentoPercentual);
    
    // Arredondar para múltiplos de 2.5kg (step comum de halteres)
    const cargaArredondada = Math.round(novaCarga / 2.5) * 2.5;
    
    return {
      feedback: 'MUITO_FACIL',
      ajuste: {
        tipo: 'CARGA',
        valor: cargaArredondada,
        motivo: `Exercício foi muito fácil. Aumente a carga de ${cargaAtual}kg para ${cargaArredondada}kg (${((aumentoPercentual * 100).toFixed(1))}% a mais) na próxima vez.`,
        aplicavel: true
      },
      mensagem: `Exercício foi muito fácil. Vamos aumentar a carga para ${cargaArredondada}kg na próxima vez.`
    };
  }
  
  // Exercício sem carga (peso corporal)
  const repsAtuais = parseRepeticoes(repeticoes);
  
  // Aumentar 1-2 repetições ou adicionar 1 série
  if (series < 4) {
    // Adicionar série se tiver menos de 4
    return {
      feedback: 'MUITO_FACIL',
      ajuste: {
        tipo: 'SERIES',
        valor: series + 1,
        motivo: `Exercício foi muito fácil. Adicione 1 série (de ${series} para ${series + 1} séries) na próxima vez.`,
        aplicavel: true
      },
      mensagem: `Exercício foi muito fácil. Vamos adicionar 1 série na próxima vez.`
    };
  } else {
    // Aumentar repetições
    const novasReps = repsAtuais.media + 2;
    return {
      feedback: 'MUITO_FACIL',
      ajuste: {
        tipo: 'REPETICOES',
        valor: novasReps.toString(),
        motivo: `Exercício foi muito fácil. Aumente as repetições de ${repeticoes} para ${novasReps} na próxima vez.`,
        aplicavel: true
      },
      mensagem: `Exercício foi muito fácil. Vamos aumentar as repetições para ${novasReps} na próxima vez.`
    };
  }
}

/**
 * Interpreta "Pesado demais" - corpo não aguentou, reduzir estímulo
 */
function interpretarPesadoDemais(
  cargaAtual: number | null,
  repeticoes: string,
  series: number,
  objetivo: string
): InterpretacaoFeedback {
  // Se tem carga (exercício com peso)
  if (cargaAtual && cargaAtual > 0) {
    // Reduzir 2.5% a 5%
    const reducaoPercentual = 0.05; // 5% de redução
    const novaCarga = cargaAtual * (1 - reducaoPercentual);
    
    // Arredondar para múltiplos de 2.5kg
    const cargaArredondada = Math.max(2.5, Math.round(novaCarga / 2.5) * 2.5);
    
    return {
      feedback: 'PESADO_DEMAIS',
      ajuste: {
        tipo: 'CARGA',
        valor: cargaArredondada,
        motivo: `Exercício foi pesado demais. Reduza a carga de ${cargaAtual}kg para ${cargaArredondada}kg (${((reducaoPercentual * 100).toFixed(1))}% a menos) na próxima vez para manter a forma técnica.`,
        aplicavel: true
      },
      mensagem: `Exercício foi pesado demais. Vamos reduzir a carga para ${cargaArredondada}kg na próxima vez para manter a forma técnica.`
    };
  }
  
  // Exercício sem carga (peso corporal)
  const repsAtuais = parseRepeticoes(repeticoes);
  
  // Reduzir 1-2 repetições
  const novasReps = Math.max(1, repsAtuais.media - 2);
  
  return {
    feedback: 'PESADO_DEMAIS',
    ajuste: {
      tipo: 'REPETICOES',
      valor: novasReps.toString(),
      motivo: `Exercício foi pesado demais. Reduza as repetições de ${repeticoes} para ${novasReps} na próxima vez para manter a forma técnica.`,
      aplicavel: true
    },
    mensagem: `Exercício foi pesado demais. Vamos reduzir as repetições para ${novasReps} na próxima vez.`
  };
}

/**
 * Parse repetições (ex: "8-12" retorna {min: 8, max: 12, media: 10})
 */
function parseRepeticoes(repeticoes: string): { min: number; max: number; media: number } {
  const parts = repeticoes.split('-').map(s => parseInt(s.trim(), 10));
  
  if (parts.length === 1) {
    const num = parts[0];
    return { min: num, max: num, media: num };
  }
  
  const min = parts[0];
  const max = parts[1];
  return { min, max, media: Math.round((min + max) / 2) };
}

/**
 * Valida se ajuste pode ser aplicado
 */
export function podeAplicarAjuste(
  exercicioConcluido: boolean,
  feedbackFornecido: boolean,
  aceitouAjuste: boolean | null,
  proximoTreinoGerado: boolean,
  modoManual: boolean
): boolean {
  return (
    exercicioConcluido &&
    feedbackFornecido &&
    (aceitouAjuste === true || aceitouAjuste === null) && // null = modo automático
    !proximoTreinoGerado &&
    !modoManual
  );
}

/**
 * Aplica ajuste automático ao próximo treino
 */
export function aplicarAjusteAutomatico(
  ajuste: AjusteAutomatico,
  exercicioTreinoAtual: any
): Partial<any> {
  const dadosAtualizados: any = {};
  
  switch (ajuste.tipo) {
    case 'CARGA':
      dadosAtualizados.carga = ajuste.valor as number;
      break;
    
    case 'REPETICOES':
      dadosAtualizados.repeticoes = ajuste.valor as string;
      break;
    
    case 'SERIES':
      dadosAtualizados.series = ajuste.valor as number;
      break;
    
    case 'VARIACAO':
      // Trocar exercício por variação mais fácil
      dadosAtualizados.exercicioId = ajuste.valor as string;
      break;
  }
  
  return dadosAtualizados;
}

