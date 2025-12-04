import fs from 'fs';
import path from 'path';

const uploadPath = path.join(process.cwd(), 'upload', 'exercicios');

console.log('='.repeat(80));
console.log('DIAGNÓSTICO DE ARQUIVOS DE MÍDIA');
console.log('='.repeat(80));
console.log('');

console.log(`📁 Diretório de uploads: ${uploadPath}`);
console.log(`   Existe: ${fs.existsSync(uploadPath) ? '✅ SIM' : '❌ NÃO'}`);
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

// Verificar cada diretório
let totalComMedia = 0;
let totalSemMedia = 0;

console.log('🔍 Verificando arquivos de mídia:');
console.log('-'.repeat(80));

for (const dirName of exercicioDirs.slice(0, 20)) { // Mostrar apenas os primeiros 20
    const dirPath = path.join(uploadPath, dirName);
    const files = fs.readdirSync(dirPath);
    const mediaFiles = files.filter(f => f.startsWith('media.'));

    if (mediaFiles.length > 0) {
        totalComMedia++;
        console.log(`\n✅ ${dirName}`);
        for (const mediaFile of mediaFiles) {
            const filePath = path.join(dirPath, mediaFile);
            const stats = fs.statSync(filePath);
            const ext = path.extname(mediaFile);
            console.log(`   📄 ${mediaFile} (${(stats.size / 1024).toFixed(2)} KB) - ${ext}`);
            console.log(`   🔗 URL: /api/exercicios/${dirName}/media${ext}`);
        }
    } else {
        totalSemMedia++;
        console.log(`\n⚠️  ${dirName} - SEM MÍDIA`);
        if (files.length > 0) {
            console.log(`   Arquivos encontrados: ${files.join(', ')}`);
        }
    }
}

if (exercicioDirs.length > 20) {
    console.log(`\n... e mais ${exercicioDirs.length - 20} diretórios`);
}

console.log('');
console.log('='.repeat(80));
console.log('RESUMO');
console.log('='.repeat(80));
console.log(`Total de diretórios: ${exercicioDirs.length}`);
console.log(`Com mídia: ${totalComMedia}`);
console.log(`Sem mídia: ${totalSemMedia}`);
console.log('='.repeat(80));
