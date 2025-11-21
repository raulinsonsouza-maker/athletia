import { PrismaClient } from '@prisma/client';

/**
 * Singleton do PrismaClient para evitar múltiplas instâncias
 * e múltiplas conexões ao banco de dados
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Sempre armazenar no global para evitar múltiplas instâncias em todos os ambientes
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Disconnect gracefully on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

