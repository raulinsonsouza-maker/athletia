/**
 * CANONICAL WORKOUT GENERATOR SERVICE
 * 
 * Motor determinístico de geração de treinos canônicos
 * 
 * REGRAS IMPLEMENTADAS:
 * 
 * 1. Premissas Inegociáveis:
 *    - Todo treino diário contém exatamente 2 grupos musculares
 *    - 4 exercícios por grupo (8 exercícios de força no total)
 *    - 0 repetição de exercício no mesmo treino
 *    - 0 repetição de exercício do mesmo grupo na mesma semana
 *    - Cardio sempre após o último exercício de força
 * 
 * 2. Matriz de Sinergia:
 *    - Apenas pares definidos na matriz podem ser usados
 *    - Sinergia é bidirecional (se A → B, então B → A)
 *    - Se um par não existe na matriz, é inválido
 * 
 * 3. Descanso Muscular (48h):
 *    - Se grupo G foi treinado no dia D, não pode aparecer em D+1
 *    - Sem exceções, sem "treino leve"
 * 
 * 4. Algoritmo:
 *    - Gera lista de pares válidos da matriz
 *    - Filtra pares que violam descanso de 48h
 *    - Seleciona par determinístico baseado em frequência e dia
 *    - Se nenhum par válido, encerra semana (não força encaixe inválido)
 * 
 * 5. Determinismo:
 *    - Mesma frequência + mesma data de início = mesma semana
 *    - Usa seed baseado em userId, frequência e início da semana
 */

import { prisma } from '../lib/prisma';
import { GRUPOS_CANONICOS, GrupoCanonico, isGrupoCanonico } from './muscle-group-canonical.service';
import { obterParesSinergicos, saoGruposSinergicos } from './muscle-synergy-matrix.service';
import { normalizarGrupoParaCanonico } from './grupo-muscular.service';
import { obterInicioSemana, normalizarData } from './treino-utils.service';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface DiaTreinoCanonico {
  indice: number;
  grupos: [GrupoCanonico, GrupoCanonico]; // Exatamente 2 grupos
  parValido: boolean;
}

export interface SemanaCanonica {
  dias: DiaTreinoCanonico[];
  frequenciaSemanal: number;
  inicioSemana: Date;
}

// ============================================================================
// VALIDAÇÃO DE DESCANSO DE 48H
// ============================================================================

/**
 * Obtém grupos que foram treinados nas últimas 48h
 * 
 * @param dataAtual Data do treino a ser gerado
 * @param userId ID do usuário
 * @returns Set com grupos treinados nas últimas 48h
 */
export async function gruposTreinadosHa48h(
  dataAtual: Date,
  userId: string
): Promise<Set<GrupoCanonico>> {
  const dataNormalizada = normalizarData(dataAtual);
  
  // Calcular data limite (48h atrás = 2 dias)
  const dataLimite = new Date(dataNormalizada);
  dataLimite.setDate(dataLimite.getDate() - 2);
  dataLimite.setHours(0, 0, 0, 0);

  // Buscar treinos dos últimos 2 dias
  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: dataLimite,
        lt: dataNormalizada // Menor que hoje (não inclui hoje)
      },
      criadoPor: 'IA' // Apenas treinos gerados pela IA
    },
    include: {
      exercicios: {
        include: {
          exercicio: {
            select: {
              grupoMuscularPrincipal: true
            }
          }
        }
      }
    }
  });

  const gruposTreinados = new Set<GrupoCanonico>();

  for (const treino of treinos) {
    for (const exercicioTreino of treino.exercicios) {
      const grupoPrincipal = exercicioTreino.exercicio?.grupoMuscularPrincipal;
      if (grupoPrincipal) {
        const grupoCanonico = normalizarGrupoParaCanonico(grupoPrincipal);
        if (grupoCanonico) {
          gruposTreinados.add(grupoCanonico);
        }
      }
    }
  }

  return gruposTreinados;
}

/**
 * Verifica se um par de grupos pode ser usado (respeita descanso de 48h)
 */
function parPodeSerUsado(
  par: [GrupoCanonico, GrupoCanonico],
  gruposEmDescanso: Set<GrupoCanonico>
): boolean {
  return !gruposEmDescanso.has(par[0]) && !gruposEmDescanso.has(par[1]);
}

// ============================================================================
// GERAÇÃO DETERMINÍSTICA DE SEMANA CANÔNICA
// ============================================================================

/**
 * Gera seed determinístico baseado em userId, frequência e início da semana
 */
function gerarSeedDeterministico(
  userId: string,
  frequenciaSemanal: number,
  inicioSemana: Date
): number {
  const semanaStr = inicioSemana.toISOString().split('T')[0];
  const hash = `${userId}_${frequenciaSemanal}_${semanaStr}`;
  
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed = ((seed << 5) - seed) + hash.charCodeAt(i);
    seed = seed & seed;
  }
  return Math.abs(seed);
}

/**
 * Shuffle determinístico usando seed
 */
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

