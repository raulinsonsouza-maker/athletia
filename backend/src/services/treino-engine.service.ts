/**
 * TREINO ENGINE SERVICE V3.0
 * 
 * Wrapper de alto nível que usa o motor centralizado (treino-core.service.ts)
 * Mantém compatibilidade com APIs existentes
 */

import { prisma } from '../lib/prisma';
import { garantirPerfilParaInteligencia } from './perfil.service';
import {
  gerarTreinoUnificado,
  regenerarTreinos30Dias,
  distribuirDiasSemana,
  obterInicioSemana,
  PerfilCompleto,
  TreinoGerado,
  TreinoOptions
} from './treino-core.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type PerfilTreino = Awaited<ReturnType<typeof garantirPerfilParaInteligencia>>;

export interface TreinoEngineConfig {
  userId: string;
  dataReferencia?: Date;
  forcarRegeneracao?: boolean;
}

interface CardioInfo {
  ativo: boolean;
  tipo?: string;
  tempoMinutos?: number;
  intensidade?: 'leve' | 'moderada' | 'alta';
  momento?: 'inicio' | 'final' | 'intercalado';
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const LETRAS_TREINO = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function obterFimSemana(inicioSemana: Date): Date {
  const fim = new Date(inicioSemana);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

/**
 * Calcula índice do dia baseado na frequência e data
 */
function calcularIndiceDia(frequencia: number, data: Date, inicioSemana: Date): number {
  const diasTreino = distribuirDiasSemana(frequencia);
  const diaSemana = data.getDay() === 0 ? 7 : data.getDay();
  const indice = diasTreino.indexOf(diaSemana);
  return indice;
}

/**
 * Aplica cardio estruturado ao treino
 */
export function aplicarCardioAoTreino(treino: any, objetivo: string): any {
  if (!treino.cardio) {
    treino.cardio = { ativo: false };
  }

  if (treino.cardio.ativo === true && treino.cardio.tempoMinutos) {
    return treino;
  }

  let tempo = 0;
  let intensidade: 'leve' | 'moderada' | 'alta' = 'leve';
  let tipo = 'esteira';
  let momento: 'inicio' | 'final' | 'intercalado' = 'final';

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

/**
 * Converte perfil do banco para PerfilCompleto
 */
function converterPerfilParaCompleto(perfil: PerfilTreino): PerfilCompleto {
  return {
    idade: perfil.idade,
    sexo: perfil.sexo,
    altura: perfil.altura,
    pesoAtual: perfil.pesoAtual,
    percentualGordura: perfil.percentualGordura,
    tipoCorpo: perfil.tipoCorpo,
    experiencia: perfil.experiencia,
    problemasAnteriores: perfil.problemasAnteriores || [],
    lesoes: perfil.lesoes || [],
    objetivo: perfil.objetivo,
    objetivosAdicionais: perfil.objetivosAdicionais || [],
    rpePreferido: perfil.rpePreferido,
    frequenciaSemanal: perfil.frequenciaSemanal,
    tempoDisponivel: perfil.tempoDisponivel,
    localTreino: perfil.localTreino,
    preferencias: perfil.preferencias || [],
    aguaDiaria: perfil.aguaDiaria
  };
}

// ============================================================================
// GERAÇÃO DE TREINO
// ============================================================================

/**
 * Gera um treino completo para um dia específico
 * Usa o motor centralizado (treino-core)
 */
async function gerarTreinoDoDia(
  userId: string,
  perfil: PerfilTreino,
  data: Date,
  indiceDia: number,
  exerciciosEvitar: Set<string>
): Promise<TreinoGerado | null> {
  // Converter perfil para formato completo
  const perfilCompleto = converterPerfilParaCompleto(perfil);
  
  // Usar motor centralizado
  return await gerarTreinoUnificado({
    userId,
    data,
    tipo: 'IA',
    indiceDia,
    perfil: perfilCompleto,
    aplicarDadosOnboarding: true
  });
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

  // Converter perfil para formato completo
  const perfilCompleto = converterPerfilParaCompleto(perfil);

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

    const treino = await gerarTreinoUnificado({
      userId,
      data: dataTreino,
      tipo: 'IA',
      indiceDia: i,
      perfil: perfilCompleto,
      aplicarDadosOnboarding: true
    });

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
  
  // Converter perfil para formato completo
  const perfilCompleto = converterPerfilParaCompleto(perfil);
  
  // Gerar treino usando motor centralizado
  return await gerarTreinoUnificado({
    userId,
    data,
    tipo: 'IA',
    indiceDia,
    perfil: perfilCompleto,
    aplicarDadosOnboarding: true
  });
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

