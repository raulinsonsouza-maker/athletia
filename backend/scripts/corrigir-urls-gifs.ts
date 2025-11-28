import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Função para obter caminho de upload
function getUploadExerciciosPath(): string {
  if (process.env.UPLOAD_EXERCICIOS_PATH) {
    return process.env.UPLOAD_EXERCICIOS_PATH;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return '/opt/athletia/backend/upload/exercicios';
  }
  
  return path.join(process.cwd(), 'upload', 'exercicios');
}

async function corrigirUrlsGifs() {
  try {
    const uploadBasePath = getUploadExerciciosPath();
    
    console.log('🔍 Buscando exercícios com gifUrl...');
    
    // Buscar todos os exercícios com gifUrl
    const exerciciosComGif = await prisma.exercicio.findMany({
      where: {
        gifUrl: { not: null }
      },
      select: {
        id: true,
        nome: true,
        gifUrl: true
      }
    });

    console.log(`📊 Total de exercícios com gifUrl: ${exerciciosComGif.length}`);
    console.log('');

    const resultados = {
      total: exerciciosComGif.length,
      corrigidos: 0,
      removidos: 0,
      semMudanca: 0,
      detalhes: [] as Array<{
        id: string;
        nome: string;
        gifUrlAntigo: string | null;
        gifUrlNovo: string | null;
        acao: string;
      }>
    };

    for (const exercicio of exerciciosComGif) {
      if (!exercicio.gifUrl) continue;

      let precisaCorrigir = false;
      let novaUrl: string | null = null;
      let acao = 'sem_mudanca';

      // Verificar se a URL aponta para CDN inexistente
      if (exercicio.gifUrl.includes('minha-cdn.com')) {
        precisaCorrigir = true;
        novaUrl = null;
        acao = 'removido_cdn_invalida';
      }
      // Verificar se a URL usa nome em vez de UUID
      else if (exercicio.gifUrl.includes('/api/uploads/exercicios/')) {
        const match = exercicio.gifUrl.match(/\/exercicios\/([^\/]+)\/exercicio\.gif/);
        const idNaUrl = match ? match[1] : null;
        
        if (idNaUrl && idNaUrl !== exercicio.id) {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          
          if (!uuidPattern.test(idNaUrl)) {
            // É um nome, não um UUID
            const filePath = path.join(uploadBasePath, exercicio.id, 'exercicio.gif');
            
            if (fs.existsSync(filePath)) {
              precisaCorrigir = true;
              novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
              acao = 'corrigido_nome_para_uuid';
            } else {
              precisaCorrigir = true;
              novaUrl = null;
              acao = 'removido_arquivo_nao_encontrado';
            }
          } else {
            // É um UUID válido, mas diferente do ID do exercício
            const filePathComIdExercicio = path.join(uploadBasePath, exercicio.id, 'exercicio.gif');
            
            if (fs.existsSync(filePathComIdExercicio)) {
              precisaCorrigir = true;
              novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
              acao = 'corrigido_uuid_incorreto';
            } else {
              const filePathComIdUrl = path.join(uploadBasePath, idNaUrl, 'exercicio.gif');
              if (!fs.existsSync(filePathComIdUrl)) {
                precisaCorrigir = true;
                novaUrl = null;
                acao = 'removido_arquivo_nao_encontrado';
              }
            }
          }
        } else if (idNaUrl === exercicio.id) {
          // URL está correta, verificar se arquivo existe
          const filePath = path.join(uploadBasePath, exercicio.id, 'exercicio.gif');
          if (!fs.existsSync(filePath)) {
            precisaCorrigir = true;
            novaUrl = null;
            acao = 'removido_arquivo_nao_encontrado';
          }
        }
      }

      if (precisaCorrigir) {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { gifUrl: novaUrl }
        });

        if (novaUrl === null) {
          resultados.removidos++;
        } else {
          resultados.corrigidos++;
        }

        resultados.detalhes.push({
          id: exercicio.id,
          nome: exercicio.nome,
          gifUrlAntigo: exercicio.gifUrl,
          gifUrlNovo: novaUrl,
          acao
        });

        console.log(`✅ ${exercicio.nome}: ${acao}`);
      } else {
        resultados.semMudanca++;
      }
    }

    console.log('');
    console.log('📊 Resumo:');
    console.log(`   Total: ${resultados.total}`);
    console.log(`   Corrigidos: ${resultados.corrigidos}`);
    console.log(`   Removidos: ${resultados.removidos}`);
    console.log(`   Sem mudança: ${resultados.semMudanca}`);
    console.log('');

    if (resultados.detalhes.length > 0) {
      console.log('📝 Detalhes das correções:');
      resultados.detalhes.forEach(d => {
        console.log(`   - ${d.nome} (${d.id}): ${d.acao}`);
        if (d.gifUrlAntigo && d.gifUrlNovo) {
          console.log(`     Antigo: ${d.gifUrlAntigo}`);
          console.log(`     Novo: ${d.gifUrlNovo}`);
        } else if (d.gifUrlAntigo && !d.gifUrlNovo) {
          console.log(`     Removido: ${d.gifUrlAntigo}`);
        }
      });
    }

    console.log('');
    console.log('✨ Processo concluído!');

  } catch (error: any) {
    console.error('❌ Erro ao corrigir URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirUrlsGifs();

