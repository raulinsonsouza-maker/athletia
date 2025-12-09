import { prisma } from '../lib/prisma';

/**
 * Utilitários para validar ownership de recursos
 * Previne IDOR (Insecure Direct Object Reference) attacks
 */

/**
 * Valida se um treino pertence ao usuário
 */
export async function validateTreinoOwnership(
  treinoId: string,
  userId: string
): Promise<boolean> {
  try {
    const treino = await prisma.treino.findFirst({
      where: {
        id: treinoId,
        userId: userId
      },
      select: {
        id: true
      }
    });
    return !!treino;
  } catch (error) {
    console.error('[Ownership Validator] Erro ao validar ownership de treino:', error);
    return false;
  }
}

/**
 * Valida se um treino personalizado pertence ao usuário
 * Treinos personalizados são armazenados na tabela Treino com criadoPor = 'USUARIO'
 */
export async function validateTreinoPersonalizadoOwnership(
  treinoId: string,
  userId: string
): Promise<boolean> {
  try {
    const treino = await prisma.treino.findFirst({
      where: {
        id: treinoId,
        userId: userId,
        criadoPor: 'USUARIO'
      },
      select: {
        id: true
      }
    });
    return !!treino;
  } catch (error) {
    console.error('[Ownership Validator] Erro ao validar ownership de treino personalizado:', error);
    return false;
  }
}

/**
 * Valida se um exercício de treino pertence ao usuário
 */
export async function validateExercicioTreinoOwnership(
  exercicioTreinoId: string,
  userId: string
): Promise<boolean> {
  try {
    const exercicioTreino = await prisma.exercicioTreino.findFirst({
      where: {
        id: exercicioTreinoId,
        treino: {
          userId: userId
        }
      },
      select: {
        id: true
      }
    });
    return !!exercicioTreino;
  } catch (error) {
    console.error('[Ownership Validator] Erro ao validar ownership de exercício de treino:', error);
    return false;
  }
}

/**
 * Valida se um perfil pertence ao usuário
 */
export async function validatePerfilOwnership(
  userId: string,
  requestedUserId: string
): Promise<boolean> {
  // Um usuário só pode acessar seu próprio perfil (a menos que seja admin)
  return userId === requestedUserId;
}

/**
 * Valida se um histórico de peso pertence ao usuário
 */
export async function validateHistoricoPesoOwnership(
  historicoId: string,
  userId: string
): Promise<boolean> {
  try {
    const historico = await prisma.historicoPeso.findFirst({
      where: {
        id: historicoId,
        userId: userId
      },
      select: {
        id: true
      }
    });
    return !!historico;
  } catch (error) {
    console.error('[Ownership Validator] Erro ao validar ownership de histórico de peso:', error);
    return false;
  }
}

/**
 * Middleware helper para validar ownership de treino
 */
export async function requireTreinoOwnership(
  treinoId: string,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  const isValid = await validateTreinoOwnership(treinoId, userId);
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Treino não encontrado ou você não tem permissão para acessá-lo'
    };
  }
  
  return { valid: true };
}

/**
 * Middleware helper para validar ownership de treino personalizado
 */
export async function requireTreinoPersonalizadoOwnership(
  treinoId: string,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  const isValid = await validateTreinoPersonalizadoOwnership(treinoId, userId);
  
  if (!isValid) {
    return {
      valid: false,
      error: 'Treino personalizado não encontrado ou você não tem permissão para acessá-lo'
    };
  }
  
  return { valid: true };
}

