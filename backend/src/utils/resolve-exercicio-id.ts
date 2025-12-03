import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Resolve um exercicioId (pode ser UUID, slug ou nome) para o UUID real do exercício
 * 
 * @param exercicioId - Pode ser UUID, slug (ex: "abdominal-bicicleta") ou nome (ex: "Abdominal Bicicleta")
 * @returns UUID do exercício ou null se não encontrado
 */
/**
 * Resolve exercicioId para UUID real
 * PASSO 8: Proteção contra path traversal - valida entrada
 */
export async function resolveExercicioId(exercicioId: string): Promise<string | null> {
  if (!exercicioId || typeof exercicioId !== 'string') {
    return null;
  }

  const trimmedId = exercicioId.trim();
  if (!trimmedId) {
    return null;
  }

  // Proteção contra path traversal
  if (trimmedId.includes('..') || trimmedId.includes('/') || trimmedId.includes('\\')) {
    return null;
  }

  // Verificar se é UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedId);

  // Tentar buscar pelo ID diretamente (seja UUID ou legado)
  try {
    const exercicio = await prisma.exercicio.findUnique({
      where: { id: trimmedId },
      select: { id: true }
    });
    if (exercicio) {
      return exercicio.id;
    }
  } catch (error) {
    // Ignorar erro se ID for inválido para o banco (ex: muito longo)
  }

  if (isUuid) {
    // Se era pra ser UUID e não achou, retorna null (não tenta buscar por nome)
    return null;
  }

  // Não é UUID, buscar por nome/slug
  // Estratégia 1: Busca exata pelo nome (case-insensitive)
  let exercicio = await prisma.exercicio.findFirst({
    where: {
      nome: { equals: trimmedId, mode: 'insensitive' as const }
    },
    select: { id: true }
  });

  if (exercicio) {
    return exercicio.id;
  }

  // Estratégia 2: Se tem hífen, converter slug para nome
  // Ex: "abdominal-bicicleta" -> "Abdominal Bicicleta"
  if (trimmedId.includes('-')) {
    const nomeAproximado = trimmedId
      .split('-')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(' ');

    exercicio = await prisma.exercicio.findFirst({
      where: {
        nome: { equals: nomeAproximado, mode: 'insensitive' as const }
      },
      select: { id: true }
    });

    if (exercicio) {
      return exercicio.id;
    }
  }

  // Estratégia 3: Busca parcial (contains)
  // Remove hífens e busca por palavras
  const palavrasBusca = trimmedId.replace(/-/g, ' ').trim();
  if (palavrasBusca) {
    exercicio = await prisma.exercicio.findFirst({
      where: {
        nome: { contains: palavrasBusca, mode: 'insensitive' as const }
      },
      select: { id: true }
    });

    if (exercicio) {
      return exercicio.id;
    }
  }

  // Estratégia 4: Busca por cada palavra individualmente
  // Útil para casos como "abdominal infra" vs "abdominal-infra"
  const palavras = palavrasBusca.split(/\s+/).filter(p => p.length > 0);
  if (palavras.length > 0) {
    exercicio = await prisma.exercicio.findFirst({
      where: {
        AND: palavras.map(palavra => ({
          nome: { contains: palavra, mode: 'insensitive' as const }
        }))
      },
      select: { id: true }
    });

    if (exercicio) {
      return exercicio.id;
    }
  }

  // Não encontrado
  return null;
}

/**
 * Resolve exercicioId e retorna o objeto completo do exercício
 */
export async function resolveExercicio(
  exercicioId: string,
  select: { id: true; nome: true } = { id: true, nome: true }
): Promise<{ id: string; nome: string } | null> {
  const uuid = await resolveExercicioId(exercicioId);
  if (!uuid) {
    return null;
  }

  const exercicio = await prisma.exercicio.findUnique({
    where: { id: uuid },
    select: {
      id: true,
      nome: true
    }
  });

  if (!exercicio) {
    return null;
  }

  return {
    id: exercicio.id,
    nome: exercicio.nome
  };
}

