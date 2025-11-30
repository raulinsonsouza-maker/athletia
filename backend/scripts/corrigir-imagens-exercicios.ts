import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../src/utils/upload-paths';
import { ACCEPTED_EXTENSIONS } from '../src/utils/file-validation';

const prisma = new PrismaClient();

interface CorrecaoResult {
  exercicioId: string;
  nome: string;
  gifUrlOriginal: string | null;
  gifUrlNovo: string | null;
  imagemUrlOriginal: string | null;
  imagemUrlNovo: string | null;
  arquivoMigrado: boolean;
  arquivoEncontrado: string | null;
  acao: string;
}

async function corrigirImagens() {
  console.log('🔧 Iniciando correção de imagens de exercícios...\n');

  const uploadBasePath = getUploadExerciciosPath();
  console.log(`📁 Caminho de upload: ${uploadBasePath}\n`);

  if (!fs.existsSync(uploadBasePath)) {
    console.error(`❌ Diretório de upload não existe: ${uploadBasePath}`);
    console.log('💡 Execute o script criar-estrutura-upload.sh para criar a estrutura');
    return;
  }

  // Buscar todos os exercícios com URLs
  const exercicios = await prisma.exercicio.findMany({
    where: {
      OR: [{ gifUrl: { not: null } }, { imagemUrl: { not: null } }],
    },
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

  console.log(`📊 Exercícios com URLs no banco: ${exercicios.length}\n`);

  const resultados: CorrecaoResult[] = [];
  let corrigidos = 0;
  let migrados = 0;
  let naoEncontrados = 0;

  for (const exercicio of exercicios) {
    const resultado: CorrecaoResult = {
      exercicioId: exercicio.id,
      nome: exercicio.nome,
      gifUrlOriginal: exercicio.gifUrl,
      gifUrlNovo: exercicio.gifUrl,
      imagemUrlOriginal: exercicio.imagemUrl,
      imagemUrlNovo: exercicio.imagemUrl,
      arquivoMigrado: false,
      arquivoEncontrado: null,
      acao: 'nenhuma',
    };

    // Verificar pasta do exercício
    const exercicioDir = path.join(uploadBasePath, exercicio.id);
    let arquivoExiste = false;
    let arquivoPath: string | null = null;

    // Verificar se pasta existe e se tem arquivo
    if (fs.existsSync(exercicioDir)) {
      for (const ext of ACCEPTED_EXTENSIONS) {
        const filePath = path.join(exercicioDir, `exercicio${ext}`);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && stats.size > 0) {
            arquivoExiste = true;
            arquivoPath = filePath;
            resultado.arquivoEncontrado = `exercicio${ext}`;
            break;
          }
        }
      }
    }

    // Extrair ID da URL e verificar se está correto
    const gifUrlId = exercicio.gifUrl ? extrairIdDaUrl(exercicio.gifUrl) : null;
    const imagemUrlId = exercicio.imagemUrl ? extrairIdDaUrl(exercicio.imagemUrl) : null;

    // Verificar se IDs nas URLs estão corretos
    let precisaCorrigirUrl = false;

    if (gifUrlId && gifUrlId !== exercicio.id) {
      // URL tem ID diferente - verificar se arquivo existe nesse ID
      const outroDir = path.join(uploadBasePath, gifUrlId);
      if (fs.existsSync(outroDir)) {
        for (const ext of ACCEPTED_EXTENSIONS) {
          const filePath = path.join(outroDir, `exercicio${ext}`);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.isFile() && stats.size > 0) {
              // Arquivo existe em outra pasta - migrar para pasta correta
              const destinoDir = path.join(uploadBasePath, exercicio.id);
              if (!fs.existsSync(destinoDir)) {
                fs.mkdirSync(destinoDir, { recursive: true });
              }
              const destinoPath = path.join(destinoDir, path.basename(filePath));
              fs.copyFileSync(filePath, destinoPath);
              resultado.arquivoMigrado = true;
              resultado.arquivoEncontrado = path.basename(filePath);
              migrados++;
              arquivoExiste = true;
              break;
            }
          }
        }
      }
      // Corrigir URL para usar ID correto
      if (arquivoExiste) {
        const ext = resultado.arquivoEncontrado?.replace('exercicio', '') || '.gif';
        resultado.gifUrlNovo = `/api/uploads/exercicios/${exercicio.id}/exercicio${ext}`;
        precisaCorrigirUrl = true;
      }
    }

    if (imagemUrlId && imagemUrlId !== exercicio.id) {
      // Similar para imagemUrl
      const outroDir = path.join(uploadBasePath, imagemUrlId);
      if (fs.existsSync(outroDir)) {
        for (const ext of ACCEPTED_EXTENSIONS) {
          const filePath = path.join(outroDir, `exercicio${ext}`);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.isFile() && stats.size > 0) {
              const destinoDir = path.join(uploadBasePath, exercicio.id);
              if (!fs.existsSync(destinoDir)) {
                fs.mkdirSync(destinoDir, { recursive: true });
              }
              const destinoPath = path.join(destinoDir, path.basename(filePath));
              if (!fs.existsSync(destinoPath)) {
                fs.copyFileSync(filePath, destinoPath);
              }
              break;
            }
          }
        }
      }
      if (arquivoExiste || fs.existsSync(exercicioDir)) {
        const ext = resultado.arquivoEncontrado?.replace('exercicio', '') || '.gif';
        resultado.imagemUrlNovo = `/api/uploads/exercicios/${exercicio.id}/exercicio${ext}`;
        precisaCorrigirUrl = true;
      }
    }

    // Se arquivo não existe e URL está correta, apenas reportar
    if (!arquivoExiste && !precisaCorrigirUrl) {
      resultado.acao = 'arquivo não encontrado';
      naoEncontrados++;
    }

    // Se precisa corrigir URL ou arquivo foi migrado, atualizar banco
    if (precisaCorrigirUrl || resultado.arquivoMigrado) {
      try {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: {
            gifUrl: resultado.gifUrlNovo,
            imagemUrl: resultado.imagemUrlNovo || resultado.imagemUrlOriginal,
          },
        });
        resultado.acao = resultado.arquivoMigrado ? 'migrado e URL corrigida' : 'URL corrigida';
        corrigidos++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar exercício ${exercicio.id}:`, error);
        resultado.acao = 'erro ao atualizar';
      }
    } else if (!arquivoExiste) {
      // Se não há arquivo, limpar URL do banco para evitar tentativas vãs
      try {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: {
            gifUrl: null,
            imagemUrl: null,
          },
        });
        resultado.gifUrlNovo = null;
        resultado.imagemUrlNovo = null;
        resultado.acao = 'URL removida (arquivo não encontrado)';
        corrigidos++;
      } catch (error) {
        console.error(`❌ Erro ao limpar URL do exercício ${exercicio.id}:`, error);
      }
    }

    resultados.push(resultado);
  }

  // Relatório
  console.log('═'.repeat(80));
  console.log('📊 RESUMO DA CORREÇÃO');
  console.log('═'.repeat(80));
  console.log(`Total processado: ${exercicios.length}`);
  console.log(`Corrigidos/Atualizados: ${corrigidos}`);
  console.log(`Arquivos migrados: ${migrados}`);
  console.log(`Arquivos não encontrados: ${naoEncontrados}`);
  console.log('');

  // Listar correções
  const comAcoes = resultados.filter((r) => r.acao !== 'nenhuma');
  if (comAcoes.length > 0) {
    console.log('═'.repeat(80));
    console.log('🔧 CORREÇÕES REALIZADAS');
    console.log('═'.repeat(80));
    for (const resultado of comAcoes) {
      console.log(`\n📝 ${resultado.nome} (ID: ${resultado.exercicioId})`);
      console.log(`   Ação: ${resultado.acao}`);
      if (resultado.gifUrlOriginal !== resultado.gifUrlNovo) {
        console.log(`   gifUrl: ${resultado.gifUrlOriginal} -> ${resultado.gifUrlNovo}`);
      }
      if (resultado.imagemUrlOriginal !== resultado.imagemUrlNovo) {
        console.log(`   imagemUrl: ${resultado.imagemUrlOriginal} -> ${resultado.imagemUrlNovo}`);
      }
      if (resultado.arquivoEncontrado) {
        console.log(`   Arquivo: ${resultado.arquivoEncontrado}`);
      }
    }
  }

  console.log('\n═'.repeat(80));
  console.log('✅ Correção concluída!');
  console.log('═'.repeat(80));
}

function extrairIdDaUrl(url: string): string | null {
  const match = url.match(/\/api\/uploads\/exercicios\/([^\/]+)\//);
  return match ? match[1] : null;
}

corrigirImagens()
  .catch((error) => {
    console.error('❌ Erro ao executar correção:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