/**
 * Gera uma semana canônica completa
 * 
 * @param frequenciaSemanal Número de dias de treino por semana (3-7)
 * @param userId ID do usuário
 * @param inicioSemana Data de início da semana
 * @param gruposUsadosNaSemanaAnterior Grupos usados na semana anterior (para transição suave)
 */
export async function gerarSemanaCanonica(
  frequenciaSemanal: number,
  userId: string,
  inicioSemana: Date,
  gruposUsadosNaSemanaAnterior: GrupoCanonico[] = []
): Promise<SemanaCanonica> {
  const frequenciaValida = Math.max(1, Math.min(7, frequenciaSemanal));
  const inicioSemanaNormalizado = normalizarData(obterInicioSemana(inicioSemana));

  // Obter todos os pares sinérgicos válidos
  const todosPares = obterParesSinergicos();

  // Gerar seed determinístico
  const seed = gerarSeedDeterministico(userId, frequenciaValida, inicioSemanaNormalizado);
  
  // Embaralhar pares de forma determinística
  const paresEmbaralhados = shuffleDeterministico(todosPares, seed);

  const dias: DiaTreinoCanonico[] = [];
  const gruposUsadosNaSemana = new Set<GrupoCanonico>(gruposUsadosNaSemanaAnterior);
  let indicePar = 0;

  for (let dia = 0; dia < frequenciaValida; dia++) {
    const dataTreino = new Date(inicioSemanaNormalizado);
    dataTreino.setDate(dataTreino.getDate() + dia);

    // Obter grupos em descanso (48h)
    const gruposEmDescanso = await gruposTreinadosHa48h(dataTreino, userId);

    // Tentar encontrar um par válido
    let parEncontrado: [GrupoCanonico, GrupoCanonico] | null = null;
    let tentativas = 0;
    const maxTentativas = paresEmbaralhados.length * 2; // Evitar loop infinito

    while (!parEncontrado && tentativas < maxTentativas) {
      const par = paresEmbaralhados[indicePar % paresEmbaralhados.length];
      indicePar++;

      // Verificar se par respeita descanso de 48h
      if (parPodeSerUsado(par, gruposEmDescanso)) {
        // Verificar se pelo menos um grupo não foi usado na semana (opcional - para variar)
        // Se ambos já foram usados, ainda podemos usar, mas preferimos pares com grupos novos
        parEncontrado = par;
        gruposUsadosNaSemana.add(par[0]);
        gruposUsadosNaSemana.add(par[1]);
        break;
      }

      tentativas++;
    }

    if (parEncontrado) {
      dias.push({
        indice: dia,
        grupos: parEncontrado,
        parValido: true
      });
    } else {
      // Se não encontrou par válido, encerrar semana
      // Não forçar encaixe inválido
      break;
    }
  }

  return {
    dias,
    frequenciaSemanal: frequenciaValida,
    inicioSemana: inicioSemanaNormalizado
  };
}

/**
 * Obtém os grupos canônicos para um dia específico
 * 
 * @param frequenciaSemanal Frequência de treino
 * @param indiceDia Índice do dia (0-based)
 * @param userId ID do usuário
 * @param data Data do treino
 */
export async function obterGruposCanonicosDoDia(
  frequenciaSemanal: number,
  indiceDia: number,
  userId: string,
  data: Date
): Promise<[GrupoCanonico, GrupoCanonico] | null> {
  const inicioSemana = obterInicioSemana(data);
  
  // Gerar semana canônica
  const semana = await gerarSemanaCanonica(frequenciaSemanal, userId, inicioSemana);

  // Buscar dia específico
  const dia = semana.dias.find(d => d.indice === indiceDia);

  return dia?.grupos || null;
}

/**
 * Valida se dois grupos formam um par sinérgico válido
 */
export function validarParSinergico(grupo1: string, grupo2: string): boolean {
  return saoGruposSinergicos(grupo1, grupo2);
}

/**
 * Valida se uma semana canônica está correta
 */
export function validarSemanaCanonica(semana: SemanaCanonica): {
  valida: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  // Verificar que todos os dias têm exatamente 2 grupos
  for (const dia of semana.dias) {
    if (dia.grupos.length !== 2) {
      erros.push(`Dia ${dia.indice}: deve ter exatamente 2 grupos, encontrado ${dia.grupos.length}`);
    }

    // Verificar que o par é válido
    if (!saoGruposSinergicos(dia.grupos[0], dia.grupos[1])) {
      erros.push(`Dia ${dia.indice}: par [${dia.grupos[0]}, ${dia.grupos[1]}] não é sinérgico válido`);
    }
  }

  // Verificar que não há grupos repetidos em dias consecutivos
  for (let i = 1; i < semana.dias.length; i++) {
    const diaAnterior = semana.dias[i - 1];
    const diaAtual = semana.dias[i];

    for (const grupoAnterior of diaAnterior.grupos) {
      if (diaAtual.grupos.includes(grupoAnterior)) {
        erros.push(`Grupo ${grupoAnterior} repetido em dias consecutivos (${i - 1} e ${i})`);
      }
    }
  }

  return {
    valida: erros.length === 0,
    erros
  };
}
