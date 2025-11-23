import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.exercicio.count({ where: { ativo: true } });
  console.log(`Total de exercícios ativos: ${total}`);
  
  const porGrupo = await prisma.exercicio.groupBy({
    by: ['grupoMuscularPrincipal'],
    where: { ativo: true },
    _count: true
  });
  
  console.log('\nExercícios por grupo:');
  porGrupo.forEach(g => {
    console.log(`  ${g.grupoMuscularPrincipal}: ${g._count}`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);

