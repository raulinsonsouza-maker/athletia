import fs from 'fs';
import path from 'path';

const uploadPath = path.join(process.cwd(), 'upload', 'exercicios');

console.log('='.repeat(80));
console.log('RENOMEANDO ARQUIVOS DE EXERCICIO.* PARA MEDIA.*');
console.log('='.repeat(80));
console.log('');

if (!fs.existsSync(uploadPath)) {
    console.log('❌ Diretório de uploads não existe!');
    process.exit(1);
}

// Listar todos os diretórios de exercícios
const exercicioDirs = fs.readdirSync(uploadPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

console.log(`📊 Total de diretórios de exercícios: ${exercicioDirs.length}`);
console.log('');

let totalRenomeados = 0;
let totalErros = 0;

for (const dirName of exercicioDirs) {
    const dirPath = path.join(uploadPath, dirName);

    try {
        const files = fs.readdirSync(dirPath);
        const exercicioFiles = files.filter(f => f.startsWith('exercicio.'));

        for (const oldFileName of exercicioFiles) {
            const ext = path.extname(oldFileName);
            const newFileName = `media${ext}`;

            const oldPath = path.join(dirPath, oldFileName);
            const newPath = path.join(dirPath, newFileName);

            // Verificar se já existe um arquivo media.*
            if (fs.existsSync(newPath)) {
                console.log(`⚠️  ${dirName}: ${newFileName} já existe, pulando...`);
                continue;
            }

            fs.renameSync(oldPath, newPath);
            totalRenomeados++;
            console.log(`✅ ${dirName}: ${oldFileName} → ${newFileName}`);
        }
    } catch (error: any) {
        totalErros++;
        console.error(`❌ Erro ao processar ${dirName}: ${error.message}`);
    }
}

console.log('');
console.log('='.repeat(80));
console.log('RESUMO');
console.log('='.repeat(80));
console.log(`Total de arquivos renomeados: ${totalRenomeados}`);
console.log(`Total de erros: ${totalErros}`);
console.log('='.repeat(80));
