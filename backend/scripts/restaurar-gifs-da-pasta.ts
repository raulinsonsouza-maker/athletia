import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const uploadPath = '/opt/athletia/backend/upload/exercicios';

// Normalizar nome para comparação
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Função para fazer match de nome de pasta com nome de exercício
function nomesCombinam(pastaNome: string, exercicioNome: string): boolean {
  const pastaNorm = normalizarNome(pastaNome);
  const exercicioNorm = normalizarNome(exercicioNome);
  
  // Match exato
  if (pastaNorm === exercicioNorm) return true;
  
  // Match se pasta contém exercício ou vice-versa
  if (pastaNorm.includes(exercicioNorm) || exercicioNorm.includes(pastaNorm)) {
    // Verificar se não é match muito genérico (menos de 5 caracteres)
    if (pastaNorm.length >= 5 || exercicioNorm.length >= 5) {
      return true;
    }
  }
  
  return false;
}

async function restaurarGifs() {
  try {
    console.log('🔍 Verificando arquivos em:', uploadPath);
    
    if (!fs.existsSync(uploadPath)) {
      console.error('❌ Pasta não encontrada:', uploadPath);
      process.exit(1);
    }

    // Buscar TODOS os exercícios de uma vez para fazer match
    console.log('📚 Carregando exercícios do banco...');
    const todosExercicios = await prisma.exercicio.findMany({
      select: { id: true, nome: true, gifUrl: true, imagemUrl: true }
    });
    console.log(`   Encontrados ${todosExercicios.length} exercícios no banco`);
    console.log('');

    // Listar todos os diretórios
    const diretorios = fs.readdirSync(uploadPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Encontrados ${diretorios.length} diretórios na pasta`);
    console.log('');

    let atualizados = 0;
    let naoEncontrados = 0;
    const detalhes: string[] = [];

    for (const dirName of diretorios) {
      const gifPath = path.join(uploadPath, dirName, 'exercicio.gif');
      
      if (!fs.existsSync(gifPath)) {
        continue;
      }

      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      let exercicio = null;
      
      // Tentar 1: Se dirName é UUID, buscar direto
      if (uuidPattern.test(dirName)) {
        exercicio = todosExercicios.find(ex => ex.id === dirName);
      }
      
      // Tentar 2: Buscar por nome normalizado
      if (!exercicio) {
        exercicio = todosExercicios.find(ex => nomesCombinam(dirName, ex.nome));
      }
      
      // Tentar 3: Buscar por substring no nome
      if (!exercicio) {
        const dirNameLower = dirName.toLowerCase().replace(/-/g, ' ');
        exercicio = todosExercicios.find(ex => {
          const exNomeLower = ex.nome.toLowerCase();
          return exNomeLower.includes(dirNameLower) || dirNameLower.includes(exNomeLower);
        });
      }

      if (!exercicio) {
        naoEncontrados++;
        detalhes.push(`   ❌ ${dirName}: Exercício não encontrado no banco`);
        continue;
      }

      const novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
      
      // Verificar se precisa atualizar
      const precisaAtualizar = exercicio.gifUrl !== novaUrl || 
                               exercicio.gifUrl?.includes('minha-cdn.com') ||
                               exercicio.imagemUrl?.includes('minha-cdn.com');
      
      if (precisaAtualizar) {
        const updateData: any = { gifUrl: novaUrl };
        
        // Limpar imagemUrl se tiver CDN inválida
        if (exercicio.imagemUrl?.includes('minha-cdn.com')) {
          updateData.imagemUrl = null;
        }
        
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: updateData
        });
        
        atualizados++;
        detalhes.push(`   ✅ ${exercicio.nome} (${dirName} → ${exercicio.id})`);
      }
    }

    // Agora limpar URLs inválidas de exercícios que não têm arquivo na pasta
    console.log('');
    console.log('🧹 Limpando URLs inválidas...');
    
    let limpos = 0;
    for (const exercicio of todosExercicios) {
      if (!exercicio.gifUrl) continue;
      
      // Remover URLs de CDN inválida
      if (exercicio.gifUrl.includes('minha-cdn.com')) {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { gifUrl: null }
        });
        limpos++;
        continue;
      }
      
      // Verificar se URL aponta para arquivo que não existe
      if (exercicio.gifUrl.includes('/api/uploads/exercicios/')) {
        const match = exercicio.gifUrl.match(/\/exercicios\/([^\/]+)\/exercicio\.gif/);
        if (match) {
          const idNaUrl = match[1];
          const filePath = path.join(uploadPath, idNaUrl, 'exercicio.gif');
          
          // Se não existe e não é o ID correto do exercício, limpar
          if (!fs.existsSync(filePath) && idNaUrl !== exercicio.id) {
            // Tentar com o ID correto
            const filePathCorreto = path.join(uploadPath, exercicio.id, 'exercicio.gif');
            if (fs.existsSync(filePathCorreto)) {
              // Atualizar para URL correta
              await prisma.exercicio.update({
                where: { id: exercicio.id },
                data: { gifUrl: `/api/uploads/exercicios/${exercicio.id}/exercicio.gif` }
              });
              limpos++;
            } else {
              // Arquivo não existe, remover URL
              await prisma.exercicio.update({
                where: { id: exercicio.id },
                data: { gifUrl: null }
              });
              limpos++;
            }
          }
        }
      }
    }

    console.log('📊 Resumo:');
    console.log(`   GIFs atualizados: ${atualizados}`);
    console.log(`   URLs limpas: ${limpos}`);
    console.log(`   Não encontrados no banco: ${naoEncontrados}`);
    console.log('');
    
    if (detalhes.length > 0 && detalhes.length <= 50) {
      console.log('📝 Detalhes:');
      detalhes.forEach(d => console.log(d));
    } else if (detalhes.length > 50) {
      console.log(`📝 ${detalhes.length} exercícios atualizados (mostrando primeiros 20):`);
      detalhes.slice(0, 20).forEach(d => console.log(d));
      console.log(`   ... e mais ${detalhes.length - 20} exercícios`);
    }

    console.log('');
    console.log('✨ Processo concluído!');

  } catch (error: any) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restaurarGifs();

