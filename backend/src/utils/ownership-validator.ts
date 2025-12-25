/**
 * Helper para validar ownership de recursos (prevenção de IDOR)
 * Garante que usuários só possam acessar seus próprios recursos
 */

import { prisma } from '../lib/prisma';
import { logIDORAttempt } from './security-logger';

/**
 * Valida se um treino pertence ao usuário
 */
export async function validateTreinoOwnership(
  treinoId: string,
  userId: string
): Promise<{ valid: boolean; treino?: any }> {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId
    }
  });

  return {
    valid: !!treino,
    treino: treino || undefined
  };
}

/**
 * Valida se um exercício de treino pertence ao usuário
 */
export async function validateExercicioTreinoOwnership(
  exercicioTreinoId: string,
  userId: string
): Promise<{ valid: boolean; exercicioTreino?: any }> {
  const exercicioTreino = await prisma.exercicioTreino.findFirst({
    where: {
      id: exercicioTreinoId,
      treino: {
        userId
      }
    },
    include: {
      treino: {
        select: {
          userId: true
        }
      }
    }
  });

  return {
    valid: !!exercicioTreino,
    exercicioTreino: exercicioTreino || undefined
  };
}

/**
 * Valida se um registro de peso pertence ao usuário
 */
export async function validatePesoOwnership(
  pesoId: string,
  userId: string
): Promise<{ valid: boolean; peso?: any }> {
  const peso = await prisma.historicoPeso.findFirst({
    where: {
      id: pesoId,
      userId
    }
  });

  return {
    valid: !!peso,
    peso: peso || undefined
  };
}

/**
 * Valida se um perfil pertence ao usuário
 */
export async function validatePerfilOwnership(
  perfilId: string,
  userId: string
): Promise<{ valid: boolean; perfil?: any }> {
  const perfil = await prisma.perfil.findFirst({
    where: {
      id: perfilId,
      userId
    }
  });

  return {
    valid: !!perfil,
    perfil: perfil || undefined
  };
}

/**
 * Valida se um treino personalizado pertence ao usuário
 * Retorna boolean para compatibilidade com código existente
 */
export async function validateTreinoPersonalizadoOwnership(
  treinoId: string,
  userId: string
): Promise<boolean> {
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      userId,
      criadoPor: 'USUARIO' // Treinos personalizados são criados por USUARIO
    }
  });

  if (!treino) {
    logIDORAttempt(userId, 'treino-personalizado', treinoId);
    return false;
  }

  return true;
}

/**
 * Helper genérico para validar ownership via userId direto
 * Usado quando o recurso já tem userId como campo
 */
export async function validateResourceOwnership<T>(
  model: any,
  resourceId: string,
  userId: string,
  resourceName: string = 'recurso'
): Promise<{ valid: boolean; resource?: T }> {
  try {
    const resource = await model.findFirst({
      where: {
        id: resourceId,
        userId
      }
    });

    if (!resource) {
      // Logar tentativa de IDOR
      logIDORAttempt(userId, resourceName, resourceId);
    }

    return {
      valid: !!resource,
      resource: resource || undefined
    };
  } catch (error: any) {
    console.error(`[OWNERSHIP-VALIDATOR] Erro ao validar ${resourceName}:`, error);
    return {
      valid: false
    };
  }
}
