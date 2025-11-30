import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../src/utils/upload-paths';
import { ACCEPTED_EXTENSIONS } from '../src/utils/file-validation';

const prisma = new PrismaClient();

interface DiagnosticResult {
  exercicioId: string;
  nome: string;
  gifUrl: string | null;
  imagemUrl: string | null;
  arquivoExiste: boolean;
  pastaExiste: boolean;
  caminhoEsperado: string;
  arquivoEncontrado: string | null;
  isSlug: boolean;
  problema: string[];
}

async function diagnosticarImagens() {
  console.log('🔍 Iniciando diagnóstico de imagens de exercícios...\n');

  // Obter caminho de upload
  const uploadBasePath = getUploadExerciciosPath();
  console.log(`📁 Caminho de upload: ${uploadBasePath}\n`);

  if (!fs.existsSync(uploadBasePath)) {
    console.error(`❌ Diretório de upload não existe: ${uploadBasePath}`);
    console.log('💡 Execute o script criar-estrutura-upload.sh para criar a estrutura');
    return;
  }

  // Buscar todos os exercícios
  const exercicios = await prisma.exercicio.findMany({
    select: {
      id: true,
      nome: true,
      gifUrl: true,
      imagemUrl: true,
    },
    orderBy: {
      nome: 'asc',
    },
  });

  console.log(`📊 Total de exercícios no banco: ${exercicios.length}\n`);

  const resultados: DiagnosticResult[] = [];
  let comGifUrl = 0;
  let comArquivo = 0;
  let semArquivo = 0;
  let slugs = 0;

  for (const exercicio of exercicios) {
    const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      exercicio.id
    );

    if (isSlug) {
      slugs++;
    }

    const resultado: DiagnosticResult = {
      exercicioId: exercicio.id,
      nome: exercicio.nome,
      gifUrl: exercicio.gifUrl,
      imagemUrl: exercicio.imagemUrl,
      arquivoExiste: false,
      pastaExiste: false,
      caminhoEsperado: '',
      arquivoEncontrado: null,
      isSlug,
      problema: [],
    };

    if (exercicio.gifUrl || exercicio.imagemUrl) {
      comGifUrl++;
    }

    // Verificar pasta do exercício
    const exercicioDir = path.join(uploadBasePath, exercicio.id);
    resultado.caminhoEsperado = exercicioDir;
    resultado.pastaExiste = fs.existsSync(exercicioDir);

    // Se pasta não existe, adicionar ao problema
    if (!resultado.pastaExiste && (exercicio.gifUrl || exercicio.imagemUrl)) {
      resultado.problema.push('Pasta não existe mas há URL no banco');
    }

    // Verificar arquivo
    if (resultado.pastaExiste) {
      // Tentar encontrar arquivo com qualquer extensão aceita
      for (const ext of ACCEPTED_EXTENSIONS) {
        const filePath = path.join(exercicioDir, `exercicio${ext}`);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && stats.size > 0) {
            resultado.arquivoExiste = true;
            resultado.arquivoEncontrado = `exercicio${ext}`;
            comArquivo++;
            break;
          }
        }
      }
    }

    // Se há URL mas não há arquivo, adicionar ao problema
    if ((exercicio.gifUrl || exercicio.imagemUrl) && !resultado.arquivoExiste) {
      resultado.problema.push('URL no banco mas arquivo não encontrado');
      semArquivo++;
    }

    // Verificar se URL no banco está correta
    if (exercicio.gifUrl) {
      const urlId = extrairIdDaUrl(exercicio.gifUrl);
      if (urlId && urlId !== exercicio.id) {
        resultado.problema.push(
          `ID na URL (${urlId}) diferente do ID do exercício (${exercicio.id})`
        );
      }
    }

    resultados.push(resultado);
  }

  // Relatório
  console.log('═'.repeat(80));
  console.log('📊 RESUMO');
  console.log('═'.repeat(80));
  console.log(`Total de exercícios: ${exercicios.length}`);
  console.log(`Exercícios com gifUrl/imagemUrl: ${comGifUrl}`);
  console.log(`Exercícios com arquivo encontrado: ${comArquivo}`);
  console.log(`Exercícios sem arquivo (mas com URL): ${semArquivo}`);
  console.log(`Exercícios com ID slug (não-UUID): ${slugs}`);
  console.log('');

  // Exercícios com problemas
  const comProblemas = resultados.filter((r) => r.problema.length > 0);
  if (comProblemas.length > 0) {
    console.log('═'.repeat(80));
    console.log('⚠️  EXERCÍCIOS COM PROBLEMAS');
    console.log('═'.repeat(80));
    for (const resultado of comProblemas) {
      console.log(`\n🔴 ${resultado.nome} (ID: ${resultado.exercicioId})`);
      console.log(`   Tipo: ${resultado.isSlug ? 'Slug' : 'UUID'}`);
      if (resultado.gifUrl) {
        console.log(`   gifUrl: ${resultado.gifUrl}`);
      }
      if (resultado.imagemUrl) {
        console.log(`   imagemUrl: ${resultado.imagemUrl}`);
      }
      console.log(`   Caminho esperado: ${resultado.caminhoEsperado}`);
      console.log(`   Pasta existe: ${resultado.pastaExiste ? '✅' : '❌'}`);
      console.log(`   Arquivo existe: ${resultado.arquivoExiste ? '✅' : '❌'}`);
      if (resultado.arquivoEncontrado) {
        console.log(`   Arquivo encontrado: ${resultado.arquivoEncontrado}`);
      }
      console.log(`   Problemas:`);
      resultado.problema.forEach((p) => console.log(`     - ${p}`));
    }
  }

  // Listar pastas no sistema de arquivos que não correspondem a exercícios
  console.log('\n═'.repeat(80));
  console.log('📁 VERIFICANDO PASTAS ÓRFÃS');
  console.log('═'.repeat(80));

  if (fs.existsSync(uploadBasePath)) {
    const pastasNoFs = fs
      .readdirSync(uploadBasePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const idsNoBanco = new Set(exercicios.map((e) => e.id));
    const pastasOrfas = pastasNoFs.filter((pasta) => !idsNoBanco.has(pasta));

    if (pastasOrfas.length > 0) {
      console.log(`\n⚠️  Encontradas ${pastasOrfas.length} pastas sem exercício correspondente:`);
      pastasOrfas.slice(0, 20).forEach((pasta) => {
        const pastaPath = path.join(uploadBasePath, pasta);
        const arquivos = fs.readdirSync(pastaPath).filter((f) =>
          ACCEPTED_EXTENSIONS.some((ext) => f.endsWith(ext))
        );
        console.log(`   - ${pasta} (${arquivos.length} arquivo(s))`);
      });
      if (pastasOrfas.length > 20) {
        console.log(`   ... e mais ${pastasOrfas.length - 20} pastas`);
      }
    } else {
      console.log('✅ Nenhuma pasta órfã encontrada');
    }
  }

  console.log('\n═'.repeat(80));
  console.log('✅ Diagnóstico concluído!');
  console.log('═'.repeat(80));
}

function extrairIdDaUrl(url: string): string | null {
  const match = url.match(/\/api\/uploads\/exercicios\/([^\/]+)\//);
  return match ? match[1] : null;
}

diagnosticarImagens()
  .catch((error) => {
    console.error('❌ Erro ao executar diagnóstico:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

