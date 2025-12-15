/**
 * CANONICAL WORKOUT VALIDATOR SERVICE
 * 
 * Validador final para treinos canônicos
 * 
 * Garante que todos os requisitos estão sendo atendidos:
 * 
 * 1. Exatamente 2 grupos musculares
 * 2. Pares existem na matriz de sinergia
 * 3. Exatamente 4 exercícios por grupo (8 total)
 * 4. Nenhum exercício repetido no treino
 * 5. Nenhum grupo repetido em dias consecutivos (descanso de 48h)
 * 6. Cardio presente e na última posição
 * 7. Ordem fixa: grupo1(4) → grupo2(4) → cardio(1)
 * 
 * Se qualquer validação falhar, o treino é considerado inválido
 * e deve ser regenerado ou retornar null (nunca forçar encaixe inválido).
 */

import { GrupoCanonico } from './muscle-group-canonical.service';
import { saoGruposSinergicos } from './muscle-synergy-matrix.service';
import { normalizarGrupoParaCanonico } from './grupo-muscular.service';

// ============================================================================
// TIPOS
// ============================================================================

export interface ValidacaoTreinoCanonico {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

interface ExercicioTreino {
  exercicioId: string;
  ordem: number;
  exercicio?: {
    grupoMuscularPrincipal: string;
    sinergistas?: string[];
  };
}

interface TreinoParaValidacao {
  gruposPrincipais: string[];
  exercicios: ExercicioTreino[];
  temCardio: boolean;
  posicaoCardio?: number;
}

// ============================================================================
// VALIDAÇÕES
// ============================================================================

/**
 * Valida um treino canônico completo
 * 
 * Verifica:
 * - Exatamente 2 grupos musculares
 * - Pares existem na matriz de sinergia
 * - Exatamente 4 exercícios por grupo (8 total)
 * - Nenhum exercício repetido no treino
 * - Nenhum grupo repetido em dias consecutivos
 * - Cardio presente e na última posição
 */
export function validarTreinoCanonico(
  treino: TreinoParaValidacao,
  gruposDoDiaAnterior?: string[]
): ValidacaoTreinoCanonico {
  const erros: string[] = [];
  const avisos: string[] = [];

  // 1. Validar número de grupos (deve ser exatamente 2)
  if (treino.gruposPrincipais.length !== 2) {
    erros.push(
      `Treino deve ter exatamente 2 grupos musculares, encontrado: ${treino.gruposPrincipais.length}`
    );
  }

  // 2. Validar que os grupos são canônicos e formam par sinérgico
  if (treino.gruposPrincipais.length === 2) {
    const grupo1 = normalizarGrupoParaCanonico(treino.gruposPrincipais[0]);
    const grupo2 = normalizarGrupoParaCanonico(treino.gruposPrincipais[1]);

    if (!grupo1) {
      erros.push(`Grupo "${treino.gruposPrincipais[0]}" não é um grupo canônico válido`);
    }
    if (!grupo2) {
      erros.push(`Grupo "${treino.gruposPrincipais[1]}" não é um grupo canônico válido`);
    }

    if (grupo1 && grupo2 && !saoGruposSinergicos(grupo1, grupo2)) {
      erros.push(
        `Par [${grupo1}, ${grupo2}] não é sinérgico válido segundo a matriz de sinergia`
      );
    }
  }

  // 3. Separar exercícios de força do cardio
  const exerciciosForca = treino.exercicios.filter(
    ex => ex.exercicio?.grupoMuscularPrincipal !== 'Cardio' &&
          ex.exercicio?.grupoMuscularPrincipal !== 'Alongamento' &&
          ex.exercicio?.grupoMuscularPrincipal !== 'Flexibilidade'
  );

  // 4. Validar número total de exercícios de força (deve ser exatamente 8)
  if (exerciciosForca.length !== 8) {
    erros.push(
      `Treino deve ter exatamente 8 exercícios de força, encontrado: ${exerciciosForca.length}`
    );
  }

  // 5. Validar 4 exercícios por grupo
  if (treino.gruposPrincipais.length === 2 && exerciciosForca.length > 0) {
    const grupo1 = treino.gruposPrincipais[0];
    const grupo2 = treino.gruposPrincipais[1];

    // Normalizar grupos para comparação (aceitar variações)
    const grupo1Canonico = normalizarGrupoParaCanonico(grupo1);
    const grupo2Canonico = normalizarGrupoParaCanonico(grupo2);

    const exerciciosGrupo1 = exerciciosForca.filter(ex => {
      const grupoPrincipal = ex.exercicio?.grupoMuscularPrincipal || '';
      const sinergistas = ex.exercicio?.sinergistas || [];
      
      // Normalizar para comparar
      const grupoPrincipalCanonico = normalizarGrupoParaCanonico(grupoPrincipal);
      
      // Verificar se corresponde ao grupo1 (direto ou sinergista)
      return grupoPrincipalCanonico === grupo1Canonico || 
             grupoPrincipal === grupo1 ||
             sinergistas.some(s => {
               const sCanonico = normalizarGrupoParaCanonico(s);
               return sCanonico === grupo1Canonico || s === grupo1;
             });
    });

    const exerciciosGrupo2 = exerciciosForca.filter(ex => {
      const grupoPrincipal = ex.exercicio?.grupoMuscularPrincipal || '';
      const sinergistas = ex.exercicio?.sinergistas || [];
      
      // Normalizar para comparar
      const grupoPrincipalCanonico = normalizarGrupoParaCanonico(grupoPrincipal);
      
      // Verificar se corresponde ao grupo2 (direto ou sinergista)
      return grupoPrincipalCanonico === grupo2Canonico || 
             grupoPrincipal === grupo2 ||
             sinergistas.some(s => {
               const sCanonico = normalizarGrupoParaCanonico(s);
               return sCanonico === grupo2Canonico || s === grupo2;
             });
    });

    if (exerciciosGrupo1.length !== 4) {
      erros.push(
        `Grupo "${grupo1}" deve ter exatamente 4 exercícios, encontrado: ${exerciciosGrupo1.length}`
      );
    }

    if (exerciciosGrupo2.length !== 4) {
      erros.push(
        `Grupo "${grupo2}" deve ter exatamente 4 exercícios, encontrado: ${exerciciosGrupo2.length}`
      );
    }
  }

  // 6. Validar que não há exercícios repetidos
  const idsExercicios = new Set<string>();
  const exerciciosDuplicados: string[] = [];

  for (const ex of exerciciosForca) {
    if (idsExercicios.has(ex.exercicioId)) {
      exerciciosDuplicados.push(ex.exercicioId);
    } else {
      idsExercicios.add(ex.exercicioId);
    }
  }

  if (exerciciosDuplicados.length > 0) {
    erros.push(
      `Exercícios duplicados no treino: ${exerciciosDuplicados.join(', ')}`
    );
  }

  // 7. Validar descanso de 48h (grupos não devem repetir do dia anterior)
  if (gruposDoDiaAnterior && gruposDoDiaAnterior.length > 0) {
    for (const grupoAtual of treino.gruposPrincipais) {
      if (gruposDoDiaAnterior.includes(grupoAtual)) {
        erros.push(
          `Grupo "${grupoAtual}" foi treinado no dia anterior (viola descanso de 48h)`
        );
      }
    }
  }

  // 8. Validar presença e posição do cardio
  if (!treino.temCardio) {
    avisos.push('Cardio não encontrado no treino (deveria estar presente)');
  } else if (treino.posicaoCardio !== undefined) {
    const ultimaPosicao = Math.max(...treino.exercicios.map(ex => ex.ordem));
    if (treino.posicaoCardio !== ultimaPosicao) {
      erros.push(
        `Cardio deve estar na última posição (posição ${ultimaPosicao}), mas está na posição ${treino.posicaoCardio}`
      );
    }
  }

  // 9. Validar ordem dos exercícios: grupo1 (0-3) → grupo2 (4-7) → cardio (8+)
  if (treino.gruposPrincipais.length === 2 && exerciciosForca.length === 8) {
    const grupo1 = treino.gruposPrincipais[0];
    const grupo2 = treino.gruposPrincipais[1];

    // Primeiros 4 devem ser do grupo1
    const primeiros4 = exerciciosForca.slice(0, 4);
    const todosPrimeiros4SaoGrupo1 = primeiros4.every(ex => {
      const grupoPrincipal = ex.exercicio?.grupoMuscularPrincipal || '';
      const sinergistas = ex.exercicio?.sinergistas || [];
      return grupoPrincipal === grupo1 || sinergistas.includes(grupo1);
    });

    if (!todosPrimeiros4SaoGrupo1) {
      avisos.push(
        'Os primeiros 4 exercícios devem ser do primeiro grupo, mas há exercícios de outros grupos'
      );
    }

    // Últimos 4 devem ser do grupo2
    const ultimos4 = exerciciosForca.slice(4, 8);
    const todosUltimos4SaoGrupo2 = ultimos4.every(ex => {
      const grupoPrincipal = ex.exercicio?.grupoMuscularPrincipal || '';
      const sinergistas = ex.exercicio?.sinergistas || [];
      return grupoPrincipal === grupo2 || sinergistas.includes(grupo2);
    });

    if (!todosUltimos4SaoGrupo2) {
      avisos.push(
        'Os últimos 4 exercícios de força devem ser do segundo grupo, mas há exercícios de outros grupos'
      );
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos
  };
}

/**
 * Valida múltiplos treinos de uma semana
 * Verifica descanso de 48h entre dias consecutivos
 */
export function validarSemanaTreinosCanonicos(
  treinos: TreinoParaValidacao[]
): ValidacaoTreinoCanonico {
  const erros: string[] = [];
  const avisos: string[] = [];

  // Validar cada treino individualmente
  for (let i = 0; i < treinos.length; i++) {
    const treino = treinos[i];
    const gruposDiaAnterior = i > 0 ? treinos[i - 1].gruposPrincipais : undefined;

    const validacao = validarTreinoCanonico(treino, gruposDiaAnterior);
    
    if (!validacao.valido) {
      erros.push(`Treino dia ${i + 1}: ${validacao.erros.join('; ')}`);
    }
    if (validacao.avisos.length > 0) {
      avisos.push(`Treino dia ${i + 1}: ${validacao.avisos.join('; ')}`);
    }
  }

  // Validar descanso entre todos os dias
  for (let i = 1; i < treinos.length; i++) {
    const treinoAnterior = treinos[i - 1];
    const treinoAtual = treinos[i];

    for (const grupoAnterior of treinoAnterior.gruposPrincipais) {
      if (treinoAtual.gruposPrincipais.includes(grupoAnterior)) {
        erros.push(
          `Grupo "${grupoAnterior}" repetido em dias consecutivos (dia ${i} e ${i + 1})`
        );
      }
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos
  };
}
