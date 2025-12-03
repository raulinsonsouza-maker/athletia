
import { PrismaClient } from '@prisma/client';
import { resolveExercicioId } from '../src/utils/resolve-exercicio-id';
import { getMediaFilePath } from '../src/services/exercicio-media.service';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const slug = 'abdominal-bicicleta';
    console.log(`Testing resolution for slug: ${slug}`);

    // 1. Test ID Resolution
    const uuid = await resolveExercicioId(slug);
    console.log(`Resolved UUID: ${uuid}`);

    if (!uuid) {
        console.error('FAILED to resolve UUID from slug!');
        // List exercises to see what's in DB
        const exercises = await prisma.exercicio.findMany({
            select: { id: true, nome: true },
            take: 10
        });
        console.log('Sample exercises in DB:', exercises);
    } else {
        // 2. Test File Path Resolution
        console.log('Testing file path resolution...');
        // Mocking the behavior of the controller
        const filePath = await getMediaFilePath(uuid, '.gif', slug);
        console.log(`Resolved File Path: ${filePath}`);

        if (filePath) {
            console.log(`File exists: ${fs.existsSync(filePath)}`);
        } else {
            console.log('getMediaFilePath returned null');

            // Debug: Check directories manually
            const uploadDir = path.join(process.cwd(), 'upload', 'exercicios');
            console.log(`Upload Dir: ${uploadDir}`);
            const slugDir = path.join(uploadDir, slug);
            const uuidDir = path.join(uploadDir, uuid);

            console.log(`Slug Dir exists? ${fs.existsSync(slugDir)}`);
            console.log(`UUID Dir exists? ${fs.existsSync(uuidDir)}`);

            if (fs.existsSync(slugDir)) {
                console.log('Contents of slug dir:', fs.readdirSync(slugDir));
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
