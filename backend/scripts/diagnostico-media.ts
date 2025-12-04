import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { getUploadExerciciosPath } from '../src/utils/upload-paths';

const prisma = new PrismaClient();

async function diagnosticarMedia() {
    console.log('='.repeat(80));
    console.log('DIAGNÓSTICO DE MÍDIA DE EXERCÍCIOS');
    console.log('='.repeat(80));
    console.log('');

    // 1. Verificar diretório de uploads
    const uploadPath = getUploadExerciciosPath();
    console.log(`📁 Diretório de uploads: ${uploadPath}`);
    console.log(`   Existe: ${fs.existsSync(uploadPath) ? '✅ SIM' : '❌ NÃO'}`);
    console.log('');

    // 2. Buscar exercícios com imagemUrl no banco
    const exerciciosComMedia = await prisma.exercicio.findMany({
        where: {
            imagemUrl: {
                not: null
            }
        },
        select: {
            id: true,
            nome: true,
            imagemUrl: true
        },
        take: 10
    });

    console.log(`📊 Exercícios com imagemUrl no banco: ${exerciciosComMedia.length}`);
    console.log('');

    // 3. Verificar se os arquivos físicos existem
    console.log('🔍 Verificando arquivos físicos:');
    console.log('-'.repeat(80));

    for (const exercicio of exerciciosComMedia) {
        console.log(`\n📝 ${exercicio.nome}`);
        console.log(`   ID: ${exercicio.id}`);
        console.log(`   URL no banco: ${exercicio.imagemUrl}`);

        // Extrair extensão da URL
        const urlMatch = exercicio.imagemUrl?.match(/\/media\.(\w+)$/);
        if (!urlMatch) {
            console.log(`   ⚠️  URL não segue o padrão esperado`);
            continue;
        }

        const extension = urlMatch[1];
        const exercicioDir = path.join(uploadPath, exercicio.id);
        const mediaFile = path.join(exercicioDir, `media.${extension}`);

        console.log(`   Diretório esperado: ${exercicioDir}`);
        console.log(`   Arquivo esperado: ${mediaFile}`);
        console.log(`   Diretório existe: ${fs.existsSync(exercicioDir) ? '✅' : '❌'}`);
        console.log(`   Arquivo existe: ${fs.existsSync(mediaFile) ? '✅' : '❌'}`);

        if (fs.existsSync(mediaFile)) {
            const stats = fs.statSync(mediaFile);
            console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
        }

        // Verificar se há outros arquivos no diretório
        if (fs.existsSync(exercicioDir)) {
            const files = fs.readdirSync(exercicioDir);
            if (files.length > 0) {
                console.log(`   Arquivos no diretório: ${files.join(', ')}`);
            }
        }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('DIAGNÓSTICO CONCLUÍDO');
    console.log('='.repeat(80));

    await prisma.$disconnect();
}

diagnosticarMedia().catch(console.error);
