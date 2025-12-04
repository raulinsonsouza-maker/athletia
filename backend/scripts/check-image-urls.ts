import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageUrls() {
    const exercicios = await prisma.exercicio.findMany({
        select: {
            id: true,
            nome: true,
            imagemUrl: true
        },
        take: 10
    });

    console.log('=== EXERCÍCIOS E SUAS URLS DE IMAGEM ===\n');

    for (const ex of exercicios) {
        console.log(`ID: ${ex.id}`);
        console.log(`Nome: ${ex.nome}`);
        console.log(`imagemUrl: ${ex.imagemUrl || '(null)'}`);
        console.log('---');
    }
}

checkImageUrls()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
